import React, { useState } from 'react';
import { useAuth, AVATAR_COLORS, AVATAR_INITIALS } from '../context/AuthContext';
import { soundEffects } from '../utils/soundEffects';
import { Volume2, VolumeX, BookOpen, Copy, Check, Share2, Skull, Wifi, WifiOff } from 'lucide-react';
import { RulesModal } from './RulesModal';

interface HeaderProps {
  roomCode?: string;
  isConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ roomCode, isConnected = true }) => {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(soundEffects.getIsMuted());
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleAudio = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
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
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (!roomCode) return;
    const shareData = {
      title: "Mafiya O'yini",
      text: `Mafiya o'yiniga qo'shiling! Xona kodi: ${roomCode}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {}
    } else {
      handleCopyCode();
    }
  };

  return (
    <>
      <header className="w-full bg-[#08080c]/85 border-b border-white/10 backdrop-blur-xl sticky top-0 z-40 px-3 sm:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-950 via-[#180a0a] to-[#251010] border border-red-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.35)]">
              <Skull className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-wider text-white flex items-center gap-1.5 font-display">
                <span className="text-[#f5f5f5]">MAFIA</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 font-mono font-bold tracking-normal">
                  ONLINE
                </span>
              </h1>
            </div>
          </div>

          {/* Room Code Badge (if inside a room) */}
          {roomCode && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#121218]/90 border border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
                XONA:
              </span>
              <span className="font-mono font-black text-xs sm:text-sm text-[#d4af37] tracking-widest">
                {roomCode}
              </span>

              <button
                type="button"
                onClick={handleCopyCode}
                title="Kodni nusxalash"
                className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleShare}
                title="Xonani ulashish"
                className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer transition-colors hidden xs:inline-flex"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Right Action Icons & User */}
          <div className="flex items-center gap-2">
            {/* Connection Indicator */}
            <div
              className={`p-1.5 rounded-xl border flex items-center justify-center ${
                isConnected
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                  : 'bg-red-950/40 text-red-400 border-red-800/50'
              }`}
              title={isConnected ? 'Serverga ulangan' : 'Aloqa uzildi'}
            >
              {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            </div>

            {/* Rules Button */}
            <button
              type="button"
              onClick={() => setIsRulesOpen(true)}
              className="p-1.5 rounded-xl bg-[#121218] hover:bg-[#1c1c24] border border-white/10 text-zinc-300 hover:text-[#d4af37] hover:border-[#d4af37]/40 cursor-pointer transition-colors"
              title="Qoidalar"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-[#121218] border-white/10 text-zinc-500 hover:text-zinc-300'
                  : 'bg-[#d4af37]/10 border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/20 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              }`}
              title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* User Profile Mini Badge */}
            {user && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-tr ${
                    AVATAR_COLORS[user.avatarIndex % AVATAR_COLORS.length]
                  } flex items-center justify-center text-xs shadow-inner flex-shrink-0 border border-white/20`}
                >
                  {AVATAR_INITIALS[user.avatarIndex % AVATAR_INITIALS.length]}
                </div>
                <span className="text-xs font-bold text-zinc-200 max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                  {user.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </>
  );
};
