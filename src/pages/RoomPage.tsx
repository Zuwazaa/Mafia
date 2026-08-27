import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Copy, 
  Check, 
  Share2, 
  Play, 
  Bot, 
  Users, 
  Crown, 
  Shield, 
  Skull, 
  HeartHandshake, 
  Search, 
  Flame, 
  LogOut, 
  AlertCircle,
  XCircle
} from 'lucide-react';
import { AVATAR_COLORS, AVATAR_INITIALS } from '../context/AuthContext';
import { ChatPanel } from '../components/ChatPanel';
import { motion } from 'motion/react';

interface RoomPageProps {
  roomCode: string;
  onLeave: () => void;
}

export const RoomPage: React.FC<RoomPageProps> = ({ roomCode, onLeave }) => {
  const { user } = useAuth();
  const { 
    gameState, 
    privateState, 
    messages, 
    startGame, 
    addBot, 
    kickPlayer, 
    updateSettings, 
    sendChat,
    errorMessage,
    clearError 
  } = useSocket();

  const [copied, setCopied] = useState(false);

  if (!gameState) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center animate-spin mb-4">
          <Skull className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-white">Xona ma'lumotlari yuklanmoqda...</h3>
        <p className="text-xs text-slate-400 mt-1">Iltimos, kuting...</p>
      </div>
    );
  }

  const isHost = gameState.hostId === user?.id;
  const players = gameState.players;
  const settings = gameState.settings;
  const playerCount = players.length;

  // Calculate roles breakdown
  const mafiaCount = settings.mafiaCount;
  const doctorCount = settings.hasDoctor ? 1 : 0;
  const detectiveCount = settings.hasDetective ? 1 : 0;
  const maniacCount = settings.hasManiac ? 1 : 0;
  const totalSpecialRoles = mafiaCount + doctorCount + detectiveCount + maniacCount;
  const citizenCount = Math.max(0, playerCount - totalSpecialRoles);

  const isConfigValid = playerCount >= settings.minPlayers && totalSpecialRoles < playerCount;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(roomCode);
      } else {
        const el = document.createElement('textarea');
        el.value = roomCode;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleShare = async () => {
    const shareData = {
      title: "Mafia Online Xonasi",
      text: `Mafiya o'yiniga qo'shiling! Xona kodi: ${roomCode}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6">
      {/* Top Bar: Room Code, Share, and Leave */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0e0e14]/90 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37] font-display">
              MAFIA XONASI
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 font-semibold">
              Kutilmoqda
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <span className="font-mono font-black text-2xl sm:text-3xl text-[#d4af37] tracking-widest drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]">
              {roomCode}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-[#161620] hover:bg-[#20202c] border border-white/15 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#d4af37]" />}
              <span>{copied ? "Nusxalandi" : "Kodni Nusxalash"}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-[#161620] hover:bg-[#20202c] border border-white/15 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden sm:inline">Ulashish</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="px-4 py-2 rounded-2xl bg-black/60 border border-white/10 text-right">
            <span className="text-[11px] text-zinc-400 block font-medium">O'yinchilar:</span>
            <span className="text-sm sm:text-base font-extrabold text-white">
              {playerCount} / {settings.maxPlayers}
            </span>
          </div>

          <button
            type="button"
            onClick={onLeave}
            className="p-2.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-400 hover:text-red-200 cursor-pointer transition-all"
            title="Xonadan chiqish"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-2xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-red-400 hover:text-white text-xs underline cursor-pointer"
          >
            Yopish
          </button>
        </div>
      )}

      {/* Main Grid: Left (Players & Host Settings) & Right (Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player List and Host Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Players List Card */}
          <div className="rounded-3xl bg-[#0d0d12]/90 p-5 sm:p-6 border border-white/10 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#d4af37]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                  Xonadagi O'yinchilar ({playerCount})
                </h3>
              </div>

              {isHost && playerCount < settings.maxPlayers && (
                <button
                  type="button"
                  onClick={addBot}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>+ Bot Qo'shish</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {players.map((p) => {
                const isMe = p.id === user?.id;
                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-[#121218]/90 border border-white/10 flex items-center justify-between hover:border-[#d4af37]/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full bg-gradient-to-tr ${
                          AVATAR_COLORS[p.avatarIndex % AVATAR_COLORS.length]
                        } flex items-center justify-center text-sm shadow-inner flex-shrink-0 border border-white/15`}
                      >
                        {AVATAR_INITIALS[p.avatarIndex % AVATAR_INITIALS.length]}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-white truncate">
                            {p.name}
                          </p>
                          {isMe && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-semibold">
                              Siz
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          <span>{p.isBot ? "Bot O'yinchi" : "Tayyor"}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {p.isHost && (
                        <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-[10px] font-bold flex items-center gap-1">
                          <Crown className="w-3 h-3" /> HOST
                        </span>
                      )}

                      {/* Host can kick other players/bots */}
                      {isHost && !p.isHost && (
                        <button
                          type="button"
                          onClick={() => kickPlayer(p.id)}
                          className="p-1 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Chiqarib yuborish"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Host Game Settings & Role Distribution Card */}
          <div className="rounded-3xl bg-[#0d0d12]/90 p-5 sm:p-6 border border-white/10 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#d4af37]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                  Rollar va O'yin Sozlamalari
                </h3>
              </div>
              <span className="text-xs text-zinc-400">
                {isHost ? "Boshlovchi nazoratida" : "Faqat ko'rish"}
              </span>
            </div>

            {/* Role Config Rows */}
            <div className="space-y-3">
              {/* Mafia count */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#121218]/90 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-950 border border-red-700/50 text-red-500 flex items-center justify-center">
                    <Skull className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Mafiya Soni</h5>
                    <p className="text-[10px] text-zinc-400">Tungi qatllarni amalga oshiruvchi klan</p>
                  </div>
                </div>

                {isHost ? (
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => updateSettings({ mafiaCount: num })}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          settings.mafiaCount === num
                            ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.5)]'
                            : 'bg-[#181822] text-zinc-400 hover:text-white border border-white/10'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-bold text-red-400">{settings.mafiaCount} nafar</span>
                )}
              </div>

              {/* Doctor Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#121218]/90 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-700/50 text-emerald-400 flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Shifokor (Doktor)</h5>
                    <p className="text-[10px] text-zinc-400">Tunda insonlarni qutqaradi</p>
                  </div>
                </div>

                {isHost ? (
                  <button
                    type="button"
                    onClick={() => updateSettings({ hasDoctor: !settings.hasDoctor })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      settings.hasDoctor
                        ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'bg-[#181822] text-zinc-500 border border-white/10'
                    }`}
                  >
                    {settings.hasDoctor ? 'ON (Bor)' : 'OFF (Yo‘q)'}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400">
                    {settings.hasDoctor ? 'Mavjud' : 'Mavjud emas'}
                  </span>
                )}
              </div>

              {/* Detective Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#121218]/90 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-700/50 text-blue-400 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Komissar (Detektiv)</h5>
                    <p className="text-[10px] text-zinc-400">Gumonlanuvchilarni tekshiradi</p>
                  </div>
                </div>

                {isHost ? (
                  <button
                    type="button"
                    onClick={() => updateSettings({ hasDetective: !settings.hasDetective })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      settings.hasDetective
                        ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                        : 'bg-[#181822] text-zinc-500 border border-white/10'
                    }`}
                  >
                    {settings.hasDetective ? 'ON (Bor)' : 'OFF (Yo‘q)'}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-blue-400">
                    {settings.hasDetective ? 'Mavjud' : 'Mavjud emas'}
                  </span>
                )}
              </div>

              {/* Maniac Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#121218]/90 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-700/50 text-amber-400 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Manyak (Yakka Qotil)</h5>
                    <p className="text-[10px] text-zinc-400">Yolg'iz harakatlanuvchi qotil</p>
                  </div>
                </div>

                {isHost ? (
                  <button
                    type="button"
                    onClick={() => updateSettings({ hasManiac: !settings.hasManiac })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      settings.hasManiac
                        ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                        : 'bg-[#181822] text-zinc-500 border border-white/10'
                    }`}
                  >
                    {settings.hasManiac ? 'ON (Bor)' : 'OFF (Yo‘q)'}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-amber-400">
                    {settings.hasManiac ? 'Mavjud' : 'Mavjud emas'}
                  </span>
                )}
              </div>

              {/* Citizens Automatic remainder display */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#121218]/60 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Tinch Aholi (Fuqarolar)</h5>
                    <p className="text-[10px] text-zinc-400">Qolgan bo'sh o'rinlar avtomatik to'ldiriladi</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-zinc-300">
                  {citizenCount} nafar
                </span>
              </div>
            </div>

            {/* Start Game Button (Host only) */}
            {isHost ? (
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={!isConfigValid}
                  onClick={startGame}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-amber-600 to-[#b8860b] hover:from-amber-400 hover:to-amber-600 text-black font-extrabold text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.35)] cursor-pointer transition-all transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5 fill-black stroke-black" />
                  <span>O'yinni Boshlash ({playerCount} O'yinchi)</span>
                </button>
                {!isConfigValid && (
                  <p className="text-[11px] text-amber-400 text-center mt-2">
                    Kamida {settings.minPlayers} ta o'yinchi kerak. Bot qo'shish tugmasidan foydalanishingiz mumkin.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-zinc-400 animate-pulse font-mono">
                  Boshlovchi o'yinni boshlashini kuting...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lobby Chat Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 font-display">
              Lobbiy Chati
            </h4>
            <ChatPanel
              messages={messages}
              myId={user?.id || ''}
              myRole={null}
              isAlive={true}
              currentPhase="LOBBY"
              canChatPublic={true}
              canChatMafia={false}
              canChatDead={false}
              onSendMessage={(text) => sendChat(text, 'public')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
