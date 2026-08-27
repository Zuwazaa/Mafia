import { 
  GamePhase, 
  Player, 
  RoomSettings, 
  RoleId, 
  ChatMessage, 
  GameLog, 
  PublicGameState, 
  PrivatePlayerState, 
  Team 
} from '../src/types/mafia';

export interface RoomData {
  roomCode: string;
  hostId: string;
  players: Map<string, Player>;
  settings: RoomSettings;
  status: 'waiting' | 'in_progress' | 'ended';
  currentPhase: GamePhase;
  dayNumber: number;
  nightNumber: number;
  phaseTimer: NodeJS.Timeout | null;
  phaseTimeRemaining: number;
  isPaused: boolean;
  phaseTotalTime: number;
  messages: ChatMessage[];
  logs: GameLog[];
  // Night action staging
  nightActions: {
    mafiaVotes: Map<string, string>; // mafiaPlayerId -> targetPlayerId
    doctorTarget: string | null;
    detectiveTarget: string | null;
    detectivePlayerId: string | null;
    maniacTarget: string | null;
    detectiveReport: { targetName: string; isMafia: boolean } | null;
  };
  // Day voting staging
  votes: Map<string, string>; // voterPlayerId -> targetPlayerId | 'skip'
  lastNightResult: {
    deaths: Array<{ id: string; name: string; role?: RoleId }>;
    saved: boolean;
  } | null;
  lastVoteResult: {
    votesCount: Record<string, number>;
    eliminatedPlayerId: string | null;
    eliminatedPlayerName: string | null;
    eliminatedPlayerRole?: RoleId;
    isTie: boolean;
  } | null;
  winner: Team | 'maniac' | null;
  winnerTeamName: string | null;
  winnerPlayerNames: string[];
  createdAt: number;
}

export class MemoryStore {
  private rooms = new Map<string, RoomData>();
  private playerSessions = new Map<string, { playerId: string; roomCode: string; name: string; email: string }>();

  createRoom(hostPlayer: { id: string; name: string; email: string; avatarIndex: number }): RoomData {
    let roomCode = this.generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = this.generateRoomCode();
    }

    const host: Player = {
      id: hostPlayer.id,
      name: hostPlayer.name,
      email: hostPlayer.email,
      avatarIndex: hostPlayer.avatarIndex,
      isHost: true,
      isAlive: true,
      connected: true,
      joinedAt: Date.now(),
    };

    const playersMap = new Map<string, Player>();
    playersMap.set(host.id, host);

    const defaultSettings: RoomSettings = {
      minPlayers: 4,
      maxPlayers: 15,
      mafiaCount: 1,
      hasDoctor: true,
      hasDetective: true,
      hasManiac: false,
      discussionTime: 45,
      votingTime: 30,
      nightTime: 25,
      revealRoleOnDeath: true,
    };

    const room: RoomData = {
      roomCode,
      hostId: host.id,
      players: playersMap,
      settings: defaultSettings,
      status: 'waiting',
      currentPhase: 'LOBBY',
      dayNumber: 0,
      nightNumber: 0,
      phaseTimer: null,
      phaseTimeRemaining: 0,
      phaseTotalTime: 0,
      isPaused: false,
      messages: [
        {
          id: 'welcome_' + Date.now(),
          senderId: 'system',
          senderName: 'Tizim',
          isSystem: true,
          channel: 'public',
          text: `🎉 Xona yaratildi! Xona kodi: ${roomCode}. Boshqa o'yinchilarni taklif qiling.`,
          timestamp: Date.now(),
          phase: 'LOBBY',
        },
      ],
      logs: [
        {
          id: 'log_' + Date.now(),
          timestamp: Date.now(),
          dayNumber: 0,
          phase: 'LOBBY',
          message: `${host.name} xona yaratdi va Boshlovchi bo'ldi.`,
          type: 'system',
        },
      ],
      nightActions: {
        mafiaVotes: new Map(),
        doctorTarget: null,
        detectiveTarget: null,
        detectivePlayerId: null,
        maniacTarget: null,
        detectiveReport: null,
      },
      votes: new Map(),
      lastNightResult: null,
      lastVoteResult: null,
      winner: null,
      winnerTeamName: null,
      winnerPlayerNames: [],
      createdAt: Date.now(),
    };

    this.rooms.set(roomCode, room);
    this.playerSessions.set(host.id, {
      playerId: host.id,
      roomCode,
      name: host.name,
      email: host.email,
    });

    return room;
  }

  getRoom(roomCode: string): RoomData | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  deleteRoom(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (room && room.phaseTimer) {
      clearInterval(room.phaseTimer);
    }
    this.rooms.delete(roomCode);
  }

  getSession(playerId: string) {
    return this.playerSessions.get(playerId);
  }

  setSession(playerId: string, roomCode: string, name: string, email: string) {
    this.playerSessions.set(playerId, { playerId, roomCode, name, email });
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  getAllRooms(): RoomData[] {
    return Array.from(this.rooms.values());
  }
}

export const memoryStore = new MemoryStore();
