/**
 * Canvas LMS API Configuration
 *
 * This file contains configuration for connecting to Canvas LMS.
 * Currently using mock data, but structured for real API integration.
 */

export const CANVAS_CONFIG = {
  // ============================================================================
  // CANVAS INSTANCE CONFIGURATION
  // ============================================================================

  // Canvas instance URL (without trailing slash)
  INSTANCE_URL: import.meta.env.VITE_CANVAS_INSTANCE_URL || 'https://canvas.instructure.com',

  // Canvas API base path
  API_PATH: import.meta.env.VITE_CANVAS_API_PATH || '/api/v1',

  // Full API base URL (computed)
  get API_BASE_URL() {
    return `${this.INSTANCE_URL}${this.API_PATH}`;
  },

  // ============================================================================
  // OAUTH CONFIGURATION
  // ============================================================================

  // OAuth Client ID
  CLIENT_ID: import.meta.env.VITE_CANVAS_CLIENT_ID || '',

  // OAuth Redirect URI
  REDIRECT_URI: import.meta.env.VITE_CANVAS_REDIRECT_URI || `${window.location.origin}/academics/canvas/callback`,

  // OAuth Scopes (Canvas permissions to request)
  OAUTH_SCOPES: [
    'url:GET|/api/v1/courses',
    'url:GET|/api/v1/courses/:id',
    'url:GET|/api/v1/courses/:course_id/assignments',
    'url:GET|/api/v1/courses/:course_id/assignments/:id/submissions',
    'url:GET|/api/v1/calendar_events',
    'url:GET|/api/v1/courses/:course_id/modules',
    'url:GET|/api/v1/courses/:course_id/analytics',
    'url:GET|/api/v1/users/self',
  ].join(' '),

  // ============================================================================
  // MOCK DATA TOGGLE
  // ============================================================================

  // Use mock data instead of real Canvas API
  USE_MOCK_DATA: import.meta.env.VITE_USE_CANVAS_MOCK !== 'false',

  // ============================================================================
  // API REQUEST CONFIGURATION
  // ============================================================================

  // API request timeout (milliseconds)
  REQUEST_TIMEOUT: parseInt(import.meta.env.VITE_CANVAS_API_TIMEOUT || '10000', 10),

  // ============================================================================
  // RATE LIMITING CONFIGURATION
  // ============================================================================

  // Canvas rate limit (requests per hour)
  // Default: 600 requests/hour (Canvas's limit)
  RATE_LIMIT_PER_HOUR: parseInt(import.meta.env.VITE_CANVAS_RATE_LIMIT || '600', 10),

  // Computed: requests per minute (safe limit)
  get RATE_LIMIT_PER_MINUTE() {
    return Math.floor(this.RATE_LIMIT_PER_HOUR / 60);
  },

  // Computed: requests per second (very conservative)
  get RATE_LIMIT_PER_SECOND() {
    return Math.max(1, Math.floor(this.RATE_LIMIT_PER_MINUTE / 60));
  },

  // ============================================================================
  // PAGINATION CONFIGURATION
  // ============================================================================

  // Default number of items per page
  DEFAULT_PAGE_SIZE: 50,

  // Maximum items per page (Canvas allows up to 100)
  MAX_PAGE_SIZE: 100,

  // ============================================================================
  // CACHING CONFIGURATION
  // ============================================================================

  // Cache TTL in milliseconds
  CACHE_TTL_MS: parseInt(import.meta.env.VITE_CANVAS_CACHE_TTL || '15', 10) * 60 * 1000,

  // ============================================================================
  // SYNC CONFIGURATION
  // ============================================================================

  // Auto-sync interval in milliseconds (0 = disabled)
  SYNC_INTERVAL_MS: parseInt(import.meta.env.VITE_CANVAS_SYNC_INTERVAL || '30', 10) * 60 * 1000,

  // Whether auto-sync is enabled
  get AUTO_SYNC_ENABLED() {
    return this.SYNC_INTERVAL_MS > 0;
  },
} as const;

/**
 * Canvas OAuth endpoints
 */
export const CANVAS_OAUTH_ENDPOINTS = {
  // OAuth authorization endpoint (full URL)
  AUTHORIZE: (instanceUrl: string) => `${instanceUrl}/login/oauth2/auth`,

  // OAuth token endpoint (full URL)
  TOKEN: (instanceUrl: string) => `${instanceUrl}/login/oauth2/token`,

  // OAuth token revocation endpoint (full URL)
  REVOKE: (instanceUrl: string) => `${instanceUrl}/login/oauth2/token`,
} as const;

/**
 * Canvas API endpoints
 */
export const CANVAS_ENDPOINTS = {
  // Courses
  COURSES: '/courses',
  COURSE_DETAIL: (courseId: string) => `/courses/${courseId}`,
  COURSE_STUDENTS: (courseId: string) => `/courses/${courseId}/students`,

  // Assignments
  ASSIGNMENTS: (courseId: string) => `/courses/${courseId}/assignments`,
  ASSIGNMENT_DETAIL: (courseId: string, assignmentId: string) =>
    `/courses/${courseId}/assignments/${assignmentId}`,
  ASSIGNMENT_SUBMISSIONS: (courseId: string, assignmentId: string) =>
    `/courses/${courseId}/assignments/${assignmentId}/submissions`,

  // Grades
  COURSE_GRADES: (courseId: string) => `/courses/${courseId}/enrollments`,
  USER_GRADES: (userId: string) => `/users/${userId}/enrollments`,

  // Calendar
  CALENDAR_EVENTS: '/calendar_events',
  USER_CALENDAR: (userId: string) => `/users/${userId}/calendar_events`,

  // Modules
  COURSE_MODULES: (courseId: string) => `/courses/${courseId}/modules`,
  MODULE_ITEMS: (courseId: string, moduleId: string) =>
    `/courses/${courseId}/modules/${moduleId}/items`,

  // Analytics
  COURSE_ANALYTICS: (courseId: string) => `/courses/${courseId}/analytics/student_summaries`,
  STUDENT_ANALYTICS: (courseId: string, studentId: string) =>
    `/courses/${courseId}/analytics/users/${studentId}/activity`,

  // Users
  USER_PROFILE: (userId: string) => `/users/${userId}/profile`,
  CURRENT_USER: '/users/self',
} as const;

/**
 * Canvas data sync intervals (milliseconds)
 */
export const CANVAS_SYNC_INTERVALS = {
  COURSES: 1000 * 60 * 30, // 30 minutes
  ASSIGNMENTS: 1000 * 60 * 15, // 15 minutes
  GRADES: 1000 * 60 * 10, // 10 minutes
  CALENDAR: 1000 * 60 * 60, // 1 hour
  ANALYTICS: 1000 * 60 * 60 * 6, // 6 hours
} as const;
