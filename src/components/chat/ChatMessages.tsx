import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import type { Message } from '../../contexts/ChatContext';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth custom-scrollbar"
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {/* Enhanced Typing Indicator */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl blur opacity-30" />
              <Sparkles className="w-4 h-4 relative animate-pulse" style={{ animationDuration: '2s' }} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl px-5 py-3 shadow-lg shadow-violet-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <motion.span
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                    className="w-2 h-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full"
                  />
                  <motion.span
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }}
                    className="w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full"
                  />
                  <motion.span
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
                    className="w-2 h-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full"
                  />
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                  Hapi is thinking...
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen reader announcement for typing */}
      {isTyping && (
        <div role="status" aria-live="polite" className="sr-only">
          AI is thinking...
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
