/**
 * Unit Tests for Assignment Impact Calculator
 *
 * Tests the grade impact calculation logic, priority assignment,
 * and target score calculations.
 */

import { describe, it, expect } from 'vitest';
import { AssignmentImpactCalculator, CourseGradeContext } from '@/lib/academics/impactCalculator';

describe('AssignmentImpactCalculator', () => {
  const calculator = new AssignmentImpactCalculator();

  // Helper function to create consistent test context
  const createContext = (overrides: Partial<CourseGradeContext> = {}): CourseGradeContext => ({
    currentGrade: 85,
    totalPoints: 1000,
    earnedPoints: 850,
    completedWeight: 0.85,
    ...overrides,
  });

  describe('calculateImpact', () => {
    it('should calculate impact correctly with valid inputs', () => {
      const context = createContext();
      const result = calculator.calculateImpact(100, context);

      expect(result).toHaveProperty('impactScore');
      expect(result).toHaveProperty('priority');
      expect(result).toHaveProperty('gradeChangeRange');
      expect(result).toHaveProperty('explanation');
      expect(result).toHaveProperty('targetScoreFor');

      expect(result.impactScore).toBeGreaterThan(0);
      expect(result.impactScore).toBeLessThanOrEqual(1);
      expect(result.gradeChangeRange.min).toBeLessThan(result.gradeChangeRange.max);
    });

    it('should assign high priority to high-impact assignments', () => {
      const context = createContext({
        currentGrade: 85,
        totalPoints: 1000,
        earnedPoints: 850,
      });

      // Large assignment worth 10% of grade
      const result = calculator.calculateImpact(100, context);

      expect(result.priority).toBe('high');
      expect(result.impactScore).toBeGreaterThan(0.05);
    });

    it('should assign medium priority to medium-impact assignments', () => {
      const context = createContext({
        currentGrade: 85,
        totalPoints: 1000,
        earnedPoints: 850,
      });

      // Small assignment worth ~3% of grade
      const result = calculator.calculateImpact(30, context);

      expect(result.priority).toBe('medium');
      expect(result.impactScore).toBeGreaterThan(0.02);
      expect(result.impactScore).toBeLessThanOrEqual(0.05);
    });

    it('should assign low priority to low-impact assignments', () => {
      const context = createContext({
        currentGrade: 85,
        totalPoints: 1000,
        earnedPoints: 850,
      });

      // Tiny assignment worth ~1% of grade
      const result = calculator.calculateImpact(10, context);

      expect(result.priority).toBe('low');
      expect(result.impactScore).toBeLessThanOrEqual(0.02);
    });

    it('should handle zero points possible', () => {
      const context = createContext();
      const result = calculator.calculateImpact(0, context);

      expect(result.impactScore).toBe(0);
      expect(result.priority).toBe('low');
      expect(result.gradeChangeRange.min).toBe(85);
      expect(result.gradeChangeRange.max).toBe(85);
    });

    it('should calculate correct grade change range', () => {
      const context = createContext({
        currentGrade: 85,
        totalPoints: 1000,
        earnedPoints: 850,
      });

      const result = calculator.calculateImpact(100, context);

      // Max: (850 + 100) / 1000 * 100 = 95%
      // Min: (850 + 0) / 1000 * 100 = 85%
      expect(result.gradeChangeRange.max).toBe(95);
      expect(result.gradeChangeRange.min).toBe(85);
    });

    it('should generate appropriate explanation for high priority', () => {
      const context = createContext();
      const result = calculator.calculateImpact(100, context);

      expect(result.explanation).toContain('High impact');
      expect(result.explanation).toContain('10.0%'); // Assignment weight
    });

    it('should calculate target scores for letter grades', () => {
      const context = createContext({
        currentGrade: 85,
        totalPoints: 1000,
        earnedPoints: 850,
      });

      const result = calculator.calculateImpact(100, context);

      // To get A (93%): need (0.93 * 1000 - 850) = 80 on this assignment = 80%
      expect(result.targetScoreFor.A).toBeCloseTo(80, 1);

      // To get B (83%): need (0.83 * 1000 - 850) = -20, which is negative, so null
      expect(result.targetScoreFor.B).toBe(null);

      // Already above C threshold
      expect(result.targetScoreFor.C).toBe(null);
    });

    it('should return null for unreachable target grades', () => {
      const context = createContext({
        currentGrade: 70,
        totalPoints: 1000,
        earnedPoints: 700,
        completedWeight: 0.9, // 90% of course completed
      });

      // Only 100 points possible, can only reach 80% max
      const result = calculator.calculateImpact(100, context);

      // A (93%) is unreachable
      expect(result.targetScoreFor.A).toBe(null);
    });

    it('should return null for already achieved target grades', () => {
      const context = createContext({
        currentGrade: 95, // Already has an A
        totalPoints: 1000,
        earnedPoints: 950,
      });

      const result = calculator.calculateImpact(50, context);

      expect(result.targetScoreFor.A).toBe(null); // Already have A
      expect(result.targetScoreFor.B).toBe(null); // Already above B
      expect(result.targetScoreFor.C).toBe(null); // Already above C
    });
  });

  describe('calculateImpactsForAssignments', () => {
    it('should calculate impacts for multiple assignments', () => {
      const context = createContext();

      const assignments = [
        {
          id: '1',
          name: 'Big Project',
          points_possible: 200,
          due_at: '2025-11-10',
          status: 'pending' as const,
        },
        {
          id: '2',
          name: 'Small Quiz',
          points_possible: 20,
          due_at: '2025-11-08',
          status: 'pending' as const,
        },
        {
          id: '3',
          name: 'Medium Essay',
          points_possible: 100,
          due_at: '2025-11-09',
          status: 'pending' as const,
        },
      ];

      const results = calculator.calculateImpactsForAssignments(assignments, context);

      expect(results).toHaveLength(3);
      expect(results[0].assignmentId).toBe('1'); // Highest impact first
      expect(results[0].impact.priority).toBe('high');
    });

    it('should sort assignments by impact score (descending)', () => {
      const context = createContext();

      const assignments = [
        {
          id: 'low',
          name: 'Low Impact',
          points_possible: 10,
          status: 'pending' as const,
        },
        {
          id: 'high',
          name: 'High Impact',
          points_possible: 200,
          status: 'pending' as const,
        },
        {
          id: 'medium',
          name: 'Medium Impact',
          points_possible: 50,
          status: 'pending' as const,
        },
      ];

      const results = calculator.calculateImpactsForAssignments(assignments, context);

      expect(results[0].assignmentId).toBe('high');
      expect(results[1].assignmentId).toBe('medium');
      expect(results[2].assignmentId).toBe('low');
    });

    it('should sort by due date when impact scores are similar', () => {
      const context = createContext();

      const assignments = [
        {
          id: 'later',
          name: 'Due Later',
          points_possible: 100,
          due_at: '2025-11-15',
          status: 'pending' as const,
        },
        {
          id: 'sooner',
          name: 'Due Sooner',
          points_possible: 100,
          due_at: '2025-11-08',
          status: 'pending' as const,
        },
      ];

      const results = calculator.calculateImpactsForAssignments(assignments, context);

      // Should be sorted by due date when impact is the same
      expect(results[0].assignmentId).toBe('sooner');
      expect(results[1].assignmentId).toBe('later');
    });

    it('should handle assignments with missing due dates', () => {
      const context = createContext();

      const assignments = [
        {
          id: '1',
          name: 'No Due Date',
          points_possible: 100,
          status: 'pending' as const,
        },
        {
          id: '2',
          name: 'With Due Date',
          points_possible: 100,
          due_at: '2025-11-10',
          status: 'pending' as const,
        },
      ];

      const results = calculator.calculateImpactsForAssignments(assignments, context);

      expect(results).toHaveLength(2);
      expect(results[0].dueDate).toBeUndefined();
      expect(results[1].dueDate).toBe('2025-11-10');
    });
  });

  describe('edge cases', () => {
    it('should handle 100% current grade', () => {
      const context = createContext({
        currentGrade: 100,
        totalPoints: 1000,
        earnedPoints: 1000,
      });

      const result = calculator.calculateImpact(0, context);

      expect(result.gradeChangeRange.max).toBe(100);
      expect(result.gradeChangeRange.min).toBe(100);
    });

    it('should handle 0% current grade', () => {
      const context = createContext({
        currentGrade: 0,
        totalPoints: 1000,
        earnedPoints: 0,
      });

      const result = calculator.calculateImpact(100, context);

      expect(result.gradeChangeRange.max).toBe(10); // 100/1000 * 100 = 10%
      expect(result.gradeChangeRange.min).toBe(0);
    });

    it('should handle very small assignments', () => {
      const context = createContext();
      const result = calculator.calculateImpact(1, context);

      expect(result.priority).toBe('low');
      expect(result.impactScore).toBeLessThan(0.01);
    });

    it('should handle very large assignments', () => {
      const context = createContext({
        currentGrade: 85,
        totalPoints: 1000,
        earnedPoints: 850,
      });

      const result = calculator.calculateImpact(500, context);

      expect(result.priority).toBe('high');
      expect(result.impactScore).toBeGreaterThan(0.3);
    });
  });
});
