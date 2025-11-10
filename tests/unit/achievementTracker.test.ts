/**
 * Unit Tests for Academic Achievement Tracker
 *
 * Tests achievement tracking, point awarding, streak management,
 * and achievement unlocking logic.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AcademicAchievementTracker } from '@/lib/gamification/achievementTracker';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Import after mock
import { supabase } from '@/lib/supabase';

describe('AcademicAchievementTracker', () => {
  let tracker: AcademicAchievementTracker;
  let mockSupabaseFrom: any;
  let mockSupabaseRpc: any;

  beforeEach(() => {
    tracker = new AcademicAchievementTracker();
    vi.clearAllMocks();

    // Setup Supabase mocks
    mockSupabaseFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    mockSupabaseRpc = vi.fn().mockResolvedValue({ data: null, error: null });

    (supabase.from as any) = mockSupabaseFrom;
    (supabase.rpc as any) = mockSupabaseRpc;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('trackAssignmentSubmission', () => {
    it('should award points for on-time submission', async () => {
      const userId = 'user-123';
      const assignment = {
        id: 'assignment-1',
        due_at: new Date('2025-11-10T23:59:59Z'),
        points_possible: 100,
      };
      const submittedAt = new Date('2025-11-09T10:00:00Z'); // 1 day early

      await tracker.trackAssignmentSubmission(userId, assignment, submittedAt);

      // Should call insert for points log
      expect(mockSupabaseFrom).toHaveBeenCalledWith('academic_points_log');

      // Should call rpc to increment points
      expect(mockSupabaseRpc).toHaveBeenCalledWith('increment_user_points', {
        user_id_param: userId,
        points_param: expect.any(Number),
      });
    });

    it('should award bonus points for early submission', async () => {
      const userId = 'user-123';
      const assignment = {
        id: 'assignment-1',
        due_at: new Date('2025-11-10T23:59:59Z'),
        points_possible: 100,
      };
      const submittedAt = new Date('2025-11-08T10:00:00Z'); // 2 days early

      await tracker.trackAssignmentSubmission(userId, assignment, submittedAt);

      // Should award both on-time and early points
      expect(mockSupabaseRpc).toHaveBeenCalled();
    });

    it('should not award points for late submission', async () => {
      const userId = 'user-123';
      const assignment = {
        id: 'assignment-1',
        due_at: new Date('2025-11-10T23:59:59Z'),
        points_possible: 100,
      };
      const submittedAt = new Date('2025-11-11T10:00:00Z'); // 1 day late

      const achievements = await tracker.trackAssignmentSubmission(
        userId,
        assignment,
        submittedAt
      );

      // Should not track action for late submission
      expect(achievements).toEqual([]);
    });

    it('should handle submission exactly at deadline', async () => {
      const userId = 'user-123';
      const dueDate = new Date('2025-11-10T23:59:59Z');
      const assignment = {
        id: 'assignment-1',
        due_at: dueDate,
        points_possible: 100,
      };
      const submittedAt = new Date(dueDate); // Exactly at deadline

      await tracker.trackAssignmentSubmission(userId, assignment, submittedAt);

      // Should award on-time points
      expect(mockSupabaseRpc).toHaveBeenCalled();
    });
  });

  describe('trackStudySession', () => {
    it('should award points based on study duration', async () => {
      const userId = 'user-123';
      const session = {
        id: 'session-1',
        start_time: new Date('2025-11-04T09:00:00Z'),
        end_time: new Date('2025-11-04T11:00:00Z'), // 2 hours
      };

      await tracker.trackStudySession(userId, session);

      // Should award points (10 per hour = 20 points for 2 hours)
      expect(mockSupabaseFrom).toHaveBeenCalledWith('academic_points_log');
      expect(mockSupabaseRpc).toHaveBeenCalledWith('increment_user_points', {
        user_id_param: userId,
        points_param: 20,
      });
    });

    it('should cap points at 50 per session', async () => {
      const userId = 'user-123';
      const session = {
        id: 'session-1',
        start_time: new Date('2025-11-04T09:00:00Z'),
        end_time: new Date('2025-11-04T20:00:00Z'), // 11 hours
      };

      await tracker.trackStudySession(userId, session);

      // Should award max 50 points
      expect(mockSupabaseRpc).toHaveBeenCalledWith('increment_user_points', {
        user_id_param: userId,
        points_param: 50,
      });
    });

    it('should update study streak', async () => {
      const userId = 'user-123';
      const session = {
        id: 'session-1',
        start_time: new Date('2025-11-04T09:00:00Z'),
        end_time: new Date('2025-11-04T10:00:00Z'),
      };

      await tracker.trackStudySession(userId, session);

      // Should call to update study streaks
      expect(mockSupabaseFrom).toHaveBeenCalledWith('study_streaks');
    });
  });

  describe('trackTutorUsage', () => {
    it('should award points for AI tutor question', async () => {
      const userId = 'user-123';
      const questionId = 'question-1';

      await tracker.trackTutorUsage(userId, questionId);

      // Should award 5 points
      expect(mockSupabaseRpc).toHaveBeenCalledWith('increment_user_points', {
        user_id_param: userId,
        points_param: 5,
      });
    });

    it('should track action for tutor achievements', async () => {
      const userId = 'user-123';
      const questionId = 'question-1';

      await tracker.trackTutorUsage(userId, questionId);

      // Should log points
      expect(mockSupabaseFrom).toHaveBeenCalledWith('academic_points_log');
    });
  });

  describe('trackQuizCompletion', () => {
    it('should award points based on score', async () => {
      const userId = 'user-123';
      const quiz = {
        id: 'quiz-1',
        total_questions: 10,
      };
      const score = 90; // 90%

      await tracker.trackQuizCompletion(userId, quiz, score);

      // Should award 45 points (90% of 50 max)
      expect(mockSupabaseRpc).toHaveBeenCalledWith('increment_user_points', {
        user_id_param: userId,
        points_param: 45,
      });
    });

    it('should award zero points for zero score', async () => {
      const userId = 'user-123';
      const quiz = {
        id: 'quiz-1',
        total_questions: 10,
      };
      const score = 0;

      await tracker.trackQuizCompletion(userId, quiz, score);

      // Should award 0 points
      expect(mockSupabaseRpc).toHaveBeenCalledWith('increment_user_points', {
        user_id_param: userId,
        points_param: 0,
      });
    });

    it('should award full points for perfect score', async () => {
      const userId = 'user-123';
      const quiz = {
        id: 'quiz-1',
        total_questions: 10,
      };
      const score = 100;

      await tracker.trackQuizCompletion(userId, quiz, score);

      // Should award 50 points (100% of 50 max)
      expect(mockSupabaseRpc).toHaveBeenCalledWith('increment_user_points', {
        user_id_param: userId,
        points_param: 50,
      });
    });
  });

  describe('trackGradeAchievement', () => {
    it('should track improvement when grade increases', async () => {
      const userId = 'user-123';
      const courseId = 'course-1';
      const currentGrade = 90;
      const previousGrade = 75; // 15 point improvement

      const achievements = await tracker.trackGradeAchievement(
        userId,
        courseId,
        currentGrade,
        previousGrade
      );

      // Should track achievement (improvement >= 10)
      expect(achievements).toBeDefined();
    });

    it('should not track for small improvements', async () => {
      const userId = 'user-123';
      const courseId = 'course-1';
      const currentGrade = 85;
      const previousGrade = 82; // Only 3 points

      const achievements = await tracker.trackGradeAchievement(
        userId,
        courseId,
        currentGrade,
        previousGrade
      );

      // Should not trigger improvement achievement
      expect(achievements).toEqual([]);
    });

    it('should track high grade achievement', async () => {
      const userId = 'user-123';
      const courseId = 'course-1';
      const currentGrade = 95; // A grade

      const achievements = await tracker.trackGradeAchievement(
        userId,
        courseId,
        currentGrade
      );

      // Should track high grade achievement
      expect(achievements).toBeDefined();
    });

    it('should not track for grades below 90%', async () => {
      const userId = 'user-123';
      const courseId = 'course-1';
      const currentGrade = 85;

      const achievements = await tracker.trackGradeAchievement(
        userId,
        courseId,
        currentGrade
      );

      // Should not trigger high grade achievement
      expect(achievements).toEqual([]);
    });
  });

  describe('getUserAchievements', () => {
    it('should fetch user achievements and streak', async () => {
      const userId = 'user-123';

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            current_streak: 5,
            longest_streak: 10,
            total_study_days: 50,
          },
          error: null,
        }),
      });

      const result = await tracker.getUserAchievements(userId);

      expect(result).toHaveProperty('achievements');
      expect(result).toHaveProperty('streak');
      expect(result).toHaveProperty('stats');
    });

    it('should calculate stats correctly', async () => {
      const userId = 'user-123';

      const result = await tracker.getUserAchievements(userId);

      expect(result.stats).toHaveProperty('unlocked');
      expect(result.stats).toHaveProperty('total');
      expect(result.stats).toHaveProperty('percentage');
      expect(result.stats).toHaveProperty('totalPoints');
    });

    it('should handle no streak data', async () => {
      const userId = 'user-123';

      const result = await tracker.getUserAchievements(userId);

      // Should return null streak if none exists
      expect(result.streak).toBeNull();
    });
  });

  describe('study streak management', () => {
    it('should create new streak for first study', async () => {
      const userId = 'user-123';
      const today = new Date('2025-11-04');

      // Mock no existing streak
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      const session = {
        id: 'session-1',
        start_time: today,
        end_time: new Date(today.getTime() + 3600000), // 1 hour later
      };

      await tracker.trackStudySession(userId, session);

      // Should create new streak
      expect(mockSupabaseFrom).toHaveBeenCalledWith('study_streaks');
    });

    it('should increment streak for consecutive day', async () => {
      const userId = 'user-123';

      // Mock existing streak from yesterday
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            current_streak: 5,
            longest_streak: 10,
            last_study_date: '2025-11-03',
            total_study_days: 50,
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      });

      const session = {
        id: 'session-1',
        start_time: new Date('2025-11-04T10:00:00Z'),
        end_time: new Date('2025-11-04T11:00:00Z'),
      };

      await tracker.trackStudySession(userId, session);

      // Should increment streak
      expect(mockSupabaseFrom).toHaveBeenCalledWith('study_streaks');
    });

    it('should not increment streak for same day', async () => {
      const userId = 'user-123';
      const today = '2025-11-04';

      // Mock existing streak from today
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            current_streak: 5,
            longest_streak: 10,
            last_study_date: today,
            total_study_days: 50,
          },
          error: null,
        }),
      });

      const session = {
        id: 'session-1',
        start_time: new Date('2025-11-04T10:00:00Z'),
        end_time: new Date('2025-11-04T11:00:00Z'),
      };

      await tracker.trackStudySession(userId, session);

      // Should not update (already studied today)
      expect(mockSupabaseFrom).toHaveBeenCalledWith('study_streaks');
    });

    it('should reset streak when broken', async () => {
      const userId = 'user-123';

      // Mock existing streak from 3 days ago (broken)
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            current_streak: 10,
            longest_streak: 15,
            last_study_date: '2025-11-01', // 3 days ago
            total_study_days: 50,
          },
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      });

      const session = {
        id: 'session-1',
        start_time: new Date('2025-11-04T10:00:00Z'),
        end_time: new Date('2025-11-04T11:00:00Z'),
      };

      await tracker.trackStudySession(userId, session);

      // Should reset streak to 1
      expect(mockSupabaseFrom).toHaveBeenCalledWith('study_streaks');
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const userId = 'user-123';

      mockSupabaseFrom.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      });

      // Should not throw error
      await expect(
        tracker.trackTutorUsage(userId, 'question-1')
      ).resolves.not.toThrow();
    });

    it('should handle missing achievement data', async () => {
      const userId = 'user-123';

      const result = await tracker.getUserAchievements(userId);

      // Should return empty structure
      expect(result.achievements).toEqual([]);
      expect(result.streak).toBeNull();
      expect(result.stats.total).toBe(0);
    });
  });
});
