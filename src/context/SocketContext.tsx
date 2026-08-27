import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  PublicGameState, 
  PrivatePlayerState, 
  ChatMessage, 
  ClientSyncPayload, 
  RoomSettings 
} from '../types/mafia';
import { useAuth, UserProfile } from './AuthContext';
import { soundEffects } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  gameState: PublicGameState | null;
  privateState: PrivatePlayerState | null;
  messages: ChatMessage[];
  errorMessage: string | null;
  clearError: () => void;
  joinRoom: (roomCode: string, userOverride?: UserProfile) => void;
  startGame: () => void;
  sendNightAction: (targetId: string) => void;
  sendVote: (targetId: string | 'skip') => void;
  sendChat: (text: string, channel: 'public' | 'mafia' | 'dead') => void;
  hostAction: (action: 'pause' | 'resume' | 'skip' | 'end' | 'restart') => void;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  addBot: () => void;
  kickPlayer: (playerId: string) => void;
  leaveRoom: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [privateState, setPrivateState] = useState<PrivatePlayerState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const prevPhaseRef = useRef<string | null>(null);

  useEffect(() => {
    // Connect to server
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      setIsConnected(true);
      // If user is in a room, attempt auto rejoin
      const savedRoom = sessionStorage.getItem('mafia_active_room');
      if (savedRoom && user) {
        s.emit('room:join', { roomCode: savedRoom, player: user });
      }
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('game:sync', (payload: ClientSyncPayload) => {
      setGameState(payload.gameState);
      setPrivateState(payload.privateState);
      setMessages(payload.messages);

      // Check phase change for sound effects & animations
      const currentPhase = payload.gameState.currentPhase;
      if (prevPhaseRef.current !== currentPhase) {
        if (currentPhase === 'ROLE_REVEAL') {
          soundEffects.playRoleReveal();
        } else if (currentPhase === 'NIGHT') {
          soundEffects.playNightBegins();
        } else if (currentPhase === 'DAY') {
          soundEffects.playDayBegins();
        } else if (currentPhase === 'EXECUTION' && payload.gameState.lastVoteResult?.eliminatedPlayerId) {
          soundEffects.playElimination();
        } else if (currentPhase === 'GAME_OVER') {
          soundEffects.playVictory();
          // Confetti celebration
          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });
          } catch (e) {}
        }
        prevPhaseRef.current = currentPhase;
      }
    });

    s.on('game:timer', ({ timeRemaining }: { timeRemaining: number; currentPhase: string }) => {
      setGameState((prev) => (prev ? { ...prev, timeRemaining } : prev));
    });

    s.on('chat:new', (msg: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    s.on('error:message', (err: string) => {
      setErrorMessage(err);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  const clearError = () => setErrorMessage(null);

  const joinRoom = (roomCode: string, userOverride?: UserProfile) => {
    const activeUser = userOverride || user;
    if (!activeUser || !socket) return;
    sessionStorage.setItem('mafia_active_room', roomCode.toUpperCase());
    socket.emit('room:join', { roomCode: roomCode.toUpperCase(), player: activeUser });
  };

  const startGame = () => {
    if (!socket) return;
    socket.emit('game:start');
  };

  const sendNightAction = (targetId: string) => {
    if (!socket) return;
    socket.emit('action:night_target', { targetId });
    soundEffects.playVoteClick();
  };

  const sendVote = (targetId: string | 'skip') => {
    if (!socket) return;
    socket.emit('action:vote', { targetId });
    soundEffects.playVoteClick();
  };

  const sendChat = (text: string, channel: 'public' | 'mafia' | 'dead') => {
    if (!socket) return;
    socket.emit('chat:send', { text, channel });
  };

  const hostAction = (action: 'pause' | 'resume' | 'skip' | 'end' | 'restart') => {
    if (!socket) return;
    socket.emit('host:action', { action });
  };

  const updateSettings = (settings: Partial<RoomSettings>) => {
    if (!socket) return;
    socket.emit('host:update_settings', { settings });
  };

  const addBot = () => {
    if (!socket) return;
    socket.emit('host:add_bot');
  };

  const kickPlayer = (playerId: string) => {
    if (!socket) return;
    socket.emit('host:kick_player', { playerId });
  };

  const leaveRoom = () => {
    sessionStorage.removeItem('mafia_active_room');
    setGameState(null);
    setPrivateState(null);
    setMessages([]);
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        gameState,
        privateState,
        messages,
        errorMessage,
        clearError,
        joinRoom,
        startGame,
        sendNightAction,
        sendVote,
        sendChat,
        hostAction,
        updateSettings,
        addBot,
        kickPlayer,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
