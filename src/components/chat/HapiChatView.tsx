import { useEffect, useRef } from 'react';
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
    <div
      ref={containerRef}
      className="flex flex-col h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 rounded-2xl border border-border/60 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <ChatHeader onClose={() => {}} onClearMessages={clearMessages} />

      {/* Messages Area */}
      <ChatMessages messages={messages} isTyping={isTyping} />

      {/* Input Area */}
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  );
}
