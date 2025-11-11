import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../../contexts/ChatContext';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

export function HapiChatView() {
  const { messages, isTyping, sendMessage, clearMessages } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    const input = containerRef.current?.querySelector('textarea');
    input?.focus();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-200px)] relative overflow-hidden rounded-3xl"
    >
      {/* Modern gradient background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-pink-50/40 dark:from-violet-950/20 dark:via-purple-950/10 dark:to-pink-950/15" />
      
      {/* Animated gradient orbs for depth */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-rose-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      
      {/* Content container with backdrop blur */}
      <div className="relative flex flex-col h-full backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 shadow-2xl shadow-violet-500/10 dark:shadow-violet-500/5">
        {/* Header */}
        <ChatHeader onClose={() => {}} onClearMessages={clearMessages} />

        {/* Messages Area */}
        <ChatMessages messages={messages} isTyping={isTyping} />

        {/* Input Area */}
        <ChatInput onSend={sendMessage} disabled={isTyping} />
      </div>
    </motion.div>
  );
}
