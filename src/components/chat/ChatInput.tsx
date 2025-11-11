import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Sparkles, Paperclip, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="relative border-t border-white/10 dark:border-gray-800/30 bg-gradient-to-b from-white/30 to-white/50 dark:from-gray-900/30 dark:to-gray-900/50 backdrop-blur-xl">
      {/* Deep Search Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-3 border-b border-white/10 dark:border-gray-800/20 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: deepSearchEnabled ? [1, 1.1, 1] : 1,
              rotate: deepSearchEnabled ? [0, 5, -5, 0] : 0
            }}
            transition={{ duration: 0.5 }}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              deepSearchEnabled 
                ? "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/20" 
                : "bg-muted/50"
            )}
          >
            <Globe className={cn(
              "w-4 h-4 transition-colors",
              deepSearchEnabled ? "text-white" : "text-muted-foreground"
            )} />
          </motion.div>
          <div>
            <span className="text-sm font-bold text-foreground">Deep Web Search</span>
            <p className="text-xs text-muted-foreground">Real-time information from the web</p>
          </div>
        </div>
        <button
          onClick={() => setDeepSearchEnabled(!deepSearchEnabled)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-inner",
            deepSearchEnabled 
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 focus:ring-blue-500/50 shadow-blue-500/20" 
              : "bg-gray-200 dark:bg-gray-700 focus:ring-primary/50"
          )}
          role="switch"
          aria-checked={deepSearchEnabled}
          aria-label="Toggle deep web search"
        >
          <motion.span
            animate={{
              x: deepSearchEnabled ? 20 : 2
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-2 ring-white/20"
          />
        </button>
      </motion.div>

      {/* Quick Suggestions */}
      <AnimatePresence>
        {inputValue.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-4 border-b border-white/10 dark:border-gray-800/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </motion.div>
              <span className="text-xs font-bold text-foreground tracking-wide uppercase">Quick Start</span>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {suggestions.map((suggestion, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setInputValue(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-800/40 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all text-sm font-medium whitespace-nowrap text-foreground group"
                >
                  <span className="group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {suggestion}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <div className="p-6">
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
            <AnimatePresence>
              {deepSearchEnabled && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="absolute -top-10 left-0 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/30"
                >
                  <Globe className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    Web Search On
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={deepSearchEnabled 
                  ? "Ask me anything - searching the web for latest info..." 
                  : "Type your message here..."}
                disabled={disabled}
                rows={1}
                className={cn(
                  'w-full px-5 py-4 pr-14 rounded-2xl',
                  'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
                  'border-2 transition-all',
                  deepSearchEnabled 
                    ? 'border-blue-500/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-lg shadow-blue-500/10' 
                    : 'border-white/20 dark:border-gray-700/30 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20',
                  'focus:outline-none',
                  'text-[15px] placeholder:text-muted-foreground/50 font-medium',
                  'resize-none',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'max-h-[120px] overflow-y-auto custom-scrollbar',
                  'leading-relaxed',
                  'shadow-xl'
                )}
                aria-label="Type your message"
                aria-describedby="chat-input-hint"
              />
              {/* Paperclip button inside textarea */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={triggerFileUpload}
                disabled={disabled}
                className={cn(
                  'absolute right-4 bottom-4 p-2 rounded-xl transition-all',
                  'bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                  'shadow-md',
                  disabled ? 'opacity-50 cursor-not-allowed' : 'text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400'
                )}
                aria-label="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </motion.button>
            </div>
            
            <span id="chat-input-hint" className="sr-only">
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            className={cn(
              'p-4 rounded-2xl transition-all flex-shrink-0 relative overflow-hidden group',
              'focus:outline-none focus:ring-4',
              inputValue.trim() && !disabled
                ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-violet-500/30 focus:ring-violet-500/50'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            {/* Shine effect on hover */}
            {inputValue.trim() && !disabled && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700" />
            )}
            <Send className="w-5 h-5 relative z-10" />
          </motion.button>
        </div>
        
        {/* Helper Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground/60 mt-3 px-1 font-medium flex items-center gap-2"
        >
          <Sparkles className="w-3 h-3" />
          <span>
            Press <kbd className="px-2 py-0.5 bg-white/50 dark:bg-gray-800/50 rounded text-[10px] font-bold border border-white/20 dark:border-gray-700/30 shadow-sm">↵</kbd> to send, 
            <kbd className="ml-1 px-2 py-0.5 bg-white/50 dark:bg-gray-800/50 rounded text-[10px] font-bold border border-white/20 dark:border-gray-700/30 shadow-sm">Shift+↵</kbd> for new line
          </span>
        </motion.p>
      </div>
    </div>
  );
}
