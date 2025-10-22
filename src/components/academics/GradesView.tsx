import { useState, useEffect } from 'react';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Award,
  Target,
  ChevronRight,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { canvasApi, type CanvasCourse, type CanvasAssignment, type CanvasSubmission } from '../../lib/canvasApiMock';

type AssignmentWithSubmission = CanvasAssignment & {
  submission?: CanvasSubmission;
  course_name?: string;
  status: 'completed' | 'pending' | 'overdue' | 'upcoming';
  daysUntilDue?: number;
};

export function GradesView() {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [loading, setLoading] = useState(true);

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
          let status: AssignmentWithSubmission['status'] = 'upcoming';
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

          return {
            ...assignment,
            submission,
            course_name: course?.name || 'Unknown Course',
            status,
            daysUntilDue,
          };
        })
      );

      setCourses(coursesData);
      setAssignments(enrichedAssignments);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusBadge = (assignment: AssignmentWithSubmission) => {
    switch (assignment.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Due Soon
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            <Calendar className="w-3 h-3" />
            Upcoming
          </span>
        );
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const overallGPA = courses.reduce((sum, course) => {
    const score = course.enrollments[0]?.current_score || 0;
    return sum + score;
  }, 0) / courses.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Academic Performance</h2>
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

      {/* Course Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Your Courses</h3>
        {courses.map((course) => {
          const courseAssignments = assignments.filter((a) => a.course_id === course.id);
          const isExpanded = expandedCourse === course.id;
          const currentScore = course.enrollments[0]?.current_score || 0;
          const currentGrade = course.enrollments[0]?.current_grade || 'N/A';

          return (
            <div key={course.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl ${getGradeBgColor(currentScore)} border flex items-center justify-center`}>
                    <BookOpen className={`w-6 h-6 ${getGradeColor(currentScore)}`} />
                  </div>

                  <div className="flex-1 text-left">
                    <h4 className="text-lg font-bold text-gray-900">{course.name}</h4>
                    <p className="text-sm text-gray-500">{course.course_code} • {course.term}</p>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getGradeColor(currentScore)}`}>{currentGrade}</div>
                    <div className="text-sm text-gray-500">{currentScore.toFixed(1)}%</div>
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">Assignments</h5>
                  <div className="space-y-3">
                    {courseAssignments.length === 0 ? (
                      <p className="text-gray-500 text-sm">No assignments yet</p>
                    ) : (
                      courseAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <h6 className="font-semibold text-gray-900">{assignment.name}</h6>
                                {assignment.due_at && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Due: {new Date(assignment.due_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                    {assignment.daysUntilDue !== undefined && assignment.daysUntilDue >= 0 && (
                                      <span className="ml-2 text-gray-400">
                                        ({assignment.daysUntilDue} {assignment.daysUntilDue === 1 ? 'day' : 'days'} left)
                                      </span>
                                    )}
                                  </p>
                                )}
                                {assignment.submission?.score !== null && assignment.submission?.score !== undefined && (
                                  <p className="text-sm font-medium text-green-600 mt-1">
                                    Score: {assignment.submission.score}/{assignment.points_possible} (
                                    {((assignment.submission.score / assignment.points_possible) * 100).toFixed(1)}%)
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(assignment)}
                              <span className="text-sm text-gray-500">{assignment.points_possible} pts</span>
                            </div>
                          </div>
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

      {/* Upcoming Assignments */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">All Assignments</h3>
          <div className="flex gap-2">
            {(['all', 'pending', 'overdue', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredAssignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No assignments found</p>
          ) : (
            filteredAssignments
              .sort((a, b) => {
                if (!a.due_at) return 1;
                if (!b.due_at) return -1;
                return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
              })
              .map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <h6 className="font-semibold text-gray-900">{assignment.name}</h6>
                        <p className="text-sm text-gray-600 mt-1">{assignment.course_name}</p>
                        {assignment.due_at && (
                          <p className="text-sm text-gray-500 mt-1">
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
                      {getStatusBadge(assignment)}
                      <span className="text-sm text-gray-500">{assignment.points_possible} pts</span>
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
