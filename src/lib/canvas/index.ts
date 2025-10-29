/**
 * Canvas Integration Module
 *
 * Central export point for all Canvas LMS integration functionality.
 */

// Configuration
export { CANVAS_CONFIG, CANVAS_ENDPOINTS, CANVAS_OAUTH_ENDPOINTS, CANVAS_SYNC_INTERVALS } from './canvasConfig';

// Official Canvas API Types (matches Canvas API v1 exactly)
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
  CanvasApiError,
  CanvasPaginationParams,
} from './canvasTypesOfficial';

// Legacy types (for backward compatibility with mock data)
export type {
  CanvasStudentSummary,
  CanvasStudentActivity,
} from './canvasTypes';

// Services
export { canvasService, CanvasService } from './canvasService';
export { canvasServiceEnhanced, CanvasServiceEnhanced } from './canvasServiceEnhanced';
export { canvasSyncService, CanvasSyncService } from './canvasSyncService';
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
