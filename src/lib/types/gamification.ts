/**
 * Gamification & Achievement Type Definitions
 *
 * This file consolidates all achievement, badge, and gamification-related types.
 *
 * Last Updated: 2025-11-04
 */

// ============================================================================
// ACHIEVEMENT TYPES (from Supabase schema)
// ============================================================================

export type AchievementType =
  | 'first_pulse'
  | 'week_streak'
  | 'month_streak'
  | 'all_a_student'
  | 'grade_improver'
  | 'early_bird'
  | 'helpful_peer'
  | 'class_leader'
  | 'perfect_attendance'
  | 'assignment_master';

export type Achievement = {
  id: string;
  user_id: string;
  achievement_type: AchievementType;
  title: string;
  description: string | null;
  icon_name: string | null;
  unlocked_at: string;
};

// ============================================================================
// BADGE TYPES
// ============================================================================

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: BadgeTier;
  points_required?: number;
  criteria?: {
    type: string;
    value: number;
  };
};

export type UserBadge = {
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress?: number;
};

// ============================================================================
// POINTS & REWARDS
// ============================================================================

export type PointSource =
  | 'morning_pulse'
  | 'class_pulse_response'
  | 'hapi_moment_sent'
  | 'hapi_moment_received'
  | 'assignment_submitted'
  | 'perfect_attendance'
  | 'streak_bonus'
  | 'achievement_unlocked';

export type PointTransaction = {
  id: string;
  user_id: string;
  source: PointSource;
  points: number;
  description: string | null;
  metadata?: Record<string, any>;
  created_at: string;
};

// ============================================================================
// STREAK TRACKING
// ============================================================================

export type Streak = {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_date: string | null;
  streak_type: 'morning_pulse' | 'class_attendance' | 'assignment_submission';
};

// ============================================================================
// LEADERBOARD TYPES
// ============================================================================

export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  points: number;
  streak: number;
  badges_count: number;
};

export type LeaderboardScope = 'class' | 'university' | 'global';

export type LeaderboardFilter = {
  scope: LeaderboardScope;
  class_id?: string;
  university_id?: string;
  time_period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
};

// ============================================================================
// ACHIEVEMENT PROGRESS
// ============================================================================

export type AchievementProgress = {
  achievement_type: AchievementType;
  current_value: number;
  target_value: number;
  percentage: number;
  is_unlocked: boolean;
};

// ============================================================================
// LEVEL & XP SYSTEM
// ============================================================================

export type UserLevel = {
  user_id: string;
  current_level: number;
  current_xp: number;
  xp_for_next_level: number;
  total_xp: number;
};

export type LevelReward = {
  level: number;
  reward_type: 'badge' | 'points' | 'unlock_feature';
  reward_value: string | number;
  description: string;
};

// ============================================================================
// CHALLENGE TYPES
// ============================================================================

export type ChallengeType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'special_event';

export type Challenge = {
  id: string;
  name: string;
  description: string;
  challenge_type: ChallengeType;
  start_date: string;
  end_date: string;
  points_reward: number;
  badge_reward_id?: string | null;
  target_value: number;
  criteria: Record<string, any>;
  is_active: boolean;
};

export type UserChallengeProgress = {
  user_id: string;
  challenge_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string | null;
};
