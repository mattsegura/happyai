import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Award,
  Target,
  ChevronDown,
  FileText,
  Sparkles,
} from 'lucide-react';
import { canvasApi, type CanvasCourse, type CanvasAssignment, type CanvasSubmission } from '../../lib/canvasApiMock';
import { SimpleGradeProjection } from './SimpleGradeProjection';
import { WhatIfCalculator } from './WhatIfCalculator';
import { ImpactIndicatorBadge } from './ImpactIndicatorBadge';
import { impactCalculator, type CourseGradeContext, type ImpactScore } from '../../lib/academics/impactCalculator';

type AssignmentWithSubmission = CanvasAssignment & {
  submission?: CanvasSubmission;
  status: 'completed' | 'pending' | 'overdue';
  daysUntilDue?: number;
  impact?: ImpactScore;
};

// Mock data for development/testing
function getMockCourseData(courseId: string) {
  const mockCourses: CanvasCourse[] = [
    {
      id: '1',
      name: 'Introduction to Computer Science',
      course_code: 'CS 101',
      term: { name: 'Fall 2024' },
      start_at: '2024-09-01T00:00:00Z',
      end_at: '2024-12-15T00:00:00Z',
      enrollments: [{
        type: 'student',
        role: 'StudentEnrollment',
        enrollment_state: 'active',
        current_score: 95,
        current_grade: 'A'
      }],
    },
    {
      id: '2',
      name: 'Calculus II',
      course_code: 'MATH 202',
      term: { name: 'Fall 2024' },
      start_at: '2024-09-01T00:00:00Z',
      end_at: '2024-12-15T00:00:00Z',
      enrollments: [{
        type: 'student',
        role: 'StudentEnrollment',
        enrollment_state: 'active',
        current_score: 87,
        current_grade: 'B+'
      }],
    },
    {
      id: '3',
      name: 'English Literature',
      course_code: 'ENG 201',
      term: { name: 'Fall 2024' },
      start_at: '2024-09-01T00:00:00Z',
      end_at: '2024-12-15T00:00:00Z',
      enrollments: [{
        type: 'student',
        role: 'StudentEnrollment',
        enrollment_state: 'active',
        current_score: 91,
        current_grade: 'A-'
      }],
    },
    {
      id: '4',
      name: 'Physics I',
      course_code: 'PHYS 101',
      term: { name: 'Fall 2024' },
      start_at: '2024-09-01T00:00:00Z',
      end_at: '2024-12-15T00:00:00Z',
      enrollments: [{
        type: 'student',
        role: 'StudentEnrollment',
        enrollment_state: 'active',
        current_score: 82,
        current_grade: 'B'
      }],
    },
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const threeDays = new Date();
  threeDays.setDate(threeDays.getDate() + 3);

  const mockAssignments: Record<string, CanvasAssignment[]> = {
    '1': [
      {
        id: 'a1',
        course_id: '1',
        name: 'Final Project Proposal',
        description: 'Submit your project proposal',
        due_at: tomorrow.toISOString(),
        points_possible: 100,
        submission_types: ['online_upload'],
        has_submitted_submissions: true,
        grading_type: 'points',
        assignment_group_id: 'ag1',
      },
      {
        id: 'a2',
        course_id: '1',
        name: 'Algorithm Analysis Quiz',
        description: 'Quiz on Big O notation',
        due_at: threeDays.toISOString(),
        points_possible: 50,
        submission_types: ['online_quiz'],
        has_submitted_submissions: false,
        grading_type: 'points',
        assignment_group_id: 'ag1',
      },
      {
        id: 'a3',
        course_id: '1',
        name: 'Data Structures Assignment',
        description: 'Implement a binary tree',
        due_at: nextWeek.toISOString(),
        points_possible: 150,
        submission_types: ['online_upload'],
        has_submitted_submissions: false,
        grading_type: 'points',
        assignment_group_id: 'ag1',
      },
    ],
    '2': [
      {
        id: 'a4',
        course_id: '2',
        name: 'Integration Techniques Problem Set',
        description: 'Complete problems 1-20',
        due_at: threeDays.toISOString(),
        points_possible: 50,
        submission_types: ['online_text_entry'],
        has_submitted_submissions: false,
        grading_type: 'points',
        assignment_group_id: 'ag2',
      },
      {
        id: 'a5',
        course_id: '2',
        name: 'Midterm Exam',
        description: 'Covers chapters 5-8',
        due_at: nextWeek.toISOString(),
        points_possible: 200,
        submission_types: ['on_paper'],
        has_submitted_submissions: false,
        grading_type: 'points',
        assignment_group_id: 'ag2',
      },
    ],
    '3': [
      {
        id: 'a6',
        course_id: '3',
        name: 'Poetry Analysis Essay',
        description: 'Analyze a poem from the Romantic era',
        due_at: nextWeek.toISOString(),
        points_possible: 150,
        submission_types: ['online_text_entry'],
        has_submitted_submissions: false,
        grading_type: 'points',
        assignment_group_id: 'ag3',
      },
    ],
    '4': [
      {
        id: 'a7',
        course_id: '4',
        name: 'Lab Report: Newton\'s Laws',
        description: 'Submit lab report',
        due_at: tomorrow.toISOString(),
        points_possible: 75,
        submission_types: ['online_upload'],
        has_submitted_submissions: false,
        grading_type: 'points',
        assignment_group_id: 'ag4',
      },
      {
        id: 'a8',
        course_id: '4',
        name: 'Chapter 4 Quiz',
        description: 'Online quiz',
        due_at: threeDays.toISOString(),
        points_possible: 25,
        submission_types: ['online_quiz'],
        has_submitted_submissions: true,
        grading_type: 'points',
        assignment_group_id: 'ag4',
      },
    ],
  };

  const mockSubmissions: Record<string, CanvasSubmission[]> = {
    'a1': [{
      id: 's1',
      assignment_id: 'a1',
      user_id: 'user1',
      score: 60,
      grade: '60',
      workflow_state: 'submitted',
      submitted_at: new Date().toISOString(),
      graded_at: null,
      late: false,
    }],
    'a8': [{
      id: 's2',
      assignment_id: 'a8',
      user_id: 'user1',
      score: 20,
      grade: '20',
      workflow_state: 'submitted',
      submitted_at: new Date().toISOString(),
      graded_at: null,
      late: false,
    }],
  };

  const course = mockCourses.find((c) => c.id === courseId);
  const assignments = mockAssignments[courseId] || [];

  return {
    course,
    assignments,
    submissions: mockSubmissions,
  };
}

export function SingleCourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CanvasCourse | null>(null);
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWhatIf, setShowWhatIf] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    setLoading(true);
    try {
      // Check if we should use mock data
      const useMockData = import.meta.env.VITE_USE_ACADEMICS_MOCK === 'true';

      let foundCourse: CanvasCourse | undefined;
      let courseAssignments: CanvasAssignment[];
      let submissionsData: Record<string, CanvasSubmission[]>;

      if (useMockData) {
        // Use mock data for development/testing
        console.log('📚 Using mock course data (VITE_USE_ACADEMICS_MOCK=true)');
        const mockData = getMockCourseData(courseId || '');
        foundCourse = mockData.course;
        courseAssignments = mockData.assignments;
        submissionsData = mockData.submissions;
      } else {
        // Fetch real data from Canvas API
        console.log('📊 Fetching real course data from Canvas API');
        const coursesData = await canvasApi.getCourses();
        const allAssignments = await canvasApi.getAssignments();

        // Find the specific course
        foundCourse = coursesData.find((c) => c.id === courseId);

        // Filter assignments for this course only
        courseAssignments = allAssignments.filter((a) => a.course_id === courseId);

        // Build submissions data
        submissionsData = {};
        for (const assignment of courseAssignments) {
          const subs = await canvasApi.getSubmissions(assignment.id);
          submissionsData[assignment.id] = subs;
        }
      }

      if (!foundCourse) {
        setLoading(false);
        return;
      }

      // Enrich assignments with submission data
      const enrichedAssignments = courseAssignments.map((assignment) => {
        const submissions = submissionsData[assignment.id] || [];
        const submission = submissions[0];

        // Calculate status
        let status: AssignmentWithSubmission['status'] = 'pending';
        let daysUntilDue: number | undefined;

        if (assignment.due_at) {
          const dueDate = new Date(assignment.due_at);
          const now = new Date();
          const diffTime = dueDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          daysUntilDue = diffDays;

          if (submission && submission.workflow_state === 'graded') {
            status = 'completed';
          } else if (diffDays < 0) {
            status = 'overdue';
          } else if (diffDays <= 7) {
            status = 'pending';
          }
        }

        // Calculate impact score for incomplete assignments
        let impact: ImpactScore | undefined;
        if (status !== 'completed') {
          const currentScore = foundCourse!.enrollments[0]?.current_score || 0;
          const totalPoints = courseAssignments.reduce((sum, a) => sum + a.points_possible, 0);
          const earnedPoints = courseAssignments.reduce((sum, a) => {
            const allSubs = Object.values(submissionsData).flat();
            const sub = allSubs.find((s) => s.assignment_id === a.id);
            return sum + (sub?.score || 0);
          }, 0);

          const completedWeight = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

          const courseContext: CourseGradeContext = {
            currentGrade: currentScore,
            totalPoints,
            earnedPoints,
            completedWeight,
          };

          impact = impactCalculator.calculateImpact(assignment.points_possible, courseContext);
        }

        return {
          ...assignment,
          submission,
          status,
          daysUntilDue,
          impact,
        };
      });

      setCourse(foundCourse);
      setAssignments(enrichedAssignments);
    } catch (error) {
      console.error('Failed to load course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 80) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (score >= 70) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getStatusBadge = (assignment: AssignmentWithSubmission) => {
    switch (assignment.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Course Not Found</h3>
        <p className="text-sm text-muted-foreground">The course you're looking for doesn't exist.</p>
      </div>
    );
  }

  const currentScore = course.enrollments[0]?.current_score || 0;
  const currentGrade = course.enrollments[0]?.current_grade || 'N/A';
  const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
  const totalAssignments = assignments.length;
  const upcomingAssignments = assignments.filter((a) => a.status === 'pending' && (a.daysUntilDue || 0) <= 7).length;

  // Calculate total points and earned points for WhatIfCalculator
  const totalPoints = assignments.reduce((sum, a) => sum + a.points_possible, 0);
  const earnedPoints = assignments.reduce((sum, a) => {
    if (a.submission && a.submission.score !== null) {
      return sum + a.submission.score;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 dark:from-primary/20 dark:via-accent/20 dark:to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/10 dark:bg-primary/20">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{course.name}</h2>
                <p className="text-sm text-muted-foreground">{course.course_code}</p>
              </div>
            </div>
          </div>
          <div className={`px-6 py-3 rounded-xl border ${getGradeBgColor(currentScore)}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getGradeColor(currentScore)}`}>{currentGrade}</div>
              <div className="text-xs text-muted-foreground mt-1">{currentScore.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </div>
            <div className="text-xl font-bold text-foreground">
              {completedAssignments}/{totalAssignments}
            </div>
          </div>
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Clock className="h-3 w-3" />
              Due This Week
            </div>
            <div className="text-xl font-bold text-foreground">{upcomingAssignments}</div>
          </div>
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="h-3 w-3" />
              Progress
            </div>
            <div className="text-xl font-bold text-foreground">
              {totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* What-If Calculator */}
      {course && showWhatIf && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              What-If Grade Calculator
            </h3>
            <button
              onClick={() => setShowWhatIf(false)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Close
            </button>
          </div>
          <WhatIfCalculator
            courseId={course.id}
            assignments={assignments}
            currentGrade={currentScore}
            totalPoints={totalPoints}
            earnedPoints={earnedPoints}
          />
        </div>
      )}

      {/* Grade Projection */}
      {course && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Grade Path Projection
            </h3>
            {!showWhatIf && (
              <button
                onClick={() => setShowWhatIf(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                What-If Calculator
              </button>
            )}
          </div>

          <SimpleGradeProjection course={course} assignments={assignments} />
        </div>
      )}

      {/* Assignments List */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Assignments ({assignments.length})
        </h3>
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{assignment.name}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {assignment.due_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due {new Date(assignment.due_at).toLocaleDateString()}
                      </span>
                    )}
                    <span>{assignment.points_possible} points</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {assignment.impact && <ImpactIndicatorBadge impact={assignment.impact} size="sm" />}
                  {getStatusBadge(assignment)}
                </div>
              </div>

              {assignment.submission && assignment.submission.score !== null && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Your Score</span>
                  <span className={`text-lg font-bold ${getGradeColor((assignment.submission.score / assignment.points_possible) * 100)}`}>
                    {assignment.submission.score} / {assignment.points_possible}
                  </span>
                </div>
              )}
            </div>
          ))}

          {assignments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No assignments found for this course</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
