import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { PhaseBanner } from '../components/PhaseBanner';
import { RoleCard } from '../components/RoleCard';
import { PlayerGrid } from '../components/PlayerGrid';
import { NightActionModal } from '../components/NightActionModal';
import { VotingPanel } from '../components/VotingPanel';
import { ChatPanel } from '../components/ChatPanel';
import { HostControls } from '../components/HostControls';
import { GameOverModal } from '../components/GameOverModal';
import { ROLES_DATA } from '../data/rolesData';
import { Skull, Shield, HeartHandshake, Search, Sun, Moon, Gavel, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GamePageProps {
  onLeaveRoom: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({ onLeaveRoom }) => {
  const { user } = useAuth();
  const { 
    gameState, 
    privateState, 
    messages, 
    sendNightAction, 
    sendVote, 
    sendChat, 
    hostAction, 
    addBot,
    startGame 
  } = useSocket();

  if (!gameState || !privateState) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center animate-spin mb-4">
          <Skull className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-white">O'yin holati sinxronizatsiya qilinmoqda...</h3>
      </div>
    );
  }

  const myId = user?.id || '';
  const myPlayer = gameState.players.find((p) => p.id === myId);
  const isAlive = myPlayer ? myPlayer.isAlive : false;
  const isHost = gameState.hostId === myId;
  const currentPhase = gameState.currentPhase;

  const livingPlayers = gameState.players.filter((p) => p.isAlive);
  const aliveCount = livingPlayers.length;
  const deadCount = gameState.players.length - aliveCount;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Top Banner with Phase name, Timer, and Alive Stats */}
      <PhaseBanner
        phase={currentPhase}
        dayNumber={gameState.dayNumber}
        nightNumber={gameState.nightNumber}
        timeRemaining={gameState.timeRemaining}
        isPaused={gameState.isPaused}
        aliveCount={aliveCount}
        deadCount={deadCount}
      />

      {/* Host In-Game Management Controls Bar */}
      {isHost && (
        <HostControls
          currentPhase={currentPhase}
          isPaused={gameState.isPaused}
          isHost={isHost}
          playerCount={gameState.players.length}
          settings={gameState.settings}
          onHostAction={hostAction}
          onAddBot={addBot}
        />
      )}

      {/* Main Game Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center Content Stage (7 or 8 columns) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Phase Specific Main Action Area */}
          <AnimatePresence mode="wait">
            {/* 1. ROLE REVEAL PHASE */}
            {currentPhase === 'ROLE_REVEAL' && (
              <motion.div
                key="role_reveal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-4"
              >
                {privateState.myRole && (
                  <RoleCard
                    roleId={privateState.myRole}
                    teammates={privateState.myTeammates}
                    isDramaticReveal={true}
                  />
                )}
              </motion.div>
            )}

            {/* 2. NIGHT PHASE */}
            {currentPhase === 'NIGHT' && (
              <motion.div
                key="night_phase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {isAlive && privateState.myRole ? (
                  <NightActionModal
                    myRole={privateState.myRole}
                    livingPlayers={livingPlayers}
                    myId={myId}
                    selectedTargetId={privateState.myActionTarget}
                    detectiveReport={privateState.detectiveReport}
                    teammates={privateState.myTeammates}
                    mafiaVotes={privateState.mafiaVotes}
                    mafiaTargetsCount={privateState.mafiaTargetsCount}
                    leadingMafiaTarget={privateState.leadingMafiaTarget}
                    allPlayers={gameState.players}
                    onSelectTarget={sendNightAction}
                  />
                ) : (
                  <div className="p-8 rounded-2xl bg-[#12131a] border border-zinc-800 text-center shadow-lg">
                    <Moon className="w-10 h-10 text-indigo-400 mx-auto mb-2.5 opacity-80" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Tun Fazasi
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Maxsus rollar o'z harakatlarini yakunlamoqda. Shahar uyquda...
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. DAY PHASE (MORNING ANNOUNCEMENT) */}
            {currentPhase === 'DAY' && (
              <motion.div
                key="day_phase"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 rounded-3xl bg-gradient-to-b from-[#1a1505] via-[#0d0d12] to-black border border-[#d4af37]/30 text-center shadow-2xl backdrop-blur-md"
              >
                <Sun className="w-12 h-12 text-[#d4af37] mx-auto mb-3 animate-bounce drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white font-display">
                  {gameState.dayNumber}-Kun: Shahar Tonggi
                </h3>

                {gameState.lastNightResult?.deaths && gameState.lastNightResult.deaths.length > 0 ? (
                  <div className="mt-4 p-4 rounded-2xl bg-red-950/60 border border-red-700/60 max-w-md mx-auto">
                    <span className="text-xs uppercase font-bold text-red-400 tracking-wider block mb-1">
                      Tungi Qurbonlar:
                    </span>
                    <div className="space-y-1">
                      {gameState.lastNightResult.deaths.map((victim) => (
                        <p key={victim.id} className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                          <Skull className="w-4 h-4 text-red-500" />
                          <span>{victim.name}</span>
                          {victim.role && (
                            <span className="text-xs text-zinc-400 font-normal">
                              ({ROLES_DATA[victim.role].name})
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 max-w-md mx-auto">
                    <p className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-emerald-400" />
                      <span>O'tgan tunda hech kim halok bo'lmadi!</span>
                    </p>
                    {gameState.lastNightResult?.saved && (
                      <p className="text-xs text-emerald-400/80 mt-1">
                        Shifokor inson hayotini saqlab qolishga muvaffaq bo'ldi.
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. DISCUSSION PHASE */}
            {currentPhase === 'DISCUSSION' && (
              <motion.div
                key="discussion_phase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 rounded-3xl bg-[#0d0d12]/90 border border-white/10 backdrop-blur-md shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-display">
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                    <span>Shahardagi Gumonlanuvchilar va O'yinchilar</span>
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    {livingPlayers.length} nafar tirik fuqaro
                  </span>
                </div>

                <PlayerGrid
                  players={gameState.players}
                  myId={myId}
                  isSelectable={false}
                />
              </motion.div>
            )}

            {/* 5. VOTING PHASE */}
            {currentPhase === 'VOTING' && (
              <motion.div
                key="voting_phase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <VotingPanel
                  livingPlayers={livingPlayers}
                  myId={myId}
                  myVoteTarget={privateState.myVoteTarget}
                  lastVoteResult={gameState.lastVoteResult}
                  onVote={sendVote}
                  isAlive={isAlive}
                />
              </motion.div>
            )}

            {/* 6. EXECUTION PHASE */}
            {currentPhase === 'EXECUTION' && (
              <motion.div
                key="execution_phase"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 rounded-3xl bg-gradient-to-b from-red-950/60 via-[#0d0d12] to-black border border-red-600/40 text-center shadow-2xl backdrop-blur-md"
              >
                <Gavel className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white font-display">
                  Shahar Sudi Natijasi
                </h3>

                {gameState.lastVoteResult?.eliminatedPlayerName ? (
                  <div className="mt-4 p-4 rounded-2xl bg-red-950/70 border border-red-700 max-w-md mx-auto">
                    <span className="text-xs uppercase font-bold text-red-400 tracking-wider block mb-1">
                      Qatl Etilgan O'yinchi:
                    </span>
                    <p className="text-base font-black text-white">
                      {gameState.lastVoteResult.eliminatedPlayerName}
                    </p>
                    {gameState.lastVoteResult.eliminatedPlayerRole && (
                      <p className="text-xs text-[#d4af37] mt-1 font-semibold">
                        Rol: {ROLES_DATA[gameState.lastVoteResult.eliminatedPlayerRole].name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-2xl bg-[#14141c] border border-white/10 max-w-md mx-auto">
                    <p className="text-sm font-bold text-zinc-300">
                      Ovozlar yetarli bo'lmadi yoki teng keldi. Bugun hech kim qatl qilinmadi.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Players Overview Grid during Night / Day / Execution */}
          {currentPhase !== 'DISCUSSION' && currentPhase !== 'ROLE_REVEAL' && (
            <div className="p-4 rounded-3xl bg-[#0a0a0f]/90 border border-white/10 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-display">
                  O'yinchilar Ro'yxati
                </span>
                <span className="text-[11px] text-zinc-500">
                  {aliveCount} tirik, {deadCount} vafot
                </span>
              </div>
              <PlayerGrid
                players={gameState.players}
                myId={myId}
                isSelectable={false}
              />
            </div>
          )}
        </div>

        {/* Right Content / Sidebar: Chat Panel & Player's Secret Role Widget (5 or 4 columns) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Mini My Role Info Card */}
          {privateState.myRole && (
            <div className="p-3.5 rounded-2xl bg-[#0e0e14]/90 border border-white/10 flex items-center justify-between shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border ${ROLES_DATA[privateState.myRole].badgeBg}`}>
                  {privateState.myRole === 'mafia' ? '🥷' : privateState.myRole === 'doctor' ? '👨‍⚕️' : privateState.myRole === 'detective' ? '🕵️' : privateState.myRole === 'maniac' ? '🔥' : '🛡️'}
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold block font-display">
                    Sizning Rolingiz:
                  </span>
                  <span className="text-xs font-bold text-white">
                    {ROLES_DATA[privateState.myRole].name}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isAlive ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60' : 'bg-red-950/80 text-red-400 border border-red-700/60'
                }`}
              >
                {isAlive ? 'Tirik' : 'Vafot etgan'}
              </span>
            </div>
          )}

          {/* Real-time Multi-channel Chat Panel */}
          <ChatPanel
            messages={messages}
            myId={myId}
            myRole={privateState.myRole}
            isAlive={isAlive}
            currentPhase={currentPhase}
            canChatPublic={privateState.canChatPublic}
            canChatMafia={privateState.canChatMafia}
            canChatDead={privateState.canChatDead}
            onSendMessage={(text, channel) => sendChat(text, channel)}
          />
        </div>
      </div>

      {/* Game Over Modal when victory reached */}
      {currentPhase === 'GAME_OVER' && (
        <GameOverModal
          winner={gameState.winner}
          winnerTeamName={gameState.winnerTeamName}
          winnerPlayerNames={gameState.winnerPlayerNames}
          players={gameState.players}
          isHost={isHost}
          onRestart={() => hostAction('restart')}
          onLeave={onLeaveRoom}
        />
      )}
    </div>
  );
};
