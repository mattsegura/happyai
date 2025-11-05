/**
 * Unit Tests for Canvas Hooks
 *
 * Tests custom hooks for Canvas data:
 * - useCanvasAssignments
 * - useCanvasCourses
 * - useStudyStreak
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCanvasAssignments } from '@/hooks/useCanvasAssignments';
import { useCanvasCourses } from '@/hooks/useCanvasCourses';
import { useStudyStreak } from '@/hooks/useStudyStreak';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/lib/utils/dates', () => ({
  getCurrentDateISO: vi.fn(() => new Date('2025-01-15').toISOString()),
}));

import { supabase } from '@/lib/supabase';

describe('Canvas Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCanvasAssignments', () => {
    const mockUserId = 'user-123';
    const mockAssignments = [
      {
        id: 'assign-1',
        name: 'Math Homework 1',
        description: 'Complete problems 1-10',
        due_at: '2025-01-20T23:59:59Z',
        points_possible: 100,
        course_id: 'course-1',
        user_id: mockUserId,
        course: { name: 'Math 101', canvas_course_code: 'MATH101' },
        canvas_submissions: [
          {
            workflow_state: 'submitted',
            score: 95,
            submitted_at: '2025-01-19T10:00:00Z',
          },
        ],
      },
      {
        id: 'assign-2',
        name: 'English Essay',
        description: 'Write 500 words',
        due_at: '2025-01-25T23:59:59Z',
        points_possible: 50,
        course_id: 'course-2',
        user_id: mockUserId,
        course: { name: 'English 101', canvas_course_code: 'ENG101' },
        canvas_submissions: [],
      },
    ];

    it('should return empty array and not load when userId is undefined', async () => {
      const { result } = renderHook(() => useCanvasAssignments(undefined));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.assignments).toEqual([]);
    });

    it('should fetch upcoming assignments for valid userId', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockAssignments, error: null }),
            }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useCanvasAssignments(mockUserId, 'upcoming'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.assignments.length).toBeGreaterThan(0);
      expect(result.current.error).toBeNull();
    });

    it('should fetch past due assignments when filter is past_due', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockAssignments, error: null }),
            }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useCanvasAssignments(mockUserId, 'past_due'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.assignments).toBeDefined();
    });

    it('should apply limit when provided', async () => {
      const mockLimit = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockAssignments.slice(0, 1), error: null }),
      });

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              limit: mockLimit,
            }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useCanvasAssignments(mockUserId, 'upcoming', 1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it('should handle fetch errors gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
            }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useCanvasAssignments(mockUserId, 'upcoming'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.assignments).toEqual([]);
    });

    it('should transform submission data correctly', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockAssignments, error: null }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useCanvasAssignments(mockUserId, 'all'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.assignments[0]).toHaveProperty('course_name');
      expect(result.current.assignments[0]).toHaveProperty('submission_workflow_state');
    });
  });

  describe('useCanvasCourses', () => {
    const mockUserId = 'user-123';
    const mockCourses = [
      {
        id: 'course-1',
        name: 'Math 101',
        course_code: 'MATH101',
        user_id: mockUserId,
        current_grade: 'A',
        current_score: 92.5,
        enrollment_state: 'active',
      },
      {
        id: 'course-2',
        name: 'English 101',
        course_code: 'ENG101',
        user_id: mockUserId,
        current_grade: 'B+',
        current_score: 87.0,
        enrollment_state: 'active',
      },
    ];

    it('should return empty array when userId is undefined', async () => {
      const { result } = renderHook(() => useCanvasCourses(undefined));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.courses).toEqual([]);
    });

    it('should fetch courses for valid userId', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCourses, error: null }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useCanvasCourses(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.courses.length).toBe(2);
      expect(result.current.courses[0].name).toBe('Math 101');
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useCanvasCourses(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.courses).toEqual([]);
    });

    it('should provide refetch function', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCourses, error: null }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useCanvasCourses(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('useStudyStreak', () => {
    const mockUserId = 'user-123';
    const mockStreak = {
      user_id: mockUserId,
      current_streak: 7,
      longest_streak: 14,
      last_check_date: '2025-01-15',
    };

    it('should return null streak when userId is undefined', async () => {
      const { result } = renderHook(() => useStudyStreak(undefined));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.streak).toBeNull();
      expect(result.current.currentStreak).toBe(0);
      expect(result.current.longestStreak).toBe(0);
    });

    it('should fetch study streak for valid userId', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockStreak, error: null }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useStudyStreak(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.streak).toBeDefined();
      expect(result.current.currentStreak).toBe(7);
      expect(result.current.longestStreak).toBe(14);
      expect(result.current.error).toBeNull();
    });

    it('should handle missing streak gracefully (PGRST116 error)', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows returned' },
            }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useStudyStreak(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.streak).toBeNull();
      expect(result.current.currentStreak).toBe(0);
      expect(result.current.error).toBeNull(); // Should NOT set error for PGRST116
    });

    it('should handle fetch errors gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useStudyStreak(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.streak).toBeNull();
    });

    it('should return default values when streak is null', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useStudyStreak(mockUserId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(0);
      expect(result.current.longestStreak).toBe(0);
    });
  });
});
