import React from 'react';
import { GamePhase } from '../types/mafia';
import { Moon, Sun, MessageSquare, Vote, Gavel, Sparkles, Pause, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhaseBannerProps {
  phase: GamePhase;
  dayNumber: number;
  nightNumber: number;
  timeRemaining: number;
  isPaused: boolean;
  aliveCount: number;
  deadCount: number;
}

export const PhaseBanner: React.FC<PhaseBannerProps> = ({
  phase,
  dayNumber,
  nightNumber,
  timeRemaining,
  isPaused,
  aliveCount,
  deadCount,
}) => {
  const getPhaseInfo = () => {
    switch (phase) {
      case 'ROLE_REVEAL':
        return {
          title: 'MAXFIY ROL OCHILISHI',
          subtitle: 'Rolingizni eslab qoling va maqsadingizni belgilang.',
          icon: Sparkles,
          color: 'bg-[#141520] border-indigo-900/40 text-indigo-300',
          accent: 'text-indigo-400',
        };
      case 'NIGHT':
        return {
          title: `${nightNumber}-TUN`,
          subtitle: "Shahar uyquga ketdi... Maxsus rollar o'z amallarini bajarmoqda.",
          icon: Moon,
          color: 'bg-[#12131d] border-indigo-900/40 text-indigo-300',
          accent: 'text-indigo-400',
        };
      case 'DAY':
        return {
          title: `${dayNumber}-KUN TONGGI`,
          subtitle: "Shahar uyg'ondi... Tunda sodir bo'lgan voqealar ma'lum qilindi.",
          icon: Sun,
          color: 'bg-[#171612] border-amber-900/40 text-amber-300',
          accent: 'text-amber-400',
        };
      case 'DISCUSSION':
        return {
          title: `${dayNumber}-KUN: MUHOKAMA`,
          subtitle: "Gumonlanuvchilarni fosh qiling va dalillarni muhokama qiling.",
          icon: MessageSquare,
          color: 'bg-[#12131a] border-zinc-800 text-zinc-200',
          accent: 'text-sky-400',
        };
      case 'VOTING':
        return {
          title: 'OVOZ BERISH FAZASI',
          subtitle: 'Gumonlanuvchiga ovoz bering yoki ovozni o‘tkazib yuboring.',
          icon: Vote,
          color: 'bg-[#1a1215] border-red-900/40 text-red-300',
          accent: 'text-red-400',
        };
      case 'EXECUTION':
        return {
          title: 'SHAHAR SUDI VA QATL',
          subtitle: 'Ovozlar hisoblanmoqda va sud qarori ijro etilmoqda...',
          icon: Gavel,
          color: 'bg-[#1c1214] border-red-800/60 text-red-300',
          accent: 'text-red-500',
        };
      case 'GAME_OVER':
        return {
          title: "O'YIN YAKUNLANDI",
          subtitle: "G'olib jamoa aniqlandi va barcha yashirin rollar fosh etildi!",
          icon: Trophy,
          color: 'bg-[#171612] border-amber-800/40 text-amber-300',
          accent: 'text-amber-400',
        };
      default:
        return {
          title: 'XONA LOBBIYSI',
          subtitle: "Boshqa o'yinchilar qo'shilishini kuting.",
          icon: Sparkles,
          color: 'bg-[#12131a] border-zinc-800 text-zinc-300',
          accent: 'text-zinc-400',
        };
    }
  };

  const info = getPhaseInfo();
  const IconComponent = info.icon;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full rounded-2xl border p-4 sm:p-5 ${info.color} shadow-lg relative overflow-hidden transition-all`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
            <IconComponent className={`w-5 h-5 ${info.accent}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-wide uppercase text-white">
                {info.title}
              </h1>
              {isPaused && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                  <Pause className="w-3 h-3" /> To'xtatildi
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {info.subtitle}
            </p>
          </div>
        </div>

        {/* Right side stats: Timer and Alive/Dead badges */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-zinc-800 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Tirik: {aliveCount}</span>
            </div>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-1.5 text-red-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Vafot: {deadCount}</span>
            </div>
          </div>

          {phase !== 'GAME_OVER' && phase !== 'LOBBY' && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/50 border border-zinc-700">
              <span className={`text-base font-mono font-bold ${timeRemaining <= 5 ? 'text-red-400' : 'text-zinc-200'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
