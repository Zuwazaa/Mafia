import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarIndex: number;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (name: string, email: string, avatarIndex?: number) => UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AVATAR_COLORS = [
  'from-red-600 to-red-950',
  'from-blue-600 to-indigo-950',
  'from-emerald-600 to-emerald-950',
  'from-amber-600 to-amber-950',
  'from-purple-600 to-purple-950',
  'from-cyan-600 to-slate-950',
  'from-rose-600 to-stone-950',
  'from-violet-600 to-zinc-950',
];

export const AVATAR_INITIALS = ['🥷', '🕵️', '👨‍⚕️', '🔥', '🛡️', '🎩', '🐺', '⭐'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mafia_player_auth');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const login = (name: string, email: string, avatarIndex = 0): UserProfile => {
    let id = user?.id;
    if (!id) {
      id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    }
    const cleanUser: UserProfile = {
      id,
      name: name.trim(),
      email: (email || `${name.toLowerCase().replace(/\s+/g, '')}@mafia.uz`).trim(),
      avatarIndex: Math.abs(avatarIndex % 8),
    };
    setUser(cleanUser);
    localStorage.setItem('mafia_player_auth', JSON.stringify(cleanUser));
    return cleanUser;
  };

  const updateUser = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('mafia_player_auth', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mafia_player_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
