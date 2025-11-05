import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Star,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Trophy,
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { AchievementsDisplay } from './AchievementsDisplay';
import { FeedbackHub } from './FeedbackHub';
import { MoodGradeAnalytics } from './MoodGradeAnalytics';
import { CanvasConnectionCard } from './CanvasConnectionCard';
import { CanvasSyncStatus } from './CanvasSyncStatus';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type TabType = 'overview' | 'feedback' | 'analytics' | 'achievements' | 'canvas';

type CourseCard = {
  id: string;
  name: string;
  grade: string;
  percent: number;
  trend: 'up' | 'down' | 'stable';
  nextClass: string;
  color: string;
};

type Assignment = {
  id: string;
  title: string;
  course: string;
  due: string;
  daysLeft: number;
  status: 'completed' | 'in-progress' | 'not-started';
  priority: 'high' | 'medium' | 'low';
  points: number;
  completed: number;
};

// Helper functions
function getCourseColor(courseId: string): string {
  const colors = [
    'bg-gradient-to-br from-green-500 to-emerald-600',
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-purple-500 to-pink-600',
    'bg-gradient-to-br from-orange-500 to-red-600',
  ];
  // Use courseId hash to consistently assign colors
  const index = Math.abs(courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  return colors[index];
}

function formatDueDate(dueAt: string): string {
  const date = new Date(dueAt);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `${diffDays} days`;
  return date.toLocaleDateString();
}

function calculateDaysLeft(dueAt: string): number {
  const date = new Date(dueAt);
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

type Submission = {
  assignment_id: string;
  workflow_state: string;
};

type AssignmentData = {
  due_at: string;
  points_possible: number;
};

function getAssignmentStatus(assignmentId: string, submissions: Submission[]): 'completed' | 'in-progress' | 'not-started' {
  const submission = submissions?.find((s) => s.assignment_id === assignmentId);
  if (!submission) return 'not-started';
  if (submission.workflow_state === 'graded') return 'completed';
  if (submission.workflow_state === 'submitted') return 'in-progress';
  return 'not-started';
}

function calculatePriority(assignment: AssignmentData): 'high' | 'medium' | 'low' {
  const daysLeft = calculateDaysLeft(assignment.due_at);
  const points = assignment.points_possible || 0;

  if (daysLeft <= 1 || points >= 100) return 'high';
  if (daysLeft <= 3 || points >= 50) return 'medium';
  return 'low';
}

function calculateCompletion(assignmentId: string, submissions: Submission[]): number {
  const submission = submissions?.find((s) => s.assignment_id === assignmentId);
  if (!submission) return 0;
  if (submission.workflow_state === 'graded') return 100;
  if (submission.workflow_state === 'submitted') return 75;
  return 0;
}

// Mock data function for development/testing
function getMockAcademicsData() {
  const mockCourses: CourseCard[] = [
    {
      id: '1',
      name: 'Introduction to Computer Science',
      grade: 'A',
      percent: 95,
      trend: 'up',
      nextClass: 'Mon 10:00 AM',
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    },
    {
      id: '2',
      name: 'Calculus II',
      grade: 'B+',
      percent: 87,
      trend: 'stable',
      nextClass: 'Tue 2:00 PM',
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    {
      id: '3',
      name: 'English Literature',
      grade: 'A-',
      percent: 91,
      trend: 'up',
      nextClass: 'Wed 11:00 AM',
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
    },
    {
      id: '4',
      name: 'Physics I',
      grade: 'B',
      percent: 82,
      trend: 'down',
      nextClass: 'Thu 1:00 PM',
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
    },
  ];

  const mockAssignments: Assignment[] = [
    {
      id: '1',
      title: 'Biology Lab Report',
      course: 'Biology 101',
      due: 'Tomorrow',
      daysLeft: 1,
      status: 'in-progress',
      priority: 'high',
      points: 100,
      completed: 60,
    },
    {
      id: '2',
      title: 'Calc Problem Set #5',
      course: 'Calculus II',
      due: 'Friday',
      daysLeft: 3,
      status: 'not-started',
      priority: 'medium',
      points: 50,
      completed: 0,
    },
    {
      id: '3',
      title: 'History Essay',
      course: 'History 201',
      due: 'Next Week',
      daysLeft: 7,
      status: 'not-started',
      priority: 'high',
      points: 150,
      completed: 0,
    },
    {
      id: '4',
      title: 'Chem Quiz Ch.4',
      course: 'Chemistry',
      due: '3 days',
      daysLeft: 3,
      status: 'in-progress',
      priority: 'low',
      points: 25,
      completed: 30,
    },
  ];

  return {
    courses: mockCourses,
    assignments: mockAssignments,
    studyStreak: 7,
  };
}

export function AcademicsHub() {
  const { user } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studyStreak, setStudyStreak] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    async function fetchAcademicData() {
      setLoading(true);
      setError(null);

      // Set a timeout to prevent infinite loading (30 seconds max)
      timeoutId = setTimeout(() => {
        if (!isCancelled) {
          console.warn('⏱️ Academic data fetch timed out after 30 seconds');
          setError('Loading timed out. Please refresh the page.');
          setLoading(false);
        }
      }, 30000);

      try {
        // Check if we should use mock data
        const useMockData = import.meta.env.VITE_USE_ACADEMICS_MOCK === 'true';

        if (useMockData) {
          // Use mock data for development/testing
          console.log('📚 Using mock academics data (VITE_USE_ACADEMICS_MOCK=true)');
          const mockData = getMockAcademicsData();
          setCourses(mockData.courses);
          setAssignments(mockData.assignments);
          setStudyStreak(mockData.studyStreak);
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        // Fetch real data from Supabase
        console.log('📊 Fetching real academics data from Supabase');

        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        // Fetch courses with timeout protection
        const coursesPromise = supabase
          .from('canvas_courses')
          .select('*')
          .eq('user_id', user.id)
          .order('name')
          .limit(50); // Add limit to prevent huge queries

        const { data: coursesData, error: coursesError } = await coursesPromise;

        if (coursesError) throw coursesError;

        // Fetch assignments (upcoming only) with timeout protection
        const assignmentsPromise = supabase
          .from('canvas_assignments')
          .select(`
            *,
            course:canvas_courses!inner(
              name,
              canvas_course_code
            )
          `)
          .eq('canvas_assignments.user_id', user.id)
          .gte('due_at', new Date().toISOString())
          .order('due_at', { ascending: true })
          .limit(10);

        const { data: assignmentsData, error: assignmentsError } = await assignmentsPromise;

        if (assignmentsError) {
          console.warn('Assignments fetch error:', assignmentsError);
          // Don't throw - continue with empty assignments
        }

        // Fetch submissions for grades (non-blocking)
        const submissionsPromise = supabase
          .from('canvas_submissions')
          .select('*')
          .eq('user_id', user.id)
          .limit(100);

        const { data: submissionsData } = await submissionsPromise;

        // Fetch study streak (non-blocking)
        const streakPromise = supabase
          .from('study_streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .single();

        const { data: streakData } = await streakPromise;

        setStudyStreak(streakData?.current_streak || 0);

        // Transform data to match component expectations
        const transformedCourses: CourseCard[] = coursesData?.map((course) => ({
          id: course.id,
          name: course.name,
          grade: course.current_grade || 'N/A',
          percent: course.current_score || 0,
          trend: (course.current_score || 0) >= 90 ? 'up' : (course.current_score || 0) >= 80 ? 'stable' : 'down',
          nextClass: 'Check calendar',
          color: getCourseColor(course.id)
        })) || [];

        const transformedAssignments: Assignment[] = assignmentsData?.map((assignment) => ({
          id: assignment.id,
          title: assignment.name,
          course: assignment.course?.name || 'Unknown',
          due: formatDueDate(assignment.due_at),
          daysLeft: calculateDaysLeft(assignment.due_at),
          status: getAssignmentStatus(assignment.id, submissionsData || []),
          priority: calculatePriority(assignment),
          points: assignment.points_possible || 0,
          completed: calculateCompletion(assignment.id, submissionsData || [])
        })) || [];

        if (!isCancelled) {
          setCourses(transformedCourses);
          setAssignments(transformedAssignments);
        }
      } catch (err) {
        console.error('Error fetching academic data:', err);
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load academic data');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    }

    fetchAcademicData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [user]);

  const handleStudyPlan = () => {
    navigate('/dashboard/academics/planner');
  };

  const handleAITutor = () => {
    navigate('/dashboard/academics/tutor');
  };

  // Calculate stats from real data
  const currentGPA = courses.length > 0
    ? (courses.reduce((sum, c) => sum + c.percent, 0) / courses.length / 25).toFixed(1)
    : '0.0';

  const dueSoon = assignments.filter(a => a.daysLeft <= 7).length;

  const avgGrade = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.percent, 0) / courses.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your academic data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 max-h-[calc(100vh-120px)]">
      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
            activeTab === 'feedback'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
              : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <MessageSquare className="w-4 h-4" />
          Feedback Hub
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
              : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          Mood × Grades
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
            activeTab === 'achievements'
              ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
              : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Trophy className="w-4 h-4" />
          Achievements
        </button>

        <button
          onClick={() => setActiveTab('canvas')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
            activeTab === 'canvas'
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg'
              : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <RefreshCw className="w-4 h-4" />
          Canvas Sync
        </button>
      </div>

      {/* Top Stats Bar - Always Visible */}
      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg p-2.5 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{currentGPA}</span>
          </div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mt-0.5">Current GPA</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg p-2.5 border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center justify-between">
            <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-lg font-bold text-purple-900 dark:text-purple-100">{dueSoon}</span>
          </div>
          <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mt-0.5">Due Soon</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg p-2.5 border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-lg font-bold text-green-900 dark:text-green-100">{avgGrade}%</span>
          </div>
          <p className="text-xs font-medium text-green-700 dark:text-green-300 mt-0.5">Avg Grade</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg p-2.5 border border-orange-200/50 dark:border-orange-800/50">
          <div className="flex items-center justify-between">
            <Star className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-lg font-bold text-orange-900 dark:text-orange-100">{studyStreak}</span>
          </div>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mt-0.5">Streak Days</p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 min-h-0">
        {/* Left Column - Courses */}
        <div className="flex flex-col bg-card rounded-xl border border-border p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">My Courses</h3>
            <button
              onClick={() => navigate('/dashboard/academics/grades')}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              View All Grades
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No courses found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect Canvas to see your courses
                </p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/dashboard/academics/course/${course.id}`)}
                  className="group relative rounded-lg border border-border/60 bg-background/50 p-3 hover:bg-muted/30 hover:scale-[1.02] hover:shadow-md transition-all cursor-pointer"
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
              ))
            )}
          </div>
        </div>

        {/* Middle Column - Assignments */}
        <div className="flex flex-col bg-card rounded-xl border border-border p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Assignments</h3>
            <button className="text-xs text-primary hover:text-primary/80 font-medium">View All</button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming assignments</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              assignments.map((assignment) => (
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
              ))
            )}
          </div>
        </div>

        {/* Right Column - Quick Actions & Insights */}
        <div className="flex flex-col gap-3">
          {/* Study Tools */}
          <div className="bg-card rounded-xl border border-border p-3">
            <h3 className="text-sm font-semibold text-foreground mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleStudyPlan}
                className="relative group flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/20 dark:to-violet-900/20 border border-violet-200/50 dark:border-violet-800/50 hover:scale-[1.02] transition-all overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Sparkle animation on hover */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-3 w-3 text-violet-400 animate-pulse" />
                </div>

                <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400 relative z-10" />
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300 relative z-10">Study Plan</span>
              </button>

              <button
                onClick={handleAITutor}
                className="relative group flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 hover:scale-[1.02] transition-all overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Sparkle animation on hover */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
                </div>

                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 relative z-10" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300 relative z-10">AI Tutor</span>
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
      )}

      {activeTab === 'feedback' && (
        <div className="flex-1 overflow-y-auto">
          <FeedbackHub />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="flex-1 overflow-y-auto">
          <MoodGradeAnalytics />
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="flex-1 overflow-y-auto">
          <AchievementsDisplay />
        </div>
      )}

      {activeTab === 'canvas' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          <CanvasConnectionCard />
          <CanvasSyncStatus />
        </div>
      )}
    </div>
  );
}