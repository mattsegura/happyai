import { X, Sparkles, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ChatHeaderProps {
  onClose?: () => void;
  onClearMessages?: () => void;
}

export function ChatHeader({ onClose, onClearMessages }: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* AI Avatar with pulse animation */}
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card">
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
          </div>
        </div>
        
        <div>
          <h2 className="font-semibold text-base text-foreground">Hapi AI Assistant</h2>
          <p className="text-xs text-muted-foreground font-medium">Always here to help</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Chat options"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                <button
                  onClick={() => {
                    onClearMessages?.();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 text-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear conversation
                </button>
              </div>
            </>
          )}
        </div>

        {/* Close Button - Only show if onClose is provided */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </header>
  );
}
