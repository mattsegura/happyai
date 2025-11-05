/**
 * Unit Tests for Validation Utilities
 *
 * Tests all validation functions in src/lib/utils/validation.ts
 * Ensures 100% code coverage with comprehensive edge case testing.
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  validatePassword,
  isValidURL,
  isNotEmpty,
  isValidLength,
  isInRange,
  isValidGrade,
  isValidPoints,
  isValidPhone,
  isValidClassCode,
  isValidUniversityEmail,
  sanitizeString,
  isValidJSON,
  hasRequiredFields,
  isValidHexColor,
  isValidSentiment,
  isValidIntensity,
  isValidFileSize,
  isValidFileExtension,
  isValidUUID,
  hasItems,
  hasProperties,
} from '@/lib/utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('student@university.edu')).toBe(true);
      expect(isValidEmail('test.user@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.org')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user domain@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return valid for strong passwords', () => {
      const result = validatePassword('StrongPass123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for short passwords', () => {
      const result = validatePassword('Short1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should return errors for passwords without uppercase', () => {
      const result = validatePassword('lowercase123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should return errors for passwords without lowercase', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should return errors for passwords without numbers', () => {
      const result = validatePassword('NoNumbers');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return multiple errors for weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('isValidURL', () => {
    it('should return true for valid URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://university.edu')).toBe(true);
      expect(isValidURL('https://example.com/path?query=value')).toBe(true);
      expect(isValidURL('https://sub.domain.example.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidURL('not-a-url')).toBe(false);
      expect(isValidURL('')).toBe(false);
      expect(isValidURL('example.com')).toBe(false); // missing protocol
    });
  });

  describe('isNotEmpty', () => {
    it('should return true for non-empty strings', () => {
      expect(isNotEmpty('hello')).toBe(true);
      expect(isNotEmpty(' text ')).toBe(true);
    });

    it('should return false for empty or whitespace strings', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
      expect(isNotEmpty(null)).toBe(false);
      expect(isNotEmpty(undefined)).toBe(false);
    });
  });

  describe('isValidLength', () => {
    it('should return true for strings within length range', () => {
      expect(isValidLength('hello', 1, 10)).toBe(true);
      expect(isValidLength('test', 4, 4)).toBe(true);
      expect(isValidLength('  trim  ', 1, 10)).toBe(true); // trims whitespace
    });

    it('should return false for strings outside length range', () => {
      expect(isValidLength('', 1, 10)).toBe(false);
      expect(isValidLength('short', 10, 20)).toBe(false);
      expect(isValidLength('this is a very long string', 1, 10)).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should return true for numbers within range', () => {
      expect(isInRange(5, 0, 10)).toBe(true);
      expect(isInRange(0, 0, 10)).toBe(true); // boundary
      expect(isInRange(10, 0, 10)).toBe(true); // boundary
      expect(isInRange(-5, -10, 0)).toBe(true);
    });

    it('should return false for numbers outside range', () => {
      expect(isInRange(11, 0, 10)).toBe(false);
      expect(isInRange(-1, 0, 10)).toBe(false);
      expect(isInRange(100, 0, 10)).toBe(false);
    });
  });

  describe('isValidGrade', () => {
    it('should return true for valid grades (0-100)', () => {
      expect(isValidGrade(0)).toBe(true);
      expect(isValidGrade(50)).toBe(true);
      expect(isValidGrade(100)).toBe(true);
      expect(isValidGrade(85.5)).toBe(true);
    });

    it('should return false for invalid grades', () => {
      expect(isValidGrade(-1)).toBe(false);
      expect(isValidGrade(101)).toBe(false);
      expect(isValidGrade(150)).toBe(false);
    });
  });

  describe('isValidPoints', () => {
    it('should return true for valid points', () => {
      expect(isValidPoints(0)).toBe(true);
      expect(isValidPoints(100)).toBe(true);
      expect(isValidPoints(10.5)).toBe(true);
    });

    it('should return false for invalid points', () => {
      expect(isValidPoints(-1)).toBe(false);
      expect(isValidPoints(Infinity)).toBe(false);
      expect(isValidPoints(-Infinity)).toBe(false);
      expect(isValidPoints(NaN)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should return true for valid US phone numbers', () => {
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('123.456.7890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('not-a-phone')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('12345678901')).toBe(false); // too long
    });
  });

  describe('isValidClassCode', () => {
    it('should return true for valid class codes', () => {
      expect(isValidClassCode('ABC123')).toBe(true);
      expect(isValidClassCode('CLASS123456')).toBe(true);
      expect(isValidClassCode('abc123')).toBe(true); // case insensitive
    });

    it('should return false for invalid class codes', () => {
      expect(isValidClassCode('SHORT')).toBe(false); // too short (5 chars)
      expect(isValidClassCode('TOOLONGCODE12')).toBe(false); // too long (13 chars)
      expect(isValidClassCode('ABC-123')).toBe(false); // special chars
      expect(isValidClassCode('ABC 123')).toBe(false); // space
      expect(isValidClassCode('')).toBe(false);
    });
  });

  describe('isValidUniversityEmail', () => {
    const allowedDomains = ['university.edu', 'college.edu'];

    it('should return true for emails with allowed domains', () => {
      expect(isValidUniversityEmail('student@university.edu', allowedDomains)).toBe(true);
      expect(isValidUniversityEmail('user@college.edu', allowedDomains)).toBe(true);
      expect(isValidUniversityEmail('User@UNIVERSITY.EDU', allowedDomains)).toBe(true); // case insensitive
    });

    it('should return false for emails with disallowed domains', () => {
      expect(isValidUniversityEmail('user@gmail.com', allowedDomains)).toBe(false);
      expect(isValidUniversityEmail('user@example.com', allowedDomains)).toBe(false);
    });

    it('should return false for invalid email format', () => {
      expect(isValidUniversityEmail('invalid', allowedDomains)).toBe(false);
      expect(isValidUniversityEmail('', allowedDomains)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
      expect(sanitizeString('<div>Hello</div>')).toBe('Hello');
      expect(sanitizeString('<b>Bold</b> <i>Italic</i>')).toBe('Bold Italic');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('\n\ttabs\n')).toBe('tabs');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });

    it('should handle strings with no tags', () => {
      expect(sanitizeString('plain text')).toBe('plain text');
    });
  });

  describe('isValidJSON', () => {
    it('should return true for valid JSON strings', () => {
      expect(isValidJSON('{}')).toBe(true);
      expect(isValidJSON('[]')).toBe(true);
      expect(isValidJSON('{"key": "value"}')).toBe(true);
      expect(isValidJSON('[1, 2, 3]')).toBe(true);
      expect(isValidJSON('null')).toBe(true);
    });

    it('should return false for invalid JSON strings', () => {
      expect(isValidJSON('{')).toBe(false);
      expect(isValidJSON('invalid')).toBe(false);
      expect(isValidJSON('')).toBe(false);
      expect(isValidJSON('{key: value}')).toBe(false); // unquoted keys
    });
  });

  describe('hasRequiredFields', () => {
    it('should return true when all required fields are present', () => {
      const obj = { name: 'John', email: 'john@example.com', age: 25 };
      expect(hasRequiredFields(obj, ['name', 'email'])).toBe(true);
      expect(hasRequiredFields(obj, ['name', 'email', 'age'])).toBe(true);
    });

    it('should return false when required fields are missing', () => {
      const obj = { name: 'John', email: '' };
      expect(hasRequiredFields(obj, ['name', 'email', 'age'])).toBe(false);
      expect(hasRequiredFields(obj, ['email'])).toBe(false); // email is empty string
    });

    it('should return false when required fields are null or undefined', () => {
      const obj = { name: 'John', email: null, age: undefined };
      expect(hasRequiredFields(obj, ['email'])).toBe(false);
      expect(hasRequiredFields(obj, ['age'])).toBe(false);
    });
  });

  describe('isValidHexColor', () => {
    it('should return true for valid hex colors', () => {
      expect(isValidHexColor('#FFF')).toBe(true);
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#abc')).toBe(true);
      expect(isValidHexColor('#123456')).toBe(true);
    });

    it('should return false for invalid hex colors', () => {
      expect(isValidHexColor('FFF')).toBe(false); // missing #
      expect(isValidHexColor('#GGG')).toBe(false); // invalid hex
      expect(isValidHexColor('#12')).toBe(false); // too short
      expect(isValidHexColor('#1234567')).toBe(false); // too long
      expect(isValidHexColor('')).toBe(false);
    });
  });

  describe('isValidSentiment', () => {
    it('should return true for valid sentiment levels (1-6)', () => {
      expect(isValidSentiment(1)).toBe(true);
      expect(isValidSentiment(3)).toBe(true);
      expect(isValidSentiment(6)).toBe(true);
    });

    it('should return false for invalid sentiment levels', () => {
      expect(isValidSentiment(0)).toBe(false);
      expect(isValidSentiment(7)).toBe(false);
      expect(isValidSentiment(3.5)).toBe(false); // not integer
      expect(isValidSentiment(-1)).toBe(false);
    });
  });

  describe('isValidIntensity', () => {
    it('should return true for valid intensity levels (1-7)', () => {
      expect(isValidIntensity(1)).toBe(true);
      expect(isValidIntensity(4)).toBe(true);
      expect(isValidIntensity(7)).toBe(true);
    });

    it('should return false for invalid intensity levels', () => {
      expect(isValidIntensity(0)).toBe(false);
      expect(isValidIntensity(8)).toBe(false);
      expect(isValidIntensity(3.5)).toBe(false); // not integer
      expect(isValidIntensity(-1)).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('should return true for files within size limit', () => {
      expect(isValidFileSize(1024 * 1024, 2)).toBe(true); // 1MB, limit 2MB
      expect(isValidFileSize(0, 5)).toBe(true); // empty file
      expect(isValidFileSize(5 * 1024 * 1024, 5)).toBe(true); // exactly at limit
    });

    it('should return false for files exceeding size limit', () => {
      expect(isValidFileSize(10 * 1024 * 1024, 5)).toBe(false); // 10MB, limit 5MB
      expect(isValidFileSize(6 * 1024 * 1024, 5)).toBe(false); // 6MB, limit 5MB
    });
  });

  describe('isValidFileExtension', () => {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    it('should return true for files with allowed extensions', () => {
      expect(isValidFileExtension('photo.jpg', allowedExtensions)).toBe(true);
      expect(isValidFileExtension('image.PNG', allowedExtensions)).toBe(true); // case insensitive
      expect(isValidFileExtension('animated.gif', allowedExtensions)).toBe(true);
    });

    it('should return false for files with disallowed extensions', () => {
      expect(isValidFileExtension('document.pdf', allowedExtensions)).toBe(false);
      expect(isValidFileExtension('script.js', allowedExtensions)).toBe(false);
      expect(isValidFileExtension('file', allowedExtensions)).toBe(false); // no extension
    });

    it('should handle edge cases', () => {
      expect(isValidFileExtension('', allowedExtensions)).toBe(false);
      expect(isValidFileExtension('.jpg', allowedExtensions)).toBe(true);
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
      expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true); // uppercase
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('invalid-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false); // too short
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false); // too long
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('not-a-uuid-at-all')).toBe(false);
    });
  });

  describe('hasItems', () => {
    it('should return true for arrays with items', () => {
      expect(hasItems([1, 2, 3])).toBe(true);
      expect(hasItems(['a'])).toBe(true);
      expect(hasItems([null])).toBe(true); // has one item (null)
    });

    it('should return false for empty arrays', () => {
      expect(hasItems([])).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(hasItems(null)).toBe(false);
      expect(hasItems(undefined)).toBe(false);
    });
  });

  describe('hasProperties', () => {
    it('should return true for objects with properties', () => {
      expect(hasProperties({ a: 1 })).toBe(true);
      expect(hasProperties({ name: 'John', age: 30 })).toBe(true);
    });

    it('should return false for empty objects', () => {
      expect(hasProperties({})).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(hasProperties(null)).toBe(false);
      expect(hasProperties(undefined)).toBe(false);
    });
  });
});
