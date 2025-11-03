/**
 * Validation Utilities
 *
 * Centralized validation functions for forms, user input, and data integrity.
 * Use these instead of inline validation to maintain consistency.
 *
 * Created: 2025-11-04 (Phase 3: Code Deduplication)
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Returns { valid: boolean, errors: string[] }
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate if string is not empty
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Validate string length
 */
export function isValidLength(
  value: string,
  min: number,
  max: number
): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate number range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate grade (0-100)
 */
export function isValidGrade(grade: number): boolean {
  return isInRange(grade, 0, 100);
}

/**
 * Validate points (must be positive)
 */
export function isValidPoints(points: number): boolean {
  return points >= 0 && Number.isFinite(points);
}

/**
 * Validate phone number (basic US format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

/**
 * Validate class code format (alphanumeric, 6-12 characters)
 */
export function isValidClassCode(code: string): boolean {
  const codeRegex = /^[A-Z0-9]{6,12}$/;
  return codeRegex.test(code.toUpperCase());
}

/**
 * Validate university email domain
 */
export function isValidUniversityEmail(
  email: string,
  allowedDomains: string[]
): boolean {
  if (!isValidEmail(email)) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.some((d) => domain === d.toLowerCase());
}

/**
 * Sanitize string (remove HTML tags, trim whitespace)
 */
export function sanitizeString(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate JSON string
 */
export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate required fields in object
 */
export function hasRequiredFields<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[]
): boolean {
  return requiredFields.every((field) => {
    const value = obj[field];
    return value !== null && value !== undefined && value !== '';
  });
}

/**
 * Validate hex color code
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
  return hexRegex.test(color);
}

/**
 * Validate sentiment level (1-6 in HapiAI)
 */
export function isValidSentiment(sentiment: number): boolean {
  return Number.isInteger(sentiment) && isInRange(sentiment, 1, 6);
}

/**
 * Validate intensity level (1-7 in HapiAI)
 */
export function isValidIntensity(intensity: number): boolean {
  return Number.isInteger(intensity) && isInRange(intensity, 1, 7);
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(sizeInBytes: number, maxMB: number): boolean {
  const maxBytes = maxMB * 1024 * 1024;
  return sizeInBytes <= maxBytes;
}

/**
 * Validate file extension
 */
export function isValidFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate array has items
 */
export function hasItems<T>(array: T[] | null | undefined): boolean {
  return Array.isArray(array) && array.length > 0;
}

/**
 * Validate object has properties
 */
export function hasProperties(obj: Record<string, unknown> | null | undefined): boolean {
  return obj !== null && obj !== undefined && Object.keys(obj).length > 0;
}
