/**
 * Consolidated Canvas LMS API Type Definitions
 *
 * Based on official Canvas API documentation at https://canvas.instructure.com/doc/api/
 * These types match the Canvas API v1 response structures exactly.
 *
 * This file consolidates:
 * - src/lib/canvas/canvasTypes.ts
 * - src/lib/canvas/canvasTypesOfficial.ts
 *
 * Last Updated: 2025-11-04
 * Canvas API Version: v1
 */

// ============================================================================
// CANVAS USER TYPES
// ============================================================================

export type CanvasUser = {
  id: number;
  name: string;
  sortable_name: string;
  short_name: string;
  sis_user_id?: string | null;
  sis_import_id?: number | null;
  integration_id?: string | null;
  login_id?: string;
  avatar_url?: string;
  email?: string;
  locale?: string;
  created_at?: string;
  pronouns?: string | null;
};

// ============================================================================
// CANVAS COURSE TYPES
// ============================================================================

export type CanvasCourseWorkflowState =
  | 'unpublished'
  | 'available'
  | 'completed'
  | 'deleted';

export type CanvasEnrollmentType =
  | 'StudentEnrollment'
  | 'TeacherEnrollment'
  | 'TaEnrollment'
  | 'ObserverEnrollment'
  | 'DesignerEnrollment';

export type CanvasEnrollmentState =
  | 'active'
  | 'invited'
  | 'inactive'
  | 'completed'
  | 'rejected'
  | 'deleted';

export type CanvasAccount = {
  id: number;
  name: string;
  uuid: string;
  parent_account_id?: number | null;
  root_account_id?: number | null;
  workflow_state: 'active' | 'deleted';
  default_storage_quota_mb?: number;
  default_user_storage_quota_mb?: number;
  default_group_storage_quota_mb?: number;
  default_time_zone?: string;
  sis_account_id?: string | null;
  sis_import_id?: number | null;
  integration_id?: string | null;
};

export type CanvasEnrollment = {
  id: number;
  user_id: number;
  course_id: number;
  type: CanvasEnrollmentType;
  created_at: string;
  updated_at: string;
  associated_user_id?: number | null;
  start_at?: string | null;
  end_at?: string | null;
  course_section_id: number;
  root_account_id: number;
  limit_privileges_to_course_section: boolean;
  enrollment_state: CanvasEnrollmentState;
  role: string;
  role_id: number;
  last_activity_at?: string | null;
  last_attended_at?: string | null;
  total_activity_time?: number;
  sis_account_id?: string | null;
  sis_course_id?: string | null;
  sis_section_id?: string | null;
  sis_user_id?: string | null;
  html_url: string;
  grades?: {
    html_url: string;
    current_score?: number | null;
    current_grade?: string | null;
    final_score?: number | null;
    final_grade?: string | null;
    unposted_current_score?: number | null;
    unposted_current_grade?: string | null;
    unposted_final_score?: number | null;
    unposted_final_grade?: string | null;
  };
  user?: CanvasUser;
  override_grade?: string;
  override_score?: number;
  unposted_current_grade?: string;
  unposted_final_grade?: string;
  unposted_current_score?: number;
  unposted_final_score?: number;
  has_grading_periods?: boolean;
  totals_for_all_grading_periods_option?: boolean;
  current_grading_period_title?: string;
  current_grading_period_id?: number;
};

export type CanvasTerm = {
  id: number;
  name: string;
  start_at?: string | null;
  end_at?: string | null;
  created_at: string;
  workflow_state: string;
  grading_period_group_id?: number | null;
  sis_term_id?: string | null;
  sis_import_id?: number | null;
  overrides?: Record<string, {
    start_at?: string;
    end_at?: string;
  }>;
};

export type CanvasCourse = {
  id: number;
  sis_course_id?: string | null;
  uuid: string;
  integration_id?: string | null;
  sis_import_id?: number | null;
  name: string;
  course_code: string;
  original_name?: string;
  workflow_state: CanvasCourseWorkflowState;
  account_id: number;
  root_account_id: number;
  enrollment_term_id: number;
  grading_periods?: any[];
  grading_standard_id?: number | null;
  grade_passback_setting?: string | null;
  created_at: string;
  start_at?: string | null;
  end_at?: string | null;
  locale?: string;
  enrollments?: CanvasEnrollment[];
  total_students?: number;
  calendar?: {
    ics: string;
  };
  default_view?: 'feed' | 'wiki' | 'modules' | 'syllabus' | 'assignments';
  syllabus_body?: string | null;
  needs_grading_count?: number;
  term?: CanvasTerm | null;
  course_progress?: any;
  apply_assignment_group_weights?: boolean;
  permissions?: Record<string, boolean>;
  is_public?: boolean;
  is_public_to_auth_users?: boolean;
  public_syllabus?: boolean;
  public_syllabus_to_auth?: boolean;
  public_description?: string | null;
  storage_quota_mb?: number;
  storage_quota_used_mb?: number;
  hide_final_grades?: boolean;
  license?: string;
  allow_student_assignment_edits?: boolean;
  allow_wiki_comments?: boolean;
  allow_student_forum_attachments?: boolean;
  open_enrollment?: boolean;
  self_enrollment?: boolean;
  restrict_enrollments_to_course_dates?: boolean;
  course_format?: string;
  access_restricted_by_date?: boolean;
  time_zone?: string;
  blueprint?: boolean;
  blueprint_restrictions?: Record<string, boolean>;
  blueprint_restrictions_by_object_type?: Record<string, Record<string, boolean>>;
  template?: boolean;
};

// ============================================================================
// CANVAS ASSIGNMENT TYPES
// ============================================================================

export type CanvasAssignmentType =
  | 'discussion_topic'
  | 'online_quiz'
  | 'on_paper'
  | 'none'
  | 'external_tool'
  | 'online_text_entry'
  | 'online_url'
  | 'online_upload'
  | 'media_recording'
  | 'student_annotation';

export type CanvasGradingType =
  | 'pass_fail'
  | 'percent'
  | 'letter_grade'
  | 'gpa_scale'
  | 'points'
  | 'not_graded';

export type CanvasAssignmentWorkflowState =
  | 'published'
  | 'unpublished'
  | 'deleted';

export type CanvasAssignment = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  due_at: string | null;
  lock_at: string | null;
  unlock_at: string | null;
  has_overrides: boolean;
  all_dates?: any[];
  course_id: number;
  html_url: string;
  submissions_download_url?: string;
  assignment_group_id: number;
  due_date_required: boolean;
  allowed_extensions?: string[];
  max_name_length: number;
  turnitin_enabled?: boolean;
  vericite_enabled?: boolean;
  turnitin_settings?: Record<string, any>;
  grade_group_students_individually?: boolean;
  external_tool_tag_attributes?: Record<string, any>;
  peer_reviews: boolean;
  automatic_peer_reviews: boolean;
  peer_review_count?: number;
  peer_reviews_assign_at?: string | null;
  intra_group_peer_reviews?: boolean;
  group_category_id?: number | null;
  needs_grading_count?: number;
  needs_grading_count_by_section?: Array<{
    section_id: string;
    needs_grading_count: number;
  }>;
  position: number;
  post_to_sis?: boolean;
  integration_id?: string | null;
  integration_data?: Record<string, any>;
  points_possible: number;
  submission_types: CanvasAssignmentType[];
  has_submitted_submissions: boolean;
  grading_type: CanvasGradingType;
  grading_standard_id?: number | null;
  published: boolean;
  unpublishable: boolean;
  only_visible_to_overrides: boolean;
  locked_for_user: boolean;
  lock_info?: Record<string, any>;
  lock_explanation?: string;
  quiz_id?: number;
  anonymous_submissions?: boolean;
  discussion_topic?: Record<string, any>;
  freeze_on_copy?: boolean;
  frozen?: boolean;
  frozen_attributes?: string[];
  submission?: any;
  use_rubric_for_grading?: boolean;
  rubric_settings?: Record<string, any>;
  rubric?: any[];
  assignment_visibility?: number[];
  overrides?: any[];
  omit_from_final_grade?: boolean;
  moderated_grading?: boolean;
  grader_count?: number;
  final_grader_id?: number | null;
  grader_comments_visible_to_graders?: boolean;
  graders_anonymous_to_graders?: boolean;
  grader_names_visible_to_final_grader?: boolean;
  anonymous_grading?: boolean;
  allowed_attempts?: number;
  post_manually?: boolean;
  score_statistics?: {
    min: number;
    max: number;
    mean: number;
  };
  can_submit?: boolean;
  annotatable_attachment_id?: number | null;
  anonymize_students?: boolean;
  require_lockdown_browser?: boolean;
  important_dates?: boolean;
  muted?: boolean;
  anonymous_peer_reviews?: boolean;
  anonymous_instructor_annotations?: boolean;
  graded_submissions_exist?: boolean;
  is_quiz_assignment?: boolean;
  can_duplicate?: boolean;
  original_course_id?: number | null;
  original_assignment_id?: number | null;
  original_assignment_name?: string | null;
  original_quiz_id?: number | null;
  workflow_state: CanvasAssignmentWorkflowState;
  secure_params?: string;
  lti_context_id?: string;
  course_section_id?: number | null;
};

// ============================================================================
// CANVAS SUBMISSION TYPES
// ============================================================================

export type CanvasSubmissionWorkflowState =
  | 'submitted'
  | 'unsubmitted'
  | 'graded'
  | 'pending_review';

export type CanvasSubmissionType =
  | 'online_text_entry'
  | 'online_url'
  | 'online_upload'
  | 'media_recording'
  | 'basic_lti_launch'
  | 'student_annotation';

export type CanvasSubmission = {
  id: number;
  body?: string | null;
  url?: string | null;
  grade?: string | null;
  score?: number | null;
  submitted_at?: string | null;
  assignment_id: number;
  user_id: number;
  submission_type?: CanvasSubmissionType | null;
  workflow_state: CanvasSubmissionWorkflowState;
  grade_matches_current_submission: boolean;
  graded_at?: string | null;
  grader_id?: number | null;
  attempt: number;
  cached_due_date?: string | null;
  excused?: boolean;
  late_policy_status?: 'late' | 'missing' | 'extended' | 'none' | null;
  points_deducted?: number | null;
  grading_period_id?: number | null;
  extra_attempts?: number | null;
  posted_at?: string | null;
  late: boolean;
  missing: boolean;
  seconds_late?: number;
  entered_grade?: string | null;
  entered_score?: number | null;
  preview_url: string;
  anonymous_id?: string;
  user?: CanvasUser;
  submission_history?: CanvasSubmission[];
  submission_comments?: Array<{
    id: number;
    author_id: number;
    author_name: string;
    author: CanvasUser;
    comment: string;
    created_at: string;
    edited_at?: string | null;
    media_comment?: {
      content_type: string;
      display_name: string;
      media_id: string;
      media_type: string;
      url: string;
    };
  }>;
  attachments?: Array<{
    id: number;
    uuid: string;
    folder_id: number;
    display_name: string;
    filename: string;
    content_type: string;
    url: string;
    size: number;
    created_at: string;
    updated_at: string;
    unlock_at?: string | null;
    locked: boolean;
    hidden: boolean;
    lock_at?: string | null;
    hidden_for_user: boolean;
    thumbnail_url?: string | null;
    modified_at: string;
    mime_class: string;
    media_entry_id?: string | null;
    locked_for_user: boolean;
    lock_info?: any;
    lock_explanation?: string;
    preview_url?: string;
  }>;
  rubric_assessment?: Record<string, any>;
  assignment_visible?: boolean;
  turnitin_data?: Record<string, any>;
  vericite_data?: Record<string, any>;
  grade_hidden?: boolean;
};

// ============================================================================
// CANVAS CALENDAR EVENT TYPES
// ============================================================================

export type CanvasCalendarEventType =
  | 'event'
  | 'assignment';

export type CanvasCalendarEvent = {
  id: number;
  title: string;
  start_at: string;
  end_at: string;
  description: string;
  location_name?: string | null;
  location_address?: string | null;
  context_code: string;
  effective_context_code?: string | null;
  all_context_codes?: string;
  workflow_state: 'active' | 'locked' | 'deleted';
  hidden: boolean;
  parent_event_id?: number | null;
  child_events_count?: number;
  child_events?: CanvasCalendarEvent[];
  url: string;
  html_url: string;
  all_day_date?: string | null;
  all_day: boolean;
  created_at: string;
  updated_at: string;
  appointment_group_id?: number | null;
  appointment_group_url?: string | null;
  own_reservation?: boolean;
  reserve_url?: string | null;
  reserved?: boolean;
  participants_per_appointment?: number | null;
  available_slots?: number | null;
  user?: CanvasUser;
  group?: any;
  important_dates?: boolean;
  series_natural_language?: string | null;
  rrule?: string | null;
  series_uuid?: string | null;
  series_head?: boolean;
  blackout_date?: boolean;
};

// ============================================================================
// CANVAS MODULE TYPES
// ============================================================================

export type CanvasModuleWorkflowState = 'active' | 'deleted';
export type CanvasModuleState = 'locked' | 'unlocked' | 'started' | 'completed';

export type CanvasModule = {
  id: number;
  workflow_state: CanvasModuleWorkflowState;
  position: number;
  name: string;
  unlock_at?: string | null;
  require_sequential_progress: boolean;
  prerequisite_module_ids: number[];
  items_count: number;
  items_url: string;
  items?: CanvasModuleItem[];
  state?: CanvasModuleState;
  completed_at?: string | null;
  publish_final_grade: boolean;
  published?: boolean;
};

export type CanvasModuleItemType =
  | 'File'
  | 'Page'
  | 'Discussion'
  | 'Assignment'
  | 'Quiz'
  | 'SubHeader'
  | 'ExternalUrl'
  | 'ExternalTool';

export type CanvasModuleItem = {
  id: number;
  module_id: number;
  position: number;
  title: string;
  indent: number;
  type: CanvasModuleItemType;
  content_id: number;
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
    locked_for_user?: boolean;
    lock_explanation?: string;
    lock_info?: any;
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
  errors?: Array<{
    message: string;
    error_code?: string;
  }>;
};

export type CanvasPaginationParams = {
  page?: number;
  per_page?: number;
};
