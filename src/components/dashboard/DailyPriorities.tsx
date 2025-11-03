import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sunrise, MessageSquare, Video, Heart, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

// TODO: Fetch from Supabase
const mockClassMembers: any[] = [];
const mockPulseCheckSets: any[] = [];
const mockOfficeHours: any[] = [];
const mockAssignmentsWithStatus: any[] = [];

interface Priority {
  id: string;
  type: 'morning_pulse' | 'class_pulse' | 'assignment' | 'meeting' | 'hapi_moment';
  title: string;
  description: string;
  points?: number;
  urgent?: boolean;
  completed?: boolean;
  icon: any;
  color: string;
  data?: any;
}

interface DailyPrioritiesProps {
  onMorningPulseClick: () => void;
  onClassPulseClick: () => void;
  onMeetingClick: (meetingData: any) => void;
  onHapiMomentClick: (data?: any) => void;
}

export function DailyPriorities({
  onMorningPulseClick,
  onClassPulseClick,
  onMeetingClick,
  onHapiMomentClick
}: DailyPrioritiesProps) {
  const { user } = useAuth();
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPriorities();
    }
  }, [user]);

  const loadPriorities = async () => {
    if (!user) return;

    setLoading(true);
    const priorityList: Priority[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Morning Pulse
    priorityList.push({
      id: 'morning-pulse',
      type: 'morning_pulse',
      title: 'Morning Pulse Check',
      description: 'How are you feeling today?',
      points: 15,
      icon: Sunrise,
      color: 'text-amber-600 dark:text-amber-400',
      completed: false,
    });

    // Class Pulses
    const classMemberships = mockClassMembers.filter(m => m.user_id === user.id);
    if (classMemberships.length > 0) {
      const classIds = classMemberships.map(m => m.class_id);
      const pulseSets = mockPulseCheckSets.filter(p =>
        classIds.includes(p.class_id) &&
        p.is_active &&
        !p.is_draft &&
        new Date(p.expires_at) > new Date()
      );

      if (pulseSets.length > 0) {
        const nextPulse = pulseSets[0];
        const classData = (nextPulse as any).classes || { name: 'Class' };
        priorityList.push({
          id: 'class-pulse',
          type: 'class_pulse',
          title: `${classData?.name || 'Class'} Pulse`,
          description: nextPulse.title,
          points: nextPulse.point_value || 20,
          icon: MessageSquare,
          color: 'text-blue-600 dark:text-blue-400',
          data: pulseSets,
          completed: false,
        });
      }
    }

    // Urgent Assignments (due within 48 hours)
    const urgentAssignments = mockAssignmentsWithStatus
      .filter(a => {
        const dueDate = new Date(a.due_at);
        const now = new Date();
        const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilDue > 0 && hoursUntilDue <= 48 && a.status !== 'completed';
      })
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
      .slice(0, 3);

    urgentAssignments.forEach(assignment => {
      const dueDate = new Date(assignment.due_at);
      const now = new Date();
      const hoursUntilDue = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      priorityList.push({
        id: `assignment-${assignment.id}`,
        type: 'assignment',
        title: assignment.name,
        description: `Due in ${hoursUntilDue} hours • ${assignment.course_name}`,
        urgent: hoursUntilDue <= 6,
        icon: assignment.status === 'late' ? AlertTriangle : Clock,
        color: assignment.status === 'late' 
          ? 'text-red-600 dark:text-red-400' 
          : hoursUntilDue <= 6
          ? 'text-orange-600 dark:text-orange-400'
          : 'text-blue-600 dark:text-blue-400',
        data: assignment,
        completed: false,
      });
    });

    // Office Hours Today
    const officeHoursToday = mockOfficeHours.filter(oh => oh.date === today && oh.is_active);
    if (officeHoursToday.length > 0) {
      const nextMeeting = officeHoursToday[0];
      const startHour = parseInt(nextMeeting.start_time.substring(0, 2));
      const endHour = parseInt(nextMeeting.end_time.substring(0, 2));
      const startFormatted = startHour > 12 ? `${startHour - 12}pm` : `${startHour}am`;
      const endFormatted = endHour > 12 ? `${endHour - 12}pm` : `${endHour}am`;
      
      priorityList.push({
        id: 'meeting',
        type: 'meeting',
        title: 'Office Hours',
        description: `${nextMeeting.class_name || 'Available'} • ${startFormatted}-${endFormatted}`,
        icon: Video,
        color: 'text-emerald-600 dark:text-emerald-400',
        data: nextMeeting,
        completed: false,
      });
    }

    // Hapi Moment Referrals (query from database if needed)
    const unreadReferrals: any[] = [];

    if (unreadReferrals.length > 0) {
      const referral = unreadReferrals[0];
      priorityList.push({
        id: 'hapi-referral',
        type: 'hapi_moment',
        title: 'Hapi Moment',
        description: 'A classmate sent you appreciation!',
        points: referral.points_awarded || 5,
        icon: Heart,
        color: 'text-rose-600 dark:text-rose-400',
        data: referral,
        completed: false,
      });
    }

    setPriorities(priorityList);
    setLoading(false);
  };

  const handlePriorityClick = (priority: Priority) => {
    switch (priority.type) {
      case 'morning_pulse':
        onMorningPulseClick();
        break;
      case 'class_pulse':
        onClassPulseClick();
        break;
      case 'meeting':
        onMeetingClick(priority.data);
        break;
      case 'hapi_moment':
        onHapiMomentClick(priority.data);
        break;
      case 'assignment':
        // Could navigate to academics or open assignment detail
        break;
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">Today's Priorities</h2>
          <p className="text-sm text-muted-foreground">Loading your tasks...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (priorities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">Today's Priorities</h2>
          <p className="text-sm text-muted-foreground">You're all caught up!</p>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="mb-3 h-16 w-16 text-green-500" />
          <p className="text-center text-sm text-muted-foreground">
            No urgent tasks right now. Great job staying on top of things!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Today's Priorities</h2>
          <p className="text-sm text-muted-foreground">
            {priorities.length} {priorities.length === 1 ? 'task' : 'tasks'} to complete
          </p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {priorities.filter(p => p.points).reduce((sum, p) => sum + (p.points || 0), 0)} pts available
        </div>
      </div>

      <div className="space-y-2">
        {priorities.map((priority) => {
          const Icon = priority.icon;
          return (
            <button
              key={priority.id}
              onClick={() => handlePriorityClick(priority)}
              className={`group w-full rounded-lg border-2 p-4 text-left transition-all hover:border-primary hover:shadow-md ${
                priority.urgent
                  ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20'
                  : 'border-border bg-card hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg bg-muted p-2 ${priority.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary">
                        {priority.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{priority.description}</p>
                    </div>
                    {priority.points && (
                      <div className="ml-2 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        +{priority.points} pts
                      </div>
                    )}
                  </div>
                  {priority.urgent && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
                      <AlertTriangle className="h-3 w-3" />
                      Urgent
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
