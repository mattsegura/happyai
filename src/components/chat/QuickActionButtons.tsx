import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Brain, Calendar, Sparkles, FileText, Clock, Target,
  TrendingUp, Heart, Coffee, ArrowRight
} from 'lucide-react';
import { DetectedAction } from '@/lib/ai/actionDetector';
import { cn } from '@/lib/utils';
import { ReminderModal } from '../student/ReminderModal';
import { BreakTimerModal } from '../student/BreakTimerModal';
import { SupportResourcesModal } from '../student/SupportResourcesModal';

interface QuickActionButtonsProps {
  actions: DetectedAction[];
  className?: string;
}

// Map icon names to components
const iconMap: Record<string, React.ComponentType<any>> = {
  Brain,
  Calendar,
  Sparkles,
  FileText,
  Clock,
  Target,
  TrendingUp,
  Heart,
  Coffee,
};

export function QuickActionButtons({ actions, className }: QuickActionButtonsProps) {
  const navigate = useNavigate();
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [reminderContext, setReminderContext] = useState<any>(null);

  if (actions.length === 0) return null;

  const handleActionClick = (action: DetectedAction) => {
    if (action.route) {
      // Navigate to the route with context if provided
      navigate(action.route, { state: action.context });
    } else {
      // Handle non-routing actions (like reminders, breaks)
      handleSpecialAction(action);
    }
  };

  const handleSpecialAction = (action: DetectedAction) => {
    switch (action.type) {
      case 'set_reminder':
        setReminderContext(action.context);
        setShowReminderModal(true);
        break;
      case 'schedule_break':
        setShowBreakModal(true);
        break;
      case 'connect_with_support':
        setShowSupportModal(true);
        break;
    }
  };

  return (
    <>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {actions.map((action, index) => {
          const Icon = iconMap[action.icon] || ArrowRight;
          
          return (
            <motion.button
              key={`${action.type}-${index}`}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActionClick(action)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'backdrop-blur-xl bg-white/60 dark:bg-gray-800/60',
                'border border-primary/20 hover:border-primary/40',
                'text-sm font-medium text-foreground',
                'transition-all shadow-sm hover:shadow-md',
                'group'
              )}
            >
              <Icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span>{action.label}</span>
              {action.context?.subject && (
                <span className="text-xs text-muted-foreground">
                  ({action.context.subject})
                </span>
              )}
              <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </motion.button>
          );
        })}
      </div>

      {/* Modals */}
      <ReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        initialContext={reminderContext}
      />
      <BreakTimerModal
        isOpen={showBreakModal}
        onClose={() => setShowBreakModal(false)}
      />
      <SupportResourcesModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </>
  );
}

// Variant for inline actions within messages
export function InlineActionButton({ action }: { action: DetectedAction }) {
  const navigate = useNavigate();
  const Icon = iconMap[action.icon] || ArrowRight;

  const handleClick = () => {
    if (action.route) {
      navigate(action.route, { state: action.context });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md',
        'bg-primary/10 hover:bg-primary/20',
        'border border-primary/30',
        'text-xs font-medium text-primary',
        'transition-all'
      )}
    >
      <Icon className="w-3 h-3" />
      {action.label}
    </button>
  );
}

