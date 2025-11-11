import { useChat } from '../../../contexts/ChatContext';
import { ChatMessages } from '../ChatMessages';
import { ChatInput } from '../ChatInput';

export function ChatTab() {
  const { messages, isTyping, sendMessage } = useChat();

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} isTyping={isTyping} />
      </div>

      {/* Input with integrated file upload */}
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </div>
  );
}
