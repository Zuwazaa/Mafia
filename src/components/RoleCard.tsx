import React from 'react';
import { RoleId } from '../types/mafia';
import { ROLES_DATA } from '../data/rolesData';
import { Shield, Skull, HeartHandshake, Search, Flame, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface RoleCardProps {
  roleId: RoleId;
  teammates?: Array<{ id: string; name: string; role: RoleId }>;
  isDramaticReveal?: boolean;
}

export const RoleCard: React.FC<RoleCardProps> = ({ roleId, teammates = [], isDramaticReveal = false }) => {
  const role = ROLES_DATA[roleId] || ROLES_DATA.citizen;

  const renderArtwork = () => {
    switch (roleId) {
      case 'mafia':
        return (
          <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-red-950/60 to-black border border-red-900/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(220,38,38,0.25),transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-red-900/30 border border-red-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                <Skull className="w-10 h-10 text-red-500" />
              </div>
              <span className="mt-2 text-xs tracking-widest uppercase font-semibold text-red-400">Yashirin Klan</span>
            </div>
            {/* Ambient noir lines */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
          </div>
        );
      case 'doctor':
        return (
          <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-emerald-950/60 to-black border border-emerald-900/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.25),transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-emerald-900/30 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                <HeartHandshake className="w-10 h-10 text-emerald-400" />
              </div>
              <span className="mt-2 text-xs tracking-widest uppercase font-semibold text-emerald-400">Hayot Najotkori</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
          </div>
        );
      case 'detective':
        return (
          <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-blue-950/60 to-black border border-blue-900/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.25),transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-900/30 border border-blue-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                <Search className="w-10 h-10 text-blue-400" />
              </div>
              <span className="mt-2 text-xs tracking-widest uppercase font-semibold text-blue-400">Qonun Posboni</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
          </div>
        );
      case 'maniac':
        return (
          <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-amber-950/60 to-black border border-amber-900/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.25),transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-amber-900/30 border border-amber-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                <Flame className="w-10 h-10 text-amber-400" />
              </div>
              <span className="mt-2 text-xs tracking-widest uppercase font-semibold text-amber-400">Yolg'iz Qotil</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
          </div>
        );
      default:
        return (
          <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-900/60 to-black border border-slate-800/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(148,163,184,0.2),transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-slate-800/40 border border-slate-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(148,163,184,0.25)]">
                <Shield className="w-10 h-10 text-slate-300" />
              </div>
              <span className="mt-2 text-xs tracking-widest uppercase font-semibold text-slate-400">Shahar Aholisi</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={isDramaticReveal ? { scale: 0.85, opacity: 0 } : { opacity: 1 }}
      animate={isDramaticReveal ? { scale: 1, opacity: 1 } : { opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm rounded-2xl bg-[#12131a] p-5 sm:p-6 border border-zinc-800 shadow-2xl relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          Sizning Maxfiy Rolingiz
        </span>
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${role.badgeBg}`}>
          {role.teamName}
        </div>
      </div>

      {/* Role Artwork */}
      {renderArtwork()}

      {/* Role Title */}
      <div className="mt-4 text-center">
        <h2 className="text-xl font-bold tracking-wide text-white flex items-center justify-center gap-2">
          <span>{role.name}</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          {role.description}
        </p>
      </div>

      {/* Ability box */}
      <div className="mt-3.5 p-3.5 rounded-xl bg-[#181924] border border-zinc-800 text-left">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Maxsus Qobiliyat:</span>
        </div>
        <p className="text-xs text-zinc-300 leading-snug">
          {role.ability}
        </p>
      </div>

      {/* Mafia Teammates list if applicable */}
      {roleId === 'mafia' && (
        <div className="mt-3 p-3 rounded-xl bg-red-950/30 border border-red-900/40">
          <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Skull className="w-3.5 h-3.5 text-red-400" />
            <span>Mafiya Sheriklaringiz:</span>
          </div>
          {teammates.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {teammates.map((tm) => (
                <span
                  key={tm.id}
                  className="px-2.5 py-0.5 rounded-lg bg-red-900/40 border border-red-800 text-xs font-medium text-red-200"
                >
                  {tm.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-red-300/80 italic">Siz ushbu o'yindagi yagona Mafiyasiz.</p>
          )}
        </div>
      )}
    </motion.div>
  );
};
