import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Settings,
  Bell,
  Mail,
  Shield,
  Database,
  Save,
  CheckCircle2,
  Megaphone
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function SettingsView() {
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Platform Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure platform-wide settings and preferences
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved
          </div>
        )}
      </div>

      {/* Platform Announcements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-base font-semibold">Platform Announcements</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Announcement Title
            </label>
            <Input placeholder="e.g., System Maintenance Scheduled" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Announcement Message
            </label>
            <Textarea
              placeholder="Enter announcement message..."
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
              <Bell className="mr-2 h-4 w-4" />
              Publish Announcement
            </Button>
            <Button variant="outline">Preview</Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-base font-semibold">Email Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              From Email Address
            </label>
            <Input placeholder="noreply@hapiai.com" type="email" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Support Email Address
            </label>
            <Input placeholder="support@hapiai.com" type="email" />
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <input type="checkbox" id="email-notifications" className="h-4 w-4" defaultChecked />
            <div>
              <label htmlFor="email-notifications" className="font-semibold text-foreground">
                Enable email notifications
              </label>
              <p className="text-xs text-muted-foreground">
                Send automated emails to users for important events
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-base font-semibold">Feature Flags</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              id: 'morning-pulse',
              label: 'Morning Pulse Check-ins',
              description: 'Allow students to submit daily emotional check-ins',
              enabled: true,
            },
            {
              id: 'class-pulse',
              label: 'Class Pulse Questions',
              description: 'Enable teachers to post pulse questions to classes',
              enabled: true,
            },
            {
              id: 'hapi-moments',
              label: 'Hapi Moments',
              description: 'Enable peer-to-peer recognition system',
              enabled: true,
            },
            {
              id: 'leaderboard',
              label: 'Class Leaderboards',
              description: 'Display points-based leaderboards',
              enabled: true,
            },
            {
              id: 'canvas-integration',
              label: 'Canvas LMS Integration',
              description: 'Allow Canvas API integration for class sync',
              enabled: true,
            },
            {
              id: 'ai-chat',
              label: 'AI Support Chat',
              description: 'Enable AI-powered emotional support chat',
              enabled: false,
            },
          ].map((feature) => (
            <div
              key={feature.id}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-4"
            >
              <div className="flex-1">
                <p className="font-semibold text-foreground">{feature.label}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
              <button
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  feature.enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                    feature.enabled ? 'left-5' : 'left-0.5'
                  )}
                ></span>
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-base font-semibold">Security & Privacy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <input type="checkbox" id="require-2fa" className="h-4 w-4" />
            <div>
              <label htmlFor="require-2fa" className="font-semibold text-foreground">
                Require two-factor authentication
              </label>
              <p className="text-xs text-muted-foreground">
                Force all users to enable 2FA for enhanced security
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <input type="checkbox" id="password-policy" className="h-4 w-4" defaultChecked />
            <div>
              <label htmlFor="password-policy" className="font-semibold text-foreground">
                Strong password policy
              </label>
              <p className="text-xs text-muted-foreground">
                Require minimum 8 characters with mixed case and numbers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <input type="checkbox" id="session-timeout" className="h-4 w-4" defaultChecked />
            <div>
              <label htmlFor="session-timeout" className="font-semibold text-foreground">
                Auto session timeout
              </label>
              <p className="text-xs text-muted-foreground">
                Automatically log users out after 24 hours of inactivity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-base font-semibold">Database & Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Database Status</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="font-semibold text-foreground">Online</span>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Last Backup</p>
              <p className="mt-2 font-semibold text-foreground">2 hours ago</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <Database className="mr-2 h-4 w-4" />
            Trigger Manual Backup
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          onClick={handleSaveSettings}
        >
          <Save className="mr-2 h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
