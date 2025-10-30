import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Award,
  Target,
  ChevronRight,
  ChevronDown,
  FileText,
  Sparkles,
  Filter,
} from 'lucide-react';
import { canvasApi, type CanvasCourse, type CanvasAssignment, type CanvasSubmission } from '../../lib/canvasApiMock';
import { GoogleCalendarConnect } from './GoogleCalendarConnect';
import { CalendarSyncSettings } from './CalendarSyncSettings';
import { GradeProjectionCard } from './GradeProjectionCard';
import { WhatIfCalculator } from './WhatIfCalculator';
import { ImpactIndicatorBadge } from './ImpactIndicatorBadge';
import { FeedbackExplainerCard } from './FeedbackExplainerCard';
import { impactCalculator, type CourseGradeContext, type ImpactScore } from '../../lib/academics/impactCalculator';

type AssignmentWithSubmission = CanvasAssignment & {
  submission?: CanvasSubmission;
  course_name?: string;
  status: 'completed' | 'pending' | 'overdue';
  daysUntilDue?: number;
  impact?: ImpactScore;
};

type FilterType = 'all' | 'pending' | 'completed' | 'overdue' | 'high-impact';

export function EnhancedGradesView() {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [selectedCourseForProjection, setSelectedCourseForProjection] = useState<string | null>(null);
  const [showWhatIf, setShowWhatIf] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const coursesData = await canvasApi.getCourses();
      const assignmentsData = await canvasApi.getAssignments();

      // Enrich assignments with submission data and course info
      const enrichedAssignments = await Promise.all(
        assignmentsData.map(async (assignment) => {
          const submissions = await canvasApi.getSubmissions(assignment.id);
          const submission = submissions[0];
          const course = coursesData.find((c) => c.id === assignment.course_id);

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
          if (status !== 'completed' && course) {
            const currentScore = course.enrollments[0]?.current_score || 0;
            const totalPoints = assignmentsData
              .filter((a) => a.course_id === course.id)
              .reduce((sum, a) => sum + a.points_possible, 0);
            const earnedPoints = assignmentsData
              .filter((a) => a.course_id === course.id)
              .reduce((sum, a) => {
                const sub = submissions.find((s) => s.assignment_id === a.id);
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
            course_name: course?.name || 'Unknown Course',
            status,
            daysUntilDue,
            impact,
          };
        })
      );

      setCourses(coursesData);
      setAssignments(enrichedAssignments);

      // Auto-select first course for projection
      if (coursesData.length > 0) {
        setSelectedCourseForProjection(coursesData[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
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
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Due Soon
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
            <Calendar className="w-3 h-3" />
            Upcoming
          </span>
        );
    }
  };

  const filteredAssignments = useMemo(() => {
    let filtered = assignments;

    // Apply status filter
    if (filterStatus === 'high-impact') {
      filtered = filtered.filter((a) => a.impact && a.impact.priority === 'high');
    } else if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    // Sort by impact (high to low) and due date (soonest first)
    return filtered.sort((a, b) => {
      // First priority: Sort by impact
      const impactA = a.impact?.impactScore || 0;
      const impactB = b.impact?.impactScore || 0;
      if (Math.abs(impactA - impactB) > 0.001) {
        return impactB - impactA;
      }

      // Second priority: Sort by due date
      if (a.due_at && b.due_at) {
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      }

      return 0;
    });
  }, [assignments, filterStatus]);

  const overallGPA = courses.reduce((sum, course) => {
    const score = course.enrollments[0]?.current_score || 0;
    return sum + score;
  }, 0) / courses.length || 0;

  const selectedCourse = courses.find((c) => c.id === selectedCourseForProjection);
  const selectedCourseAssignments = assignments.filter(
    (a) => a.course_id === selectedCourseForProjection
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Academic Performance</h2>
          <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span>AI-Enhanced</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Overall GPA</span>
            </div>
            <div className="text-3xl font-bold">{(overallGPA / 25).toFixed(2)}</div>
            <div className="text-xs opacity-80">{overallGPA.toFixed(1)}% Average</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Courses</span>
            </div>
            <div className="text-3xl font-bold">{courses.length}</div>
            <div className="text-xs opacity-80">Active Enrollments</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Assignments</span>
            </div>
            <div className="text-3xl font-bold">{assignments.length}</div>
            <div className="text-xs opacity-80">
              {assignments.filter((a) => a.status === 'pending' || a.status === 'overdue').length} Pending
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Completion</span>
            </div>
            <div className="text-3xl font-bold">
              {Math.round((assignments.filter((a) => a.status === 'completed').length / assignments.length) * 100)}%
            </div>
            <div className="text-xs opacity-80">
              {assignments.filter((a) => a.status === 'completed').length} of {assignments.length}
            </div>
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Projection Card */}
        {selectedCourseForProjection && selectedCourse && (
          <div>
            <div className="mb-3">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Select course for projection:
              </label>
              <select
                value={selectedCourseForProjection}
                onChange={(e) => setSelectedCourseForProjection(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <GradeProjectionCard courseId={selectedCourseForProjection} courseName={selectedCourse.name} />
          </div>
        )}

        {/* What-If Calculator */}
        {selectedCourseForProjection && selectedCourse && (
          <div>
            <button
              onClick={() => setShowWhatIf(!showWhatIf)}
              className="mb-3 text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              {showWhatIf ? 'Hide' : 'Show'} What-If Calculator
            </button>
            {showWhatIf && (
              <WhatIfCalculator
                courseId={selectedCourseForProjection}
                assignments={selectedCourseAssignments.map((a) => ({
                  id: a.id,
                  name: a.name,
                  points_possible: a.points_possible,
                  due_at: a.due_at || undefined,
                  status: a.status,
                  score: a.submission?.score || undefined,
                }))}
                currentGrade={selectedCourse.enrollments[0]?.current_score || 0}
                totalPoints={selectedCourseAssignments.reduce((sum, a) => sum + a.points_possible, 0)}
                earnedPoints={selectedCourseAssignments.reduce(
                  (sum, a) => sum + (a.submission?.score || 0),
                  0
                )}
              />
            )}
          </div>
        )}
      </div>

      {/* Google Calendar Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoogleCalendarConnect />
        <CalendarSyncSettings />
      </div>

      {/* Course Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Your Courses</h3>
        {courses.map((course) => {
          const courseAssignments = assignments.filter((a) => a.course_id === course.id);
          const isExpanded = expandedCourse === course.id;
          const currentScore = course.enrollments[0]?.current_score || 0;
          const currentGrade = course.enrollments[0]?.current_grade || 'N/A';

          return (
            <div key={course.id} className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
              <button
                onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl ${getGradeBgColor(currentScore)} border flex items-center justify-center`}>
                    <BookOpen className={`w-6 h-6 ${getGradeColor(currentScore)}`} />
                  </div>

                  <div className="flex-1 text-left">
                    <h4 className="text-lg font-bold text-foreground">{course.name}</h4>
                    <p className="text-sm text-muted-foreground">{course.course_code} • {course.term}</p>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getGradeColor(currentScore)}`}>{currentGrade}</div>
                    <div className="text-sm text-muted-foreground">{currentScore.toFixed(1)}%</div>
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border bg-muted/30 p-6">
                  <h5 className="font-semibold text-foreground mb-4">Assignments</h5>
                  <div className="space-y-3">
                    {courseAssignments.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No assignments yet</p>
                    ) : (
                      courseAssignments.map((assignment) => (
                        <div key={assignment.id} className="space-y-3">
                          <div className="bg-card p-4 rounded-lg border border-border hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                  <h6 className="font-semibold text-foreground">{assignment.name}</h6>
                                  {assignment.due_at && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Due: {new Date(assignment.due_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                      {assignment.daysUntilDue !== undefined && assignment.daysUntilDue >= 0 && (
                                        <span className="ml-2 text-muted-foreground/70">
                                          ({assignment.daysUntilDue} {assignment.daysUntilDue === 1 ? 'day' : 'days'} left)
                                        </span>
                                      )}
                                    </p>
                                  )}
                                  {assignment.submission?.score !== null && assignment.submission?.score !== undefined && (
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                                      Score: {assignment.submission.score}/{assignment.points_possible} (
                                      {((assignment.submission.score / assignment.points_possible) * 100).toFixed(1)}%)
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(assignment)}
                                  {assignment.impact && <ImpactIndicatorBadge impact={assignment.impact} />}
                                </div>
                                <span className="text-sm text-muted-foreground">{assignment.points_possible} pts</span>
                              </div>
                            </div>
                          </div>

                          {/* Feedback Explainer for graded assignments */}
                          {assignment.submission &&
                            assignment.submission.workflow_state === 'graded' &&
                            assignment.submission.score !== null && (
                              <FeedbackExplainerCard
                                submissionId={assignment.submission.id}
                                originalFeedback="Great work on this assignment! You demonstrated good understanding of the concepts."
                                score={assignment.submission.score || 0}
                                pointsPossible={assignment.points_possible}
                                assignmentName={assignment.name}
                              />
                            )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* All Assignments with Filters */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Filter className="w-5 h-5" />
            All Assignments
          </h3>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'overdue', 'completed', 'high-impact'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status === 'high-impact' ? 'High Impact' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredAssignments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No assignments found</p>
          ) : (
            filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-muted/30 p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <h6 className="font-semibold text-foreground">{assignment.name}</h6>
                      <p className="text-sm text-muted-foreground mt-1">{assignment.course_name}</p>
                      {assignment.due_at && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Due: {new Date(assignment.due_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(assignment)}
                      {assignment.impact && <ImpactIndicatorBadge impact={assignment.impact} />}
                    </div>
                    <span className="text-sm text-muted-foreground">{assignment.points_possible} pts</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
