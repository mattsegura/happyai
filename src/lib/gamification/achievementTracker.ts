/**
 * Academic Achievement Tracker
 *
 * Tracks user actions and updates achievement progress.
 * Integrates with the main HapiAI points system.
 */

import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface Achievement {
  id: string;
  achievement_key: string;
  name: string;
  description: string;
  icon: string;
  category: 'assignments' | 'study' | 'grades' | 'tutor' | 'planner';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points_reward: number;
  criteria: AchievementCriteria;
  is_active: boolean;
}

export interface AchievementCriteria {
  type: string;
  target: number;
  unit?: string;
  threshold?: number;
  window?: string;
  hours_early?: number;
  no_late?: boolean;
  avg_score?: number;
  completion_rate?: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_key: string;
  progress: number;
  target: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  notified: boolean;
}

export interface StudyStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string;
  streak_start_date: string;
  total_study_days: number;
}

export interface AchievementAction {
  type: string;
  metadata?: any;
}

export interface UserAchievementData {
  achievements: (Achievement & { user_progress?: UserAchievement })[];
  streak: StudyStreak | null;
  stats: {
    unlocked: number;
    total: number;
    percentage: number;
    totalPoints: number;
  };
}

// ============================================================================
// ACHIEVEMENT TRACKER CLASS
// ============================================================================

export class AcademicAchievementTracker {
  /**
   * Track an action and update relevant achievements
   */
  async trackAction(
    userId: string,
    action: AchievementAction
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    try {
      // Get relevant achievements for this action type
      const achievements = await this.getRelevantAchievements(action.type);

      for (const achievement of achievements) {
        // Get or create user progress
        const progress = await this.getUserProgress(userId, achievement.achievement_key);

        if (progress && progress.is_unlocked) {
          continue; // Already unlocked
        }

        // Calculate new progress
        const newProgress = this.calculateProgress(progress, action, achievement);

        // Check if achievement should be unlocked
        if (newProgress >= achievement.criteria.target && !progress?.is_unlocked) {
          await this.unlockAchievement(userId, achievement);
          unlockedAchievements.push(achievement);
        } else {
          await this.updateProgress(userId, achievement.achievement_key, newProgress, achievement.criteria.target);
        }
      }
    } catch (error) {
      console.error('Error tracking action:', error);
    }

    return unlockedAchievements;
  }

  /**
   * Track assignment submission
   */
  async trackAssignmentSubmission(
    userId: string,
    assignment: { id: string; due_at: Date; points_possible: number },
    submittedAt: Date
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    try {
      const isOnTime = submittedAt <= assignment.due_at;
      const hoursDiff = (assignment.due_at.getTime() - submittedAt.getTime()) / (1000 * 60 * 60);
      const hoursEarly = isOnTime ? hoursDiff : 0;

      if (isOnTime) {
        // Award points for on-time submission
        await this.awardPoints(userId, 10, 'assignment_on_time', assignment.id, 'Submitted assignment on time');

        // Track for on-time achievements
        const onTimeAchievements = await this.trackAction(userId, {
          type: 'assignment_submitted',
          metadata: { onTime: true, early: hoursEarly >= 24 }
        });
        unlockedAchievements.push(...onTimeAchievements);
      }

      if (hoursEarly >= 24) {
        // Bonus points for early submission
        const earlyPoints = Math.min(Math.floor(hoursEarly / 24) * 5, 20);
        await this.awardPoints(userId, earlyPoints, 'assignment_early', assignment.id, `Submitted ${Math.floor(hoursEarly)} hours early`);

        // Track for early achievements
        const earlyAchievements = await this.trackAction(userId, {
          type: 'early_submission',
          metadata: { hours_early: hoursEarly }
        });
        unlockedAchievements.push(...earlyAchievements);
      }
    } catch (error) {
      console.error('Error tracking assignment submission:', error);
    }

    return unlockedAchievements;
  }

  /**
   * Track study session completion
   */
  async trackStudySession(
    userId: string,
    session: { id: string; start_time: Date; end_time: Date }
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    try {
      // Calculate duration in hours
      const durationMs = session.end_time.getTime() - session.start_time.getTime();
      const hours = durationMs / (1000 * 60 * 60);

      // Award points based on duration (10 points per hour, max 50 per session)
      const points = Math.min(Math.floor(hours * 10), 50);
      await this.awardPoints(userId, points, 'study_session', session.id, `${hours.toFixed(1)} hour study session`);

      // Update study streak
      await this.updateStudyStreak(userId, session.start_time);

      // Track for study achievements
      const studyAchievements = await this.trackAction(userId, {
        type: 'study_session_completed',
        metadata: { duration_hours: hours }
      });
      unlockedAchievements.push(...studyAchievements);
    } catch (error) {
      console.error('Error tracking study session:', error);
    }

    return unlockedAchievements;
  }

  /**
   * Track AI tutor usage
   */
  async trackTutorUsage(userId: string, questionId: string): Promise<Achievement[]> {
    try {
      // Award points for using tutor
      await this.awardPoints(userId, 5, 'ai_tutor_question', questionId, 'Asked AI tutor a question');

      // Track for tutor achievements
      return await this.trackAction(userId, {
        type: 'tutor_question_asked'
      });
    } catch (error) {
      console.error('Error tracking tutor usage:', error);
      return [];
    }
  }

  /**
   * Track practice quiz completion
   */
  async trackQuizCompletion(
    userId: string,
    quiz: { id: string; total_questions: number },
    score: number
  ): Promise<Achievement[]> {
    try {
      // Award points based on score (up to 50 points)
      const points = Math.floor((score / 100) * 50);
      await this.awardPoints(userId, points, 'practice_quiz', quiz.id, `Scored ${score}% on practice quiz`);

      // Track for quiz achievements
      return await this.trackAction(userId, {
        type: 'practice_quiz_completed',
        metadata: { score }
      });
    } catch (error) {
      console.error('Error tracking quiz completion:', error);
      return [];
    }
  }

  /**
   * Track grade achievement (A grade, improvement, etc.)
   */
  async trackGradeAchievement(
    userId: string,
    courseId: string,
    currentGrade: number,
    previousGrade?: number
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    try {
      // Check for grade improvement
      if (previousGrade && currentGrade > previousGrade) {
        const improvement = currentGrade - previousGrade;
        if (improvement >= 10) {
          const improvementAchievements = await this.trackAction(userId, {
            type: 'grade_improvement',
            metadata: { improvement_percent: improvement }
          });
          unlockedAchievements.push(...improvementAchievements);
        }
      }

      // Check for high grades
      if (currentGrade >= 90) {
        const gradeAchievements = await this.trackAction(userId, {
          type: 'high_grade',
          metadata: { grade: currentGrade, course_id: courseId }
        });
        unlockedAchievements.push(...gradeAchievements);
      }
    } catch (error) {
      console.error('Error tracking grade achievement:', error);
    }

    return unlockedAchievements;
  }

  /**
   * Update study streak
   */
  private async updateStudyStreak(userId: string, studyDate: Date): Promise<void> {
    try {
      const today = studyDate.toISOString().split('T')[0];

      // Get current streak
      const { data: streak, error: fetchError } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!streak) {
        // Create new streak
        await supabase.from('study_streaks').insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_study_date: today,
          streak_start_date: today,
          total_study_days: 1
        });
        return;
      }

      // Check if already studied today
      if (streak.last_study_date === today) {
        return;
      }

      // Calculate days since last study
      const lastDate = new Date(streak.last_study_date);
      const currentDate = new Date(today);
      const daysSince = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSince === 1) {
        // Consecutive day - increment streak
        const newStreak = (streak.current_streak || 0) + 1;
        await supabase
          .from('study_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streak.longest_streak || 0),
            last_study_date: today,
            total_study_days: (streak.total_study_days || 0) + 1
          })
          .eq('user_id', userId);

        // Award milestone points
        if (newStreak % 7 === 0) {
          await this.awardPoints(userId, newStreak * 5, 'streak_milestone', null, `${newStreak}-day study streak`);
        }

        // Track for streak achievements
        await this.trackAction(userId, {
          type: 'study_streak',
          metadata: { streak: newStreak }
        });
      } else if (daysSince > 1) {
        // Streak broken - reset
        await supabase
          .from('study_streaks')
          .update({
            current_streak: 1,
            last_study_date: today,
            streak_start_date: today,
            total_study_days: (streak.total_study_days || 0) + 1
          })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Error updating study streak:', error);
    }
  }

  /**
   * Award points to user
   */
  private async awardPoints(
    userId: string,
    points: number,
    source: string,
    sourceId?: string | null,
    description?: string
  ): Promise<void> {
    try {
      // Log in academic points table
      await supabase.from('academic_points_log').insert({
        user_id: userId,
        points,
        source,
        source_id: sourceId,
        description: description || this.getPointsDescription(source)
      });

      // Update user's total points using database function
      await supabase.rpc('increment_user_points', {
        user_id_param: userId,
        points_param: points
      });
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }

  /**
   * Unlock achievement
   */
  private async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
      // Mark as unlocked
      await supabase
        .from('user_academic_achievements')
        .upsert({
          user_id: userId,
          achievement_key: achievement.achievement_key,
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
          progress: achievement.criteria.target,
          target: achievement.criteria.target
        });

      // Award achievement points
      await this.awardPoints(
        userId,
        achievement.points_reward,
        'achievement_unlocked',
        achievement.id,
        `Unlocked: ${achievement.name}`
      );

      // TODO: Create notification for achievement unlock
      // This would integrate with the existing notification system
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }

  /**
   * Get or create user progress for an achievement
   */
  private async getUserProgress(userId: string, achievementKey: string): Promise<UserAchievement | null> {
    try {
      const { data, error } = await supabase
        .from('user_academic_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_key', achievementKey)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  /**
   * Update progress for an achievement
   */
  private async updateProgress(
    userId: string,
    achievementKey: string,
    progress: number,
    target: number
  ): Promise<void> {
    try {
      await supabase
        .from('user_academic_achievements')
        .upsert({
          user_id: userId,
          achievement_key: achievementKey,
          progress,
          target,
          is_unlocked: false
        });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }

  /**
   * Calculate new progress based on action
   */
  private calculateProgress(
    currentProgress: UserAchievement | null,
    _action: AchievementAction,
    _achievement: Achievement
  ): number {
    const existingProgress = currentProgress?.progress || 0;

    // Simple increment for most achievement types
    return existingProgress + 1;
  }

  /**
   * Get relevant achievements for an action type
   */
  private async getRelevantAchievements(actionType: string): Promise<Achievement[]> {
    try {
      const criteriaTypeMap: Record<string, string[]> = {
        'assignment_submitted': ['on_time_assignments', 'assignment_streak'],
        'early_submission': ['early_submissions'],
        'study_session_completed': ['study_sessions', 'study_hours'],
        'study_streak': ['study_streak'],
        'tutor_question_asked': ['tutor_questions'],
        'practice_quiz_completed': ['practice_quizzes'],
        'grade_improvement': ['grade_improvement'],
        'high_grade': ['course_average', 'assignment_grade', 'quiz_performance', 'consistent_grades']
      };

      const criteriaTypes = criteriaTypeMap[actionType] || [];

      if (criteriaTypes.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('academic_achievements')
        .select('*')
        .eq('is_active', true)
        .in('criteria->type', criteriaTypes);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting relevant achievements:', error);
      return [];
    }
  }

  /**
   * Get user's achievement data
   */
  async getUserAchievements(userId: string): Promise<UserAchievementData> {
    try {
      // Get all achievements with user progress
      const { data: achievements, error: achievementsError } = await supabase
        .from('academic_achievements')
        .select(`
          *,
          user_progress:user_academic_achievements!left(*)
        `)
        .eq('is_active', true)
        .eq('user_progress.user_id', userId);

      if (achievementsError) throw achievementsError;

      // Get study streak
      const { data: streak, error: streakError } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        throw streakError;
      }

      // Calculate stats
      const processedAchievements = (achievements || []).map(a => ({
        ...a,
        user_progress: a.user_progress?.[0] || null
      }));

      const unlocked = processedAchievements.filter(a => a.user_progress?.is_unlocked).length;
      const total = processedAchievements.length;
      const totalPoints = processedAchievements
        .filter(a => a.user_progress?.is_unlocked)
        .reduce((sum, a) => sum + a.points_reward, 0);

      return {
        achievements: processedAchievements,
        streak: streak || null,
        stats: {
          unlocked,
          total,
          percentage: total > 0 ? (unlocked / total) * 100 : 0,
          totalPoints
        }
      };
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return {
        achievements: [],
        streak: null,
        stats: { unlocked: 0, total: 0, percentage: 0, totalPoints: 0 }
      };
    }
  }

  /**
   * Get points description
   */
  private getPointsDescription(source: string): string {
    const descriptions: Record<string, string> = {
      assignment_on_time: 'On-time assignment submission',
      assignment_early: 'Early assignment submission',
      study_session: 'Study session completed',
      ai_tutor_question: 'AI tutor question',
      practice_quiz: 'Practice quiz completed',
      achievement_unlocked: 'Achievement unlocked',
      streak_milestone: 'Study streak milestone'
    };

    return descriptions[source] || source;
  }
}

// Export singleton instance
export const achievementTracker = new AcademicAchievementTracker();
