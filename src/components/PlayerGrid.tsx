import React from 'react';
import { RoleId } from '../types/mafia';
import { ROLES_DATA } from '../data/rolesData';
import { Crown, Bot, Check, Skull, Shield, Crosshair, Sparkles } from 'lucide-react';
import { AVATAR_COLORS, AVATAR_INITIALS } from '../context/AuthContext';
import { motion } from 'motion/react';

interface PlayerItem {
  id: string;
  name: string;
  avatarIndex: number;
  isHost: boolean;
  isBot?: boolean;
  isAlive: boolean;
  connected: boolean;
  role?: RoleId;
  hasVoted?: boolean;
  votedForId?: string | null;
}

interface PlayerGridProps {
  players: PlayerItem[];
  myId: string;
  selectedTargetId?: string | null;
  onSelectTarget?: (playerId: string) => void;
  isSelectable?: boolean;
  actionTitle?: string;
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({
  players,
  myId,
  selectedTargetId,
  onSelectTarget,
  isSelectable = false,
  actionTitle,
}) => {
  return (
    <div className="w-full">
      {actionTitle && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Crosshair className="w-4 h-4 text-red-400" />
            {actionTitle}
          </span>
          <span className="text-[11px] text-zinc-400">Kerakli o'yinchini tanlang</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {players.map((p) => {
          const isMe = p.id === myId;
          const isSelected = selectedTargetId === p.id;
          const roleInfo = p.role ? ROLES_DATA[p.role] : null;
          const canClick = isSelectable && p.isAlive && onSelectTarget;

          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => {
                if (canClick) {
                  onSelectTarget(p.id);
                }
              }}
              disabled={!canClick}
              whileHover={canClick ? { scale: 1.02 } : undefined}
              whileTap={canClick ? { scale: 0.98 } : undefined}
              className={`relative rounded-xl p-3 text-left transition-all border flex flex-col justify-between min-h-[90px] ${
                !p.isAlive
                  ? 'bg-[#151012] border-zinc-900 opacity-60 grayscale'
                  : isSelected
                  ? 'bg-red-950/60 border-red-500 ring-1 ring-red-500'
                  : isMe
                  ? 'bg-[#181926] border-indigo-500/40 ring-1 ring-indigo-500/20'
                  : 'bg-[#12131a] border-zinc-800 hover:border-zinc-700 hover:bg-[#181924]'
              } ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {/* Top row: Status indicator & badges */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      p.isAlive
                        ? p.connected
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {p.isAlive ? (p.connected ? 'Tirik' : 'Aloqasiz') : "Vafot"}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {p.isHost && (
                    <span className="p-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40" title="Boshlovchi">
                      <Crown className="w-3 h-3" />
                    </span>
                  )}
                  {p.isBot && (
                    <span className="p-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40" title="Bot">
                      <Bot className="w-3 h-3" />
                    </span>
                  )}
                  {p.hasVoted && (
                    <span className="p-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" title="Ovoz berdi">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Middle row: Avatar & Name */}
              <div className="flex items-center gap-2.5 my-1.5">
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-tr ${
                    AVATAR_COLORS[p.avatarIndex % AVATAR_COLORS.length]
                  } border border-white/20 flex items-center justify-center text-xs flex-shrink-0`}
                >
                  {p.isAlive ? AVATAR_INITIALS[p.avatarIndex % AVATAR_INITIALS.length] : <Skull className="w-3.5 h-3.5 text-red-400" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white truncate">
                      {p.name}
                    </p>
                    {isMe && (
                      <span className="text-[9px] text-indigo-300 font-medium px-1 rounded bg-indigo-950 border border-indigo-800">
                        Siz
                      </span>
                    )}
                  </div>

                  {/* Role badge if revealed or dead */}
                  {roleInfo ? (
                    <span className="text-[11px] font-medium text-amber-400 block truncate">
                      {roleInfo.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-500 block truncate">
                      {p.isAlive ? "Noma'lum" : "Halok bo'lgan"}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom selection marker */}
              {isSelected && (
                <div className="w-full text-center py-0.5 rounded bg-red-600/30 text-[10px] font-semibold text-red-300 border border-red-500/50">
                  Tanlangan nishon
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
