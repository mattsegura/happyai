/**
 * Application Configuration
 *
 * Centralized configuration for HapiAI platform.
 * Values can be overridden via environment variables (.env file).
 */

// Auth Configuration
export const AUTH_CONFIG = {
  // Safety timeout for auth state initialization (in milliseconds)
  // Prevents infinite loading if auth state doesn't resolve
  SAFETY_TIMEOUT: parseInt(import.meta.env.VITE_AUTH_TIMEOUT || '10000', 10),
} as const;

// Admin Dashboard Configuration
export const ADMIN_CONFIG = {
  // Maximum number of students to show in sentiment alerts
  STUDENT_ALERTS_LIMIT: parseInt(import.meta.env.VITE_STUDENT_ALERTS_LIMIT || '10', 10),

  // Page size for user management pagination
  USER_PAGE_SIZE: parseInt(import.meta.env.VITE_ADMIN_USER_PAGE_SIZE || '50', 10),

  // Page size for class management pagination
  CLASS_PAGE_SIZE: parseInt(import.meta.env.VITE_ADMIN_CLASS_PAGE_SIZE || '30', 10),
} as const;

// Report Generation Configuration
export const REPORT_CONFIG = {
  // Rate limit for report generation (in seconds)
  RATE_LIMIT_SECONDS: parseInt(import.meta.env.VITE_REPORT_RATE_LIMIT || '10', 10),
} as const;
