/**
 * Notification Center Component
 *
 * Displays a dropdown with all user notifications
 * Shows unread count badge and allows marking as read/dismissed
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationQueue } from '../../lib/notifications/types';
import {
  Bell,
  BellDot,
  X,
  Check,
  ExternalLink,
  Calendar,
  TrendingDown,
  Sparkles,
  Award,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationQueue[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) {
      loadNotifications();

      // Set up realtime subscription for new notifications
      const subscription = supabase
        .channel('notification_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notification_queue',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load notifications
      const { data, error } = await supabase
        .from('notification_queue')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'sent')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications((data as NotificationQueue[]) || []);

      // Count unread
      const unread = data?.filter((n) => !n.read_at && !n.dismissed_at).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
        p_user_id: user.id,
      });

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsDismissed = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('mark_notification_dismissed', {
        p_notification_id: notificationId,
        p_user_id: user.id,
      });

      if (!error) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? {
                  ...n,
                  dismissed_at: new Date().toISOString(),
                  read_at: n.read_at || new Date().toISOString(),
                }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadIds = notifications
        .filter((n) => !n.read_at && !n.dismissed_at)
        .map((n) => n.id);

      for (const id of unreadIds) {
        await supabase.rpc('mark_notification_read', {
          p_notification_id: id,
          p_user_id: user.id,
        });
      }

      setNotifications((prev) =>
        prev.map((n) =>
          unreadIds.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: NotificationQueue) => {
    // Mark as clicked (which also marks as read)
    if (!user) return;

    try {
      await supabase.rpc('mark_notification_clicked', {
        p_notification_id: notification.id,
        p_user_id: user.id,
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? {
                ...n,
                clicked_at: new Date().toISOString(),
                read_at: n.read_at || new Date().toISOString(),
              }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Navigate to action URL if present
      if (notification.action_url) {
        window.location.href = notification.action_url;
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'mood':
        return <TrendingDown className="w-5 h-5 text-orange-500" />;
      case 'performance':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'ai_suggestion':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return 'border-l-red-500';
    if (priority >= 70) return 'border-l-orange-500';
    if (priority >= 50) return 'border-l-blue-500';
    return 'border-l-gray-300';
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') {
      return !n.read_at && !n.dismissed_at;
    }
    return !n.dismissed_at; // Show all non-dismissed
  });

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellDot className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-card border rounded-lg shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded ${
                    activeTab === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded ${
                    activeTab === 'unread'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="w-full mt-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => {
                    const isUnread = !notification.read_at && !notification.dismissed_at;

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 border-l-4 ${getPriorityColor(
                          notification.priority
                        )} hover:bg-muted/50 transition-colors ${
                          isUnread ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getIcon(notification.notification_type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm leading-tight">
                                {notification.title}
                              </h4>
                              {isUnread && (
                                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.body}
                            </p>

                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3">
                              {notification.action_url && (
                                <button
                                  onClick={() => handleNotificationClick(notification)}
                                  className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center gap-1"
                                >
                                  {notification.action_label || 'View'}
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}

                              {isUnread && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs px-3 py-1 border rounded hover:bg-muted transition-colors flex items-center gap-1"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}

                              <button
                                onClick={() => markAsDismissed(notification.id)}
                                className="text-xs px-3 py-1 border rounded hover:bg-muted transition-colors flex items-center gap-1"
                                title="Dismiss"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to full notifications page if you have one
                    // window.location.href = '/notifications';
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
