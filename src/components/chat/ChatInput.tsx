import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return;
    onSend(inputValue);
    setInputValue('');
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const suggestions = [
    'Create a study plan',
    'Help with homework',
    'Time management tips',
    'I need motivation'
  ];

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm">
      {/* Quick Suggestions */}
      {inputValue.length === 0 && (
        <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-semibold text-foreground/80">Quick actions</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(suggestion);
                  inputRef.current?.focus();
                }}
                className="px-3.5 py-2 rounded-lg bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-medium whitespace-nowrap text-foreground shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-card/50">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your studies..."
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full px-4 py-3 rounded-xl',
                'bg-background border-2 border-border',
                'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10',
                'text-[15px] placeholder:text-muted-foreground/60',
                'transition-all resize-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'max-h-[120px] overflow-y-auto',
                'leading-relaxed'
              )}
              aria-label="Type your message"
              aria-describedby="chat-input-hint"
            />
            <span id="chat-input-hint" className="sr-only">
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            className={cn(
              'p-3 rounded-xl transition-all flex-shrink-0',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              inputValue.trim() && !disabled
                ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Helper Text */}
        <p className="text-[11px] text-muted-foreground/70 mt-2.5 px-1 font-medium">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-semibold">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-semibold">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
