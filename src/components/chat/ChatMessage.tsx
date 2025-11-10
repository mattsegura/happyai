import { User, Bot } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Message } from '../../contexts/ChatContext';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 text-white'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl p-4 shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border border-border',
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
            'text-[11px] mt-3 font-medium',
            isUser ? 'text-primary-foreground/60' : 'text-muted-foreground/70'
          )}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
