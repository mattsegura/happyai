import { BookOpen, Heart, Trophy, MessageSquare, Beaker, TrendingUp, Zap, Activity, Clock, ArrowRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

interface OverviewViewProps {
  onNavigate: (view: string) => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Mock events for specific days
  const eventDays = [5, 8, 12, 15, 19, 23, 28]; // Days with events
  const today = new Date().getDate();
  const isCurrentMonth =
    currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear();

  const quickStats = [
    {
      label: 'Current Streak',
      value: '7',
      unit: 'days',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      iconBg: 'bg-gradient-to-br from-orange-500 to-red-500'
    },
    {
      label: 'Points Today',
      value: '45',
      unit: 'pts',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-500'
    },
    {
      label: 'Class Rank',
      value: '#12',
      unit: '',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500'
    },
    {
      label: 'Current Level',
      value: '9',
      unit: '',
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
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
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={cn('p-2.5 md:p-3 rounded-xl shadow-md flex-shrink-0', action.iconBg)}>
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">{action.label}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-1">{action.description}</p>
                      <p className={cn('text-xs font-semibold', action.statColor)}>{action.stats}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100 flex-shrink-0 self-center" />
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

        {/* Calendar - Takes 1 column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h3 className="text-lg md:text-xl font-semibold text-foreground">Calendar</h3>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-foreground">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={previousMonth}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const hasEvent = eventDays.includes(day);
                  const isToday = isCurrentMonth && day === today;

                  return (
                    <div
                      key={day}
                      className={cn(
                        'aspect-square flex flex-col items-center justify-center rounded-md text-sm cursor-pointer transition-colors relative',
                        isToday
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'hover:bg-muted/50',
                        !isToday && 'text-foreground'
                      )}
                    >
                      <span className="relative z-10">{day}</span>
                      {hasEvent && !isToday && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                      )}
                      {hasEvent && isToday && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Events</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-md bg-primary" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
