import { useState, useEffect } from 'react';
import { Sunrise, MessageSquare, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ProgressTask {
  id: string;
  type: 'morning_pulse' | 'class_pulse';
  title: string;
  className?: string;
  points: number;
  timeRemaining?: string;
  completionPercentage: number;
  isComplete: boolean;
}

interface UnifiedProgressBarProps {
  onTaskClick?: (taskId: string, taskType: string) => void;
  refreshTrigger?: number;
}

export function UnifiedProgressBar({ onTaskClick, refreshTrigger }: UnifiedProgressBarProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ProgressTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, refreshTrigger]);

  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);
    const allTasks: ProgressTask[] = [];

    const hasMorningPulse = await checkMorningPulse();
    if (!hasMorningPulse) {
      allTasks.push({
        id: 'morning-pulse',
        type: 'morning_pulse',
        title: 'Morning Pulse Check',
        points: 10,
        completionPercentage: 0,
        isComplete: false,
      });
    }

    const classPulseTasks = await fetchClassPulseTasks();
    allTasks.push(...classPulseTasks);

    setTasks(allTasks);
    setLoading(false);
  };

  const checkMorningPulse = async (): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('pulse_checks')
      .select('id')
      .eq('user_id', user!.id)
      .eq('check_date', today)
      .maybeSingle();

    return !!data;
  };

  const fetchClassPulseTasks = async (): Promise<ProgressTask[]> => {
    const { data: userClasses } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('user_id', user!.id);

    if (!userClasses || userClasses.length === 0) return [];

    const classIds = userClasses.map((c: any) => c.class_id);
    const now = new Date().toISOString();

    const { data: activePulses } = await supabase
      .from('class_pulses')
      .select('*, classes(name)')
      .in('class_id', classIds)
      .eq('is_active', true)
      .gt('expires_at', now);

    if (!activePulses || activePulses.length === 0) return [];

    const tasks: ProgressTask[] = [];

    for (const pulse of activePulses) {
      const { data: response } = await supabase
        .from('class_pulse_responses')
        .select('id')
        .eq('user_id', user!.id)
        .eq('class_pulse_id', pulse.id)
        .maybeSingle();

      if (response) continue;

      const { data: progress } = await supabase
        .from('pulse_response_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('class_pulse_id', pulse.id)
        .maybeSingle();

      const completionPercentage = progress?.response_data?.text ? 50 : 0;

      tasks.push({
        id: pulse.id,
        type: 'class_pulse',
        title: pulse.question,
        className: pulse.classes?.name,
        points: 10,
        timeRemaining: getTimeRemaining(pulse.expires_at),
        completionPercentage,
        isComplete: false,
      });
    }

    return tasks;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m left`;
  };

  const getUrgencyColor = (timeRemaining?: string) => {
    if (!timeRemaining) return 'green';
    if (timeRemaining.includes('m left') && !timeRemaining.includes('h')) {
      const minutes = parseInt(timeRemaining);
      if (minutes < 30) return 'red';
      if (minutes < 120) return 'yellow';
    }
    return 'green';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-gray-200 shadow-md">
        <div className="animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:1000px_100%] h-8 rounded"></div>
      </div>
    );
  }

  const incompleteTasks = tasks.filter(t => !t.isComplete);
  const totalTasks = tasks.length;
  const completedTasks = tasks.length - incompleteTasks.length;

  if (incompleteTasks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-cyan-50 to-teal-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-cyan-300 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-600" />
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-cyan-800">All Done for Today!</h3>
            <p className="text-sm sm:text-base text-cyan-600">You've completed all your daily tasks</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-blue-300 shadow-lg space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Today's Tasks</h3>
        <div className="text-sm sm:text-base font-semibold text-blue-600 bg-blue-100 px-3 py-1.5 rounded-full">
          {completedTasks}/{totalTasks}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {incompleteTasks.map((task) => {
          const urgencyColor = getUrgencyColor(task.timeRemaining);
          const borderColor =
            urgencyColor === 'red' ? 'border-red-400' :
            urgencyColor === 'yellow' ? 'border-orange-400' :
            'border-blue-400';

          const bgColor =
            urgencyColor === 'red' ? 'from-red-50 to-red-100' :
            urgencyColor === 'yellow' ? 'from-orange-50 to-yellow-50' :
            'from-blue-50 to-cyan-50';

          const glowClass = task.completionPercentage === 0 ? 'shadow-lg animate-pulse-subtle' : 'shadow-md';

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick && onTaskClick(task.id, task.type)}
              className={`bg-gradient-to-br ${bgColor} rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 ${borderColor} ${glowClass} cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${
                  task.type === 'morning_pulse'
                    ? 'from-sky-400 to-blue-500'
                    : 'from-blue-500 to-cyan-600'
                } rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 relative`}>
                  {task.type === 'morning_pulse' ? (
                    <Sunrise className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  ) : (
                    <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  )}
                  {task.completionPercentage > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md">
                      {task.completionPercentage}%
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-1.5 leading-tight">{task.title}</h4>
                  {task.className && (
                    <span className="inline-block px-2.5 py-1 bg-white/70 text-xs sm:text-sm font-semibold text-gray-700 rounded-full mb-2">
                      {task.className}
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center space-x-1.5 text-blue-600 font-bold bg-blue-100 px-2.5 py-1 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm sm:text-base">+{task.points} pts</span>
                    </div>
                    {task.timeRemaining && (
                      <div className={`flex items-center space-x-1.5 ${
                        urgencyColor === 'red' ? 'text-red-600 bg-red-100' :
                        urgencyColor === 'yellow' ? 'text-orange-600 bg-orange-100' :
                        'text-gray-600 bg-gray-100'
                      } font-bold px-2.5 py-1 rounded-lg`}>
                        <Clock className="w-4 h-4" />
                        <span className="text-sm sm:text-base">{task.timeRemaining}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {task.completionPercentage > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-500"
                      style={{ width: `${task.completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
