import React, { useState } from 'react';
import { GamePhase, RoomSettings } from '../types/mafia';
import { 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  Square, 
  Bot, 
  Settings, 
  UserMinus, 
  ShieldAlert, 
  Crown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface HostControlsProps {
  currentPhase: GamePhase;
  isPaused: boolean;
  isHost: boolean;
  playerCount: number;
  settings: RoomSettings;
  onHostAction: (action: 'pause' | 'resume' | 'skip' | 'end' | 'restart') => void;
  onAddBot: () => void;
  onStartGame?: () => void;
}

export const HostControls: React.FC<HostControlsProps> = ({
  currentPhase,
  isPaused,
  isHost,
  playerCount,
  settings,
  onHostAction,
  onAddBot,
  onStartGame,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isHost) return null;

  return (
    <div className="w-full rounded-2xl bg-[#12131a] p-4 border border-zinc-800 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-950/80 border border-amber-800 flex items-center justify-center">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Boshlovchi Boshqaruv Paneli
            </h4>
            <p className="text-[10px] text-zinc-400">
              Faqat siz (Xona Boshlovchisi) o'yin jarayonini boshqara olasiz
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-zinc-400 hover:text-white p-1 rounded cursor-pointer transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-wrap items-center gap-2">
          {currentPhase === 'LOBBY' ? (
            <>
              <button
                type="button"
                onClick={onStartGame}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>O'yinni Boshlash</span>
              </button>

              <button
                type="button"
                onClick={onAddBot}
                className="px-3.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-800 text-purple-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>+ Bot Qo'shish</span>
              </button>
            </>
          ) : (
            <>
              {isPaused ? (
                <button
                  type="button"
                  onClick={() => onHostAction('resume')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-emerald-300" />
                  <span>Davom ettirish</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onHostAction('pause')}
                  className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-3 h-3" />
                  <span>To'xtatish</span>
                </button>
              )}

              {currentPhase !== 'GAME_OVER' && (
                <button
                  type="button"
                  onClick={() => onHostAction('skip')}
                  className="px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FastForward className="w-3 h-3" />
                  <span>Fazani o'tkazish</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onHostAction('restart')}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Qaytadan boshlash</span>
              </button>

              <button
                type="button"
                onClick={() => onHostAction('end')}
                className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Square className="w-3 h-3" />
                <span>Yakunlash</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
