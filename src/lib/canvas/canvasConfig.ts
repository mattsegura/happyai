/**
 * Canvas LMS API Configuration
 *
 * This file contains configuration for connecting to Canvas LMS.
 * Currently using mock data, but structured for real API integration.
 */

export const CANVAS_CONFIG = {
  // Canvas API base URL (to be set via environment variable)
  API_BASE_URL: import.meta.env.VITE_CANVAS_API_URL || 'https://canvas.instructure.com/api/v1',

  // Canvas API access token (to be set via environment variable)
  ACCESS_TOKEN: import.meta.env.VITE_CANVAS_ACCESS_TOKEN || '',

  // Use mock data instead of real Canvas API
  USE_MOCK_DATA: import.meta.env.VITE_USE_CANVAS_MOCK !== 'false',

  // API request timeout (milliseconds)
  REQUEST_TIMEOUT: 10000,

  // Rate limiting
  MAX_REQUESTS_PER_SECOND: 10,

  // Pagination
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
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
