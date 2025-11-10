/**
 * Unit Tests for Formatting Utilities
 *
 * Tests all text and number formatting functions.
 */

import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatPercentage,
  formatGrade,
  formatLetterGrade,
  formatCurrency,
  formatCentsAsDollars,
  truncate,
  truncateWords,
  capitalize,
  capitalizeWords,
  toTitleCase,
  formatPhoneNumber,
  formatFileSize,
  formatInitials,
  formatList,
  formatOrdinal,
  formatGPA,
  formatCompactNumber,
  formatClassCode,
  formatSentimentLabel,
  formatAssignmentStatus,
  formatYesNo,
  formatActiveStatus,
  formatStreak,
  stripHTML,
  formatURLDisplay,
} from '@/lib/utils/formatting';

describe('Formatting Utilities', () => {
  describe('formatNumber', () => {
    it('should format number with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle small numbers', () => {
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(1)).toBe('1');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
    });
  });

  describe('formatPercentage', () => {
    it('should format as percentage with default decimals', () => {
      expect(formatPercentage(0.85)).toBe('85%');
      expect(formatPercentage(0.5)).toBe('50%');
    });

    it('should respect decimal places', () => {
      expect(formatPercentage(0.855, 2)).toBe('85.50%');
      expect(formatPercentage(0.8556, 1)).toBe('85.6%');
    });

    it('should handle 0 and 1', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(1)).toBe('100%');
    });
  });

  describe('formatGrade', () => {
    it('should format whole numbers without decimal', () => {
      expect(formatGrade(90)).toBe('90%');
      expect(formatGrade(100)).toBe('100%');
    });

    it('should format decimals with one place', () => {
      expect(formatGrade(85.5)).toBe('85.5%');
      expect(formatGrade(92.3)).toBe('92.3%');
    });

    it('should handle zero', () => {
      expect(formatGrade(0)).toBe('0%');
    });
  });

  describe('formatLetterGrade', () => {
    it('should return A grades', () => {
      expect(formatLetterGrade(95)).toBe('A');
      expect(formatLetterGrade(93)).toBe('A');
      expect(formatLetterGrade(91)).toBe('A-');
    });

    it('should return B grades', () => {
      expect(formatLetterGrade(89)).toBe('B+');
      expect(formatLetterGrade(85)).toBe('B');
      expect(formatLetterGrade(81)).toBe('B-');
    });

    it('should return C grades', () => {
      expect(formatLetterGrade(79)).toBe('C+');
      expect(formatLetterGrade(75)).toBe('C');
      expect(formatLetterGrade(71)).toBe('C-');
    });

    it('should return D grades', () => {
      expect(formatLetterGrade(69)).toBe('D+');
      expect(formatLetterGrade(65)).toBe('D');
      expect(formatLetterGrade(61)).toBe('D-');
    });

    it('should return F for failing grades', () => {
      expect(formatLetterGrade(59)).toBe('F');
      expect(formatLetterGrade(0)).toBe('F');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency', () => {
      expect(formatCurrency(1999.99)).toBe('$1,999.99');
      expect(formatCurrency(100)).toBe('$100.00');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-50)).toBe('-$50.00');
    });

    it('should format different currencies', () => {
      expect(formatCurrency(100, 'EUR')).toContain('100');
    });
  });

  describe('formatCentsAsDollars', () => {
    it('should convert cents to dollars', () => {
      expect(formatCentsAsDollars(1999)).toBe('$19.99');
      expect(formatCentsAsDollars(10000)).toBe('$100.00');
    });

    it('should handle zero cents', () => {
      expect(formatCentsAsDollars(0)).toBe('$0.00');
    });

    it('should handle small amounts', () => {
      expect(formatCentsAsDollars(50)).toBe('$0.50');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Hi', 10)).toBe('Hi');
    });

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(truncate('', 5)).toBe('');
    });
  });

  describe('truncateWords', () => {
    it('should truncate by word count', () => {
      expect(truncateWords('one two three four', 2)).toBe('one two...');
    });

    it('should not truncate when under limit', () => {
      expect(truncateWords('one two', 3)).toBe('one two');
    });

    it('should handle single word', () => {
      expect(truncateWords('word', 1)).toBe('word');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should lowercase the rest', () => {
      expect(capitalize('hELLO')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('capitalizeWords', () => {
    it('should capitalize each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
    });

    it('should handle mixed case', () => {
      expect(capitalizeWords('hELLO wORLD')).toBe('Hello World');
    });

    it('should handle single word', () => {
      expect(capitalizeWords('hello')).toBe('Hello');
    });
  });

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
    });

    it('should handle uppercase input', () => {
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
    });

    it('should handle mixed case', () => {
      expect(toTitleCase('hElLo WoRlD')).toBe('Hello World');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit phone number', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });

    it('should handle phone with dashes', () => {
      expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
    });

    it('should return original for invalid format', () => {
      expect(formatPhoneNumber('123')).toBe('123');
    });

    it('should strip non-digits', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format KB', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format MB', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should format GB', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });
  });

  describe('formatInitials', () => {
    it('should format two-word name', () => {
      expect(formatInitials('John Doe')).toBe('JD');
    });

    it('should format three-word name', () => {
      expect(formatInitials('John Paul Jones')).toBe('JP');
    });

    it('should handle single name', () => {
      expect(formatInitials('John')).toBe('J');
    });

    it('should uppercase initials', () => {
      expect(formatInitials('john doe')).toBe('JD');
    });
  });

  describe('formatList', () => {
    it('should format list with three items', () => {
      expect(formatList(['A', 'B', 'C'])).toBe('A, B, and C');
    });

    it('should format list with two items', () => {
      expect(formatList(['A', 'B'])).toBe('A and B');
    });

    it('should format single item', () => {
      expect(formatList(['A'])).toBe('A');
    });

    it('should handle empty list', () => {
      expect(formatList([])).toBe('');
    });

    it('should format long list', () => {
      expect(formatList(['A', 'B', 'C', 'D'])).toBe('A, B, C, and D');
    });
  });

  describe('formatOrdinal', () => {
    it('should format 1st, 2nd, 3rd', () => {
      expect(formatOrdinal(1)).toBe('1st');
      expect(formatOrdinal(2)).toBe('2nd');
      expect(formatOrdinal(3)).toBe('3rd');
    });

    it('should format 4th-20th', () => {
      expect(formatOrdinal(4)).toBe('4th');
      expect(formatOrdinal(11)).toBe('11th');
      expect(formatOrdinal(12)).toBe('12th');
      expect(formatOrdinal(13)).toBe('13th');
    });

    it('should format 21st, 22nd, 23rd', () => {
      expect(formatOrdinal(21)).toBe('21st');
      expect(formatOrdinal(22)).toBe('22nd');
      expect(formatOrdinal(23)).toBe('23rd');
    });

    it('should format 100th+', () => {
      expect(formatOrdinal(100)).toBe('100th');
      expect(formatOrdinal(101)).toBe('101st');
    });
  });

  describe('formatGPA', () => {
    it('should format GPA to 2 decimals', () => {
      expect(formatGPA(3.67)).toBe('3.67');
      expect(formatGPA(4.0)).toBe('4.00');
    });

    it('should round to 2 decimals', () => {
      expect(formatGPA(3.678)).toBe('3.68');
    });
  });

  describe('formatCompactNumber', () => {
    it('should not compact small numbers', () => {
      expect(formatCompactNumber(999)).toBe('999');
    });

    it('should format thousands', () => {
      expect(formatCompactNumber(1000)).toBe('1.0K');
      expect(formatCompactNumber(5500)).toBe('5.5K');
    });

    it('should format millions', () => {
      expect(formatCompactNumber(1000000)).toBe('1.0M');
      expect(formatCompactNumber(2500000)).toBe('2.5M');
    });
  });

  describe('formatClassCode', () => {
    it('should uppercase and add dash after 3 chars', () => {
      expect(formatClassCode('cs101a')).toBe('CS1-01A');
      expect(formatClassCode('mat201')).toBe('MAT-201');
    });

    it('should handle short codes', () => {
      expect(formatClassCode('CS')).toBe('CS');
    });
  });

  describe('formatSentimentLabel', () => {
    it('should format all sentiment levels', () => {
      expect(formatSentimentLabel(1)).toBe('Very Negative');
      expect(formatSentimentLabel(2)).toBe('Negative');
      expect(formatSentimentLabel(3)).toBe('Slightly Negative');
      expect(formatSentimentLabel(4)).toBe('Slightly Positive');
      expect(formatSentimentLabel(5)).toBe('Positive');
      expect(formatSentimentLabel(6)).toBe('Very Positive');
    });

    it('should handle invalid sentiment', () => {
      expect(formatSentimentLabel(7)).toBe('Unknown');
      expect(formatSentimentLabel(0)).toBe('Unknown');
    });
  });

  describe('formatAssignmentStatus', () => {
    it('should format all statuses', () => {
      expect(formatAssignmentStatus('upcoming')).toBe('Upcoming');
      expect(formatAssignmentStatus('due_soon')).toBe('Due Soon');
      expect(formatAssignmentStatus('late')).toBe('Late');
      expect(formatAssignmentStatus('missing')).toBe('Missing');
      expect(formatAssignmentStatus('completed')).toBe('Completed');
    });
  });

  describe('formatYesNo', () => {
    it('should format boolean as Yes/No', () => {
      expect(formatYesNo(true)).toBe('Yes');
      expect(formatYesNo(false)).toBe('No');
    });
  });

  describe('formatActiveStatus', () => {
    it('should format boolean as Active/Inactive', () => {
      expect(formatActiveStatus(true)).toBe('Active');
      expect(formatActiveStatus(false)).toBe('Inactive');
    });
  });

  describe('formatStreak', () => {
    it('should format single day', () => {
      expect(formatStreak(1)).toBe('1 day');
    });

    it('should format multiple days', () => {
      expect(formatStreak(5)).toBe('5 days');
      expect(formatStreak(100)).toBe('100 days');
    });

    it('should handle zero', () => {
      expect(formatStreak(0)).toBe('0 days');
    });
  });

  describe('stripHTML', () => {
    it('should remove HTML tags', () => {
      expect(stripHTML('<p>Hello</p>')).toBe('Hello');
      expect(stripHTML('<strong>Bold</strong> text')).toBe('Bold text');
    });

    it('should handle nested tags', () => {
      expect(stripHTML('<div><p>Hello</p></div>')).toBe('Hello');
    });

    it('should handle no tags', () => {
      expect(stripHTML('Plain text')).toBe('Plain text');
    });

    it('should handle empty string', () => {
      expect(stripHTML('')).toBe('');
    });
  });

  describe('formatURLDisplay', () => {
    it('should format URL to domain', () => {
      expect(formatURLDisplay('https://example.com/page')).toBe('example.com');
      expect(formatURLDisplay('https://www.example.com')).toBe('example.com');
    });

    it('should handle URLs with paths', () => {
      expect(formatURLDisplay('https://example.com/path/to/page')).toBe('example.com');
    });

    it('should handle invalid URLs', () => {
      expect(formatURLDisplay('not-a-url')).toBe('not-a-url');
    });

    it('should handle URLs with subdomains', () => {
      expect(formatURLDisplay('https://api.example.com')).toBe('api.example.com');
    });
  });
});
