import { motion } from 'framer-motion';
import { User, Sparkles, Pin, Copy, ThumbsUp, ThumbsDown, MoreVertical, Brain, Heart } from 'lucide-react';
import { Message } from '@/lib/chat/conversationManager';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface EnhancedMessageProps {
  message: Message;
  index?: number;
  onActionClick?: (action: string) => void;
  onPinContent?: (content: string) => void;
  themeColor?: 'blue' | 'purple';
}

export function EnhancedMessage({ message, index = 0, onActionClick, onPinContent, themeColor = 'blue' }: EnhancedMessageProps) {
  const isUser = message.role === 'user';

  const themeGradients = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
  };

  const themeIcons = {
    blue: Brain,
    purple: Heart,
  };

  const Icon = themeIcons[themeColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${themeColor === 'blue' ? 'rounded-lg' : 'rounded-full'} bg-gradient-to-br ${themeGradients[themeColor]} flex items-center justify-center shadow-md`}>
            <Icon className="h-5 h-5 text-white" />
          </div>
        </div>
      )}

      <div className={cn('flex flex-col gap-2 max-w-2xl', isUser && 'items-end')}>
        <div
          className={cn(
            'group relative p-4 rounded-2xl shadow-sm transition-all',
            isUser
              ? 'bg-gradient-to-br from-primary to-accent text-white'
              : 'backdrop-blur-xl bg-white/70 border border-white/40 text-foreground'
          )}
        >
          {message.pinned && (
            <div className="absolute -top-2 -right-2">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                <Pin className="h-3 w-3 text-white" />
              </div>
            </div>
          )}

          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

          {/* Message Actions */}
          <div className={cn(
            'opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 flex items-center gap-1',
            isUser ? 'right-0' : 'left-0'
          )}>
            {!isUser && (
              <>
                <button className="p-1.5 rounded-lg bg-white/80 hover:bg-white shadow-sm transition-colors">
                  <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                </button>
                <button className="p-1.5 rounded-lg bg-white/80 hover:bg-white shadow-sm transition-colors">
                  <ThumbsDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </>
            )}
            <button className="p-1.5 rounded-lg bg-white/80 hover:bg-white shadow-sm transition-colors">
              <Copy className="h-3 w-3 text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-lg bg-white/80 hover:bg-white shadow-sm transition-colors">
              <Pin className="h-3 w-3 text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-lg bg-white/80 hover:bg-white shadow-sm transition-colors">
              <MoreVertical className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground px-2">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {/* AI Action Buttons */}
        {!isUser && message.actions && message.actions.length > 0 && onActionClick && (
          <div className="flex flex-wrap gap-2 px-2">
            {message.actions.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => onActionClick(action)}
                className={`text-xs ${themeColor === 'blue' ? 'border-blue-300 text-blue-700 hover:bg-blue-50' : 'border-purple-300 text-purple-700 hover:bg-purple-50'}`}
              >
                {action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </Button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

