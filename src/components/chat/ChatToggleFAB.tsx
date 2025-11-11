import { MessageCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatToggleFABProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function ChatToggleFAB({ isOpen, onClick, unreadCount = 0 }: ChatToggleFABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        // Position - bottom-left on desktop, bottom-right on mobile
        'fixed z-50',
        'bottom-6 left-6',
        'lg:bottom-8 lg:left-8',
        
        // Size & Shape
        'w-14 h-14 lg:w-16 lg:h-16',
        'rounded-full',
        
        // Visual Design
        'bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600',
        'shadow-lg shadow-violet-500/50',
        'hover:shadow-xl hover:shadow-violet-500/60',
        'hover:scale-110',
        
        // Animation
        'transition-all duration-300 ease-out',
        'active:scale-95',
        
        // Hide when chat is open on desktop
        isOpen && 'lg:opacity-0 lg:pointer-events-none',
        
        // Accessibility
        'focus:outline-none focus:ring-4 focus:ring-violet-500/50'
      )}
      aria-label={isOpen ? 'Close AI Chat' : 'Open AI Chat'}
      aria-expanded={isOpen}
    >
      {/* Icon with rotation animation */}
      <div
        className={cn(
          'flex items-center justify-center transition-transform duration-300',
          isOpen ? 'rotate-180' : 'rotate-0'
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
        )}
      </div>

      {/* Unread Badge */}
      {unreadCount > 0 && !isOpen && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in duration-200">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {/* Pulse animation for attention when there are unread messages */}
      {unreadCount > 0 && !isOpen && (
        <span className="absolute inset-0 rounded-full bg-violet-600 animate-ping opacity-20" />
      )}

      {/* Subtle pulse when idle */}
      {!isOpen && unreadCount === 0 && (
        <span className="absolute inset-0 rounded-full bg-violet-600 animate-pulse opacity-10" />
      )}
    </button>
  );
}
