import React, { useState } from 'react';
import { useAuth, AVATAR_COLORS, AVATAR_INITIALS } from '../context/AuthContext';
import { Skull, ArrowRight, ShieldCheck, Users, Moon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onContinue: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onContinue }) => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarIndex, setAvatarIndex] = useState(user?.avatarIndex || 0);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Iltimos, ismingiz yoki taxallusingizni kiriting.");
      return;
    }

    login(name, email, avatarIndex);
    onContinue();
  };

  return (
    <div className="min-h-[calc(100vh-60px)] w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#050505]">
      {/* Ambient noir lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[radial-gradient(circle,rgba(220,38,38,0.08)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl bg-[#0c0c10]/90 p-6 sm:p-8 border border-[#d4af37]/25 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.08)] backdrop-blur-2xl relative z-10"
      >
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#d4af37] via-amber-700 to-red-950 p-0.5 mx-auto mb-3 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <div className="w-full h-full bg-[#08080c] rounded-[14px] flex items-center justify-center">
              <Skull className="w-8 h-8 text-[#d4af37]" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-display">
            MAFIA ONLINE
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real vaqtli, ko'p o'yinchili psixologik o'yin
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-950/80 border border-red-700/80 text-xs text-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              Qahramon Belgisi (Avatar)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_INITIALS.map((icon, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarIndex(idx)}
                  className={`h-11 rounded-xl bg-gradient-to-tr ${
                    AVATAR_COLORS[idx % AVATAR_COLORS.length]
                  } flex items-center justify-center text-lg transition-all cursor-pointer border ${
                    avatarIndex === idx
                      ? 'border-[#d4af37] ring-2 ring-[#d4af37]/60 scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Ism / Taxallus <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Masalan: Sardor yoki Don Corleone"
              maxLength={20}
              className="w-full bg-[#121218] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Ushbu ism o'yin davomida barcha o'yinchilarga ko'rinadi.
            </span>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Gmail / Elektron Pochta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masalan: sardor@gmail.com"
              className="w-full bg-[#121218] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
            />
            <span className="text-[11px] text-zinc-500 mt-1 block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Pochtangiz maxfiy saqlanadi va boshqalarga ko'rinmaydi.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-amber-600 to-[#b8860b] hover:from-amber-400 hover:to-amber-600 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.35)] cursor-pointer transition-all transform active:scale-95"
          >
            <span>O'yinga Kirish</span>
            <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
          </button>
        </form>

        {/* Feature Points */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-2 text-center text-zinc-400 text-[11px]">
          <div className="p-2.5 rounded-xl bg-[#121218]/60 border border-white/10 flex flex-col items-center">
            <Users className="w-4 h-4 text-[#d4af37] mb-1" />
            <span className="text-zinc-300">Onlayn Ko'p O'yinchili</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#121218]/60 border border-white/10 flex flex-col items-center">
            <Moon className="w-4 h-4 text-indigo-400 mb-1" />
            <span className="text-zinc-300">Avtomatlashgan Tun & Kun</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
