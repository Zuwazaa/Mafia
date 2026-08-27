import React, { useState } from 'react';
import { useAuth, AVATAR_COLORS, AVATAR_INITIALS } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { PlusCircle, LogIn, Skull, Users, Shield, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ROLES_DATA } from '../data/rolesData';

interface LobbyPageProps {
  onRoomJoined: (roomCode: string) => void;
  onEditProfile: () => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({ onRoomJoined, onEditProfile }) => {
  const { user } = useAuth();
  const { joinRoom, errorMessage, clearError } = useSocket();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [localError, setLocalError] = useState('');

  // Handle Create Room
  const handleCreateRoom = async () => {
    if (!user) return;
    setIsCreating(true);
    setLocalError('');
    clearError();

    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: user.id,
          name: user.name,
          email: user.email,
          avatarIndex: user.avatarIndex,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Xona yaratishda xatolik yuz berdi");
      }

      joinRoom(data.roomCode, user);
      onRoomJoined(data.roomCode);
    } catch (err: any) {
      setLocalError(err.message || "Server bilan bog'lanib bo'lmadi");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setLocalError("Iltimos, xona kodini kiriting.");
      return;
    }

    setIsJoining(true);
    setLocalError('');
    clearError();

    try {
      const res = await fetch(`/api/room/${cleanCode}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Bunday xona topilmadi");
      }

      joinRoom(cleanCode, user);
      onRoomJoined(cleanCode);
    } catch (err: any) {
      setLocalError(err.message || "Xonaga ulanib bo'lmadi");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      {/* Top Banner / User Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-[#0d0d12]/90 border border-white/10 backdrop-blur-xl mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
              user ? AVATAR_COLORS[user.avatarIndex % AVATAR_COLORS.length] : 'from-[#d4af37] to-black'
            } flex items-center justify-center text-xl shadow-md border border-white/20`}
          >
            {user ? AVATAR_INITIALS[user.avatarIndex % AVATAR_INITIALS.length] : '🥷'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Xush kelibsiz, {user?.name}!
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40">
                Tayyor
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {user?.email || 'Foydalanuvchi'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="px-3.5 py-1.5 rounded-xl bg-[#14141c] hover:bg-[#1f1f2a] border border-white/15 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
        >
          Profilni O'zgartirish
        </button>
      </div>

      {(localError || errorMessage) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3.5 rounded-2xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center gap-2.5 shadow-lg"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{localError || errorMessage}</span>
        </motion.div>
      )}

      {/* Main Two Actions: Create Room vs Join Room */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Create Room Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl bg-gradient-to-b from-[#14141c]/95 via-[#0c0c10] to-black p-6 sm:p-8 border border-[#d4af37]/30 hover:border-[#d4af37]/60 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.1)] relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle,rgba(212,175,55,0.15),transparent_70%)] pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <PlusCircle className="w-6 h-6 text-[#d4af37]" />
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2 font-display">
              Yangi Xona Yaratish
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
              Yangi o'yin xonasi oching, do'stlaringizni taklif qiling va xona Boshlovchisi sifatida maxsus rollarni boshqaring.
            </p>
          </div>

          <button
            type="button"
            disabled={isCreating}
            onClick={handleCreateRoom}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-amber-600 to-[#b8860b] hover:from-amber-400 hover:to-amber-600 text-black font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer transition-all disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>{isCreating ? "Xona yaratilmoqda..." : "Xona Yaratish (Boshlovchi)"}</span>
          </button>
        </motion.div>

        {/* Join Room Card */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl bg-gradient-to-b from-[#14141c]/95 via-[#0c0c10] to-black p-6 sm:p-8 border border-white/10 hover:border-blue-500/50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(59,130,246,0.25)]">
              <LogIn className="w-6 h-6 text-blue-400" />
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2 font-display">
              Xonaga Qo'shilish
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
              Do'stingiz yuborgan 5 belgili maxsus xona kodini kiriting (masalan: M7K4P).
            </p>

            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="XONA KODI (M7K4P)"
                maxLength={6}
                className="w-full bg-[#121218] border border-white/15 rounded-xl px-4 py-2.5 text-center font-mono font-bold tracking-widest text-base sm:text-lg text-[#d4af37] uppercase placeholder-zinc-600 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
              />

              <button
                type="submit"
                disabled={isJoining || !roomCodeInput.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer transition-all disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isJoining ? "Ulanmoqda..." : "Xonaga Kirish"}</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Role Showcase Grid */}
      <div className="mt-8">
        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5 font-display">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <span>O'yindagi Asosiy Rollar</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.values(ROLES_DATA).map((role) => (
            <div
              key={role.id}
              className="p-3.5 rounded-2xl bg-[#0f0f14]/80 border border-white/10 flex flex-col justify-between shadow-md"
            >
              <div>
                <div className={`w-8 h-8 rounded-xl ${role.badgeBg} flex items-center justify-center text-xs mb-2 font-bold border border-white/10`}>
                  {role.id === 'mafia' ? '🥷' : role.id === 'doctor' ? '👨‍⚕️' : role.id === 'detective' ? '🕵️' : role.id === 'maniac' ? '🔥' : '🛡️'}
                </div>
                <h5 className="text-xs font-bold text-white mb-0.5 font-display">{role.name}</h5>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {role.ability}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
