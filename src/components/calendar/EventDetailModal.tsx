import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X, Calendar, Clock, BookOpen, Target, Edit3, Trash2,
  ExternalLink, Bell, Plus, CheckCircle, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    type: 'assignment' | 'study' | 'exam' | 'lecture';
    date: string;
    time?: string;
    endTime?: string;
    className: string;
    classColor: string;
    description?: string;
    location?: string;
    points?: number;
    status?: 'pending' | 'in-progress' | 'completed';
    studyPlanId?: string;
    assignmentId?: string;
  } | null;
}

const eventTypeConfig = {
  assignment: {
    icon: BookOpen,
    label: 'Assignment',
    color: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  study: {
    icon: Target,
    label: 'Study Session',
    color: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
  },
  exam: {
    icon: AlertCircle,
    label: 'Exam',
    color: 'from-red-500 to-orange-500',
    textColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
  },
  lecture: {
    icon: Calendar,
    label: 'Lecture',
    color: 'from-green-500 to-emerald-500',
    textColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
  },
};

export function EventDetailModal({ isOpen, onClose, event }: EventDetailModalProps) {
  const navigate = useNavigate();

  if (!isOpen || !event) return null;

  const config = eventTypeConfig[event.type];
  const Icon = config.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const handleNavigateToSource = () => {
    if (event.assignmentId) {
      navigate(`/dashboard/assignments/${event.assignmentId}`);
    } else if (event.studyPlanId) {
      navigate(`/dashboard/study-buddy/${event.studyPlanId}`);
    }
    onClose();
  };

  const handleEdit = () => {
    // In a real app, this would open an edit modal
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
    notification.textContent = 'Edit functionality coming soon!';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${event.title}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmDelete) {
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
      notification.textContent = `✓ Deleted ${event.title}`;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
      onClose();
    }
  };

  const handleAddReminder = () => {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
    notification.textContent = `✓ Reminder set for ${event.title}`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className={cn('bg-gradient-to-r p-6 text-white', config.color)}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-white/20">
                      {config.label}
                    </span>
                    {event.status && (
                      <span className={cn(
                        'text-xs font-semibold px-2 py-1 rounded-md',
                        event.status === 'completed' ? 'bg-green-500/20' :
                        event.status === 'in-progress' ? 'bg-amber-500/20' :
                        'bg-white/20'
                      )}>
                        {event.status === 'completed' ? '✓ Completed' :
                         event.status === 'in-progress' ? 'In Progress' :
                         'Pending'}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
                  <p className="text-sm opacity-90">{event.className}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Date & Time */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className={cn('w-5 h-5', config.textColor)} />
                <div>
                  <p className="text-sm font-medium text-foreground">{formatDate(event.date)}</p>
                  {event.time && (
                    <p className="text-xs text-muted-foreground">
                      {event.time}{event.endTime ? ` - ${event.endTime}` : ''}
                    </p>
                  )}
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-3">
                  <ExternalLink className={cn('w-5 h-5', config.textColor)} />
                  <p className="text-sm text-foreground">{event.location}</p>
                </div>
              )}

              {event.points !== undefined && (
                <div className="flex items-center gap-3">
                  <Target className={cn('w-5 h-5', config.textColor)} />
                  <p className="text-sm text-foreground">{event.points} points</p>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className={cn('p-4 rounded-xl', config.bgColor)}>
                <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddReminder}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">Set Reminder</span>
              </button>
              {(event.assignmentId || event.studyPlanId) && (
                <button
                  onClick={handleNavigateToSource}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">Open Workspace</span>
                </button>
              )}
            </div>

            {/* Status Actions */}
            {event.status !== 'completed' && event.type === 'assignment' && (
              <button
                onClick={() => {
                  const notification = document.createElement('div');
                  notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
                  notification.textContent = `✓ Marked ${event.title} as completed`;
                  document.body.appendChild(notification);
                  setTimeout(() => document.body.removeChild(notification), 3000);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Mark as Completed</span>
              </button>
            )}
          </div>

          {/* Footer - Danger Zone */}
          <div className="p-4 border-t border-border bg-muted/30 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-background transition-colors text-sm font-medium"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

