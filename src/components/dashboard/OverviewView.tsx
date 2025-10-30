import { BookOpen, Heart, Trophy, MessageSquare, Beaker, Users, TrendingUp, Calendar, Zap, Activity, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OverviewViewProps {
  onNavigate: (view: string) => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  const quickStats = [
    { label: 'Current Streak', value: '7 days', icon: Zap, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50 dark:bg-orange-950/20' },
    { label: 'Points Today', value: '45', icon: Trophy, color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20' },
    { label: 'Class Rank', value: '#12', icon: TrendingUp, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50 dark:bg-green-950/20' },
    { label: 'Current Level', value: '9', icon: Activity, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50 dark:bg-purple-950/20' },
  ];

  const quickActions = [
    {
      id: 'academics',
      label: 'Academics',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-600',
      description: 'View grades & assignments',
      stats: '3 due this week',
    },
    {
      id: 'wellbeing',
      label: 'Wellbeing',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      description: 'Track your mood',
      stats: 'Complete today\'s pulse',
    },
    {
      id: 'hapi',
      label: 'Hapi AI',
      icon: MessageSquare,
      color: 'from-purple-500 to-indigo-600',
      description: 'Chat with your AI assistant',
      stats: 'Ask me anything',
    },
    {
      id: 'lab',
      label: 'Hapi Lab',
      icon: Beaker,
      color: 'from-emerald-500 to-teal-600',
      description: 'Pulses & Hapi Moments',
      stats: '2 new moments',
    },
  ];

  const upcomingItems = [
    { title: 'Complete Morning Pulse', time: 'Today', type: 'pulse', color: 'bg-rose-500' },
    { title: 'Biology Assignment', time: 'Tomorrow, 11:59 PM', type: 'assignment', color: 'bg-blue-500' },
    { title: 'Math Quiz Chapter 5', time: 'Friday, 2:00 PM', type: 'quiz', color: 'bg-yellow-500' },
    { title: 'Office Hours with Dr. Smith', time: 'Next Week', type: 'meeting', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Welcome back! 👋
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening with your academics and wellbeing today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                'rounded-xl border border-border/60 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all',
                stat.bgColor
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('p-2.5 rounded-xl bg-gradient-to-br shadow-md', stat.color)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Takes 2 columns */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onNavigate(action.id)}
                  className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'p-3 rounded-xl bg-gradient-to-br shadow-md group-hover:scale-110 transition-transform flex-shrink-0',
                        action.color
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-foreground mb-1">{action.label}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                      <p className="text-xs text-primary font-medium">{action.stats}</p>
                    </div>
                  </div>

                  {/* Hover gradient overlay */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity',
                    action.color
                  )} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming - Takes 1 column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Upcoming</h3>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4 shadow-sm space-y-3">
            {upcomingItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={cn('h-2 w-2 rounded-full mt-2 flex-shrink-0', item.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
