/**
 * Canvas Integration Module
 *
 * Central export point for all Canvas LMS integration functionality.
 */

// Configuration
export { CANVAS_CONFIG, CANVAS_ENDPOINTS, CANVAS_OAUTH_ENDPOINTS, CANVAS_SYNC_INTERVALS } from './canvasConfig';

// Consolidated Canvas API Types (from shared types directory)
export type {
  CanvasCourse,
  CanvasEnrollment,
  CanvasEnrollmentType,
  CanvasEnrollmentState,
  CanvasUser,
  CanvasAssignment,
  CanvasAssignmentType,
  CanvasGradingType,
  CanvasSubmission,
  CanvasSubmissionType,
  CanvasSubmissionWorkflowState,
  CanvasCalendarEvent,
  CanvasCalendarEventType,
  CanvasModule,
  CanvasModuleItem,
  CanvasModuleItemType,
  CanvasTerm,
  CanvasApiResponse,
  CanvasPaginationParams,
  CanvasStudentSummary,
  CanvasStudentActivity,
} from '../types/canvas';

// Services (Enhanced versions - recommended for all new code)
export { canvasServiceEnhanced, CanvasServiceEnhanced } from './canvasServiceEnhanced';
export { canvasSyncServiceEnhanced, CanvasSyncServiceEnhanced } from './canvasSyncServiceEnhanced';
export type { SyncStatus, SyncType, SyncProgressCallback } from './canvasSyncServiceEnhanced';

// Transformers
export {
  transformCanvasCourseToClass,
  transformCanvasCoursesToClasses,
  transformCanvasSubmissionToGrade,
  calculateCourseGrade,
  percentageToLetterGrade,
  transformCanvasCalendarEvent,
  transformCanvasCalendarEvents,
  transformCanvasAssignment,
  calculateAssignmentCompletionStats,
  calculateGradeTrends,
} from './canvasTransformers';

export type {
  HapiGrade,
  HapiCalendarEvent,
  HapiAssignment,
} from './canvasTransformers';

// OAuth
export { canvasOAuth } from './canvasOAuth';
export type { CanvasOAuthToken, StoredCanvasToken } from './canvasOAuth';

// Error handling
export {
  CanvasApiError,
  CanvasAuthError,
  CanvasRateLimitError,
  CanvasNotFoundError,
  CanvasNetworkError,
  CanvasServerError,
  CanvasValidationError,
  CanvasTokenExpiredError,
  CanvasSyncError,
  parseCanvasError,
  isCanvasError,
  requiresTokenRefresh,
  requiresReauth,
} from './canvasErrors';

// Encryption utilities
export {
  encryptToken,
  decryptToken,
  validateEncryption,
  redactToken,
  generateOAuthState,
  generatePKCE,
} from './canvasEncryption';

// Rate limiting
export { canvasRateLimiter, RequestPriority } from './canvasRateLimiter';
export type { RateLimitStatus } from './canvasRateLimiter';

// Caching
export { canvasCache } from './canvasCache';

// Department Mapping
export { departmentMapper, mapCourseToDepartment, getDepartmentLabel, isValidDepartment, DEPARTMENT_LABELS } from './departmentMapper';
export type { DepartmentType, DepartmentMapping } from './departmentMapper';
