import { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  TrendingUp,
  BookOpen,
  FileText,
  ChevronRight,
  Star,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function AcademicsHub() {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  // Mock data
  const courses = [
    { id: '1', name: 'Biology 101', grade: 'A-', percent: 92, trend: 'up', nextClass: 'Tomorrow 9AM', color: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    { id: '2', name: 'Calculus II', grade: 'B+', percent: 87, trend: 'stable', nextClass: 'Today 2PM', color: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { id: '3', name: 'History 201', grade: 'A', percent: 95, trend: 'up', nextClass: 'Wed 11AM', color: 'bg-gradient-to-br from-purple-500 to-pink-600' },
    { id: '4', name: 'Chemistry', grade: 'B', percent: 84, trend: 'down', nextClass: 'Fri 1PM', color: 'bg-gradient-to-br from-orange-500 to-red-600' },
  ];

  const assignments = [
    { id: '1', title: 'Biology Lab Report', course: 'Biology 101', due: 'Tomorrow', daysLeft: 1, status: 'in-progress', priority: 'high', points: 100, completed: 60 },
    { id: '2', title: 'Calc Problem Set #5', course: 'Calculus II', due: 'Friday', daysLeft: 3, status: 'not-started', priority: 'medium', points: 50, completed: 0 },
    { id: '3', title: 'History Essay', course: 'History 201', due: 'Next Week', daysLeft: 7, status: 'not-started', priority: 'high', points: 150, completed: 0 },
    { id: '4', title: 'Chem Quiz Ch.4', course: 'Chemistry', due: '3 days', daysLeft: 3, status: 'in-progress', priority: 'low', points: 25, completed: 30 },
  ];

  return (
    <div className="h-full flex flex-col gap-3 max-h-[calc(100vh-120px)]">
      {/* Top Stats Bar - Super Compact */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg p-2.5 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">3.8</span>
          </div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mt-0.5">Current GPA</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg p-2.5 border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center justify-between">
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-lg font-bold text-purple-900 dark:text-purple-100">4</span>
          </div>
          <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mt-0.5">Due Soon</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg p-2.5 border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-lg font-bold text-green-900 dark:text-green-100">92%</span>
          </div>
          <p className="text-xs font-medium text-green-700 dark:text-green-300 mt-0.5">Avg Grade</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg p-2.5 border border-orange-200/50 dark:border-orange-800/50">
          <div className="flex items-center justify-between">
            <Star className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-lg font-bold text-orange-900 dark:text-orange-100">7</span>
          </div>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mt-0.5">Streak Days</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
        {/* Left Column - Courses */}
        <div className="flex flex-col bg-card rounded-xl border border-border p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">My Courses</h3>
            <span className="text-xs text-muted-foreground">Fall 2024</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group relative rounded-lg border border-border/60 bg-background/50 p-3 hover:bg-muted/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm', course.color)}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground truncate">{course.name}</h4>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-foreground">{course.grade}</span>
                        {course.trend === 'up' && <ArrowUp className="h-3 w-3 text-green-500" />}
                        {course.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{course.percent}%</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.nextClass}
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                        style={{ width: `${course.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column - Assignments */}
        <div className="flex flex-col bg-card rounded-xl border border-border p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Assignments</h3>
            <button className="text-xs text-primary hover:text-primary/80 font-medium">View All</button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => setSelectedAssignment(assignment.id)}
                className={cn(
                  'group rounded-lg border p-3 transition-all cursor-pointer',
                  selectedAssignment === assignment.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border/60 bg-background/50 hover:bg-muted/30'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    {assignment.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />}
                    {assignment.status === 'in-progress' && <Circle className="h-4 w-4 text-blue-500 mt-0.5" />}
                    {assignment.status === 'not-started' && <Circle className="h-4 w-4 text-muted-foreground/40 mt-0.5" />}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground line-clamp-1">{assignment.title}</h4>
                      <p className="text-xs text-muted-foreground">{assignment.course}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs font-semibold px-1.5 py-0.5 rounded',
                    assignment.priority === 'high' && 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
                    assignment.priority === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
                    assignment.priority === 'low' && 'bg-gray-100 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400'
                  )}>
                    {assignment.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {assignment.due}
                    </span>
                    <span>{assignment.points} pts</span>
                  </div>
                  {assignment.completed > 0 && (
                    <span className="text-primary font-medium">{assignment.completed}% done</span>
                  )}
                </div>

                {/* Progress bar for in-progress items */}
                {assignment.status === 'in-progress' && (
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                      style={{ width: `${assignment.completed}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Quick Actions & Insights */}
        <div className="flex flex-col gap-3">
          {/* Study Tools */}
          <div className="bg-card rounded-xl border border-border p-3">
            <h3 className="text-sm font-semibold text-foreground mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/20 dark:to-violet-900/20 border border-violet-200/50 dark:border-violet-800/50 hover:scale-[1.02] transition-transform">
                <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Study Plan</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 hover:scale-[1.02] transition-transform">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI Tutor</span>
              </button>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="flex-1 bg-card rounded-xl border border-border p-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">This Week</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Completed</span>
                </div>
                <span className="text-sm font-bold text-green-900 dark:text-green-100">8 tasks</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200/50 dark:border-yellow-800/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">In Progress</span>
                </div>
                <span className="text-sm font-bold text-yellow-900 dark:text-yellow-100">3 tasks</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Study Hours</span>
                </div>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">24.5 hrs</span>
              </div>
            </div>

            {/* Motivational message */}
            <div className="mt-3 p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <p className="text-xs text-foreground/80 font-medium">
                💪 You're on track! Keep up the great work this week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}