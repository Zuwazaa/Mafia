import React from 'react';
import { Team, RoleId } from '../types/mafia';
import { ROLES_DATA } from '../data/rolesData';
import { Trophy, RotateCcw, Skull, Shield, Flame, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { AVATAR_COLORS, AVATAR_INITIALS } from '../context/AuthContext';

interface PlayerRevealItem {
  id: string;
  name: string;
  avatarIndex: number;
  isAlive: boolean;
  role?: RoleId;
}

interface GameOverModalProps {
  winner: Team | 'maniac' | null;
  winnerTeamName: string | null;
  winnerPlayerNames: string[];
  players: PlayerRevealItem[];
  isHost: boolean;
  onRestart: () => void;
  onLeave: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  winnerTeamName,
  winnerPlayerNames,
  players,
  isHost,
  onRestart,
  onLeave,
}) => {
  const getWinnerBanner = () => {
    switch (winner) {
      case 'mafia':
        return {
          title: "MAFIYA G'ALABA QOZONDI!",
          desc: "Shahar zulmat qo'ynida qoldi. Mafiya barcha raqiblarini yo'q qildi.",
          icon: Skull,
          color: "bg-[#181215] border-red-900/60 text-red-400",
          badgeColor: "bg-red-900/60 text-red-200 border-red-800",
        };
      case 'city':
        return {
          title: "TINCH AHOLI G'ALABA QOZONDI!",
          desc: "Adolat tantana qildi! Barcha jinoyatchilar va tahdidlar fosh etildi.",
          icon: Shield,
          color: "bg-[#14161f] border-indigo-900/60 text-indigo-400",
          badgeColor: "bg-indigo-950 text-indigo-300 border-indigo-800",
        };
      case 'maniac':
        return {
          title: "MANIK G'ALABA QOZONDI!",
          desc: "Yolg'iz qotil barcha Mafiya va shaharliklarni yengib, g'olib bo'ldi.",
          icon: Flame,
          color: "bg-[#181410] border-amber-900/60 text-amber-400",
          badgeColor: "bg-amber-900/60 text-amber-200 border-amber-800",
        };
      default:
        return {
          title: "O'YIN YAKUNLANDI",
          desc: "O'yin to'xtatildi yoki durrang natija bilan tugadi.",
          icon: Trophy,
          color: "bg-[#12131a] border-zinc-800 text-zinc-300",
          badgeColor: "bg-zinc-900 text-zinc-200 border-zinc-700",
        };
    }
  };

  const banner = getWinnerBanner();
  const Icon = banner.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-2xl rounded-2xl ${banner.color} p-6 sm:p-7 border shadow-2xl relative overflow-hidden`}
      >
        <div className="text-center relative z-10">
          <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 mx-auto flex items-center justify-center mb-3">
            <Icon className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
            {banner.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-md mx-auto">
            {banner.desc}
          </p>

          {/* Winners Tag */}
          {winnerPlayerNames.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-black/40 border border-zinc-800 max-w-md mx-auto">
              <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold block mb-1.5">
                G'olib O'yinchilar
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {winnerPlayerNames.map((name, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${banner.badgeColor}`}
                  >
                    👑 {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All Player Secret Roles Revealed */}
          <div className="mt-5 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Barcha O'yinchilarning Maxfiy Rollari:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {players.map((p) => {
                const roleData = p.role ? ROLES_DATA[p.role] : null;
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-black/30 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-full bg-gradient-to-tr ${
                          AVATAR_COLORS[p.avatarIndex % AVATAR_COLORS.length]
                        } flex items-center justify-center text-xs flex-shrink-0`}
                      >
                        {AVATAR_INITIALS[p.avatarIndex % AVATAR_INITIALS.length]}
                      </div>
                      <span className="text-xs font-semibold text-white truncate">
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {roleData && (
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded border ${roleData.badgeBg}`}
                        >
                          {roleData.name}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold ${
                          p.isAlive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {p.isAlive ? 'Tirik' : 'Vafot'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-zinc-800">
            {isHost ? (
              <button
                type="button"
                onClick={onRestart}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Qaytadan O'ynash</span>
              </button>
            ) : (
              <p className="text-xs text-zinc-400 italic">
                Boshlovchi qayta o'yinni boshlashini kuting...
              </p>
            )}

            <button
              type="button"
              onClick={onLeave}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm cursor-pointer transition-all"
            >
              Lobbiyga Chiqish
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
