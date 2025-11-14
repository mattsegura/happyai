import { useAuth } from '../../contexts/AuthContext';
import { User, Award, Flame, Mail, Calendar, TrendingUp } from 'lucide-react';
import { NotificationPreferences } from '../notifications/NotificationPreferences';

export function ProfileView() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Your profile</h1>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personal milestones and settings</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30 text-primary">
            <User className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{profile.full_name}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" /> {profile.email}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[{
            label: 'Total points',
            value: `${profile.total_points}`,
            icon: Award,
          }, {
            label: 'Current streak',
            value: `${profile.current_streak} days`,
            icon: Flame,
          }, {
            label: 'Member since',
            value: joinDate,
            icon: Calendar,
          }].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.label}
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-xl font-semibold text-foreground">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <TrendingUp className="h-5 w-5 text-primary" /> Progress snapshot
        </h3>
        <div className="mt-4 space-y-4 text-sm text-muted-foreground">
          <div>
            <div className="flex justify-between">
              <span>Daily check-ins</span>
              <span className="font-semibold text-foreground">{profile.current_streak} day streak</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min((profile.current_streak / 30) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Aim for 30 consistent days to unlock a new badge.</p>
          </div>

          <div>
            <div className="flex justify-between">
              <span>Total points earned</span>
              <span className="font-semibold text-foreground">{profile.total_points} pts</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/80"
                style={{ width: `${Math.min((profile.total_points / 500) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {profile.total_points < 500
                ? `${500 - profile.total_points} more points until your 500 badge!`
                : 'Fantastic work! You have passed the 500 point milestone.'}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <NotificationPreferences />
    </div>
  );
}
