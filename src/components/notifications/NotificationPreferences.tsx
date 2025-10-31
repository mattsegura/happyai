/**
 * Notification Preferences Component
 *
 * Allows users to configure their notification settings including:
 * - Channel preferences (in-app, email, push, SMS)
 * - Type preferences (deadline, mood, performance, AI, achievements)
 * - Quiet hours
 * - Frequency limits
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationPreferences as NotificationPrefs } from '../../lib/notifications/types';
import { Card } from '../ui/card';
import { Bell, Clock, Settings, Mail, Smartphone, MessageSquare } from 'lucide-react';

export function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load preferences on mount
  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data as NotificationPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences || !user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          ...preferences,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = <K extends keyof NotificationPrefs>(
    key: K,
    value: NotificationPrefs[K]
  ) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center py-8">
          Unable to load notification preferences
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Notification Preferences</h2>
        <p className="text-muted-foreground mt-1">
          Customize how and when you receive notifications
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Notification Channels */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Notification Channels</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Choose how you want to receive notifications
        </p>

        <div className="space-y-4">
          {/* In-App (always on) */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">In-App Notifications</div>
                <div className="text-sm text-muted-foreground">Always enabled</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={true}
              disabled
              className="w-5 h-5 rounded accent-primary opacity-50 cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive important alerts via email
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.email_enabled}
              onChange={(e) => updatePreference('email_enabled', e.target.checked)}
              className="w-5 h-5 rounded accent-primary"
            />
          </div>

          {/* Push */}
          <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5" />
              <div>
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Coming soon - Browser push notifications
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={false}
              disabled
              className="w-5 h-5 rounded accent-primary cursor-not-allowed"
            />
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <div>
                <div className="font-medium">SMS Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Coming soon - Text message alerts
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={false}
              disabled
              className="w-5 h-5 rounded accent-primary cursor-not-allowed"
            />
          </div>
        </div>
      </Card>

      {/* Notification Types */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Notification Types</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Choose which types of notifications you want to receive
        </p>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div>
              <div className="font-medium">Deadline Reminders</div>
              <div className="text-sm text-muted-foreground">
                Assignments, quizzes, and study sessions
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.deadline_notifications}
              onChange={(e) =>
                updatePreference('deadline_notifications', e.target.checked)
              }
              className="w-5 h-5 rounded accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div>
              <div className="font-medium">Mood-Based Notifications</div>
              <div className="text-sm text-muted-foreground">
                Support suggestions based on your mood
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.mood_notifications}
              onChange={(e) => updatePreference('mood_notifications', e.target.checked)}
              className="w-5 h-5 rounded accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div>
              <div className="font-medium">Performance Alerts</div>
              <div className="text-sm text-muted-foreground">
                Grade changes, missing assignments, feedback
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.performance_notifications}
              onChange={(e) =>
                updatePreference('performance_notifications', e.target.checked)
              }
              className="w-5 h-5 rounded accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div>
              <div className="font-medium">AI Suggestions</div>
              <div className="text-sm text-muted-foreground">
                Study recommendations and workload insights
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.ai_suggestions}
              onChange={(e) => updatePreference('ai_suggestions', e.target.checked)}
              className="w-5 h-5 rounded accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div>
              <div className="font-medium">Achievements & Milestones</div>
              <div className="text-sm text-muted-foreground">
                Streaks, perfect weeks, grade improvements
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.achievement_notifications}
              onChange={(e) =>
                updatePreference('achievement_notifications', e.target.checked)
              }
              className="w-5 h-5 rounded accent-primary"
            />
          </label>
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Quiet Hours</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Set times when you don't want to receive notifications
        </p>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={preferences.quiet_hours_enabled}
              onChange={(e) =>
                updatePreference('quiet_hours_enabled', e.target.checked)
              }
              className="w-5 h-5 rounded accent-primary"
            />
            <span className="font-medium">Enable Quiet Hours</span>
          </label>

          {preferences.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4 pl-8">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start?.slice(0, 5) || '22:00'}
                  onChange={(e) =>
                    updatePreference('quiet_hours_start', `${e.target.value}:00`)
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end?.slice(0, 5) || '08:00'}
                  onChange={(e) =>
                    updatePreference('quiet_hours_end', `${e.target.value}:00`)
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Frequency Limits */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Frequency Limits</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Control how often you receive notifications
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum notifications per day: {preferences.max_notifications_per_day}
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={preferences.max_notifications_per_day}
              onChange={(e) =>
                updatePreference('max_notifications_per_day', parseInt(e.target.value))
              }
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5</span>
              <span>20</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum hours between notifications: {preferences.min_hours_between_notifications}
            </label>
            <input
              type="range"
              min="0.25"
              max="4"
              step="0.25"
              value={preferences.min_hours_between_notifications}
              onChange={(e) =>
                updatePreference(
                  'min_hours_between_notifications',
                  parseFloat(e.target.value)
                )
              }
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>15 min</span>
              <span>4 hours</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={loadPreferences}
          disabled={saving}
          className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors"
        >
          Reset
        </button>
        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
