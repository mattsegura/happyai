import { useChat } from '../../../contexts/ChatContext';
import { ChatMessages } from '../ChatMessages';
import { ChatInput } from '../ChatInput';

export function ChatTab() {
  const { messages, isTyping, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-violet-200/50 dark:border-violet-800/30">
        <h2 className="text-2xl font-bold text-foreground">AI Chat Assistant</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ask me anything about your studies, get help with homework, or create study plans
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} isTyping={isTyping} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  );
}
