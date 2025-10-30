import { Sunrise, MessageSquare, Beaker, Heart, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

interface QuickActionsBarProps {
  onMorningPulseClick: () => void;
  onChatClick: () => void;
  onLabClick: () => void;
  onHapiMomentClick: () => void;
}

export function QuickActionsBar({
  onMorningPulseClick,
  onChatClick,
  onLabClick,
  onHapiMomentClick,
}: QuickActionsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions: QuickAction[] = [
    {
      id: 'pulse',
      label: 'Morning Pulse',
      icon: <Sunrise className="h-5 w-5" />,
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
      onClick: onMorningPulseClick,
    },
    {
      id: 'chat',
      label: 'Chat with Hapi',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      onClick: onChatClick,
    },
    {
      id: 'lab',
      label: 'Hapi Lab',
      icon: <Beaker className="h-5 w-5" />,
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      onClick: onLabClick,
    },
    {
      id: 'moment',
      label: 'Hapi Moment',
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-gradient-to-br from-rose-500 to-red-600',
      onClick: onHapiMomentClick,
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
                className={`group flex items-center gap-3 rounded-full ${action.color} px-5 py-3 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  {action.icon}
                </div>
                <span className="pr-2 text-sm font-bold">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl"
        animate={{ rotate: isExpanded ? 45 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="h-8 w-8" />
      </motion.button>

      {/* Tooltip */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background shadow-lg"
        >
          Quick Actions
        </motion.div>
      )}
    </div>
  );
}
