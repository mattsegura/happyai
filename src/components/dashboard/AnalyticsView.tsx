import { PersonalSentimentChart } from './PersonalSentimentChart';
import { HapiAiInsights } from './HapiAiInsights';
import { Award, TrendingUp, Target, Flame } from 'lucide-react';
import { getStaticAnalyticsData } from '../../lib/staticAnalyticsData';
import { useNavigate } from 'react-router-dom';

export function AnalyticsView() {
  const navigate = useNavigate();
  const analyticsData = getStaticAnalyticsData();

  // Mock stats - replace with real data later
  const stats = [
    {
      label: 'Current Streak',
      value: '7 days',
      icon: Flame,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    },
    {
      label: 'Total Points',
      value: '1,250',
      icon: Award,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      label: 'Avg Sentiment',
      value: '4.2/6',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
    {
      label: 'Check-ins',
      value: '45',
      icon: Target,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sentiment Chart */}
      <PersonalSentimentChart />

      {/* AI Insights */}
      <HapiAiInsights
        analyticsData={analyticsData}
        onTalkMore={() => navigate('/dashboard/ai-chat')}
      />

      {/* Additional Analytics Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Activity</h3>
          <div className="space-y-3">
            {[
              { day: 'Monday', pulses: 3, moments: 2 },
              { day: 'Tuesday', pulses: 2, moments: 1 },
              { day: 'Wednesday', pulses: 4, moments: 3 },
              { day: 'Thursday', pulses: 3, moments: 2 },
              { day: 'Friday', pulses: 2, moments: 4 },
              { day: 'Saturday', pulses: 1, moments: 1 },
              { day: 'Sunday', pulses: 1, moments: 0 },
            ].map((item) => (
              <div key={item.day} className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{item.day}</span>
                <div className="flex gap-2">
                  <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {item.pulses} pulses
                  </span>
                  <span className="rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
                    {item.moments} moments
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Achievement Progress</h3>
          <div className="space-y-4">
            {[
              { name: 'Week Warrior', progress: 70, total: 100 },
              { name: 'Mood Master', progress: 45, total: 50 },
              { name: 'Social Star', progress: 12, total: 25 },
              { name: 'Study Champion', progress: 8, total: 20 },
            ].map((achievement) => (
              <div key={achievement.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{achievement.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {achievement.progress}/{achievement.total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all"
                    style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
