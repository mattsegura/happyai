import { BookOpen, Heart, MessageSquare, Activity, Calendar, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, GraduationCap, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designSystem } from '../../lib/design-system';
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
      label: 'Current GPA',
      value: '3.72',
      unit: '',
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    },
    {
      label: 'Enrolled Classes',
      value: '5',
      unit: 'classes',
      icon: BookOpen,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600'
    },
    {
      label: 'Upcoming',
      value: '3',
      unit: 'assignments',
      icon: Calendar,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600'
    },
    {
      label: 'This Week',
      value: '2',
      unit: 'exams',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className={cn('rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 p-4 md:p-5 shadow-sm', designSystem.transition.default)}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className={cn(designSystem.typography.pageTitle, 'mb-1')}>
              Welcome back! 👋
            </h2>
            <p className={designSystem.typography.caption}>
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
        {/* Notifications Section - Takes 2 columns */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className={designSystem.typography.sectionTitle}>Notifications</h3>
            </div>
            <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full font-semibold">
              5 new
            </span>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm p-4 space-y-3">
            {/* Morning Check-in Reminder */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-rose-200/50 bg-rose-50/50 dark:border-rose-800/50 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Morning Check-in Reminder</p>
                <p className="text-xs text-muted-foreground mt-1">Don't forget to complete your daily mood check-in!</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">Just now</p>
              </div>
            </div>

            {/* Assignment Graded */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-green-200/50 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/20 hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Biology Lab Report Graded</p>
                <p className="text-xs text-muted-foreground mt-1">You received an A (95%) on your lab report.</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">2 hours ago</p>
              </div>
            </div>

            {/* New Assignment Posted */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-blue-200/50 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">New Assignment: Chapter 5 Reading</p>
                <p className="text-xs text-muted-foreground mt-1">Due Friday, 11:59 PM • History 101</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">5 hours ago</p>
              </div>
            </div>

            {/* Teacher Message */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-purple-200/50 bg-purple-50/50 dark:border-purple-800/50 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Message from Prof. Johnson</p>
                <p className="text-xs text-muted-foreground mt-1">Office hours moved to Thursday 3-5 PM this week.</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">Yesterday</p>
              </div>
            </div>

            {/* Study Plan Reminder */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Study Plan Reminder</p>
                <p className="text-xs text-muted-foreground mt-1">Remember, you're supposed to allocate 45 minutes for Calculus review today.</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">Today at 2:00 PM</p>
              </div>
            </div>
          </div>

          {/* Mood Tracker - Last 30 Days */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className={designSystem.typography.sectionTitle}>Mood Tracker</h3>
              </div>
              <span className="text-xs text-muted-foreground">Last 30 days</span>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm p-4">
              {/* Simplified mood visualization */}
              <div className="space-y-3">
                {/* Average mood this month */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Average Mood</p>
                    <p className="text-lg font-bold text-foreground mt-0.5">Good</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <span className="text-lg">😊</span>
                    </div>
                  </div>
                </div>

                {/* Mood trend bars - simple horizontal bars */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-16 text-muted-foreground">Happy</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">75%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-16 text-muted-foreground">Neutral</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">15%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-16 text-muted-foreground">Stressed</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">10%</span>
                  </div>
                </div>

                {/* Quick insight */}
                <div className="pt-2 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-primary font-semibold">Trend:</span> Your mood has been consistently positive this month! Keep it up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Calendar - Takes 1 column */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <h3 className={designSystem.typography.sectionTitle}>This Week</h3>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className={cn(
                'text-xs text-primary hover:text-primary/80 font-medium',
                designSystem.transition.default
              )}
            >
              View Full
            </button>
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
