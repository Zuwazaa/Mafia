import React from 'react';
import { VoteResult } from '../types/mafia';
import { Vote, Check, FastForward, UserCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface LivingPlayer {
  id: string;
  name: string;
  hasVoted?: boolean;
}

interface VotingPanelProps {
  livingPlayers: LivingPlayer[];
  myId: string;
  myVoteTarget: string | null;
  lastVoteResult: VoteResult | null;
  onVote: (targetId: string | 'skip') => void;
  isAlive: boolean;
}

export const VotingPanel: React.FC<VotingPanelProps> = ({
  livingPlayers,
  myId,
  myVoteTarget,
  lastVoteResult,
  onVote,
  isAlive,
}) => {
  return (
    <div className="w-full rounded-2xl bg-[#12131a] p-5 sm:p-6 border border-zinc-800 shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-950/50 border border-red-800/60 flex items-center justify-center">
            <Vote className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Kimni qatl qilish kerak?
            </h3>
            <p className="text-xs text-zinc-400">
              {isAlive ? "Shahar tinchligiga tahdid solayotgan gumonlanuvchiga ovoz bering." : "Siz vafot etgansiz, faqat kuzatishingiz mumkin."}
            </p>
          </div>
        </div>

        {/* Total Votes Progress */}
        <div className="text-right">
          <span className="text-xs text-zinc-400">Ovozlar: </span>
          <span className="text-xs font-bold text-amber-400">
            {livingPlayers.filter((p) => p.hasVoted).length} / {livingPlayers.length}
          </span>
        </div>
      </div>

      {/* Voting Candidates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
        {livingPlayers.map((p) => {
          const isSelected = myVoteTarget === p.id;
          const isMe = p.id === myId;

          return (
            <button
              key={p.id}
              type="button"
              disabled={!isAlive}
              onClick={() => onVote(p.id)}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                !isAlive ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              } ${
                isSelected
                  ? 'bg-red-950/60 border-red-500 ring-1 ring-red-500 text-white'
                  : 'bg-[#181924] border-zinc-800 hover:border-zinc-700 hover:bg-[#202130] text-zinc-200'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold truncate">
                    {p.name}
                  </p>
                  {isMe && <span className="text-[10px] text-amber-400 font-medium">(Siz)</span>}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[10px] ${
                      p.hasVoted ? 'text-emerald-400 font-medium' : 'text-zinc-500'
                    }`}
                  >
                    {p.hasVoted ? '✓ Ovoz berdi' : 'Kutilmoqda...'}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Skip Vote Option */}
      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
        <p className="text-[11px] text-zinc-400">
          Yetarli dalil bo'lmasa, qatlni bekor qilish mumkin:
        </p>

        <button
          type="button"
          disabled={!isAlive}
          onClick={() => onVote('skip')}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            !isAlive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${
            myVoteTarget === 'skip'
              ? 'bg-amber-950/60 border-amber-600 text-amber-300 ring-1 ring-amber-600'
              : 'bg-[#181924] border-zinc-800 text-zinc-300 hover:bg-[#202130] hover:text-white'
          }`}
        >
          <FastForward className="w-3.5 h-3.5 text-amber-400" />
          <span>Ovozni o'tkazib yuborish</span>
          {myVoteTarget === 'skip' && <Check className="w-3 h-3 text-amber-300 ml-1" />}
        </button>
      </div>
    </div>
  );
};
