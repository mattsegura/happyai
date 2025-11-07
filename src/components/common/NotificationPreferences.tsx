import { useState, useEffect } from 'react';
import { Bell, Mail, Moon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences as NotificationPrefs,
} from '../../lib/notifications/notificationService';

export function NotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPrefs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, [user]);

  async function loadPreferences() {
    if (!user) return;

    setIsLoading(true);
    try {
      const prefs = await getNotificationPreferences(user.id);
      setPreferences(prefs);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!user || !preferences) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const success = await updateNotificationPreferences(user.id, preferences);

      if (success) {
        setSaveMessage('Preferences saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Failed to save preferences. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  function updatePreference(key: keyof NotificationPrefs, value: any) {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load notification preferences</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Notification Preferences</h2>
        <p className="text-muted-foreground">
          Manage how you receive Care Alerts and other notifications
        </p>
      </div>

      {/* In-App Notifications */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-foreground">In-App Notifications</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-foreground">Enable in-app notifications</span>
            <input
              type="checkbox"
              checked={preferences.enable_in_app}
              onChange={(e) => updatePreference('enable_in_app', e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-foreground">Email Notifications</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-foreground">Enable email notifications</span>
            <input
              type="checkbox"
              checked={preferences.enable_email_alerts}
              onChange={(e) => updatePreference('enable_email_alerts', e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
          </label>

          {preferences.enable_email_alerts && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email frequency
              </label>
              <select
                value={preferences.email_alert_frequency}
                onChange={(e) => updatePreference('email_alert_frequency', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="immediate">Immediate (as alerts occur)</option>
                <option value="daily">Daily Digest (8am)</option>
                <option value="weekly">Weekly Digest (Monday 8am)</option>
                <option value="never">Never</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Alert Severity Preferences */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-foreground">Alert Severity</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-foreground">Critical Alerts</span>
              <p className="text-xs text-muted-foreground">Both emotional AND academic concerns</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notify_critical_alerts}
              onChange={(e) => updatePreference('notify_critical_alerts', e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-foreground">High Priority Alerts</span>
              <p className="text-xs text-muted-foreground">Severe emotional or academic issues</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notify_high_alerts}
              onChange={(e) => updatePreference('notify_high_alerts', e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-foreground">Medium Priority Alerts</span>
              <p className="text-xs text-muted-foreground">Moderate concerns</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notify_medium_alerts}
              onChange={(e) => updatePreference('notify_medium_alerts', e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>

      {/* Alert Type Preferences */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold text-foreground mb-4">Alert Types</h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-foreground">Emotional wellbeing alerts</span>
            <input
              type="checkbox"
              checked={preferences.notify_emotional_alerts}
              onChange={(e) => updatePreference('notify_emotional_alerts', e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-foreground">Academic performance alerts</span>
            <input
              type="checkbox"
              checked={preferences.notify_academic_alerts}
              onChange={(e) => updatePreference('notify_academic_alerts', e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-foreground">Intervention response updates</span>
            <input
              type="checkbox"
              checked={preferences.notify_intervention_responses}
              onChange={(e) => updatePreference('notify_intervention_responses', e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Moon className="h-5 w-5 text-primary-600" />
          <h3 className="font-semibold text-foreground">Quiet Hours</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-foreground">Enable quiet hours (no notifications)</span>
            <input
              type="checkbox"
              checked={preferences.enable_quiet_hours}
              onChange={(e) => updatePreference('enable_quiet_hours', e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary-600 focus:ring-primary-500"
            />
          </label>

          {preferences.enable_quiet_hours && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start time
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start || '22:00'}
                  onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End time
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end || '08:00'}
                  onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {saveMessage && (
            <p className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-rose-600'}`}>
              {saveMessage}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
