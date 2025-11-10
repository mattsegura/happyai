import { useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';
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
      className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 text-white flex items-center justify-center">
            <Loader className="w-4 h-4 animate-spin" />
          </div>
          <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground">Hapi is thinking...</span>
            </div>
          </div>
        </div>
      )}

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
