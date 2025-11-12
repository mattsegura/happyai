import { X, EyeOff, Lock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { useState, useEffect, useRef } from 'react';

interface PrivateModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dontShowAgain: boolean) => void;
  mode: 'enable' | 'disable';
}

/**
 * PrivateModeModal - Popover for private mode confirmation
 */
export function PrivateModeModal({ isOpen, onClose, onConfirm, mode }: PrivateModeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleConfirm = () => {
    onConfirm(dontShowAgain);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-full mb-2 right-0 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <EyeOff className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Private Mode
              </h2>
              <p className="text-xs text-muted-foreground">Your conversations, your choice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {mode === 'enable' ? (
            <>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-xs text-purple-900 dark:text-purple-100">
                      Messages won't be saved
                    </h3>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                      Conversation deleted when you close or refresh.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-xs text-blue-900 dark:text-blue-100">
                      Perfect for sensitive topics
                    </h3>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                      Great for personal concerns you don't want recorded.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-1">
                Have a conversation that won't be saved to your chat history.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-xs text-amber-900 dark:text-amber-100">
                    Your session will be cleared
                  </h3>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    All messages from this private session will be permanently deleted.
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-1">
                Return to your regular conversations with saved history.
              </p>
            </>
          )}

          {/* Don't show again checkbox */}
          <div className="pt-3 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded transition-all peer-checked:border-purple-600 peer-checked:bg-purple-600 dark:peer-checked:border-purple-500 dark:peer-checked:bg-purple-500"></div>
                <svg
                  className="absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Don't show this again
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-3 border-t border-border bg-muted/10">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-md transition-all"
          >
            {mode === 'enable' ? 'Enable' : 'Disable'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

