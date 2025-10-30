import { BookOpen, Heart, Trophy, MessageSquare, Beaker, TrendingUp, Zap, Activity, Clock, ArrowRight, Calendar, ChevronLeft, ChevronRight, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

interface OverviewViewProps {
  onNavigate: (view: string) => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day; // Get Sunday of current week
    return new Date(today.setDate(diff));
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Weekly calendar logic
  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);

  const previousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const nextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // Mock events for specific dates
  const events = {
    [new Date().toDateString()]: [{ title: 'Morning Pulse', time: '9:00 AM', color: 'bg-rose-500' }],
    [new Date(new Date().setDate(new Date().getDate() + 1)).toDateString()]: [
      { title: 'Bio Lab', time: '2:00 PM', color: 'bg-blue-500' },
    ],
    [new Date(new Date().setDate(new Date().getDate() + 3)).toDateString()]: [
      { title: 'Math Quiz', time: '10:00 AM', color: 'bg-yellow-500' },
    ],
  };

  const today = new Date().toDateString();

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
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      description: 'View grades & assignments',
      stats: '3 due this week',
      statColor: 'text-blue-600 dark:text-blue-400',
      preview: {
        type: 'assignments',
        items: [
          { title: 'Biology Lab Report', due: 'Tomorrow', status: 'pending' },
          { title: 'Math Problem Set', due: 'Friday', status: 'in-progress' },
          { title: 'History Essay', due: 'Next Week', status: 'not-started' },
        ]
      }
    },
    {
      id: 'wellbeing',
      label: 'Wellbeing',
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
      description: 'Track your mood',
      stats: "Complete today's pulse",
      statColor: 'text-rose-600 dark:text-rose-400',
      preview: {
        type: 'mood-tracker',
        sentiment: 5, // Current mood level
        streak: 7,
        message: 'Coming soon: Consolidated mood tracking and sentiment analytics'
      }
    },
    {
      id: 'hapi',
      label: 'Hapi AI',
      icon: MessageSquare,
      color: 'from-purple-500 to-indigo-600',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
      description: 'Chat with your AI assistant',
      stats: 'Ask me anything',
      statColor: 'text-purple-600 dark:text-purple-400',
      preview: {
        type: 'suggestions',
        items: [
          'Help with math homework?',
          'Explain photosynthesis',
          'Study tips for finals',
        ]
      }
    },
    {
      id: 'lab',
      label: 'Hapi Lab',
      icon: Beaker,
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      description: 'Pulses & Hapi Moments',
      stats: '2 new moments',
      statColor: 'text-emerald-600 dark:text-emerald-400',
      preview: {
        type: 'moments',
        items: [
          { from: 'Sarah', message: 'Thanks for helping me!', time: '2h' },
          { from: 'Mike', message: 'Great presentation!', time: '5h' },
        ]
      }
    },
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Welcome Section */}
      <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-4 md:p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
              Welcome back! 👋
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Here's what's happening with your academics and wellbeing today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/40">
            <Calendar className="h-3.5 w-3.5" />
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
                'rounded-xl border border-border/60 backdrop-blur-sm p-3 md:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]',
                stat.bgColor
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn('p-2 rounded-xl shadow-sm', stat.iconBg)}>
                  <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
                {stat.unit && <span className="text-xs text-muted-foreground font-medium">{stat.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions - Takes 2 columns */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg md:text-xl font-semibold text-foreground">Quick Actions</h3>
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs md:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 flex-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onNavigate(action.id)}
                  className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] text-left h-full flex flex-col"
                >
                  {/* Header */}
                  <div className="p-4 md:p-5 pb-3 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 md:gap-4 mb-3">
                      <div className={cn('p-2.5 md:p-3 rounded-xl shadow-md flex-shrink-0', action.iconBg)}>
                        <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-semibold text-foreground mb-0.5">{action.label}</h4>
                        <p className={cn('text-xs font-medium', action.statColor)}>{action.stats}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>

                    {/* Preview Content */}
                    <div className="mt-auto pt-2">
                      {action.preview.type === 'assignments' && (
                        <div className="space-y-2 min-h-[80px]">
                          {action.preview.items.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              {item.status === 'in-progress' ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                              )}
                              <span className="flex-1 text-foreground/80 truncate">{item.title}</span>
                              <span className="text-muted-foreground text-[10px]">{item.due}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {action.preview.type === 'mood-tracker' && (
                        <div className="space-y-3 min-h-[80px]">
                          {/* Mood indicator */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                              <div>
                                <p className="text-xs font-semibold text-foreground">Current Mood</p>
                                <p className="text-[10px] text-muted-foreground">Level {action.preview.sentiment}/6</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5, 6].map((level) => (
                                <div
                                  key={level}
                                  className={cn(
                                    'w-1.5 h-6 rounded-full transition-all',
                                    level <= action.preview.sentiment
                                      ? 'bg-gradient-to-t from-rose-500 to-pink-500'
                                      : 'bg-muted-foreground/20'
                                  )}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Coming soon message */}
                          <div className="text-[11px] text-muted-foreground/80 italic leading-relaxed">
                            {action.preview.message}
                          </div>
                        </div>
                      )}

                      {action.preview.type === 'suggestions' && (
                        <div className="space-y-1.5 min-h-[80px]">
                          {action.preview.items.slice(0, 2).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-foreground/70 group-hover:text-foreground/90 transition-colors">
                              <Sparkles className="h-3 w-3 text-purple-500 flex-shrink-0" />
                              <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {action.preview.type === 'moments' && (
                        <div className="space-y-2 min-h-[80px]">
                          {action.preview.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0">
                                {item.from[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-foreground/80 truncate">{item.message}</p>
                                <p className="text-[10px] text-muted-foreground">{item.from} • {item.time} ago</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover gradient overlay */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none',
                    action.color
                  )} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Calendar - Takes 1 column */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h3 className="text-lg md:text-xl font-semibold text-foreground">This Week</h3>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm p-3.5 flex-1 flex flex-col">
            {/* Week Navigation Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">
                {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={previousWeek}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={nextWeek}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                  aria-label="Next week"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Balanced Weekly View */}
            <div className="flex flex-col gap-1.5 flex-1">
              {weekDays.map((day, idx) => {
                const dateString = day.toDateString();
                const isToday = dateString === today;
                const dayEvents = events[dateString] || [];

                return (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-lg p-2 transition-colors border',
                      isToday
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-background/50 border-border/40 hover:bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex flex-col items-center justify-center w-8 h-8 rounded-md flex-shrink-0',
                          isToday
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-foreground'
                        )}
                      >
                        <span className="text-[9px] font-medium uppercase">
                          {day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
                        </span>
                        <span className="text-xs font-bold">{day.getDate()}</span>
                      </div>

                      {/* Events inline */}
                      <div className="flex-1 min-w-0">
                        {dayEvents.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <div className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dayEvents[0].color)} />
                            <span className="text-[11px] text-foreground/80 font-medium truncate">
                              {dayEvents[0].title}
                            </span>
                            {dayEvents.length > 1 && (
                              <span className="text-[9px] text-muted-foreground">
                                +{dayEvents.length - 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/50 italic">No events</p>
                        )}
                      </div>

                      {/* Time - only for events */}
                      {dayEvents.length > 0 && (
                        <span className="text-[9px] text-muted-foreground flex-shrink-0">
                          {dayEvents[0].time}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
