import { BookOpen, Heart, Trophy, MessageSquare, Beaker, Users, TrendingUp, Calendar, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OverviewViewProps {
  onNavigate: (view: string) => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  const quickStats = [
    { label: 'Streak', value: '7 days', icon: Zap, color: 'from-orange-500 to-red-500' },
    { label: 'Points Today', value: '45', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { label: 'Rank', value: '#12', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Level', value: '9', icon: Trophy, color: 'from-purple-500 to-pink-500' },
  ];

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
      description: 'Achievements',
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

  const upcomingTasks = [
    { title: 'Complete Morning Pulse', time: 'Today', priority: 'high' },
    { title: 'Biology Assignment Due', time: 'Tomorrow', priority: 'medium' },
    { title: 'Math Quiz', time: 'Friday', priority: 'medium' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-h-[calc(100vh-12rem)] overflow-hidden">
      {/* Left Column - Stats & Tasks */}
      <div className="space-y-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg bg-gradient-to-br', stat.color)}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Tasks */}
        <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Upcoming</h3>
          </div>
          <div className="space-y-2">
            {upcomingTasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      task.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    )}
                  />
                  <p className="text-xs font-medium text-foreground">{task.title}</p>
                </div>
                <span className="text-xs text-muted-foreground">{task.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle & Right Columns - Quick Actions */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={cn(
                      'p-4 rounded-2xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform',
                      action.color
                    )}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{action.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                  </div>
                </div>

                {/* Hover effect */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity',
                  action.color
                )} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
