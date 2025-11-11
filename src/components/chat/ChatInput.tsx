import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Sparkles, Paperclip, X, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return;
    
    // Include deep search indicator in the message if enabled
    const messagePrefix = deepSearchEnabled ? '[WEB SEARCH] ' : '';
    onSend(messagePrefix + inputValue);
    
    setInputValue('');
    setAttachedFiles([]);
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
      {/* Deep Search Toggle */}
      <div className="px-4 py-3 border-b border-border/50 bg-card/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className={cn(
            "w-4 h-4 transition-colors",
            deepSearchEnabled ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
          )} />
          <span className="text-sm font-medium text-foreground">Deep Web Search</span>
          <span className="text-xs text-muted-foreground">Get real-time information from the web</span>
        </div>
        <button
          onClick={() => setDeepSearchEnabled(!deepSearchEnabled)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
            deepSearchEnabled ? "bg-gradient-to-r from-blue-600 to-blue-500" : "bg-muted"
          )}
          role="switch"
          aria-checked={deepSearchEnabled}
          aria-label="Toggle deep web search"
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform",
              deepSearchEnabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

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

      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="px-4 pt-3 bg-card/50 border-t border-border/50">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20"
              >
                <Paperclip className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-0.5 hover:bg-primary/20 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-card/50">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
        />
        
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            {/* Deep Search Active Indicator */}
            {deepSearchEnabled && (
              <div className="absolute -top-8 left-0 flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Web Search Active
                </span>
              </div>
            )}
            
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={deepSearchEnabled 
                ? "Ask me anything - searching the web for latest info..." 
                : "Ask me anything about your studies..."}
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full px-4 py-3 pr-12 rounded-xl',
                'bg-background border-2',
                deepSearchEnabled 
                  ? 'border-blue-500/50 focus:border-blue-500 focus:ring-blue-500/20' 
                  : 'border-border focus:border-primary focus:ring-primary/10',
                'focus:outline-none focus:ring-2',
                'text-[15px] placeholder:text-muted-foreground/60',
                'transition-all resize-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'max-h-[120px] overflow-y-auto',
                'leading-relaxed'
              )}
              aria-label="Type your message"
              aria-describedby="chat-input-hint"
            />
            {/* Paperclip button inside textarea */}
            <button
              onClick={triggerFileUpload}
              disabled={disabled}
              className={cn(
                'absolute right-3 bottom-3 p-1.5 rounded-lg transition-all',
                'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50',
                disabled ? 'opacity-50 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </button>
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
