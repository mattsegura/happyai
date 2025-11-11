import { Bell, BookOpen, MessageSquare, Trophy, TrendingUp, Sparkles, FileText, GraduationCap, Target, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { designSystem } from '../../lib/design-system';

type NotificationType = 'canvas' | 'hapi';
type NotificationCategory = 'grade' | 'assignment' | 'discussion' | 'remark' | 'study_plan' | 'achievement' | 'sentiment';

interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'canvas',
    category: 'grade',
    title: 'Assignment Graded',
    message: 'Your "Essay on Climate Change" has been graded: A- (92%)',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    read: false,
  },
  {
    id: '2',
    type: 'hapi',
    category: 'achievement',
    title: 'New Achievement Unlocked! 🎉',
    message: 'Study Streak Master - 7 days in a row!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: '3',
    type: 'canvas',
    category: 'assignment',
    title: 'New Assignment Posted',
    message: 'Biology Lab Report due on Dec 15th',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
  },
  {
    id: '4',
    type: 'hapi',
    category: 'sentiment',
    title: 'Mood Improvement Detected! 📈',
    message: 'Your wellbeing score improved by 15% this week',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: false,
  },
  {
    id: '5',
    type: 'canvas',
    category: 'discussion',
    title: 'New Discussion Post',
    message: 'Dr. Smith replied to "Chapter 5 Questions"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
  {
    id: '6',
    type: 'hapi',
    category: 'study_plan',
    title: 'Study Plan Created',
    message: 'AI generated your master plan for Finals Week',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    read: true,
  },
  {
    id: '7',
    type: 'canvas',
    category: 'remark',
    title: 'Teacher Comment',
    message: 'Prof. Johnson: "Excellent work on your presentation!"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    read: true,
  },
];

const getNotificationIcon = (category: NotificationCategory) => {
  switch (category) {
    case 'grade':
      return GraduationCap;
    case 'assignment':
      return FileText;
    case 'discussion':
      return MessageSquare;
    case 'remark':
      return Sparkles;
    case 'study_plan':
      return Target;
    case 'achievement':
      return Trophy;
    case 'sentiment':
      return TrendingUp;
    default:
      return Bell;
  }
};

const getNotificationStyle = (category: NotificationCategory) => {
  switch (category) {
    case 'grade':
      return {
        bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        lightBg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-800',
      };
    case 'assignment':
      return {
        bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        lightBg: 'bg-amber-50 dark:bg-amber-950/20',
        border: 'border-amber-200 dark:border-amber-800',
      };
    case 'discussion':
      return {
        bg: 'bg-gradient-to-br from-purple-500 to-violet-600',
        lightBg: 'bg-purple-50 dark:bg-purple-950/20',
        border: 'border-purple-200 dark:border-purple-800',
      };
    case 'remark':
      return {
        bg: 'bg-gradient-to-br from-pink-500 to-rose-600',
        lightBg: 'bg-pink-50 dark:bg-pink-950/20',
        border: 'border-pink-200 dark:border-pink-800',
      };
    case 'study_plan':
      return {
        bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
        lightBg: 'bg-emerald-50 dark:bg-emerald-950/20',
        border: 'border-emerald-200 dark:border-emerald-800',
      };
    case 'achievement':
      return {
        bg: 'bg-gradient-to-br from-yellow-500 to-amber-600',
        lightBg: 'bg-yellow-50 dark:bg-yellow-950/20',
        border: 'border-yellow-200 dark:border-yellow-800',
      };
    case 'sentiment':
      return {
        bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
        lightBg: 'bg-green-50 dark:bg-green-950/20',
        border: 'border-green-200 dark:border-green-800',
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
        lightBg: 'bg-gray-50 dark:bg-gray-950/20',
        border: 'border-gray-200 dark:border-gray-800',
      };
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function NotificationsCard() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-4 md:p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-sm">
              <Bell className="h-5 w-5 text-white" />
            </div>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background"
              >
                <span className="text-[10px] font-bold text-white">{unreadCount}</span>
              </motion.div>
            )}
          </div>
          <div>
            <h3 className={cn(designSystem.typography.sectionTitle, 'mb-0')}>Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </motion.div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.category);
              const style = getNotificationStyle(notification.category);

              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={cn(
                    'relative p-3 rounded-lg border transition-all cursor-pointer group',
                    !notification.read
                      ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
                      : 'bg-background/50 border-border/40 hover:bg-muted/30'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn('p-2 rounded-lg shadow-sm flex-shrink-0', style.bg)}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(notification.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* View All Button */}
      {notifications.length > 5 && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <button className="w-full py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            View All Notifications
          </button>
        </div>
      )}
    </motion.div>
  );
}

