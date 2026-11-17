'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Crown,
  Trash2,
  Sparkles,
  AtSign,
  User,
  Shield,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Profile, ChatMessage, MentionableUser } from '@/lib/types';
import { getRankFromTitle, getPlayerRank } from '@/lib/ranks';
import { PlayerAvatar } from '@/lib/avatars';

interface LoungeChatProps {
  profile: Profile | null;
  onAuthClick?: () => void;
}

export default function LoungeChat({ profile, onAuthClick }: LoungeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [mentionUsers, setMentionUsers] = useState<MentionableUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const isAdmin = profile?.role === 'ADMIN';

  // Helper to scroll ONLY the chat box without scrolling the browser window
  const scrollChatToBottom = (smooth = false) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // 1. Fetch initial message history
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        // Reverse so oldest is on top, newest at bottom
        setMessages(data.reverse());
      }
    } catch (err) {
      console.warn('Chat messages fetch warning:', err);
    }
  }, [supabase]);

  // 2. Fetch mentionable member list
  const fetchMentionUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_mentionable_users');
      if (!error && data) {
        setMentionUsers(data);
        return;
      }

      // Fallback query
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_id')
        .limit(50);
      if (profiles) setMentionUsers(profiles);
    } catch {
      // Ignore
    }
  }, [supabase]);

  useEffect(() => {
    fetchMessages();
    fetchMentionUsers();

    // Subscribe to realtime chat messages (INSERT & DELETE)
    const channel = supabase
      .channel('lounge-chat-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(() => {
            scrollChatToBottom(true);
          }, 50);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, fetchMentionUsers, supabase]);

  // Auto-scroll chat box only on message update (never scrolls page window)
  useEffect(() => {
    scrollChatToBottom(false);
  }, [messages.length]);

  // Handle typing & @mention autocomplete detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    const cursor = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      // Only trigger if no spaces or short query
      if (!query.includes(' ') && query.length <= 15) {
        setMentionQuery(query.toLowerCase());
        setMentionIndex(0);
        return;
      }
    }
    setMentionQuery(null);
  };

  const filteredMentions = mentionQuery !== null
    ? mentionUsers.filter((u) =>
        u.full_name.toLowerCase().includes(mentionQuery)
      ).slice(0, 5)
    : [];

  const insertMention = (name: string) => {
    if (!inputRef.current) return;
    const cursor = inputRef.current.selectionStart || input.length;
    const textBefore = input.slice(0, cursor);
    const textAfter = input.slice(cursor);
    const lastAtIndex = textBefore.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const prefix = textBefore.slice(0, lastAtIndex);
      const newInput = `${prefix}@${name} ${textAfter}`;
      setInput(newInput);
      setMentionQuery(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  const tagUser = (name: string) => {
    setInput((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} @${name} ` : `@${name} `;
    });
    inputRef.current?.focus();
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      if (onAuthClick) onAuthClick();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setMentionQuery(null);

    try {
      const userRank = getPlayerRank(profile.total_spent, profile.role);
      const { error } = await supabase.from('chat_messages').insert({
        user_id: profile.id,
        sender_name: profile.full_name,
        sender_role: profile.role,
        sender_tier: userRank.title,
        sender_avatar: profile.avatar_id || 'ps_controller',
        content: trimmed,
      });

      if (error) throw error;
      setInput('');
      setTimeout(() => {
        scrollChatToBottom(true);
      }, 50);
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  // Admin delete message
  const handleDeleteMessage = async (id: string) => {
    if (!isAdmin) return;
    try {
      await supabase.from('chat_messages').delete().eq('id', id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  // Render message text with highlighted @Name mentions
  const renderMessageContent = (content: string) => {
    // Regex matches @Word or @Multi Word names
    const parts = content.split(/(@[A-Za-z0-9_]+(?:\s[A-Za-z0-9_]+)?)/g);

    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const isSelf = profile && part.toLowerCase().includes(profile.full_name.toLowerCase());
        return (
          <span
            key={i}
            className={[
              'inline-flex items-center gap-0.5 font-bold px-1.5 py-0.2 rounded-md transition-colors',
              isSelf
                ? 'bg-neon-green/30 text-neon-green shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'bg-emerald-500/20 text-emerald-300',
            ].join(' ')}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <section id="lounge-chat" className="h-full flex flex-col scroll-mt-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare size={18} className="text-neon-green" />
            <span>Lounge Live Chat</span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-neon-green bg-neon-green/15 border border-neon-green/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              Live
            </span>
          </h3>
          <p className="text-[11px] text-gray-400">Coordinate pool &amp; PS5 games with regulars</p>
        </div>

        <span className="text-[10px] text-gray-500 hidden sm:inline font-mono">
          Type @ to tag players
        </span>
      </div>

      {/* Main Glassmorphic Chat Window */}
      <div className="flex-1 rounded-2xl glass-card border border-white/10 flex flex-col justify-between shadow-xl backdrop-blur-xl overflow-hidden min-h-[350px]">
        {/* Messages Feed Container */}
        <div ref={messagesContainerRef} className="p-3.5 sm:p-4 overflow-y-auto max-h-[340px] flex-1 space-y-3">
          {messages.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center text-gray-500 text-xs px-4">
              <MessageSquare size={26} className="text-gray-600 mb-2 opacity-60" />
              <p className="font-semibold text-gray-400">Welcome to Underground Lounge Chat!</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Drop a message or challenge someone to a match.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMsgAdmin = msg.sender_role === 'ADMIN';
              const isOwn = profile && msg.user_id === profile.id;
              const mentionsMe = profile && msg.content.toLowerCase().includes(`@${profile.full_name.toLowerCase()}`);
              const senderRank = getRankFromTitle(
                msg.sender_tier || (isMsgAdmin ? 'Lounge Boss' : 'Rookie')
              );

              return (
                <div
                  key={msg.id}
                  className={[
                    'group relative rounded-xl p-2.5 transition-all duration-200 text-xs',
                    mentionsMe
                      ? 'bg-neon-green/[0.08] border-l-2 border-neon-green pl-3'
                      : isOwn
                      ? 'bg-white/[0.04] border border-white/5'
                      : 'bg-black/30 border border-transparent hover:border-white/5',
                  ].join(' ')}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <PlayerAvatar
                        avatarId={msg.sender_avatar}
                        name={msg.sender_name}
                        tier={senderRank.title}
                        size="sm"
                      />
                      <button
                        onClick={() => tagUser(msg.sender_name)}
                        className="font-bold text-gray-200 hover:text-neon-green transition-colors truncate text-left cursor-pointer"
                        title="Click to tag in reply"
                      >
                        {msg.sender_name}
                      </button>

                      {/* Rank Tier Badge */}
                      <span
                        className={`inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full border flex-shrink-0 ${senderRank.colorClasses}`}
                        title={`Rank: ${senderRank.title}`}
                      >
                        {senderRank.title === 'Lounge Boss' || senderRank.title === 'Underground Legend' ? (
                          <Crown size={9} fill="currentColor" />
                        ) : (
                          <Shield size={9} />
                        )}
                        <span>{senderRank.title}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {/* Admin delete action button */}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-crimson transition-all"
                          title="Delete message"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="text-gray-200 break-words leading-relaxed">
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar or Guest Notice */}
        <div className="p-3 bg-black/60 border-t border-white/10 relative">
          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {filteredMentions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-3 right-3 mb-2 rounded-xl glass-card border border-neon-green/40 bg-[#09120e]/95 p-1.5 shadow-2xl backdrop-blur-2xl z-20 max-h-40 overflow-y-auto"
              >
                <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 border-b border-white/10 mb-1">
                  <AtSign size={10} className="text-neon-green" />
                  <span>Mention Member</span>
                </div>
                {filteredMentions.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => insertMention(user.full_name)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-200 hover:text-white hover:bg-neon-green/20 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <PlayerAvatar
                        avatarId={user.avatar_id}
                        name={user.full_name}
                        size="sm"
                        showTierRing={false}
                      />
                      <span className="truncate">@{user.full_name}</span>
                    </div>
                    <span className="text-[10px] text-neon-green font-mono flex-shrink-0">Select</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {profile && !profile.phone ? (
            <div className="py-2.5 px-3.5 text-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between gap-2">
              <span className="truncate">
                🔒 Link your mobile number in <strong className="text-white">My Loyalty Wallet</strong> above to chat.
              </span>
              <a
                href="#loyalty-wallet"
                className="text-[11px] font-bold text-black bg-amber-400 px-2.5 py-1 rounded-lg uppercase tracking-wider flex-shrink-0 hover:bg-amber-300 transition-colors"
              >
                Link Now
              </a>
            </div>
          ) : profile ? (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Say something or tag with @Name…"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green transition-colors"
                maxLength={300}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="p-2 rounded-xl bg-neon-green text-brand-bg hover:bg-[#00ff87] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                title="Send Message"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
          ) : (
            <div className="py-1 text-center flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Sign in to join lounge chat &amp; tag players
              </span>
              <button
                onClick={onAuthClick}
                className="text-xs font-bold px-3 py-1 rounded-lg bg-neon-green/15 text-neon-green border border-neon-green/30 hover:bg-neon-green/25 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
