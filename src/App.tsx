import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { LobbyPage } from './pages/LobbyPage';
import { RoomPage } from './pages/RoomPage';
import { GamePage } from './pages/GamePage';

function MainApp() {
  const { isAuthenticated, logout } = useAuth();
  const { gameState, leaveRoom, isConnected } = useSocket();
  const [showEditProfile, setShowEditProfile] = useState(false);

  // If player has not set name / avatar yet or clicked edit profile
  if (!isAuthenticated || showEditProfile) {
    return (
      <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-[#d4af37] selection:text-black">
        <Header isConnected={isConnected} />
        <main className="flex-1 relative z-10">
          <LandingPage onContinue={() => setShowEditProfile(false)} />
        </main>
      </div>
    );
  }

  // If player is inside a room
  if (gameState) {
    const isWaitingLobby = gameState.currentPhase === 'LOBBY' && gameState.status === 'waiting';

    return (
      <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-[#d4af37] selection:text-black">
        {/* Ambient noir gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.06),transparent_50%),radial-gradient(circle_at_10%_90%,rgba(220,38,38,0.04),transparent_40%)] pointer-events-none z-0" />
        <Header roomCode={gameState.roomCode} isConnected={isConnected} />
        <main className="flex-1 pb-10 relative z-10">
          {isWaitingLobby ? (
            <RoomPage
              roomCode={gameState.roomCode}
              onLeave={leaveRoom}
            />
          ) : (
            <GamePage onLeaveRoom={leaveRoom} />
          )}
        </main>
      </div>
    );
  }

  // Default Main Lobby (Create Room / Join Room)
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-[#d4af37] selection:text-black">
      {/* Ambient noir gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.06),transparent_50%),radial-gradient(circle_at_90%_90%,rgba(220,38,38,0.04),transparent_40%)] pointer-events-none z-0" />
      <Header isConnected={isConnected} />
      <main className="flex-1 pb-10 relative z-10">
        <LobbyPage
          onRoomJoined={() => {}}
          onEditProfile={() => setShowEditProfile(true)}
        />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}
