/**
 * Canvas Data Transformers
 *
 * Utilities to transform Canvas LMS data into HapiAI's internal format.
 * This allows the app to work with Canvas data while maintaining its own data structure.
 */

import type {
  CanvasCourse,
  CanvasAssignment,
  CanvasSubmission,
  CanvasCalendarEvent,
} from '../types/canvas';

import type { Class } from '../supabase';

// ============================================================================
// COURSE TRANSFORMERS
// ============================================================================

/**
 * Transform Canvas course to HapiAI class
 */
export function transformCanvasCourseToClass(canvasCourse: CanvasCourse): Class {
  // Extract teacher info from enrollments
  const teacherEnrollment = canvasCourse.enrollments?.find(
    e => e.type === 'TeacherEnrollment'
  );

  return {
    id: `canvas-${canvasCourse.id}`,
    name: canvasCourse.name,
    description: canvasCourse.course_code,
    teacher_name: teacherEnrollment?.user?.name || 'Unknown Teacher',
    teacher_id: teacherEnrollment?.user_id || null,
    class_code: canvasCourse.course_code,
    created_at: canvasCourse.start_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Transform multiple Canvas courses to HapiAI classes
 */
export function transformCanvasCoursesToClasses(canvasCourses: CanvasCourse[]): Class[] {
  return canvasCourses.map(transformCanvasCourseToClass);
}

// ============================================================================
// GRADE TRANSFORMERS
// ============================================================================

/**
 * Grade data structure for HapiAI
 */
export type HapiGrade = {
  id: string;
  class_id: string;
  class_name: string;
  assignment_name: string;
  score: number | null;
  points_possible: number;
  percentage: number | null;
  letter_grade: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  due_at: string | null;
  is_late: boolean;
  is_missing: boolean;
  is_excused: boolean;
};

/**
 * Transform Canvas submission and assignment into HapiAI grade
 */
export function transformCanvasSubmissionToGrade(
  submission: CanvasSubmission,
  assignment: CanvasAssignment,
  course: CanvasCourse
): HapiGrade {
  const percentage =
    submission.score !== null && assignment.points_possible > 0
      ? (submission.score / assignment.points_possible) * 100
      : null;

  return {
    id: `canvas-submission-${submission.id}`,
    class_id: `canvas-${assignment.course_id}`,
    class_name: course.name,
    assignment_name: assignment.name,
    score: submission.score,
    points_possible: assignment.points_possible,
    percentage,
    letter_grade: submission.grade,
    submitted_at: submission.submitted_at,
    graded_at: submission.graded_at,
    due_at: assignment.due_at,
    is_late: submission.late,
    is_missing: submission.missing,
    is_excused: submission.excused,
  };
}

/**
 * Calculate overall course grade from submissions
 */
export function calculateCourseGrade(grades: HapiGrade[]): {
  percentage: number | null;
  letter_grade: string;
  points_earned: number;
  points_possible: number;
} {
  const validGrades = grades.filter(
    g => g.score !== null && !g.is_excused && !g.is_missing
  );

  if (validGrades.length === 0) {
    return {
      percentage: null,
      letter_grade: 'N/A',
      points_earned: 0,
      points_possible: 0,
    };
  }

  const points_earned = validGrades.reduce((sum, g) => sum + (g.score || 0), 0);
  const points_possible = validGrades.reduce((sum, g) => sum + g.points_possible, 0);

  const percentage = points_possible > 0 ? (points_earned / points_possible) * 100 : null;

  const letter_grade = percentage !== null ? percentageToLetterGrade(percentage) : 'N/A';

  return {
    percentage,
    letter_grade,
    points_earned,
    points_possible,
  };
}

/**
 * Convert percentage to letter grade
 */
export function percentageToLetterGrade(percentage: number): string {
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}

// ============================================================================
// CALENDAR TRANSFORMERS
// ============================================================================

/**
 * Calendar event structure for HapiAI
 */
export type HapiCalendarEvent = {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  type: 'assignment' | 'event' | 'quiz' | 'meeting';
  class_id: string | null;
  class_name: string | null;
  location: string | null;
  url: string | null;
  all_day: boolean;
};

/**
 * Transform Canvas calendar event to HapiAI format
 */
export function transformCanvasCalendarEvent(
  canvasEvent: CanvasCalendarEvent
): HapiCalendarEvent {
  // Extract course ID from context_code (e.g., "course_12345")
  const courseId = canvasEvent.context_code?.startsWith('course_')
    ? `canvas-${canvasEvent.context_code.split('_')[1]}`
    : null;

  // Determine event type
  let eventType: HapiCalendarEvent['type'] = 'event';
  if (canvasEvent.title.toLowerCase().includes('assignment')) {
    eventType = 'assignment';
  } else if (canvasEvent.title.toLowerCase().includes('quiz')) {
    eventType = 'quiz';
  }

  return {
    id: `canvas-event-${canvasEvent.id}`,
    title: canvasEvent.title,
    description: canvasEvent.description || '',
    start_at: canvasEvent.start_at,
    end_at: canvasEvent.end_at,
    type: eventType,
    class_id: courseId,
    class_name: null, // Would need to be populated from course data
    location: canvasEvent.location_name || null,
    url: canvasEvent.html_url,
    all_day: canvasEvent.all_day || false,
  };
}

/**
 * Transform multiple Canvas calendar events
 */
export function transformCanvasCalendarEvents(
  canvasEvents: CanvasCalendarEvent[]
): HapiCalendarEvent[] {
  return canvasEvents.map(transformCanvasCalendarEvent);
}

// ============================================================================
// ASSIGNMENT TRANSFORMERS
// ============================================================================

/**
 * Assignment structure for HapiAI
 */
export type HapiAssignment = {
  id: string;
  class_id: string;
  class_name: string;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number;
  submission_type: string;
  has_submission: boolean;
  is_published: boolean;
  position: number;
};

/**
 * Transform Canvas assignment to HapiAI format
 */
export function transformCanvasAssignment(
  assignment: CanvasAssignment,
  course: CanvasCourse
): HapiAssignment {
  return {
    id: `canvas-assignment-${assignment.id}`,
    class_id: `canvas-${assignment.course_id}`,
    class_name: course.name,
    name: assignment.name,
    description: assignment.description || '',
    due_at: assignment.due_at,
    points_possible: assignment.points_possible,
    submission_type: assignment.submission_types.join(', '),
    has_submission: assignment.has_submitted_submissions,
    is_published: assignment.published,
    position: assignment.position,
  };
}

// ============================================================================
// ANALYTICS TRANSFORMERS
// ============================================================================

/**
 * Transform Canvas tardiness data into completion statistics
 */
export function calculateAssignmentCompletionStats(grades: HapiGrade[]): {
  total: number;
  completed: number;
  late: number;
  missing: number;
  on_time: number;
  completion_rate: number;
} {
  const total = grades.length;
  const completed = grades.filter(g => g.score !== null || g.is_excused).length;
  const late = grades.filter(g => g.is_late).length;
  const missing = grades.filter(g => g.is_missing).length;
  const on_time = completed - late;

  const completion_rate = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    completed,
    late,
    missing,
    on_time,
    completion_rate,
  };
}

/**
 * Calculate grade trends over time
 */
export function calculateGradeTrends(grades: HapiGrade[]): {
  dates: string[];
  scores: number[];
  average: number;
  trend: 'improving' | 'declining' | 'stable';
} {
  const sortedGrades = grades
    .filter(g => g.graded_at && g.percentage !== null)
    .sort((a, b) => new Date(a.graded_at!).getTime() - new Date(b.graded_at!).getTime());

  const dates = sortedGrades.map(g => g.graded_at!);
  const scores = sortedGrades.map(g => g.percentage!);

  const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  // Calculate trend using linear regression
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (scores.length >= 3) {
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff > 2) trend = 'improving';
    else if (diff < -2) trend = 'declining';
  }

  return { dates, scores, average, trend };
}
