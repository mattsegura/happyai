import { User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { Message } from '../../contexts/ChatContext';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        'flex gap-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
        className={cn(
          'relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg',
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
            : 'bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600'
        )}
      >
        {/* Subtle glow */}
        {!isUser && (
          <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl blur opacity-30" />
        )}
        
        <div className="relative">
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-white" />
          )}
        </div>
      </motion.div>

      {/* Message Bubble */}
      <motion.div
        initial={{ opacity: 0, x: isUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          'max-w-[75%] rounded-2xl p-4 shadow-lg backdrop-blur-sm',
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/20'
            : 'bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30 shadow-violet-500/5',
          message.type === 'study-plan' && 'max-w-[85%]'
        )}
      >
        {/* Message Content */}
        <div className={cn(
          'text-[15px] leading-relaxed whitespace-pre-wrap font-normal',
          isUser ? 'text-primary-foreground' : 'text-foreground'
        )}>
          {message.content.split('\n').map((line, i) => {
            // Handle markdown-style formatting
            if (line.startsWith('**') && line.endsWith('**')) {
              return (
                <p key={i} className="font-semibold text-base mt-3 mb-2 first:mt-0">
                  {line.replace(/\*\*/g, '')}
                </p>
              );
            } else if (line.startsWith('•') || line.startsWith('-')) {
              return (
                <li key={i} className="ml-5 my-1.5 list-disc">
                  {line.replace(/^[•-]\s*/, '')}
                </li>
              );
            } else if (line.match(/^\d+\./)) {
              return (
                <li key={i} className="ml-5 my-1.5 list-decimal">
                  {line.replace(/^\d+\.\s*/, '')}
                </li>
              );
            } else if (line.trim()) {
              return <p key={i} className="my-2 first:mt-0 last:mb-0">{line}</p>;
            }
            return null;
          })}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            'text-[10px] mt-3 font-semibold tracking-wide',
            isUser ? 'text-white/50' : 'text-muted-foreground/50'
          )}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </motion.div>
    </motion.div>
  );
}
