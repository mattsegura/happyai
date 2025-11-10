/**
 * Unit Tests for Date Utilities
 *
 * Tests all date formatting, manipulation, and comparison functions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCurrentDateISO,
  formatDateLocal,
  formatDateTimeLocal,
  formatDateReadable,
  formatDateShort,
  formatTimeOnly,
  formatRelativeTime,
  isToday,
  isPast,
  isFuture,
  isWithinDays,
  addDays,
  subtractDays,
  startOfDay,
  endOfDay,
  daysBetween,
  hoursBetween,
  formatDuration,
  isDueSoon,
  isOverdue,
  formatForAPI,
  parseDateSafe,
  getWeekNumber,
  getDayName,
  getMonthName,
} from '@/lib/utils/dates';

describe('Date Utilities', () => {
  describe('getCurrentDateISO', () => {
    it('should return ISO string', () => {
      const result = getCurrentDateISO();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return valid ISO 8601 format', () => {
      const result = getCurrentDateISO();
      // Verify it matches ISO 8601 format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      // Verify it's a valid date
      expect(new Date(result).toISOString()).toBe(result);
    });
  });

  describe('formatDateLocal', () => {
    it('should format Date object', () => {
      const date = new Date('2025-11-04T12:00:00Z');
      const result = formatDateLocal(date);
      expect(result).toContain('11/');
      expect(result).toContain('/2025');
    });

    it('should format ISO string', () => {
      const result = formatDateLocal('2025-11-04T12:00:00Z');
      expect(result).toContain('11/');
      expect(result).toContain('/2025');
    });
  });

  describe('formatDateTimeLocal', () => {
    it('should format date and time', () => {
      const date = new Date('2025-11-04T14:30:00Z');
      const result = formatDateTimeLocal(date);
      expect(result).toBeTruthy();
      expect(result).toContain('/');
    });
  });

  describe('formatDateReadable', () => {
    it('should format as "MMM DD, YYYY"', () => {
      const date = new Date('2025-11-04');
      const result = formatDateReadable(date);
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/);
    });

    it('should handle string input', () => {
      const result = formatDateReadable('2025-11-04');
      expect(result).toBeTruthy();
    });
  });

  describe('formatDateShort', () => {
    it('should format as "MMM DD"', () => {
      const date = new Date('2025-11-04');
      const result = formatDateShort(date);
      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
    });
  });

  describe('formatTimeOnly', () => {
    it('should format time with AM/PM', () => {
      const date = new Date('2025-11-04T14:30:00');
      const result = formatTimeOnly(date);
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    });

    it('should handle morning time', () => {
      const date = new Date('2025-11-04T09:15:00');
      const result = formatTimeOnly(date);
      expect(result).toContain('AM');
    });

    it('should handle afternoon time', () => {
      const date = new Date('2025-11-04T15:45:00');
      const result = formatTimeOnly(date);
      expect(result).toContain('PM');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-11-04T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "Just now" for recent times', () => {
      const recent = new Date('2025-11-04T11:59:30Z');
      expect(formatRelativeTime(recent)).toBe('Just now');
    });

    it('should return minutes ago', () => {
      const date = new Date('2025-11-04T11:45:00Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('15 minutes ago');
    });

    it('should return hours ago', () => {
      const date = new Date('2025-11-04T10:00:00Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('2 hours ago');
    });

    it('should return days ago', () => {
      const date = new Date('2025-11-02T12:00:00Z');
      const result = formatRelativeTime(date);
      expect(result).toBe('2 days ago');
    });

    it('should return date string for >7 days', () => {
      const date = new Date('2025-10-20T12:00:00Z');
      const result = formatRelativeTime(date);
      expect(result).toContain('/');
    });

    it('should pluralize correctly', () => {
      const oneHour = new Date('2025-11-04T11:00:00Z');
      expect(formatRelativeTime(oneHour)).toBe('1 hour ago');

      const twoHours = new Date('2025-11-04T10:00:00Z');
      expect(formatRelativeTime(twoHours)).toBe('2 hours ago');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isPast', () => {
    it('should return true for past dates', () => {
      const past = new Date('2020-01-01');
      expect(isPast(past)).toBe(true);
    });

    it('should return false for future dates', () => {
      const future = new Date('2030-01-01');
      expect(isPast(future)).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('should return true for future dates', () => {
      const future = new Date('2030-01-01');
      expect(isFuture(future)).toBe(true);
    });

    it('should return false for past dates', () => {
      const past = new Date('2020-01-01');
      expect(isFuture(past)).toBe(false);
    });
  });

  describe('isWithinDays', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-11-04T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for dates within range', () => {
      const date = new Date('2025-11-06T12:00:00Z'); // 2 days from now
      expect(isWithinDays(date, 3)).toBe(true);
    });

    it('should return false for dates outside range', () => {
      const date = new Date('2025-11-10T12:00:00Z'); // 6 days from now
      expect(isWithinDays(date, 3)).toBe(false);
    });

    it('should return false for past dates', () => {
      const date = new Date('2025-11-02T12:00:00Z');
      expect(isWithinDays(date, 3)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days to date', () => {
      const date = new Date('2025-11-04');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(9);
    });

    it('should handle month boundaries', () => {
      const date = new Date('2025-11-28');
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(11); // December (0-indexed)
      expect(result.getDate()).toBe(3);
    });

    it('should handle string input', () => {
      const result = addDays('2025-11-04', 3);
      expect(result.getDate()).toBe(7);
    });
  });

  describe('subtractDays', () => {
    it('should subtract days from date', () => {
      const date = new Date('2025-11-10');
      const result = subtractDays(date, 5);
      expect(result.getDate()).toBe(5);
    });

    it('should handle month boundaries', () => {
      const date = new Date('2025-11-03');
      const result = subtractDays(date, 5);
      expect(result.getMonth()).toBe(9); // October (0-indexed)
      expect(result.getDate()).toBe(29);
    });
  });

  describe('startOfDay', () => {
    it('should set time to midnight', () => {
      const date = new Date('2025-11-04T15:30:45.123Z');
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('endOfDay', () => {
    it('should set time to 11:59:59.999 PM', () => {
      const date = new Date('2025-11-04T10:00:00Z');
      const result = endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between dates', () => {
      const date1 = new Date('2025-11-01');
      const date2 = new Date('2025-11-10');
      expect(daysBetween(date1, date2)).toBe(9);
    });

    it('should return absolute value', () => {
      const date1 = new Date('2025-11-10');
      const date2 = new Date('2025-11-01');
      expect(daysBetween(date1, date2)).toBe(9);
    });

    it('should handle string inputs', () => {
      const result = daysBetween('2025-11-01', '2025-11-10');
      expect(result).toBe(9);
    });
  });

  describe('hoursBetween', () => {
    it('should calculate hours between dates', () => {
      const date1 = new Date('2025-11-04T10:00:00Z');
      const date2 = new Date('2025-11-04T15:00:00Z');
      expect(hoursBetween(date1, date2)).toBe(5);
    });

    it('should return absolute value', () => {
      const date1 = new Date('2025-11-04T15:00:00Z');
      const date2 = new Date('2025-11-04T10:00:00Z');
      expect(hoursBetween(date1, date2)).toBe(5);
    });
  });

  describe('formatDuration', () => {
    it('should format hours and minutes', () => {
      const duration = (2 * 60 * 60 * 1000) + (30 * 60 * 1000); // 2h 30m
      expect(formatDuration(duration)).toBe('2h 30m');
    });

    it('should format hours only', () => {
      const duration = 3 * 60 * 60 * 1000; // 3h
      expect(formatDuration(duration)).toBe('3h');
    });

    it('should format minutes only', () => {
      const duration = 45 * 60 * 1000; // 45m
      expect(formatDuration(duration)).toBe('45m');
    });

    it('should handle less than a minute', () => {
      const duration = 30 * 1000; // 30 seconds
      expect(formatDuration(duration)).toBe('Less than a minute');
    });
  });

  describe('isDueSoon', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-11-04T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for dates within 24 hours', () => {
      const date = new Date('2025-11-05T10:00:00Z');
      expect(isDueSoon(date)).toBe(true);
    });

    it('should return false for past dates', () => {
      const date = new Date('2025-11-03T12:00:00Z');
      expect(isDueSoon(date)).toBe(false);
    });

    it('should return false for dates > 24 hours', () => {
      const date = new Date('2025-11-07T12:00:00Z');
      expect(isDueSoon(date)).toBe(false);
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const date = new Date('2020-01-01');
      expect(isOverdue(date)).toBe(true);
    });

    it('should return false for future dates', () => {
      const date = new Date('2030-01-01');
      expect(isOverdue(date)).toBe(false);
    });
  });

  describe('formatForAPI', () => {
    it('should return ISO 8601 string', () => {
      const date = new Date('2025-11-04T12:30:45.123Z');
      const result = formatForAPI(date);
      expect(result).toBe('2025-11-04T12:30:45.123Z');
    });

    it('should handle string input', () => {
      const result = formatForAPI('2025-11-04T12:00:00Z');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('parseDateSafe', () => {
    it('should parse valid date string', () => {
      const result = parseDateSafe('2025-11-04');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
    });

    it('should return null for invalid date', () => {
      const result = parseDateSafe('invalid-date');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseDateSafe('');
      expect(result).toBeNull();
    });

    it('should parse ISO string', () => {
      const result = parseDateSafe('2025-11-04T12:00:00Z');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('getWeekNumber', () => {
    it('should return week number for date', () => {
      const date = new Date('2025-01-01');
      const week = getWeekNumber(date);
      expect(week).toBeGreaterThan(0);
      expect(week).toBeLessThanOrEqual(53);
    });

    it('should handle different dates', () => {
      const date1 = new Date('2025-01-01');
      const date2 = new Date('2025-12-31');
      const week1 = getWeekNumber(date1);
      const week2 = getWeekNumber(date2);
      expect(week2).toBeGreaterThan(week1);
    });
  });

  describe('getDayName', () => {
    it('should return day name', () => {
      const monday = new Date('2025-11-03'); // Monday
      expect(getDayName(monday)).toBe('Monday');
    });

    it('should handle string input', () => {
      const result = getDayName('2025-11-04'); // Tuesday
      expect(result).toBe('Tuesday');
    });

    it('should return valid day names', () => {
      const date = new Date('2025-11-04');
      const dayName = getDayName(date);
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      expect(validDays).toContain(dayName);
    });
  });

  describe('getMonthName', () => {
    it('should return month name', () => {
      const date = new Date('2025-11-04');
      expect(getMonthName(date)).toBe('November');
    });

    it('should handle string input', () => {
      const result = getMonthName('2025-01-15');
      expect(result).toBe('January');
    });

    it('should return valid month names', () => {
      const date = new Date('2025-11-04');
      const monthName = getMonthName(date);
      const validMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      expect(validMonths).toContain(monthName);
    });
  });
});
