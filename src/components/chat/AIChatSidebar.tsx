import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { useChat } from '../../contexts/ChatContext';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

export function AIChatSidebar() {
  const { isOpen, messages, isTyping, sendMessage, closeChat, clearMessages } = useChat();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const input = sidebarRef.current?.querySelector('textarea');
        input?.focus();
      }, 350);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: Close chat
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeChat]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop - Mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeChat}
          aria-hidden="true"
        />
      )}

      {/* Chat Sidebar */}
      <aside
        ref={sidebarRef}
        role="complementary"
        aria-label="AI Chat Assistant"
        aria-hidden={!isOpen}
        className={cn(
          // Base styles
          'fixed z-40 flex flex-col',
          'bg-gradient-to-br from-violet-50/95 via-white/95 to-pink-50/95',
          'dark:from-gray-900/95 dark:via-gray-800/95 dark:to-purple-900/20',
          'backdrop-blur-xl',
          'shadow-2xl shadow-violet-500/10',
          
          // Desktop styles
          'lg:left-0 lg:top-0 lg:h-full',
          'lg:w-[380px]',
          'lg:border-r lg:border-violet-200/50 dark:lg:border-violet-800/30',
          
          // Desktop animation
          'lg:transform lg:transition-transform lg:duration-300 lg:ease-out',
          isOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full',
          
          // Mobile styles (bottom sheet)
          'max-lg:bottom-0 max-lg:left-0 max-lg:right-0',
          'max-lg:h-[75vh] max-lg:max-h-[800px]',
          'max-lg:rounded-t-3xl',
          'max-lg:border-t max-lg:border-x max-lg:border-violet-200/50 dark:max-lg:border-violet-800/30',
          
          // Mobile animation
          'max-lg:transform max-lg:transition-transform max-lg:duration-300 max-lg:ease-out',
          isOpen ? 'max-lg:translate-y-0' : 'max-lg:translate-y-full',
          
          // Safe area for mobile
          'max-lg:pb-safe'
        )}
      >
        {/* Drag Handle - Mobile only */}
        <div className="lg:hidden flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 bg-violet-300 dark:bg-violet-700 rounded-full" />
        </div>

        {/* Header */}
        <ChatHeader onClose={closeChat} onClearMessages={clearMessages} />

        {/* Messages Area */}
        <ChatMessages messages={messages} isTyping={isTyping} />

        {/* Input Area */}
        <ChatInput onSend={sendMessage} disabled={isTyping} />
      </aside>
    </>
  );
}
