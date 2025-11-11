import { X, Sparkles, MoreVertical, Trash2, Zap } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatHeaderProps {
  onClose?: () => void;
  onClearMessages?: () => void;
}

export function ChatHeader({ onClose, onClearMessages }: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="relative flex items-center justify-between px-6 py-4 border-b border-white/10 dark:border-gray-800/30 bg-gradient-to-r from-white/40 via-white/30 to-transparent dark:from-gray-900/40 dark:via-gray-900/30 dark:to-transparent backdrop-blur-sm">
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-white/[0.02] opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-center gap-4">
        {/* Enhanced AI Avatar */}
        <div className="relative group">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity" />
            
            {/* Avatar */}
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg ring-2 ring-white/20 dark:ring-gray-800/50">
              <Sparkles className="w-6 h-6 text-white animate-pulse" style={{ animationDuration: '3s' }} />
            </div>
            
            {/* Enhanced online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center">
              <span className="absolute w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-75" />
              <span className="relative w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg" />
            </div>
          </motion.div>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Hapi AI
            </h2>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
            >
              <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />
                Pro
              </span>
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Your personal study assistant
          </p>
        </div>
      </div>

      <div className="relative flex items-center gap-1">
        {/* Menu Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2.5 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all backdrop-blur-sm"
            aria-label="Chat options"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-2xl shadow-2xl shadow-violet-500/10 z-20 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      onClearMessages?.();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-violet-500/10 transition-colors flex items-center gap-3 text-foreground group"
                  >
                    <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <span>Clear conversation</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Close Button - Only show if onClose is provided */}
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="lg:hidden p-2.5 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all backdrop-blur-sm"
            aria-label="Close chat"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}
      </div>
    </header>
  );
}
