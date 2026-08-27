import { Server, Socket } from 'socket.io';
import { 
  GamePhase, 
  Player, 
  RoleId, 
  RoomSettings, 
  ChatMessage, 
  PublicGameState, 
  PrivatePlayerState, 
  Team,
  GameLog 
} from '../src/types/mafia';
import { memoryStore, RoomData } from './store';
import { ROLES_DATA } from '../src/data/rolesData';

// Uzbek realistic bot names
const UZBEK_BOT_NAMES = [
  'Temur', 'Zilola', 'Bobur', 'Jasur', 'Nodira', 
  'Farxod', 'Malika', 'Sardor', 'Dilnoza', 'Rustam', 
  'Shaxzod', 'Kamola', 'Otabek', 'Dildora', 'Javohir',
  'Gulnoza', 'Anvar', 'Shahnoza', 'Bekzod', 'Nilufar'
];

export class GameEngine {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  // Generate public view of game for a room
  public getPublicState(room: RoomData): PublicGameState {
    const playersList = Array.from(room.players.values()).map(p => {
      const showRole = !p.isAlive && room.settings.revealRoleOnDeath 
        ? p.role 
        : (room.status === 'ended' ? p.role : undefined);

      return {
        id: p.id,
        name: p.name,
        avatarIndex: p.avatarIndex,
        isHost: p.isHost,
        isBot: p.isBot,
        isAlive: p.isAlive,
        connected: p.connected,
        role: showRole,
        hasVoted: p.votedForId !== undefined && p.votedForId !== null,
        votedForId: (room.currentPhase === 'EXECUTION' || room.status === 'ended') ? p.votedForId : undefined,
      };
    });

    return {
      roomCode: room.roomCode,
      status: room.status,
      currentPhase: room.currentPhase,
      dayNumber: room.dayNumber,
      nightNumber: room.nightNumber,
      timeRemaining: room.phaseTimeRemaining,
      isPaused: room.isPaused,
      players: playersList,
      hostId: room.hostId,
      settings: room.settings,
      winner: room.winner,
      winnerTeamName: room.winnerTeamName,
      winnerPlayerNames: room.winnerPlayerNames,
      lastNightResult: room.lastNightResult,
      lastVoteResult: room.lastVoteResult,
      logs: room.logs,
    };
  }

  // Generate player-specific private state
  public getPrivateState(room: RoomData, playerId: string): PrivatePlayerState {
    const player = room.players.get(playerId);
    if (!player) {
      return {
        myId: playerId,
        myRole: null,
        myTeammates: [],
        myActionTarget: null,
        myVoteTarget: null,
        detectiveReport: null,
        canAct: false,
        canChatPublic: false,
        canChatMafia: false,
        canChatDead: false,
      };
    }

    const myRole = player.role || null;
    const isAlive = player.isAlive;
    const currentPhase = room.currentPhase;

    // Mafia teammates
    let teammates: Array<{ id: string; name: string; role: RoleId }> = [];
    if (myRole === 'mafia') {
      teammates = Array.from(room.players.values())
        .filter(p => p.role === 'mafia' && p.id !== playerId)
        .map(p => ({ id: p.id, name: p.name, role: 'mafia' as RoleId }));
    }

    // Action eligibility during NIGHT
    let canAct = false;
    if (currentPhase === 'NIGHT' && isAlive && room.status === 'in_progress') {
      if (myRole === 'mafia' || myRole === 'doctor' || myRole === 'detective' || myRole === 'maniac') {
        canAct = true;
      }
    }

    // Chat permissions
    let canChatPublic = false;
    let canChatMafia = false;
    let canChatDead = false;

    if (!isAlive) {
      canChatDead = true;
    } else {
      if (currentPhase === 'LOBBY') {
        canChatPublic = true;
      } else if (currentPhase === 'DISCUSSION' || currentPhase === 'VOTING') {
        canChatPublic = true;
      } else if (currentPhase === 'NIGHT' && myRole === 'mafia') {
        canChatMafia = true;
      }
    }

    let myActionTarget: string | null = null;
    let mafiaVotesObj: Record<string, string> = {};
    let mafiaCounts: Record<string, number> = {};
    let leadingMafiaTarget: string | null = null;

    if (myRole === 'mafia') {
      myActionTarget = room.nightActions.mafiaVotes.get(playerId) || null;
      for (const [mId, tId] of room.nightActions.mafiaVotes.entries()) {
        if (tId) {
          mafiaVotesObj[mId] = tId;
          mafiaCounts[tId] = (mafiaCounts[tId] || 0) + 1;
        }
      }
      let maxCnt = 0;
      for (const [tId, count] of Object.entries(mafiaCounts)) {
        if (count > maxCnt) {
          maxCnt = count;
          leadingMafiaTarget = tId;
        }
      }
    } else if (myRole === 'doctor') {
      myActionTarget = room.nightActions.doctorTarget;
    } else if (myRole === 'detective') {
      myActionTarget = room.nightActions.detectiveTarget;
    } else if (myRole === 'maniac') {
      myActionTarget = room.nightActions.maniacTarget;
    }

    return {
      myId: playerId,
      myRole,
      myTeammates: teammates,
      myActionTarget,
      mafiaVotes: myRole === 'mafia' ? mafiaVotesObj : undefined,
      mafiaTargetsCount: myRole === 'mafia' ? mafiaCounts : undefined,
      leadingMafiaTarget: myRole === 'mafia' ? leadingMafiaTarget : undefined,
      myVoteTarget: player.votedForId || null,
      detectiveReport: room.nightActions.detectiveReport,
      canAct,
      canChatPublic,
      canChatMafia,
      canChatDead,
    };
  }

  // Filter messages for a given player based on channels they are permitted to see
  public getFilteredMessages(room: RoomData, playerId: string): ChatMessage[] {
    const player = room.players.get(playerId);
    const isAlive = player ? player.isAlive : false;
    const isMafia = player ? player.role === 'mafia' : false;

    return room.messages.filter(msg => {
      if (msg.channel === 'public') return true;
      if (msg.channel === 'mafia') return isMafia;
      if (msg.channel === 'dead') return !isAlive;
      return false;
    });
  }

  // Sync state to all sockets in a room
  public syncRoom(roomCode: string) {
    const room = memoryStore.getRoom(roomCode);
    if (!room) return;

    const publicState = this.getPublicState(room);

    // Broadcast tailored state to each connected player
    for (const [playerId, player] of room.players.entries()) {
      if (player.socketId) {
        const privateState = this.getPrivateState(room, playerId);
        const filteredMessages = this.getFilteredMessages(room, playerId);

        this.io.to(player.socketId).emit('game:sync', {
          gameState: publicState,
          privateState,
          messages: filteredMessages,
        });
      }
    }
  }

  // Add system log & message
  public addLog(room: RoomData, message: string, type: GameLog['type'] = 'info') {
    const log: GameLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      dayNumber: room.dayNumber,
      phase: room.currentPhase,
      message,
      type,
    };
    room.logs.push(log);

    // Also add to public messages if phase is relevant
    const chatMsg: ChatMessage = {
      id: 'sys_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderId: 'system',
      senderName: 'Tizim',
      isSystem: true,
      channel: 'public',
      text: message,
      timestamp: Date.now(),
      phase: room.currentPhase,
    };
    room.messages.push(chatMsg);
  }

  // Add a bot to the room
  public addBot(roomCode: string): boolean {
    const room = memoryStore.getRoom(roomCode);
    if (!room || room.status !== 'waiting') return false;

    if (room.players.size >= room.settings.maxPlayers) return false;

    // Pick an unused Uzbek name
    const existingNames = new Set(Array.from(room.players.values()).map(p => p.name));
    const availableNames = UZBEK_BOT_NAMES.filter(name => !existingNames.has(name));
    const botName = availableNames.length > 0 
      ? availableNames[Math.floor(Math.random() * availableNames.length)]
      : `O'yinchi_${room.players.size + 1}`;

    const botId = 'bot_' + Math.random().toString(36).substring(2, 10);
    const bot: Player = {
      id: botId,
      name: botName,
      email: `${botName.toLowerCase()}@mafiabot.uz`,
      avatarIndex: Math.floor(Math.random() * 8),
      isHost: false,
      isBot: true,
      isAlive: true,
      connected: true,
      joinedAt: Date.now(),
    };

    room.players.set(botId, bot);
    this.addLog(room, `🤖 ${botName} (Bot) xonaga qo'shildi`, 'system');
    this.syncRoom(roomCode);
    return true;
  }

  // Remove a bot or player
  public removePlayer(roomCode: string, playerId: string): boolean {
    const room = memoryStore.getRoom(roomCode);
    if (!room) return false;

    const player = room.players.get(playerId);
    if (!player) return false;

    room.players.delete(playerId);
    this.addLog(room, `🔔 ${player.name} xonadan chiqdi`, 'system');

    // If host was removed, assign next host if available
    if (player.isHost && room.players.size > 0) {
      const firstHuman = Array.from(room.players.values()).find(p => !p.isBot) || Array.from(room.players.values())[0];
      if (firstHuman) {
        firstHuman.isHost = true;
        room.hostId = firstHuman.id;
        this.addLog(room, `👑 Yangi boshlovchi: ${firstHuman.name}`, 'system');
      }
    }

    if (room.players.size === 0) {
      memoryStore.deleteRoom(roomCode);
    } else {
      this.syncRoom(roomCode);
    }
    return true;
  }

  // Update room settings (host only)
  public updateSettings(roomCode: string, hostId: string, settings: Partial<RoomSettings>): boolean {
    const room = memoryStore.getRoom(roomCode);
    if (!room || room.hostId !== hostId || room.status !== 'waiting') return false;

    room.settings = { ...room.settings, ...settings };
    this.addLog(room, `⚙️ O'yin sozlamalari yangilandi.`, 'info');
    this.syncRoom(roomCode);
    return true;
  }

  // Start the game
  public startGame(roomCode: string, hostId: string): { success: boolean; error?: string } {
    const room = memoryStore.getRoom(roomCode);
    if (!room) return { success: false, error: "Xona topilmadi" };
    if (room.hostId !== hostId) return { success: false, error: "Faqat xona boshlovchisi o'yinni boshlay oladi" };
    if (room.status !== 'waiting') return { success: false, error: "O'yin allaqachon boshlangan" };

    const playerCount = room.players.size;
    if (playerCount < room.settings.minPlayers) {
      return { 
        success: false, 
        error: `O'yinni boshlash uchun kamida ${room.settings.minPlayers} ta o'yinchi kerak (Hozir: ${playerCount}). Botlar qo'shishingiz mumkin.` 
      };
    }

    // Role assignment calculation
    const mafiaCount = Math.max(1, Math.min(room.settings.mafiaCount, Math.floor(playerCount / 2) - 1 || 1));
    const doctorCount = room.settings.hasDoctor ? 1 : 0;
    const detectiveCount = room.settings.hasDetective ? 1 : 0;
    const maniacCount = room.settings.hasManiac && playerCount >= 5 ? 1 : 0;
    const citizenCount = Math.max(1, playerCount - (mafiaCount + doctorCount + detectiveCount + maniacCount));

    const rolesPool: RoleId[] = [];
    for (let i = 0; i < mafiaCount; i++) rolesPool.push('mafia');
    for (let i = 0; i < doctorCount; i++) rolesPool.push('doctor');
    for (let i = 0; i < detectiveCount; i++) rolesPool.push('detective');
    for (let i = 0; i < maniacCount; i++) rolesPool.push('maniac');
    for (let i = 0; i < citizenCount; i++) rolesPool.push('citizen');

    // Shuffle roles
    for (let i = rolesPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesPool[i], rolesPool[j]] = [rolesPool[j], rolesPool[i]];
    }

    // Assign roles to players
    const playersArray = Array.from(room.players.values());
    playersArray.forEach((player, idx) => {
      player.role = rolesPool[idx] || 'citizen';
      player.isAlive = true;
      player.votedForId = null;
      player.targetId = null;
      player.hasActedThisPhase = false;
    });

    room.status = 'in_progress';
    room.dayNumber = 0;
    room.nightNumber = 0;
    room.winner = null;
    room.winnerTeamName = null;
    room.winnerPlayerNames = [];
    room.logs = [];

    this.addLog(room, `🎭 O'yin boshlandi! Barcha o'yinchilarga maxfiy rollar taqsimlandi.`, 'phase');
    
    // Transition to ROLE_REVEAL phase
    this.transitionPhase(room, 'ROLE_REVEAL', 7);
    return { success: true };
  }

  // Phase transition state machine
  public transitionPhase(room: RoomData, nextPhase: GamePhase, durationSeconds: number) {
    if (room.phaseTimer) {
      clearInterval(room.phaseTimer);
      room.phaseTimer = null;
    }

    room.currentPhase = nextPhase;
    room.phaseTotalTime = durationSeconds;
    room.phaseTimeRemaining = durationSeconds;
    room.isPaused = false;

    // Reset action state per phase
    if (nextPhase === 'NIGHT') {
      room.nightNumber++;
      room.nightActions = {
        mafiaVotes: new Map(),
        doctorTarget: null,
        detectiveTarget: null,
        detectivePlayerId: null,
        maniacTarget: null,
        detectiveReport: null,
      };
      this.addLog(room, `🌙 ${room.nightNumber}-Tun boshlandi. Shahar uyquga ketdi... Maxsus rollar o'z ishini bajarmoqda.`, 'phase');
      this.simulateBotNightActions(room);
    } else if (nextPhase === 'DAY') {
      room.dayNumber++;
      // Resolve night results
      this.resolveNightActions(room);
      // Check win condition
      if (this.checkWinConditions(room)) {
        return;
      }
    } else if (nextPhase === 'DISCUSSION') {
      this.addLog(room, `💬 ${room.dayNumber}-Kun: Muhokama boshlandi! Shahar ahvoli va gumonlanuvchilarni muhokama qiling.`, 'phase');
      this.simulateBotDiscussionMessages(room);
    } else if (nextPhase === 'VOTING') {
      room.votes.clear();
      for (const player of room.players.values()) {
        player.votedForId = null;
      }
      this.addLog(room, `🗳️ Ovoz berish boshlandi! Qatl qilinishi kerak bo'lgan gumonlanuvchiga ovoz bering.`, 'phase');
      this.simulateBotVoting(room);
    } else if (nextPhase === 'EXECUTION') {
      this.resolveVoting(room);
      if (this.checkWinConditions(room)) {
        return;
      }
    }

    this.syncRoom(room.roomCode);

    // Start server countdown timer
    room.phaseTimer = setInterval(() => {
      if (room.isPaused) return;

      room.phaseTimeRemaining--;
      if (room.phaseTimeRemaining <= 0) {
        if (room.phaseTimer) {
          clearInterval(room.phaseTimer);
          room.phaseTimer = null;
        }
        this.handlePhaseTimeout(room);
      } else {
        // Emit tick every second
        this.io.to(room.roomCode).emit('game:timer', {
          timeRemaining: room.phaseTimeRemaining,
          currentPhase: room.currentPhase,
        });
      }
    }, 1000);
  }

  // Handle phase timeouts
  private handlePhaseTimeout(room: RoomData) {
    switch (room.currentPhase) {
      case 'ROLE_REVEAL':
        this.transitionPhase(room, 'NIGHT', room.settings.nightTime);
        break;
      case 'NIGHT':
        this.transitionPhase(room, 'DAY', 8);
        break;
      case 'DAY':
        this.transitionPhase(room, 'DISCUSSION', room.settings.discussionTime);
        break;
      case 'DISCUSSION':
        this.transitionPhase(room, 'VOTING', room.settings.votingTime);
        break;
      case 'VOTING':
        this.transitionPhase(room, 'EXECUTION', 9);
        break;
      case 'EXECUTION':
        this.transitionPhase(room, 'NIGHT', room.settings.nightTime);
        break;
      default:
        break;
    }
  }

  // Resolve night actions (Mafia, Doctor, Detective, Maniac)
  private resolveNightActions(room: RoomData) {
    const livingPlayers = Array.from(room.players.values()).filter(p => p.isAlive);
    const deaths: Array<{ id: string; name: string; role?: RoleId }> = [];
    let wasSaved = false;

    // 1. Tally Mafia Target
    const mafiaVotesCount: Record<string, number> = {};
    for (const [_, targetId] of room.nightActions.mafiaVotes.entries()) {
      if (targetId) {
        mafiaVotesCount[targetId] = (mafiaVotesCount[targetId] || 0) + 1;
      }
    }
    let mafiaTargetId: string | null = null;
    let maxMafiaVotes = 0;
    for (const [targetId, count] of Object.entries(mafiaVotesCount)) {
      if (count > maxMafiaVotes) {
        maxMafiaVotes = count;
        mafiaTargetId = targetId;
      }
    }

    // 2. Doctor Target
    const protectedId = room.nightActions.doctorTarget;

    // 3. Maniac Target
    const maniacTargetId = room.nightActions.maniacTarget;

    // Process Mafia Kill
    if (mafiaTargetId) {
      if (mafiaTargetId === protectedId) {
        wasSaved = true;
        this.addLog(room, `💉 Shifokor ushbu kechada o'lim xavfi ostida qolgan inson hayotini saqlab qoldi!`, 'save');
      } else {
        const victim = room.players.get(mafiaTargetId);
        if (victim && victim.isAlive) {
          victim.isAlive = false;
          deaths.push({ id: victim.id, name: victim.name, role: victim.role });
        }
      }
    }

    // Process Maniac Kill
    if (maniacTargetId && maniacTargetId !== mafiaTargetId) {
      if (maniacTargetId === protectedId) {
        wasSaved = true;
        this.addLog(room, `💉 Shifokor Manyak qurbonini ham o'z vaqtida qutqarib qoldi!`, 'save');
      } else {
        const victim = room.players.get(maniacTargetId);
        if (victim && victim.isAlive) {
          victim.isAlive = false;
          deaths.push({ id: victim.id, name: victim.name, role: victim.role });
        }
      }
    }

    room.lastNightResult = {
      deaths,
      saved: wasSaved,
    };

    if (deaths.length > 0) {
      const names = deaths.map(d => `${d.name} (${room.settings.revealRoleOnDeath && d.role ? ROLES_DATA[d.role].name : "Noma'lum"})`).join(', ');
      this.addLog(room, `☀️ ertalab shahar uyg'ondi: O'tgan tunda shafqatsizlarcha o'ldirilganlar: ${names}`, 'kill');
    } else {
      this.addLog(room, `☀️ ertalab shahar tinch uyg'ondi: O'tgan tunda hech kim halok bo'lmadi!`, 'info');
    }
  }

  // Resolve day voting
  private resolveVoting(room: RoomData) {
    const votesCount: Record<string, number> = {};
    for (const [_, targetId] of room.votes.entries()) {
      votesCount[targetId] = (votesCount[targetId] || 0) + 1;
    }

    let highestVoteCount = 0;
    let candidateIds: string[] = [];

    for (const [targetId, count] of Object.entries(votesCount)) {
      if (count > highestVoteCount) {
        highestVoteCount = count;
        candidateIds = [targetId];
      } else if (count === highestVoteCount) {
        candidateIds.push(targetId);
      }
    }

    let eliminatedPlayerId: string | null = null;
    let eliminatedPlayerName: string | null = null;
    let eliminatedPlayerRole: RoleId | undefined = undefined;
    let isTie = false;

    if (candidateIds.length === 1 && candidateIds[0] !== 'skip' && highestVoteCount > 0) {
      eliminatedPlayerId = candidateIds[0];
      const player = room.players.get(eliminatedPlayerId);
      if (player && player.isAlive) {
        player.isAlive = false;
        eliminatedPlayerName = player.name;
        eliminatedPlayerRole = player.role;
        this.addLog(room, `⚖️ Shahar sudi qarori bilan ${player.name} (${room.settings.revealRoleOnDeath && player.role ? ROLES_DATA[player.role].name : "Noma'lum"}) qatl qilindi!`, 'kill');
      }
    } else if (candidateIds.includes('skip') || candidateIds.length > 1) {
      isTie = true;
      this.addLog(room, `⚖️ Ovozlar teng keldi yoki ko'pchilik o'tkazib yuborishni tanladi. Bugun hech kim qatl qilinmadi.`, 'info');
    } else {
      this.addLog(room, `⚖️ Hech kim yetarli ovoz to'plamadi. Bugungi sud natijasiz yakunlandi.`, 'info');
    }

    room.lastVoteResult = {
      votesCount,
      eliminatedPlayerId,
      eliminatedPlayerName,
      eliminatedPlayerRole,
      isTie,
    };
  }

  // Evaluate win conditions
  private checkWinConditions(room: RoomData): boolean {
    const living = Array.from(room.players.values()).filter(p => p.isAlive);
    const mafiaLiving = living.filter(p => p.role === 'mafia');
    const maniacLiving = living.filter(p => p.role === 'maniac');
    const cityLiving = living.filter(p => p.role === 'citizen' || p.role === 'doctor' || p.role === 'detective');

    let winner: Team | 'maniac' | null = null;
    let winnerTeamName: string | null = null;
    let winnerPlayerNames: string[] = [];

    // Maniac win condition: Maniac is alive and total living <= 2, and no mafia
    if (maniacLiving.length > 0 && living.length <= 2 && mafiaLiving.length === 0) {
      winner = 'maniac';
      winnerTeamName = "Manyak (Yakka Qotil)";
      winnerPlayerNames = maniacLiving.map(p => p.name);
    }
    // Mafia win condition: Mafia count >= city living + maniac living
    else if (mafiaLiving.length > 0 && mafiaLiving.length >= (cityLiving.length + maniacLiving.length)) {
      winner = 'mafia';
      winnerTeamName = "Mafiya Klani";
      winnerPlayerNames = Array.from(room.players.values()).filter(p => p.role === 'mafia').map(p => p.name);
    }
    // City win condition: All mafia and maniac eliminated
    else if (mafiaLiving.length === 0 && maniacLiving.length === 0 && cityLiving.length > 0) {
      winner = 'city';
      winnerTeamName = "Tinch Aholi (Shahar)";
      winnerPlayerNames = Array.from(room.players.values()).filter(p => p.role === 'citizen' || p.role === 'doctor' || p.role === 'detective').map(p => p.name);
    }
    // Draw / Everyone dead
    else if (living.length === 0) {
      winner = 'neutral';
      winnerTeamName = "Durrang (Barcha halok bo'ldi)";
      winnerPlayerNames = [];
    }

    if (winner !== null) {
      if (room.phaseTimer) {
        clearInterval(room.phaseTimer);
        room.phaseTimer = null;
      }
      room.status = 'ended';
      room.currentPhase = 'GAME_OVER';
      room.winner = winner;
      room.winnerTeamName = winnerTeamName;
      room.winnerPlayerNames = winnerPlayerNames;
      this.addLog(room, `🏆 O'YIN TUGADI! G'olib: ${winnerTeamName}!`, 'phase');
      this.syncRoom(room.roomCode);
      return true;
    }

    return false;
  }

  // Handle Player Night Action
  public handleNightAction(roomCode: string, playerId: string, targetId: string): boolean {
    const room = memoryStore.getRoom(roomCode);
    if (!room || room.status !== 'in_progress' || room.currentPhase !== 'NIGHT') return false;

    const player = room.players.get(playerId);
    if (!player || !player.isAlive) return false;

    const target = room.players.get(targetId);
    if (!target || !target.isAlive) return false;

    if (player.role === 'mafia') {
      room.nightActions.mafiaVotes.set(playerId, targetId);

      // If there are other living bot mafias, coordinate with player's choice
      const livingMafiaBots = Array.from(room.players.values()).filter(
        p => p.isAlive && p.isBot && p.role === 'mafia' && p.id !== playerId
      );

      if (livingMafiaBots.length > 0) {
        setTimeout(() => {
          if (room.currentPhase !== 'NIGHT') return;
          for (const bot of livingMafiaBots) {
            // Bot aligns with the target
            room.nightActions.mafiaVotes.set(bot.id, targetId);
          }
          const firstBot = livingMafiaBots[0];
          const botPhrases = [
            `Kelishdik, men ham ${target.name} ga ovoz berdim.`,
            `Bo'ldi, bugun kechasi ${target.name} nishonda!`,
            `To'g'ri tanlov, ${target.name} bizga xavf tug'dirayotgan edi.`
          ];
          const phrase = botPhrases[Math.floor(Math.random() * botPhrases.length)];
          this.handleChat(roomCode, firstBot.id, phrase, 'mafia');
          this.syncRoom(roomCode);
        }, 1200);
      }
    } else if (player.role === 'doctor') {
      room.nightActions.doctorTarget = targetId;
    } else if (player.role === 'detective') {
      room.nightActions.detectiveTarget = targetId;
      room.nightActions.detectivePlayerId = playerId;
      const isTargetMafia = target.role === 'mafia';
      room.nightActions.detectiveReport = {
        targetName: target.name,
        isMafia: isTargetMafia,
      };
    } else if (player.role === 'maniac') {
      room.nightActions.maniacTarget = targetId;
    }

    player.hasActedThisPhase = true;
    this.syncRoom(roomCode);
    return true;
  }

  // Handle Player Voting Action
  public handleVote(roomCode: string, playerId: string, targetId: string | 'skip'): boolean {
    const room = memoryStore.getRoom(roomCode);
    if (!room || room.status !== 'in_progress' || room.currentPhase !== 'VOTING') return false;

    const player = room.players.get(playerId);
    if (!player || !player.isAlive) return false;

    room.votes.set(playerId, targetId);
    player.votedForId = targetId;

    this.syncRoom(roomCode);
    return true;
  }

  // Handle Chat Message
  public handleChat(roomCode: string, playerId: string, text: string, channel: 'public' | 'mafia' | 'dead'): boolean {
    const room = memoryStore.getRoom(roomCode);
    if (!room) return false;

    const player = room.players.get(playerId);
    if (!player) return false;

    const cleanText = text.trim();
    if (!cleanText) return false;

    // Validate channel permissions
    if (channel === 'dead' && player.isAlive) return false;
    if (channel === 'mafia' && player.role !== 'mafia') return false;
    if (channel === 'public') {
      if (!player.isAlive) return false;
      if (room.status === 'in_progress' && room.currentPhase === 'NIGHT') return false;
    }

    const chatMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      senderId: playerId,
      senderName: player.name,
      senderRole: player.role,
      isSystem: false,
      channel,
      text: cleanText,
      timestamp: Date.now(),
      phase: room.currentPhase,
    };

    room.messages.push(chatMsg);

    // Broadcast only to authorized recipients
    for (const [pId, p] of room.players.entries()) {
      if (p.socketId) {
        if (channel === 'public' || 
           (channel === 'mafia' && p.role === 'mafia') || 
           (channel === 'dead' && !p.isAlive)) {
          this.io.to(p.socketId).emit('chat:new', chatMsg);
        }
      }
    }

    return true;
  }

  // Host Controls: Pause / Resume / Skip / End
  public handleHostAction(roomCode: string, hostId: string, action: 'pause' | 'resume' | 'skip' | 'end' | 'restart'): boolean {
    const room = memoryStore.getRoom(roomCode);
    if (!room || room.hostId !== hostId) return false;

    if (action === 'pause') {
      room.isPaused = true;
      this.addLog(room, `⏸️ Boshlovchi o'yinni vaqtincha to'xtatdi.`, 'info');
      this.syncRoom(roomCode);
    } else if (action === 'resume') {
      room.isPaused = false;
      this.addLog(room, `▶️ Boshlovchi o'yinni davom ettirdi.`, 'info');
      this.syncRoom(roomCode);
    } else if (action === 'skip') {
      this.addLog(room, `⏭️ Boshlovchi joriy fazani o'tkazib yubordi.`, 'info');
      this.handlePhaseTimeout(room);
    } else if (action === 'end') {
      if (room.phaseTimer) {
        clearInterval(room.phaseTimer);
        room.phaseTimer = null;
      }
      room.status = 'ended';
      room.currentPhase = 'GAME_OVER';
      room.winner = 'neutral';
      room.winnerTeamName = "O'yin to'xtatildi";
      this.addLog(room, `🛑 Boshlovchi o'yinni muddatidan oldin yakunladi.`, 'phase');
      this.syncRoom(roomCode);
    } else if (action === 'restart') {
      if (room.phaseTimer) {
        clearInterval(room.phaseTimer);
        room.phaseTimer = null;
      }
      room.status = 'waiting';
      room.currentPhase = 'LOBBY';
      room.winner = null;
      room.winnerTeamName = null;
      room.winnerPlayerNames = [];
      for (const p of room.players.values()) {
        p.isAlive = true;
        p.role = undefined;
        p.votedForId = null;
        p.targetId = null;
        p.hasActedThisPhase = false;
      }
      this.addLog(room, `🔄 O'yin qaytadan boshlash uchun lobbiyga qaytarildi.`, 'phase');
      this.syncRoom(roomCode);
    }

    return true;
  }

  // Autonomous bot behaviors
  private simulateBotNightActions(room: RoomData) {
    setTimeout(() => {
      if (room.currentPhase !== 'NIGHT') return;

      const livingPlayers = Array.from(room.players.values()).filter(p => p.isAlive);
      const livingBots = livingPlayers.filter(p => p.isBot);
      const livingMafia = livingPlayers.filter(p => p.role === 'mafia');
      const nonMafiaTargets = livingPlayers.filter(p => p.role !== 'mafia');

      // Shared target for mafia bots if they choose first
      let agreedMafiaTarget: Player | null = null;
      // Check if a human mafia already voted
      for (const [mId, tId] of room.nightActions.mafiaVotes.entries()) {
        if (tId) {
          const t = room.players.get(tId);
          if (t && t.isAlive) {
            agreedMafiaTarget = t;
            break;
          }
        }
      }

      for (const bot of livingBots) {
        if (bot.role === 'mafia') {
          // If no agreed target yet, pick one non-mafia target
          if (!agreedMafiaTarget && nonMafiaTargets.length > 0) {
            agreedMafiaTarget = nonMafiaTargets[Math.floor(Math.random() * nonMafiaTargets.length)];
          }

          if (agreedMafiaTarget) {
            room.nightActions.mafiaVotes.set(bot.id, agreedMafiaTarget.id);
            // If there are multiple mafias (human or other bots), announce in mafia chat
            if (livingMafia.length > 1) {
              const botPhrases = [
                `Menimcha bugun ${agreedMafiaTarget.name} ni yo'q qilishimiz kerak.`,
                `Men ${agreedMafiaTarget.name} ga ovoz berdim, birgalikda tanlaylik!`,
                `Nishon: ${agreedMafiaTarget.name}.`
              ];
              const phrase = botPhrases[Math.floor(Math.random() * botPhrases.length)];
              this.handleChat(room.roomCode, bot.id, phrase, 'mafia');
            }
          }
        } else if (bot.role === 'doctor') {
          // Doctor bot targets any living player
          const target = livingPlayers[Math.floor(Math.random() * livingPlayers.length)];
          if (target) {
            room.nightActions.doctorTarget = target.id;
          }
        } else if (bot.role === 'detective') {
          // Detective bot targets other living players
          const potentialTargets = livingPlayers.filter(p => p.id !== bot.id);
          if (potentialTargets.length > 0) {
            const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
            room.nightActions.detectiveTarget = target.id;
            room.nightActions.detectivePlayerId = bot.id;
          }
        } else if (bot.role === 'maniac') {
          // Maniac bot targets any other living player
          const potentialTargets = livingPlayers.filter(p => p.id !== bot.id);
          if (potentialTargets.length > 0) {
            const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
            room.nightActions.maniacTarget = target.id;
          }
        }
      }

      this.syncRoom(room.roomCode);
    }, 2000);
  }

  private simulateBotDiscussionMessages(room: RoomData) {
    const BOT_UTTERANCES = [
      "Menga nimagadir vaziyat juda shubhali tuyulyapti...",
      "O'tgan tunda shifokor kimni qutqargan ekan?",
      "Men oddiy tinch aholiman, shaharni qutqarishimiz kerak!",
      "Kim ko'p gapirsa o'sha mafiya bo'lishi mumkin :)",
      "Komissar kimni tekshirdi, dalil bormi?",
      "Gumonlanuvchilarga diqqat bilan qaraylik.",
      "Shoshilmasdan ovoz berishimiz kerak."
    ];

    const livingBots = Array.from(room.players.values()).filter(p => p.isAlive && p.isBot);
    if (livingBots.length === 0) return;

    // Pick 1-2 bots to randomly say something
    const count = Math.min(2, livingBots.length);
    for (let i = 0; i < count; i++) {
      const delay = (i + 1) * (5000 + Math.random() * 8000);
      setTimeout(() => {
        if (room.currentPhase !== 'DISCUSSION') return;
        const bot = livingBots[Math.floor(Math.random() * livingBots.length)];
        const text = BOT_UTTERANCES[Math.floor(Math.random() * BOT_UTTERANCES.length)];
        this.handleChat(room.roomCode, bot.id, text, 'public');
      }, delay);
    }
  }

  private simulateBotVoting(room: RoomData) {
    setTimeout(() => {
      if (room.currentPhase !== 'VOTING') return;

      const livingPlayers = Array.from(room.players.values()).filter(p => p.isAlive);
      const livingBots = livingPlayers.filter(p => p.isBot);

      for (const bot of livingBots) {
        // Vote for another living player or skip
        const potentialTargets = livingPlayers.filter(p => p.id !== bot.id);
        if (potentialTargets.length > 0) {
          const rand = Math.random();
          if (rand < 0.15) {
            this.handleVote(room.roomCode, bot.id, 'skip');
          } else {
            const target = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
            this.handleVote(room.roomCode, bot.id, target.id);
          }
        }
      }
    }, 4000);
  }
}
