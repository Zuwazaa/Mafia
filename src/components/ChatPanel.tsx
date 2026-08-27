import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GamePhase, RoleId } from '../types/mafia';
import { Send, MessageSquare, Skull, Shield, Sparkles, Ghost } from 'lucide-react';
import { AVATAR_COLORS } from '../context/AuthContext';

interface ChatPanelProps {
  messages: ChatMessage[];
  myId: string;
  myRole: RoleId | null;
  isAlive: boolean;
  currentPhase: GamePhase;
  canChatPublic: boolean;
  canChatMafia: boolean;
  canChatDead: boolean;
  onSendMessage: (text: string, channel: 'public' | 'mafia' | 'dead') => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  myId,
  myRole,
  isAlive,
  currentPhase,
  canChatPublic,
  canChatMafia,
  canChatDead,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'public' | 'mafia' | 'dead'>('public');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto switch tab if appropriate
  useEffect(() => {
    if (!isAlive && canChatDead) {
      setActiveTab('dead');
    } else if (currentPhase === 'NIGHT' && myRole === 'mafia') {
      setActiveTab('mafia');
    } else if (currentPhase === 'DISCUSSION' || currentPhase === 'VOTING' || currentPhase === 'LOBBY') {
      if (isAlive) {
        setActiveTab('public');
      }
    }
  }, [currentPhase, isAlive, myRole]);

  // Auto scroll down
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    onSendMessage(text, activeTab);
    setInputText('');
  };

  const QUICK_REPLIES = isAlive
    ? [
        "Men tinch begunoh fuqaroman!",
        "Menga vaziyat juda shubhali ko'rinyapti.",
        "Komissar kimni tekshirdi?",
        "Keling, ovoz berishda xato qilmaylik.",
      ]
    : [
        "Men sizlarga aytgandim!",
        "Mafiya kimligini bildim!",
        "Tezroq mafiyani topinglar...",
      ];

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'public') return m.channel === 'public';
    if (activeTab === 'mafia') return m.channel === 'mafia';
    if (activeTab === 'dead') return m.channel === 'dead';
    return false;
  });

  const canSendCurrentTab =
    (activeTab === 'public' && canChatPublic) ||
    (activeTab === 'mafia' && canChatMafia) ||
    (activeTab === 'dead' && canChatDead);

  return (
    <div className="w-full flex flex-col h-[380px] sm:h-[420px] rounded-2xl bg-[#12131a] border border-zinc-800 shadow-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-[#161722]">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('public')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'public'
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Umumiy Chat</span>
          </button>

          {myRole === 'mafia' && (
            <button
              type="button"
              onClick={() => setActiveTab('mafia')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'mafia'
                  ? 'bg-red-950/80 text-red-300 border border-red-800'
                  : 'text-red-400/80 hover:text-red-300'
              }`}
            >
              <Skull className="w-3.5 h-3.5 text-red-500" />
              <span>Mafiya Klani</span>
            </button>
          )}

          {!isAlive && (
            <button
              type="button"
              onClick={() => setActiveTab('dead')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dead'
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                  : 'text-purple-400/80 hover:text-purple-300'
              }`}
            >
              <Ghost className="w-3.5 h-3.5 text-purple-400" />
              <span>Arvohlar (Vafot)</span>
            </button>
          )}
        </div>

        <span className="text-[11px] text-zinc-500 hidden sm:inline">
          {filteredMessages.length} xabar
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 scrollbar-thin">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-zinc-500 text-xs">
            <MessageSquare className="w-8 h-8 text-zinc-700 mb-2 stroke-1" />
            <p>Hozircha xabarlar yo'q.</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Birinchi bo'lib fikringizni bildiring!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderId === myId;
            const isSystem = msg.isSystem;

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className="py-1 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 text-center mx-auto max-w-sm flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span>{msg.text}</span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                  <span className="text-[11px] font-semibold text-zinc-300">
                    {msg.senderName}
                  </span>
                  {msg.channel === 'mafia' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800">
                      Mafiya
                    </span>
                  )}
                  {msg.channel === 'dead' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-400 border border-purple-800">
                      Arvoh
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                    isMe
                      ? activeTab === 'mafia'
                        ? 'bg-red-800 text-white rounded-br-none'
                        : activeTab === 'dead'
                        ? 'bg-purple-800 text-white rounded-br-none'
                        : 'bg-indigo-600 text-white rounded-br-none font-medium'
                      : activeTab === 'mafia'
                      ? 'bg-red-950/70 text-red-100 rounded-bl-none border border-red-900/60'
                      : 'bg-[#1b1c28] text-zinc-200 rounded-bl-none border border-zinc-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {canSendCurrentTab && (
        <div className="px-3 py-1.5 border-t border-zinc-800 bg-[#161722] flex items-center gap-1.5 overflow-x-auto">
          {QUICK_REPLIES.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSendMessage(reply, activeTab)}
              className="px-2.5 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 border border-zinc-700 whitespace-nowrap cursor-pointer transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="p-2.5 border-t border-zinc-800 bg-[#161722] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!canSendCurrentTab}
          placeholder={
            !canSendCurrentTab
              ? activeTab === 'public' && !isAlive
                ? "Siz vafot etgansiz (Arvohlar chatida yozishingiz mumkin)"
                : currentPhase === 'NIGHT'
                ? "Tunda shahar sukut saqlaydi..."
                : "Hozir yozish imkoniyati yo'q"
              : activeTab === 'mafia'
              ? "Mafiya sheriklaringizga maxfiy xabar yozing..."
              : activeTab === 'dead'
              ? "Boshqa vafot etganlar bilan gaplashing..."
              : "Shahar ahliga xabar yozing..."
          }
          className="flex-1 bg-[#0f1017] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={!canSendCurrentTab || !inputText.trim()}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Yuborish</span>
        </button>
      </form>
    </div>
  );
};
