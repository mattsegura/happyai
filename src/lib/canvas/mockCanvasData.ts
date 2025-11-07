/**
 * Mock Canvas LMS Data
 *
 * Comprehensive mock data for Canvas API responses
 * Used when VITE_USE_CANVAS_MOCK=true
 *
 * This allows the app to function without a real Canvas connection
 */

import type {
  CanvasCourse,
  CanvasAssignment,
  CanvasSubmission,
  CanvasCalendarEvent,
  CanvasModule,
  CanvasModuleItem,
} from '../types/canvas';

// ============================================================================
// MOCK COURSES
// ============================================================================

export const mockCanvasCourses: CanvasCourse[] = [
  {
    id: 'course-1',
    name: 'Introduction to Psychology',
    course_code: 'PSYCH 101',
    workflow_state: 'available',
    account_id: '1',
    start_at: '2024-09-01T00:00:00Z',
    end_at: '2024-12-15T23:59:59Z',
    enrollments: [
      {
        type: 'TeacherEnrollment',
        role: 'TeacherEnrollment',
        user_id: 'teacher-1',
        enrollment_state: 'active',
      },
    ],
    total_students: 28,
    calendar: {
      ics: 'https://canvas.example.com/feeds/calendars/course_1.ics',
    },
  },
  {
    id: 'course-2',
    name: 'English Literature',
    course_code: 'ENG 201',
    workflow_state: 'available',
    account_id: '1',
    start_at: '2024-09-01T00:00:00Z',
    end_at: '2024-12-15T23:59:59Z',
    enrollments: [
      {
        type: 'TeacherEnrollment',
        role: 'TeacherEnrollment',
        user_id: 'teacher-1',
        enrollment_state: 'active',
      },
    ],
    total_students: 24,
    calendar: {
      ics: 'https://canvas.example.com/feeds/calendars/course_2.ics',
    },
  },
  {
    id: 'course-3',
    name: 'World History',
    course_code: 'HIST 101',
    workflow_state: 'available',
    account_id: '1',
    start_at: '2024-09-01T00:00:00Z',
    end_at: '2024-12-15T23:59:59Z',
    enrollments: [
      {
        type: 'TeacherEnrollment',
        role: 'TeacherEnrollment',
        user_id: 'teacher-1',
        enrollment_state: 'active',
      },
    ],
    total_students: 30,
    calendar: {
      ics: 'https://canvas.example.com/feeds/calendars/course_3.ics',
    },
  },
];

// ============================================================================
// MOCK ASSIGNMENTS
// ============================================================================

export const mockCanvasAssignments: CanvasAssignment[] = [
  // Psychology Course Assignments
  {
    id: 'assignment-1',
    name: 'Chapter 1 Quiz',
    description: 'Quiz covering introduction to psychology',
    due_at: '2024-09-15T23:59:59Z',
    points_possible: 100,
    grading_type: 'points',
    submission_types: ['online_quiz'],
    course_id: 'course-1',
    workflow_state: 'published',
  },
  {
    id: 'assignment-2',
    name: 'Research Paper: Cognitive Psychology',
    description: 'Write a 5-page research paper on cognitive psychology topics',
    due_at: '2024-10-01T23:59:59Z',
    points_possible: 100,
    grading_type: 'points',
    submission_types: ['online_upload'],
    course_id: 'course-1',
    workflow_state: 'published',
  },
  {
    id: 'assignment-3',
    name: 'Midterm Exam',
    description: 'Comprehensive exam covering chapters 1-5',
    due_at: '2024-10-20T23:59:59Z',
    points_possible: 200,
    grading_type: 'points',
    submission_types: ['online_quiz'],
    course_id: 'course-1',
    workflow_state: 'published',
  },
  {
    id: 'assignment-4',
    name: 'Weekly Discussion: Social Psychology',
    description: 'Participate in the discussion on social psychology concepts',
    due_at: '2024-11-01T23:59:59Z',
    points_possible: 50,
    grading_type: 'points',
    submission_types: ['discussion_topic'],
    course_id: 'course-1',
    workflow_state: 'published',
  },
  // English Literature Assignments
  {
    id: 'assignment-5',
    name: 'Shakespeare Essay',
    description: 'Analyze a Shakespeare play of your choice',
    due_at: '2024-09-25T23:59:59Z',
    points_possible: 100,
    grading_type: 'points',
    submission_types: ['online_upload'],
    course_id: 'course-2',
    workflow_state: 'published',
  },
  {
    id: 'assignment-6',
    name: 'Poetry Analysis',
    description: 'Analyze and discuss selected poems',
    due_at: '2024-10-10T23:59:59Z',
    points_possible: 75,
    grading_type: 'points',
    submission_types: ['online_text_entry'],
    course_id: 'course-2',
    workflow_state: 'published',
  },
  // History Assignments
  {
    id: 'assignment-7',
    name: 'Ancient Civilizations Project',
    description: 'Research project on ancient civilizations',
    due_at: '2024-09-30T23:59:59Z',
    points_possible: 150,
    grading_type: 'points',
    submission_types: ['online_upload'],
    course_id: 'course-3',
    workflow_state: 'published',
  },
  {
    id: 'assignment-8',
    name: 'Weekly Quiz: World War II',
    description: 'Quiz on WWII events and significance',
    due_at: '2024-10-05T23:59:59Z',
    points_possible: 50,
    grading_type: 'points',
    submission_types: ['online_quiz'],
    course_id: 'course-3',
    workflow_state: 'published',
  },
];

// ============================================================================
// MOCK SUBMISSIONS
// ============================================================================

export const mockCanvasSubmissions: CanvasSubmission[] = [
  // Student submissions for various assignments
  {
    id: 'sub-1',
    assignment_id: 'assignment-1',
    user_id: 'student-1',
    workflow_state: 'graded',
    score: 85,
    grade: '85',
    submitted_at: '2024-09-14T18:30:00Z',
    graded_at: '2024-09-16T10:00:00Z',
    late: false,
    missing: false,
    excused: false,
  },
  {
    id: 'sub-2',
    assignment_id: 'assignment-1',
    user_id: 'student-2',
    workflow_state: 'graded',
    score: 92,
    grade: '92',
    submitted_at: '2024-09-15T12:00:00Z',
    graded_at: '2024-09-16T10:15:00Z',
    late: false,
    missing: false,
    excused: false,
  },
  {
    id: 'sub-3',
    assignment_id: 'assignment-1',
    user_id: 'student-3',
    workflow_state: 'submitted',
    submitted_at: '2024-09-16T22:00:00Z',
    late: true,
    missing: false,
    excused: false,
  },
  {
    id: 'sub-4',
    assignment_id: 'assignment-2',
    user_id: 'student-1',
    workflow_state: 'graded',
    score: 78,
    grade: '78',
    submitted_at: '2024-10-01T20:00:00Z',
    graded_at: '2024-10-03T14:00:00Z',
    late: false,
    missing: false,
    excused: false,
  },
  {
    id: 'sub-5',
    assignment_id: 'assignment-2',
    user_id: 'student-2',
    workflow_state: 'graded',
    score: 95,
    grade: '95',
    submitted_at: '2024-09-30T16:00:00Z',
    graded_at: '2024-10-03T14:30:00Z',
    late: false,
    missing: false,
    excused: false,
  },
];

// ============================================================================
// MOCK CALENDAR EVENTS
// ============================================================================

export const mockCanvasCalendarEvents: CanvasCalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Psychology Lecture: Introduction',
    start_at: '2024-09-05T09:00:00Z',
    end_at: '2024-09-05T10:30:00Z',
    description: 'First lecture covering course syllabus and introduction to psychology',
    location_name: 'Room 101',
    workflow_state: 'active',
    context_code: 'course_course-1',
  },
  {
    id: 'event-2',
    title: 'English Literature: Shakespeare Discussion',
    start_at: '2024-09-10T14:00:00Z',
    end_at: '2024-09-10T15:30:00Z',
    description: 'In-depth discussion of Hamlet',
    location_name: 'Room 205',
    workflow_state: 'active',
    context_code: 'course_course-2',
  },
  {
    id: 'event-3',
    title: 'History Exam Review Session',
    start_at: '2024-10-04T16:00:00Z',
    end_at: '2024-10-04T18:00:00Z',
    description: 'Review session for upcoming exam',
    location_name: 'Room 303',
    workflow_state: 'active',
    context_code: 'course_course-3',
  },
];

// ============================================================================
// MOCK MODULES
// ============================================================================

export const mockCanvasModules: CanvasModule[] = [
  {
    id: 'module-1',
    name: 'Introduction to Psychology',
    position: 1,
    workflow_state: 'active',
    items_count: 5,
    items_url: '/api/v1/courses/course-1/modules/module-1/items',
  },
  {
    id: 'module-2',
    name: 'Cognitive Psychology',
    position: 2,
    workflow_state: 'active',
    items_count: 7,
    items_url: '/api/v1/courses/course-1/modules/module-2/items',
  },
  {
    id: 'module-3',
    name: 'Shakespeare & Drama',
    position: 1,
    workflow_state: 'active',
    items_count: 6,
    items_url: '/api/v1/courses/course-2/modules/module-3/items',
  },
];

// ============================================================================
// MOCK MODULE ITEMS
// ============================================================================

export const mockCanvasModuleItems: CanvasModuleItem[] = [
  {
    id: 'item-1',
    module_id: 'module-1',
    position: 1,
    title: 'Course Syllabus',
    type: 'File',
    content_id: 'file-1',
    html_url: '/courses/course-1/files/file-1',
    url: '/api/v1/courses/course-1/files/file-1',
  },
  {
    id: 'item-2',
    module_id: 'module-1',
    position: 2,
    title: 'Introduction Lecture Slides',
    type: 'File',
    content_id: 'file-2',
    html_url: '/courses/course-1/files/file-2',
    url: '/api/v1/courses/course-1/files/file-2',
  },
  {
    id: 'item-3',
    module_id: 'module-1',
    position: 3,
    title: 'Chapter 1 Reading',
    type: 'Page',
    content_id: 'page-1',
    html_url: '/courses/course-1/pages/page-1',
    url: '/api/v1/courses/course-1/pages/page-1',
  },
];

// ============================================================================
// MOCK STUDENT SUMMARIES (for analytics)
// ============================================================================

export const mockCanvasStudentSummaries = [
  {
    id: 'student-1',
    name: 'Alex Johnson',
    sortable_name: 'Johnson, Alex',
    short_name: 'Alex',
    page_views: 45,
    participations: 12,
    max_page_views: 100,
    max_participations: 20,
  },
  {
    id: 'student-2',
    name: 'Sarah Martinez',
    sortable_name: 'Martinez, Sarah',
    short_name: 'Sarah',
    page_views: 82,
    participations: 18,
    max_page_views: 100,
    max_participations: 20,
  },
  {
    id: 'student-3',
    name: 'Michael Chen',
    sortable_name: 'Chen, Michael',
    short_name: 'Michael',
    page_views: 23,
    participations: 5,
    max_page_views: 100,
    max_participations: 20,
  },
];
