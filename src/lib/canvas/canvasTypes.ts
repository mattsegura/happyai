/**
 * Canvas LMS Type Definitions
 *
 * These types match the Canvas LMS API structure.
 * Reference: https://canvas.instructure.com/doc/api/
 */

// ============================================================================
// CORE CANVAS TYPES
// ============================================================================

export type CanvasCourse = {
  id: string;
  name: string;
  course_code: string;
  workflow_state: 'unpublished' | 'available' | 'completed' | 'deleted';
  account_id: string;
  start_at: string | null;
  end_at: string | null;
  enrollments?: CanvasEnrollment[];
  total_students?: number;
  calendar?: {
    ics: string;
  };
  term?: {
    id: string;
    name: string;
  };
  grading_standard_id?: string;
  time_zone?: string;
};

export type CanvasEnrollment = {
  id: string;
  user_id: string;
  course_id: string;
  type: 'StudentEnrollment' | 'TeacherEnrollment' | 'TaEnrollment' | 'ObserverEnrollment';
  role: string;
  role_id: string;
  enrollment_state: 'active' | 'invited' | 'inactive' | 'completed';
  limit_privileges_to_course_section: boolean;
  grades?: {
    html_url: string;
    current_grade?: string;
    current_score?: number;
    final_grade?: string;
    final_score?: number;
  };
  user?: CanvasUser;
};

export type CanvasUser = {
  id: string;
  name: string;
  sortable_name: string;
  short_name: string;
  email?: string;
  login_id?: string;
  avatar_url?: string;
  pronouns?: string;
};

export type CanvasAssignment = {
  id: string;
  course_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  due_at: string | null;
  lock_at: string | null;
  unlock_at: string | null;
  points_possible: number;
  grading_type: 'pass_fail' | 'percent' | 'letter_grade' | 'gpa_scale' | 'points';
  assignment_group_id: string;
  submission_types: string[];
  has_submitted_submissions: boolean;
  published: boolean;
  workflow_state: 'published' | 'unpublished' | 'deleted';
  position: number;
  omit_from_final_grade: boolean;
};

export type CanvasSubmission = {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_type?: string;
  submitted_at: string | null;
  score: number | null;
  grade: string | null;
  attempt: number;
  body?: string;
  grade_matches_current_submission: boolean;
  workflow_state: 'submitted' | 'unsubmitted' | 'graded' | 'pending_review';
  submission_comments?: CanvasSubmissionComment[];
  late: boolean;
  missing: boolean;
  excused: boolean;
  seconds_late?: number;
  graded_at: string | null;
  grader_id?: string;
};

export type CanvasSubmissionComment = {
  id: string;
  author_id: string;
  author_name: string;
  comment: string;
  created_at: string;
  edited_at?: string;
  media_comment?: {
    url: string;
    media_type: string;
  };
};

export type CanvasCalendarEvent = {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  location_name?: string;
  location_address?: string;
  context_code: string;
  workflow_state: 'active' | 'deleted';
  hidden: boolean;
  url: string;
  html_url: string;
  all_day?: boolean;
  all_day_date?: string;
  created_at: string;
  updated_at: string;
  appointment_group_id?: string;
  child_events?: CanvasCalendarEvent[];
};

export type CanvasModule = {
  id: string;
  workflow_state: 'active' | 'deleted';
  position: number;
  name: string;
  unlock_at: string | null;
  require_sequential_progress: boolean;
  prerequisite_module_ids: string[];
  items_count: number;
  items_url: string;
  items?: CanvasModuleItem[];
  state?: 'locked' | 'unlocked' | 'started' | 'completed';
  completed_at: string | null;
  publish_final_grade: boolean;
};

export type CanvasModuleItem = {
  id: string;
  module_id: string;
  position: number;
  title: string;
  indent: number;
  type: 'File' | 'Page' | 'Discussion' | 'Assignment' | 'Quiz' | 'SubHeader' | 'ExternalUrl' | 'ExternalTool';
  content_id: string;
  html_url: string;
  url?: string;
  page_url?: string;
  external_url?: string;
  new_tab: boolean;
  completion_requirement?: {
    type: 'must_view' | 'must_submit' | 'must_contribute' | 'min_score';
    min_score?: number;
    completed: boolean;
  };
  content_details?: {
    points_possible?: number;
    due_at?: string;
    unlock_at?: string;
    lock_at?: string;
  };
  published: boolean;
};

// ============================================================================
// CANVAS ANALYTICS TYPES
// ============================================================================

export type CanvasStudentSummary = {
  id: string;
  page_views: number;
  participations: number;
  tardiness_breakdown: {
    total: number;
    on_time: number;
    late: number;
    missing: number;
    floating: number;
  };
};

export type CanvasStudentActivity = {
  date: string;
  views: number;
  participations: number;
};

// ============================================================================
// CANVAS API RESPONSE TYPES
// ============================================================================

export type CanvasApiResponse<T> = {
  data: T;
  headers?: Record<string, string>;
  links?: {
    current?: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
};

export type CanvasApiError = {
  message: string;
  error_code?: string;
  status: number;
};

// ============================================================================
// CANVAS PAGINATION
// ============================================================================

export type CanvasPaginationParams = {
  page?: number;
  per_page?: number;
};
