import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockClassMembers, mockPulseCheckSets, mockOfficeHours, mockHapiMomentReferrals, mockClasses, MOCK_USER_ID } from '../../lib/mockData';
import { Sunrise, MessageSquare, Video, Heart, Sparkles, Clock, ChevronRight } from 'lucide-react';

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

    await new Promise(resolve => setTimeout(resolve, 500));

    const today = new Date().toISOString().split('T')[0];

    taskList.push({
      id: 'morning-pulse',
      type: 'morning_pulse',
      title: 'Morning Pulse Check',
      description: 'How are you feeling today?',
      points: 15,
      icon: Sunrise,
      accentColor: 'text-amber-600',
    });

    const classMemberships = mockClassMembers.filter(m => m.user_id === user.id);

    if (classMemberships && classMemberships.length > 0) {
      const classIds = classMemberships.map(m => m.class_id);

      const pulseSets = mockPulseCheckSets.filter(p =>
        classIds.includes(p.class_id) &&
        p.is_active &&
        !p.is_draft &&
        new Date(p.expires_at) > new Date()
      );

      if (pulseSets.length > 0) {
        const nextPulse = pulseSets[0];
        const classData = mockClasses.find(c => c.id === nextPulse.class_id);
        const className = classData?.name || 'Class';
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

      const officeHoursToday = mockOfficeHours.filter(oh => oh.date === today && oh.is_active);

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

    const unreadReferrals = mockHapiMomentReferrals.filter(r =>
      r.referred_user_id === user.id && !r.is_read
    );

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
    setLoading(false);
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Today’s Focus</h2>
          <div className="flex items-center gap-1 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">All caught up</h3>
        <p className="mt-1 text-sm text-slate-500">You’ve completed every pulse, check-in, and task for today.</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Today’s focus</h2>
          <p className="text-xs text-slate-500">Quick wins to keep you moving.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
          {tasks.length} pending
        </span>
      </header>

      <ul className="mt-4 space-y-3">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <li key={task.id}>
              <button
                onClick={() => handleTaskClick(task)}
                className="flex w-full items-center justify-between rounded-xl border border-transparent bg-slate-50 px-4 py-3 text-left transition hover:border-primary-200 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white ${task.accentColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
                    <p className="text-xs text-slate-500">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary-600">
                  {task.points > 0 ? `+${task.points} pts` : 'View'}
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
