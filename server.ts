import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { memoryStore } from './server/store';
import { GameEngine } from './server/gameEngine';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const gameEngine = new GameEngine(io);

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // Create Room endpoint
  app.post('/api/room/create', (req, res) => {
    try {
      const { playerId, name, email, avatarIndex } = req.body;
      if (!name || !playerId) {
        return res.status(400).json({ error: "Ism va o'yinchi ID talab qilinadi" });
      }

      const room = memoryStore.createRoom({
        id: playerId,
        name: name.trim(),
        email: (email || `${name.toLowerCase()}@mafia.uz`).trim(),
        avatarIndex: avatarIndex || 0,
      });

      return res.json({
        roomCode: room.roomCode,
        hostId: room.hostId,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Server xatosi" });
    }
  });

  // Check Room endpoint
  app.get('/api/room/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = memoryStore.getRoom(code);
    if (!room) {
      return res.status(404).json({ error: "Xona topilmadi" });
    }
    return res.json({
      roomCode: room.roomCode,
      status: room.status,
      playerCount: room.players.size,
      maxPlayers: room.settings.maxPlayers,
    });
  });

  // Socket.IO Real-Time Handlers
  io.on('connection', (socket) => {
    let currentRoomCode: string | null = null;
    let currentPlayerId: string | null = null;

    // Join room event
    socket.on('room:join', ({ roomCode, player }: { roomCode: string; player: { id: string; name: string; email: string; avatarIndex: number } }) => {
      const code = roomCode.toUpperCase();
      const room = memoryStore.getRoom(code);
      if (!room) {
        socket.emit('error:message', "Bunday xona kodi mavjud emas.");
        return;
      }

      currentRoomCode = code;
      currentPlayerId = player.id;
      socket.join(code);

      // Check if player already exists (reconnection)
      let existingPlayer = room.players.get(player.id);
      if (existingPlayer) {
        existingPlayer.socketId = socket.id;
        existingPlayer.connected = true;
        existingPlayer.name = player.name;
        existingPlayer.avatarIndex = player.avatarIndex;
        gameEngine.addLog(room, `🟢 ${existingPlayer.name} qayta ulandi.`, 'system');
      } else {
        // New player joining
        if (room.status !== 'waiting') {
          socket.emit('error:message', "O'yin allaqachon boshlangan. Faqat tomoshabin yoki keyingi o'yinda qatnashish mumkin.");
          return;
        }

        if (room.players.size >= room.settings.maxPlayers) {
          socket.emit('error:message', "Xona to'lgan.");
          return;
        }

        const isFirst = room.players.size === 0;
        const newPlayer = {
          id: player.id,
          socketId: socket.id,
          name: player.name.trim(),
          email: player.email ? player.email.trim() : `${player.name.toLowerCase()}@mafia.uz`,
          avatarIndex: player.avatarIndex || 0,
          isHost: isFirst || room.hostId === player.id,
          isAlive: true,
          connected: true,
          joinedAt: Date.now(),
        };

        if (isFirst) {
          room.hostId = player.id;
        }

        room.players.set(player.id, newPlayer);
        gameEngine.addLog(room, `🔔 ${newPlayer.name} xonaga qo'shildi`, 'system');
      }

      memoryStore.setSession(player.id, code, player.name, player.email);
      gameEngine.syncRoom(code);
    });

    // Start game event (Host only)
    socket.on('game:start', () => {
      if (!currentRoomCode || !currentPlayerId) return;
      const result = gameEngine.startGame(currentRoomCode, currentPlayerId);
      if (!result.success && result.error) {
        socket.emit('error:message', result.error);
      }
    });

    // Night action event
    socket.on('action:night_target', ({ targetId }: { targetId: string }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      gameEngine.handleNightAction(currentRoomCode, currentPlayerId, targetId);
    });

    // Voting action event
    socket.on('action:vote', ({ targetId }: { targetId: string | 'skip' }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      gameEngine.handleVote(currentRoomCode, currentPlayerId, targetId);
    });

    // Chat message event
    socket.on('chat:send', ({ text, channel }: { text: string; channel: 'public' | 'mafia' | 'dead' }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      gameEngine.handleChat(currentRoomCode, currentPlayerId, text, channel);
    });

    // Host action events
    socket.on('host:action', ({ action }: { action: 'pause' | 'resume' | 'skip' | 'end' | 'restart' }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      gameEngine.handleHostAction(currentRoomCode, currentPlayerId, action);
    });

    // Host update settings
    socket.on('host:update_settings', ({ settings }: { settings: any }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      gameEngine.updateSettings(currentRoomCode, currentPlayerId, settings);
    });

    // Host bot actions
    socket.on('host:add_bot', () => {
      if (!currentRoomCode) return;
      gameEngine.addBot(currentRoomCode);
    });

    socket.on('host:kick_player', ({ playerId }: { playerId: string }) => {
      if (!currentRoomCode) return;
      gameEngine.removePlayer(currentRoomCode, playerId);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      if (currentRoomCode && currentPlayerId) {
        const room = memoryStore.getRoom(currentRoomCode);
        if (room) {
          const player = room.players.get(currentPlayerId);
          if (player) {
            player.connected = false;
            // If in waiting lobby and not host, remove after a delay if disconnected
            if (room.status === 'waiting' && !player.isHost) {
              gameEngine.removePlayer(currentRoomCode, currentPlayerId);
            } else {
              gameEngine.syncRoom(currentRoomCode);
            }
          }
        }
      }
    });
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Mafia Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
