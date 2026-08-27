import React from 'react';
import { RoleId } from '../types/mafia';
import { ROLES_DATA } from '../data/rolesData';
import { Moon, Crosshair, Shield, Search, Flame, Check, AlertCircle, Users, MessageSquare, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface LivingPlayer {
  id: string;
  name: string;
  avatarIndex?: number;
}

interface NightActionModalProps {
  myRole: RoleId;
  livingPlayers: LivingPlayer[];
  myId: string;
  selectedTargetId: string | null;
  detectiveReport: { targetName: string; isMafia: boolean } | null;
  teammates?: Array<{ id: string; name: string; role: RoleId }>;
  mafiaVotes?: Record<string, string>;
  mafiaTargetsCount?: Record<string, number>;
  leadingMafiaTarget?: string | null;
  allPlayers?: Array<{ id: string; name: string }>;
  onSelectTarget: (targetId: string) => void;
}

export const NightActionModal: React.FC<NightActionModalProps> = ({
  myRole,
  livingPlayers,
  myId,
  selectedTargetId,
  detectiveReport,
  teammates = [],
  mafiaVotes = {},
  mafiaTargetsCount = {},
  leadingMafiaTarget,
  allPlayers = [],
  onSelectTarget,
}) => {
  const getPlayerName = (id?: string | null) => {
    if (!id) return null;
    const p = allPlayers.find(pl => pl.id === id) || livingPlayers.find(pl => pl.id === id);
    return p ? p.name : "Noma'lum";
  };

  if (myRole === 'citizen') {
    return (
      <div className="w-full rounded-2xl bg-[#12131a] p-6 border border-zinc-800 text-center shadow-lg">
        <Moon className="w-9 h-9 text-indigo-400 mx-auto mb-2 opacity-80" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Siz Tinch Aholisiz
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
          Sizda tungi maxsus qurol yo‘q. Eshiklarni mahkam qulflab, tong otishini va shahar uyg‘onishini kuting...
        </p>
      </div>
    );
  }

  const getActionPrompt = () => {
    switch (myRole) {
      case 'mafia':
        return {
          title: "Qatl uchun nishonni tanlang",
          desc: "Mafiya sheriklaringiz bilan birgalikda shahar fuqarolaridan birini yo'q qiling.",
          icon: Crosshair,
          color: "text-red-400",
          accentBg: "bg-red-500/10 border-red-500/30",
        };
      case 'doctor':
        return {
          title: "Himoya qilinuvchi insonni tanlang",
          desc: "Tunda kimning hayotini saqlab qolmoqchisiz? (O'zingizni ham tanlashingiz mumkin).",
          icon: Shield,
          color: "text-emerald-400",
          accentBg: "bg-emerald-500/10 border-emerald-500/30",
        };
      case 'detective':
        return {
          title: "Tekshirish uchun shaxsni tanlang",
          desc: "Qaysi gumonlanuvchining Mafiya ekanligini fosh qilmoqchisiz?",
          icon: Search,
          color: "text-sky-400",
          accentBg: "bg-sky-500/10 border-sky-500/30",
        };
      case 'maniac':
        return {
          title: "O'ldirish uchun qurbonni tanlang",
          desc: "Yakka o'zingiz istalgan bir o'yinchini yo'q qiling.",
          icon: Flame,
          color: "text-amber-400",
          accentBg: "bg-amber-500/10 border-amber-500/30",
        };
      default:
        return {
          title: "Nishonni tanlang",
          desc: "",
          icon: Moon,
          color: "text-white",
          accentBg: "bg-zinc-800 border-zinc-700",
        };
    }
  };

  const prompt = getActionPrompt();
  const Icon = prompt.icon;

  // Candidates list: Detective and Maniac cannot pick themselves
  const candidatePlayers = livingPlayers.filter((p) => {
    if (myRole === 'detective' || myRole === 'maniac') {
      return p.id !== myId;
    }
    return true;
  });

  // Mafia coordination calculations
  const isMafia = myRole === 'mafia';
  const totalMafiaCount = 1 + teammates.length;
  const isMultipleMafia = isMafia && totalMafiaCount > 1;

  // Calculate consensus if multiple mafias exist
  const allMafiaVotedTargets = [
    ...(selectedTargetId ? [selectedTargetId] : []),
    ...teammates.map(t => mafiaVotes[t.id]).filter(Boolean)
  ];
  const uniqueVotedTargets = Array.from(new Set(allMafiaVotedTargets));
  const hasFullConsensus = isMultipleMafia && 
    allMafiaVotedTargets.length === totalMafiaCount && 
    uniqueVotedTargets.length === 1;
  const isSplitVotes = isMultipleMafia && 
    allMafiaVotedTargets.length >= 2 && 
    uniqueVotedTargets.length > 1;

  return (
    <div className="w-full rounded-2xl bg-[#12131a] p-5 sm:p-6 border border-zinc-800 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${prompt.accentBg}`}>
          <Icon className={`w-5 h-5 ${prompt.color}`} />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white">
            {prompt.title}
          </h3>
          <p className="text-xs text-zinc-400">
            {prompt.desc}
          </p>
        </div>
      </div>

      {/* Detective Investigation Result */}
      {myRole === 'detective' && detectiveReport && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-xl border flex items-center gap-2.5 ${
            detectiveReport.isMafia
              ? 'bg-red-950/50 border-red-800/80 text-red-200'
              : 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{detectiveReport.targetName}</span> tergov qilindi:{' '}
            <span className="font-bold">
              {detectiveReport.isMafia ? "🔴 MAFIYA A'ZOSI!" : "🟢 BEGUNOH FUQARO"}
            </span>
          </div>
        </motion.div>
      )}

      {/* MAFIA CLAN COORDINATION BAR (When 2 or 3 Mafias exist) */}
      {isMultipleMafia && (
        <div className="p-3.5 rounded-xl bg-red-950/25 border border-red-900/40 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-red-300">
                Mafiya Klani Qarori ({totalMafiaCount} nafar Mafiya):
              </span>
            </div>

            {/* Consensus Status Badge */}
            {hasFullConsensus ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                To'liq kelishuv ({getPlayerName(uniqueVotedTargets[0])})
              </span>
            ) : isSplitVotes ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                Ovozlar bo'lingan! Bitta nishonga kelishing
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-700">
                Ovoz berilmoqda...
              </span>
            )}
          </div>

          {/* Members Vote Status List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {/* My vote */}
            <div className="p-2 rounded-lg bg-black/40 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400 font-medium truncate">Siz:</span>
              <span className={`font-bold truncate ml-2 ${selectedTargetId ? 'text-red-400' : 'text-zinc-500 italic'}`}>
                {getPlayerName(selectedTargetId) || "Tanlanmagan"}
              </span>
            </div>

            {/* Teammates' votes */}
            {teammates.map((teammate) => {
              const votedTargetId = mafiaVotes[teammate.id];
              const targetName = getPlayerName(votedTargetId);

              return (
                <div
                  key={teammate.id}
                  className="p-2 rounded-lg bg-black/40 border border-zinc-800 flex items-center justify-between"
                >
                  <span className="text-zinc-400 font-medium truncate">{teammate.name}:</span>
                  <span className={`font-bold truncate ml-2 ${votedTargetId ? 'text-red-400' : 'text-zinc-500 italic'}`}>
                    {targetName || "O'ylamoqda..."}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <span>💡 Ko'pchilik ovoz olgan nishon o'ldiriladi.</span>
            <span className="text-red-400 font-medium flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Mafiya chatidan foydalaning
            </span>
          </div>
        </div>
      )}

      {/* Target Candidates Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {candidatePlayers.map((p) => {
          const isSelected = selectedTargetId === p.id;
          const isMe = p.id === myId;
          const votesForThisPlayer = isMafia ? (mafiaTargetsCount[p.id] || 0) : 0;
          const isLeading = isMafia && leadingMafiaTarget === p.id && votesForThisPlayer > 0;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectTarget(p.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between min-h-[76px] transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-red-950/60 border-red-500 ring-1 ring-red-500 text-white'
                  : 'bg-[#181924] border-zinc-800 hover:bg-[#202130] hover:border-zinc-700 text-zinc-200'
              }`}
            >
              <div className="flex items-start justify-between gap-1 w-full">
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">
                    {p.name}
                  </p>
                  {isMe && (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      (O'zingiz)
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Mafia Votes indicator on card */}
              {isMafia && votesForThisPlayer > 0 && (
                <div className="mt-2 flex items-center gap-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isLeading ? 'bg-red-900/80 text-red-200 border border-red-700' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    🎯 {votesForThisPlayer} {votesForThisPlayer === 1 ? 'ovoz' : 'ovoz'}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
