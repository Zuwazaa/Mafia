export type RoleId = 'mafia' | 'doctor' | 'detective' | 'maniac' | 'citizen';

export type Team = 'mafia' | 'city' | 'neutral';

export type GamePhase = 
  | 'LOBBY' 
  | 'ROLE_REVEAL' 
  | 'NIGHT' 
  | 'DAY' 
  | 'DISCUSSION' 
  | 'VOTING' 
  | 'EXECUTION' 
  | 'GAME_OVER';

export interface RoleDefinition {
  id: RoleId;
  name: string; // O'zbekcha nomi
  team: Team;
  teamName: string;
  description: string;
  ability: string;
  icon: string;
  color: string;
  badgeBg: string;
}

export interface Player {
  id: string; // unique player ID (uuid or token)
  socketId?: string;
  name: string;
  email: string;
  avatarIndex: number;
  isHost: boolean;
  isBot?: boolean;
  isAlive: boolean;
  role?: RoleId; // Only visible to the player or at game over
  roleRevealed?: boolean;
  hasActedThisPhase?: boolean;
  votedForId?: string | null;
  targetId?: string | null;
  investigatedByDetective?: boolean;
  connected: boolean;
  joinedAt: number;
}

export interface RoomSettings {
  minPlayers: number;
  maxPlayers: number;
  mafiaCount: number;
  hasDoctor: boolean;
  hasDetective: boolean;
  hasManiac: boolean;
  discussionTime: number; // in seconds, default 60
  votingTime: number; // in seconds, default 30
  nightTime: number; // in seconds, default 35
  revealRoleOnDeath: boolean; // default true
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: RoleId;
  isSystem?: boolean;
  channel: 'public' | 'mafia' | 'dead';
  text: string;
  timestamp: number;
  phase: GamePhase;
}

export interface NightResult {
  killedPlayerId: string | null;
  killedPlayerName: string | null;
  killedPlayerRole?: RoleId;
  protectedPlayerId: string | null;
  maniacTargetId: string | null;
  detectiveInvestigation?: {
    targetId: string;
    targetName: string;
    isMafia: boolean;
  } | null;
}

export interface VoteResult {
  votesCount: Record<string, number>; // playerId -> count, 'skip' -> count
  eliminatedPlayerId: string | null;
  eliminatedPlayerName: string | null;
  eliminatedPlayerRole?: RoleId;
  isTie: boolean;
}

export interface GameLog {
  id: string;
  timestamp: number;
  dayNumber: number;
  phase: GamePhase;
  message: string;
  type: 'info' | 'kill' | 'save' | 'vote' | 'system' | 'phase';
}

export interface PublicGameState {
  roomCode: string;
  status: 'waiting' | 'in_progress' | 'ended';
  currentPhase: GamePhase;
  dayNumber: number;
  nightNumber: number;
  timeRemaining: number;
  isPaused: boolean;
  players: Array<{
    id: string;
    name: string;
    avatarIndex: number;
    isHost: boolean;
    isBot?: boolean;
    isAlive: boolean;
    connected: boolean;
    role?: RoleId; // Only if public (dead and revealed, or GAME_OVER)
    hasVoted?: boolean;
    votedForId?: string | null; // shown only at end of voting
  }>;
  hostId: string;
  settings: RoomSettings;
  winner: Team | 'maniac' | null;
  winnerTeamName: string | null;
  winnerPlayerNames: string[];
  lastNightResult: {
    deaths: Array<{ id: string; name: string; role?: RoleId }>;
    saved: boolean;
  } | null;
  lastVoteResult: VoteResult | null;
  logs: GameLog[];
}

export interface PrivatePlayerState {
  myId: string;
  myRole: RoleId | null;
  myTeammates: Array<{ id: string; name: string; role: RoleId }>;
  myActionTarget: string | null;
  mafiaVotes?: Record<string, string>; // mafiaPlayerId -> targetPlayerId
  mafiaTargetsCount?: Record<string, number>; // targetId -> count of mafia votes
  leadingMafiaTarget?: string | null;
  myVoteTarget: string | null;
  detectiveReport: { targetName: string; isMafia: boolean } | null;
  canAct: boolean;
  canChatPublic: boolean;
  canChatMafia: boolean;
  canChatDead: boolean;
}

export interface ClientSyncPayload {
  gameState: PublicGameState;
  privateState: PrivatePlayerState;
  messages: ChatMessage[];
}
