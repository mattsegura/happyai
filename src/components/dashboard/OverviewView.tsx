import { BookOpen, Heart, Trophy, MessageSquare, Beaker, TrendingUp, Zap, Activity, Clock, ArrowRight, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OverviewViewProps {
  onNavigate: (view: string) => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const quickStats = [
    {
      label: 'Current Streak',
      value: '7',
      unit: 'days',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30'
    },
    {
      label: 'Points Today',
      value: '45',
      unit: 'pts',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      label: 'Class Rank',
      value: '#12',
      unit: '',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      iconBg: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'Current Level',
      value: '9',
      unit: '',
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30'
    },
  ];

  const quickActions = [
    {
      id: 'academics',
      label: 'Academics',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-500',
      description: 'View grades & assignments',
      stats: '3 due this week',
      statColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'wellbeing',
      label: 'Wellbeing',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      iconBg: 'bg-rose-500',
      description: 'Track your mood',
      stats: "Complete today's pulse",
      statColor: 'text-rose-600 dark:text-rose-400'
    },
    {
      id: 'hapi',
      label: 'Hapi AI',
      icon: MessageSquare,
      color: 'from-purple-500 to-indigo-600',
      iconBg: 'bg-purple-500',
      description: 'Chat with your AI assistant',
      stats: 'Ask me anything',
      statColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'lab',
      label: 'Hapi Lab',
      icon: Beaker,
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-500',
      description: 'Pulses & Hapi Moments',
      stats: '2 new moments',
      statColor: 'text-emerald-600 dark:text-emerald-400'
    },
  ];

  const upcomingItems = [
    { title: 'Complete Morning Pulse', time: 'Today', type: 'pulse', color: 'bg-rose-500', priority: 'high' },
    { title: 'Biology Assignment', time: 'Tomorrow, 11:59 PM', type: 'assignment', color: 'bg-blue-500', priority: 'medium' },
    { title: 'Math Quiz Chapter 5', time: 'Friday, 2:00 PM', type: 'quiz', color: 'bg-yellow-500', priority: 'medium' },
    { title: 'Office Hours with Dr. Smith', time: 'Next Week', type: 'meeting', color: 'bg-purple-500', priority: 'low' },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Welcome Section */}
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-6 md:p-8 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Welcome back! 👋
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Here's what's happening with your academics and wellbeing today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-border/40">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{currentDate}</span>
            <span className="sm:hidden">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                'rounded-xl border border-border/60 backdrop-blur-sm p-4 md:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]',
                stat.bgColor
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn('p-2 md:p-2.5 rounded-xl shadow-sm', stat.iconBg)}>
                  <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
                {stat.unit && <span className="text-sm text-muted-foreground font-medium">{stat.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-semibold text-foreground">Quick Actions</h3>
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs md:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onNavigate(action.id)}
                  className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-5 md:p-6 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className={cn('p-2.5 md:p-3 rounded-xl shadow-md flex-shrink-0', action.iconBg)}>
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">{action.label}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-1">{action.description}</p>
                      <p className={cn('text-xs font-semibold', action.statColor)}>{action.stats}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100 flex-shrink-0" />
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h3 className="text-lg md:text-xl font-semibold text-foreground">Upcoming</h3>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">Next 7 days</span>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm divide-y divide-border/40">
            {upcomingItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer group first:rounded-t-xl last:rounded-b-xl"
              >
                <div className={cn('h-2 w-2 rounded-full mt-2 flex-shrink-0', item.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
                {item.priority === 'high' && (
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-full">
                    Urgent
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
