import { QuickStatusBar } from './QuickStatusBar';
import { DailyPriorities } from './DailyPriorities';
import { HapiAiInsights } from './HapiAiInsights';
import { getStaticAnalyticsData } from '../../lib/staticAnalyticsData';
import { BookOpen, Heart, Trophy, MessageSquare, Beaker, Users } from 'lucide-react';

interface TodayViewProps {
  onMorningPulseClick: () => void;
  onClassPulseClick: () => void;
  onMeetingClick: (meetingData: any) => void;
  onHapiMomentClick: (data?: any) => void;
  onTalkMore: () => void;
  onNavigate: (view: string) => void;
}

export function TodayView({
  onMorningPulseClick,
  onClassPulseClick,
  onMeetingClick,
  onHapiMomentClick,
  onTalkMore,
  onNavigate,
}: TodayViewProps) {
  const analyticsData = getStaticAnalyticsData();

  const quickActions = [
    {
      id: 'academics',
      label: 'Academics',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-600',
      description: 'Grades & Study',
    },
    {
      id: 'wellbeing',
      label: 'Wellbeing',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      description: 'Mood Tracking',
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-600',
      description: 'Badges & Ranks',
    },
    {
      id: 'hapi',
      label: 'Hapi AI',
      icon: MessageSquare,
      color: 'from-purple-500 to-indigo-600',
      description: 'AI Assistant',
    },
    {
      id: 'lab',
      label: 'Hapi Lab',
      icon: Beaker,
      color: 'from-emerald-500 to-teal-600',
      description: 'Pulse & Moments',
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      description: 'Class List',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6 shadow-sm">
        <h1 className="text-3xl font-black text-foreground">Welcome back!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's your overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quick Status Bar */}
      <QuickStatusBar
        streak={7}
        pointsToday={45}
        rank={12}
        rankTrend="up"
        level={9}
        levelProgress={50}
      />

      {/* Daily Priorities */}
      <DailyPriorities
        onMorningPulseClick={onMorningPulseClick}
        onClassPulseClick={onClassPulseClick}
        onMeetingClick={onMeetingClick}
        onHapiMomentClick={onHapiMomentClick}
      />

      {/* AI Insights */}
      <HapiAiInsights analyticsData={analyticsData} onTalkMore={onTalkMore} />

      {/* Quick Actions Grid */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="group flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
              >
                <div className={`rounded-lg bg-gradient-to-br ${action.color} p-3 text-white shadow-md transition-transform group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground group-hover:text-primary">
                    {action.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tips Section */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-bold text-foreground">💡 Pro Tip</h3>
        <p className="text-sm text-muted-foreground">
          Complete your Morning Pulse and Class Pulses daily to maintain your streak and earn bonus points!
          Your current {7}-day streak is impressive - keep it going!
        </p>
      </div>
    </div>
  );
}
