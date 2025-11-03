import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Sunrise, MessageSquare, Video, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState, EmptyStateIcons } from '../ui/EmptyState';

interface Task {
  id: string;
  type: 'morning_pulse' | 'class_pulse' | 'meeting' | 'hapi_moment';
  title: string;
  description: string;
  points: number;
  icon: any;
  accentColor: string;
  data?: any;
}

interface TodaysTasksProps {
  onMorningPulseClick: () => void;
  onClassPulseClick: () => void;
  onMeetingClick: (meetingData: any) => void;
  onHapiMomentClick: (data?: any) => void;
}

export function TodaysTasks({
  onMorningPulseClick,
  onClassPulseClick,
  onMeetingClick,
  onHapiMomentClick
}: TodaysTasksProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    setLoading(true);
    const taskList: Task[] = [];

    try {
      // Always show morning pulse
      taskList.push({
        id: 'morning-pulse',
        type: 'morning_pulse',
        title: 'Morning Pulse Check',
        description: 'How are you feeling today?',
        points: 15,
        icon: Sunrise,
        accentColor: 'text-amber-600',
      });

      // Get user's class memberships
      const { data: classMemberships, error: memberError } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('user_id', user.id);

      if (!memberError && classMemberships && classMemberships.length > 0) {
        const classIds = classMemberships.map(m => m.class_id);

        // Get active class pulses
        const { data: pulseSets, error: pulseError } = await supabase
          .from('pulse_check_sets')
          .select(`
            *,
            classes!inner(name)
          `)
          .in('class_id', classIds)
          .eq('is_active', true)
          .eq('is_draft', false)
          .gt('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: true })
          .limit(1);

        if (!pulseError && pulseSets && pulseSets.length > 0) {
          const nextPulse = pulseSets[0];
          const className = (nextPulse.classes as any)?.name || 'Class';
          const abbreviatedTitle = `Class Pulse (${nextPulse.point_value || 20}pt)`;
          const abbreviatedDesc = `${className}`;

        taskList.push({
          id: 'class-pulse',
          type: 'class_pulse',
          title: abbreviatedTitle,
          description: abbreviatedDesc,
          points: nextPulse.point_value || 20,
          icon: MessageSquare,
          accentColor: 'text-primary-600',
          data: pulseSets,
        });
      }

      // TODO: Get office hours from database
      const officeHoursToday: any[] = [];

      if (officeHoursToday.length > 0) {
        const relevantOfficeHours = officeHoursToday.filter(oh =>
          oh.class_id === null || classIds.includes(oh.class_id)
        );

        if (relevantOfficeHours.length > 0) {
          const nextMeeting = relevantOfficeHours[0];
          const className = nextMeeting.class_name || 'Office Hours';
          const startHour = parseInt(nextMeeting.start_time.substring(0, 2));
          const endHour = parseInt(nextMeeting.end_time.substring(0, 2));
          const startFormatted = startHour > 12 ? `${startHour - 12}pm` : `${startHour}am`;
          const endFormatted = endHour > 12 ? `${endHour - 12}pm` : `${endHour}am`;
          const timeRange = `${startFormatted}-${endFormatted}`;

          taskList.push({
            id: 'meeting',
            type: 'meeting',
            title: 'Office Hours',
            description: `${className} • ${timeRange}`,
            points: 0,
            icon: Video,
            accentColor: 'text-emerald-600',
            data: nextMeeting,
          });
        }
      }
    }

    // TODO: Get hapi moment referrals from database
    const unreadReferrals: any[] = [];

    if (unreadReferrals.length > 0) {
      const referral = unreadReferrals[0];

      taskList.push({
        id: 'hapi-referral',
        type: 'hapi_moment',
        title: 'Hapi Moment',
        description: 'A student referred you!',
        points: referral.points_awarded || 5,
        icon: Heart,
        accentColor: 'text-rose-600',
        data: referral,
      });
    }

      setTasks(taskList);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    switch (task.type) {
      case 'morning_pulse':
        onMorningPulseClick();
        break;
      case 'class_pulse':
        onClassPulseClick();
        break;
      case 'meeting':
        onMeetingClick(task.data);
        break;
      case 'hapi_moment':
        onHapiMomentClick(task.data);
        break;
    }
  };

  if (loading) {
    return (
      <Card padding="md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today's Focus</CardTitle>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-muted animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-muted animate-pulse delay-75" />
              <span className="h-2 w-2 rounded-full bg-muted animate-pulse delay-150" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card padding="md">
        <EmptyState
          icon={
            <div className="relative">
              {EmptyStateIcons.NoTasks}
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-primary-500 animate-pulse" />
              </div>
            </div>
          }
          title="All caught up!"
          description="You've completed every pulse, check-in, and task for today. Great job!"
        />
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden shadow-xl">
      <CardHeader className="p-5 sm:p-6 bg-gradient-to-br from-card to-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-black">Today's Focus</CardTitle>
            <p className="text-sm font-semibold text-muted-foreground mt-1">
              Quick wins to keep you moving
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 border border-primary-200 dark:border-primary-800 px-3 sm:px-4 py-1.5 text-xs font-black text-primary-700 dark:text-primary-300 shadow-md">
            {tasks.length} pending
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-5">
        <ul className="space-y-3">
          {tasks.map((task) => {
            const Icon = task.icon;
            return (
              <li key={task.id}>
                <button
                  onClick={() => handleTaskClick(task)}
                  className="group flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-all hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-card border border-border ${task.accentColor} group-hover:scale-105 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {task.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-3 transition-all">
                    {task.points > 0 ? `+${task.points} pts` : 'View'}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
