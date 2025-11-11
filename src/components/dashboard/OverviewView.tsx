import { BookOpen, Activity, Calendar, ChevronRight, Sparkles, GraduationCap, Clock, CheckCircle2, AlertCircle, TrendingUp, Target, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designSystem } from '../../lib/design-system';
import { useState } from 'react';
import { NotificationsCard } from './NotificationsCard';
import { DailySentimentCheckIn } from './DailySentimentCheckIn';
import { AssignmentDetailModal } from '../student/AssignmentDetailModal';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Assignment } from '@/lib/types/assignment';

interface OverviewViewProps {
  onNavigate: (view: string) => void;
}

export function OverviewView({ onNavigate }: OverviewViewProps) {
  const navigate = useNavigate();
  const [showSentimentCheckIn, setShowSentimentCheckIn] = useState(() => {
    const lastCheckIn = localStorage.getItem('lastSentimentCheckIn');
    const today = new Date().toDateString();
    return lastCheckIn !== today;
  });
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const handleSentimentComplete = () => {
    localStorage.setItem('lastSentimentCheckIn', new Date().toDateString());
    setShowSentimentCheckIn(false);
  };

  const handleTaskClick = (task: any) => {
    // Extract color from gradient string (e.g., "from-amber-500 to-orange-600" -> "#f59e0b")
    const colorMap: Record<string, string> = {
      'amber': '#f59e0b',
      'red': '#ef4444',
      'rose': '#f43f5e',
      'purple': '#a855f7',
      'violet': '#8b5cf6',
      'green': '#10b981',
      'emerald': '#10b981',
      'pink': '#ec4899',
      'blue': '#3b82f6',
      'indigo': '#6366f1',
    };
    
    const colorName = task.color.split(' ')[1]?.replace('to-', '').split('-')[0] || 'blue';
    const courseColor = colorMap[colorName] || '#3b82f6';
    
    // Convert task to Assignment format
    const assignment: Assignment = {
      id: task.id,
      title: task.title,
      description: `${task.type.charAt(0).toUpperCase() + task.type.slice(1)} for ${task.course}`,
      courseName: task.course,
      courseColor,
      dueDate: new Date(Date.now() + (task.dueDate === 'Today' ? 0 : task.dueDate === 'Tomorrow' ? 86400000 : 7 * 86400000)).toISOString(),
      type: task.type as 'essay' | 'project' | 'assignment' | 'exam',
      status: task.status as 'not-started' | 'in-progress' | 'completed',
      progress: Math.floor(Math.random() * 100),
      files: [],
      checklist: [
        { id: '1', title: 'Review materials', completed: false, category: 'preparation' },
        { id: '2', title: 'Complete first draft', completed: false, category: 'writing' },
        { id: '3', title: 'Final review', completed: false, category: 'review' },
      ],
      chatHistory: [],
      parsedInstructions: {
        requirements: [
          'Complete all sections',
          'Follow submission guidelines',
          'Meet all requirements'
        ],
        rubric: [],
        sections: [],
        format: 'Standard'
      }
    };
    setSelectedAssignment(assignment);
    setShowAssignmentModal(true);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Get current week (Monday to Sunday)
  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  };

  const { monday, sunday } = getWeekDates();
  const weekRange = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Mock data for this week's tasks
  const weekTasks = [
    {
      id: '1',
      title: 'Math Quiz - Chapter 5',
      course: 'Calculus II',
      type: 'exam',
      dueDate: 'Today',
      dueTime: '2:00 PM',
      priority: 'urgent',
      color: 'from-amber-500 to-orange-600',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Biology Lab Report',
      course: 'Biology 101',
      type: 'assignment',
      dueDate: 'Today',
      dueTime: '11:59 PM',
      priority: 'high',
      color: 'from-red-500 to-rose-600',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Essay Draft',
      course: 'English Literature',
      type: 'assignment',
      dueDate: 'Tomorrow',
      dueTime: '11:59 PM',
      priority: 'medium',
      color: 'from-purple-500 to-violet-600',
      status: 'pending'
    },
    {
      id: '4',
      title: 'Chemistry Problem Set',
      course: 'Chemistry 102',
      type: 'assignment',
      dueDate: 'Wed, Dec 13',
      dueTime: '5:00 PM',
      priority: 'medium',
      color: 'from-green-500 to-emerald-600',
      status: 'pending'
    },
    {
      id: '5',
      title: 'History Presentation',
      course: 'World History',
      type: 'assignment',
      dueDate: 'Fri, Dec 15',
      dueTime: '10:00 AM',
      priority: 'medium',
      color: 'from-pink-500 to-rose-600',
      status: 'pending'
    },
    {
      id: '6',
      title: 'Physics Study Session',
      course: 'Physics 201',
      type: 'study',
      dueDate: 'Sat, Dec 16',
      dueTime: '2:00 PM',
      priority: 'low',
      color: 'from-blue-500 to-indigo-600',
      status: 'pending'
    },
  ];

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Good morning, Student! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{currentDate}</p>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Due This Week */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-lg p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Due This Week</h2>
                  <p className="text-xs text-muted-foreground">{weekRange}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {weekTasks.length} tasks
              </span>
            </div>

            <div className="space-y-3">
              {weekTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleTaskClick(task)}
                  className={cn(
                    'p-4 rounded-lg border transition-all cursor-pointer group',
                    task.priority === 'urgent'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:shadow-md'
                      : task.priority === 'high'
                      ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 hover:shadow-md'
                      : 'bg-background/50 border-border/40 hover:bg-muted/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn('p-2 rounded-lg bg-gradient-to-br', task.color)}>
                        {task.type === 'assignment' && <BookOpen className="h-4 w-4 text-white" />}
                        {task.type === 'exam' && <AlertCircle className="h-4 w-4 text-white" />}
                        {task.type === 'study' && <Sparkles className="h-4 w-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">{task.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{task.course}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">{task.dueDate} • {task.dueTime}</span>
                          {task.priority === 'urgent' && (
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                              URGENT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-background/50 transition-colors opacity-0 group-hover:opacity-100">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/dashboard/planner')}
              className="w-full mt-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors border-t border-border/40 pt-4"
            >
              View Full Calendar →
            </button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <button
              onClick={() => navigate('/dashboard/study-buddy/create')}
              className="group p-4 rounded-xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Create Study Plan</p>
                  <p className="text-xs text-muted-foreground">AI-powered planning</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate('/dashboard/assignments/create')}
              className="group p-4 rounded-xl border border-border/60 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 hover:from-emerald-500/10 hover:to-teal-500/10 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 group-hover:scale-110 transition-transform">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">New Assignment</p>
                  <p className="text-xs text-muted-foreground">Track your work</p>
                </div>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Right Column - Notifications & Stats */}
        <div className="space-y-4">
          {/* Compact Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="p-3 rounded-xl border border-border/60 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 mb-2" />
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground">Due Soon</p>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-2" />
              <p className="text-2xl font-bold text-foreground">3.72</p>
              <p className="text-xs text-muted-foreground">Current GPA</p>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
              <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-foreground">7</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </motion.div>

          {/* Notifications Card - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NotificationsCard />
          </motion.div>

          {/* Mood Tracker - Compact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Your Wellbeing</h3>
              </div>
              <span className="text-xs text-muted-foreground">This week</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Mood Trend</p>
                <p className="text-lg font-bold text-foreground mt-0.5">Improving</p>
              </div>
              <div className="text-2xl">😊</div>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs w-14 text-muted-foreground">Happy</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs w-14 text-muted-foreground">Stressed</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sentiment Check-in Modal */}
      {showSentimentCheckIn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <DailySentimentCheckIn 
              onComplete={handleSentimentComplete}
              onDismiss={() => setShowSentimentCheckIn(false)}
            />
          </div>
        </div>
      )}

      {/* Assignment Detail Modal */}
      <AssignmentDetailModal
        isOpen={showAssignmentModal}
        assignment={selectedAssignment}
        onClose={() => setShowAssignmentModal(false)}
      />
    </div>
  );
}
