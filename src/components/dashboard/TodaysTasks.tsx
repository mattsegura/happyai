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
  color: string;
  bgGradient: string;
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
      color: 'text-orange-600',
      bgGradient: 'from-orange-50 to-pink-50',
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
          color: 'text-blue-600',
          bgGradient: 'from-blue-50 to-cyan-50',
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
            color: 'text-green-600',
            bgGradient: 'from-green-50 to-emerald-50',
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
        color: 'text-pink-600',
        bgGradient: 'from-pink-50 to-rose-50',
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
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-gray-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Today's Tasks</h2>
          <div className="animate-pulse flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-green-200 shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">All Done!</h3>
          <p className="text-gray-600">You've completed all your tasks for today.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Today's Tasks</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm sm:text-base font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            {tasks.length} pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <button
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className={`bg-gradient-to-br ${task.bgGradient} rounded-2xl p-5 sm:p-6 border border-gray-200/50 shadow-lg hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300 text-left group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${task.color}`} />
                  </div>
                  {task.points > 0 && (
                    <div className="flex items-center space-x-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1.5 rounded-xl shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                      <span className="text-xs font-extrabold text-gray-800">+{task.points}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1.5 line-clamp-1">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-1 font-semibold">
                  {task.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">View Details</span>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-700 group-hover:translate-x-2 transition-all duration-300" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
