/*
  # Seed Academic Achievements

  ## Overview
  Populates the academic_achievements table with predefined achievements
  across all categories: assignments, study, grades, tutor, and planner.

  ## Achievement Tiers
  - Bronze: Entry-level achievements (25-50 points)
  - Silver: Moderate difficulty (75-150 points)
  - Gold: Challenging achievements (200-300 points)
  - Platinum: Elite achievements (500-1000 points)
*/

-- ============================================================================
-- ASSIGNMENT ACHIEVEMENTS
-- ============================================================================

INSERT INTO academic_achievements (achievement_key, name, description, icon, category, tier, points_reward, criteria) VALUES

-- Bronze
('first_submission', 'First Steps', 'Submitted your first assignment on time', '📝', 'assignments', 'bronze', 25,
  '{"type": "on_time_assignments", "target": 1}'),

('early_bird', 'Early Bird', 'Submitted 5 assignments at least 24 hours early', '🐦', 'assignments', 'bronze', 50,
  '{"type": "early_submissions", "target": 5}'),

-- Silver
('perfect_week', 'Perfect Week', 'Submitted all assignments on time for a week', '🎯', 'assignments', 'silver', 100,
  '{"type": "on_time_assignments", "target": 5, "window": "week"}'),

('early_achiever', 'Early Achiever', 'Submitted 10 assignments at least 48 hours early', '⏰', 'assignments', 'silver', 150,
  '{"type": "early_submissions", "target": 10, "hours_early": 48}'),

-- Gold
('deadline_crusher', 'Deadline Crusher', 'Submitted 20 assignments on time', '💪', 'assignments', 'gold', 200,
  '{"type": "on_time_assignments", "target": 20}'),

('perfect_month', 'Perfect Month', 'Submitted all assignments on time for a month', '🗓️', 'assignments', 'gold', 300,
  '{"type": "on_time_assignments", "target": 20, "window": "month"}'),

-- Platinum
('assignment_streak', 'Assignment Streak Legend', 'Submitted assignments on time for 8 weeks straight', '🔥', 'assignments', 'platinum', 500,
  '{"type": "assignment_streak", "target": 8, "unit": "weeks"}'),

('never_late', 'Never Late', 'Submitted 50 assignments on time without a single late submission', '👑', 'assignments', 'platinum', 1000,
  '{"type": "on_time_assignments", "target": 50, "no_late": true}');

-- ============================================================================
-- STUDY STREAK ACHIEVEMENTS
-- ============================================================================

INSERT INTO academic_achievements (achievement_key, name, description, icon, category, tier, points_reward, criteria) VALUES

-- Bronze
('study_starter', 'Study Starter', 'Completed a study session for 3 days in a row', '📚', 'study', 'bronze', 30,
  '{"type": "study_streak", "target": 3}'),

('consistent_learner', 'Consistent Learner', 'Logged 5 study sessions', '✏️', 'study', 'bronze', 40,
  '{"type": "study_sessions", "target": 5}'),

-- Silver
('dedicated_learner', 'Dedicated Learner', 'Maintained 7-day study streak', '🎓', 'study', 'silver', 100,
  '{"type": "study_streak", "target": 7}'),

('study_marathon', 'Study Marathon', 'Completed 20 study sessions', '🏃', 'study', 'silver', 125,
  '{"type": "study_sessions", "target": 20}'),

-- Gold
('streak_master', 'Streak Master', 'Maintained 30-day study streak', '🏆', 'study', 'gold', 300,
  '{"type": "study_streak", "target": 30}'),

('focused_scholar', 'Focused Scholar', 'Completed 50 study sessions', '🎯', 'study', 'gold', 250,
  '{"type": "study_sessions", "target": 50}'),

-- Platinum
('study_legend', 'Study Legend', 'Maintained 90-day study streak', '👑', 'study', 'platinum', 1000,
  '{"type": "study_streak", "target": 90}'),

('academic_warrior', 'Academic Warrior', 'Logged 100 hours of study time', '⚔️', 'study', 'platinum', 800,
  '{"type": "study_hours", "target": 100}');

-- ============================================================================
-- GRADE ACHIEVEMENTS
-- ============================================================================

INSERT INTO academic_achievements (achievement_key, name, description, icon, category, tier, points_reward, criteria) VALUES

-- Bronze
('first_a', 'First A', 'Earned your first A on an assignment', '🅰️', 'grades', 'bronze', 50,
  '{"type": "assignment_grade", "target": 1, "threshold": 90}'),

-- Silver
('grade_improver', 'Grade Improver', 'Improved grade by 10%+ in a course', '📈', 'grades', 'silver', 150,
  '{"type": "grade_improvement", "target": 10, "unit": "percent"}'),

('quiz_champion', 'Quiz Champion', 'Scored 90%+ on 5 quizzes', '🎯', 'grades', 'silver', 100,
  '{"type": "quiz_performance", "target": 5, "threshold": 90}'),

('consistent_performer', 'Consistent Performer', 'Scored 85%+ on 10 assignments', '⭐', 'grades', 'silver', 125,
  '{"type": "consistent_grades", "target": 10, "threshold": 85}'),

-- Gold
('honors_student', 'Honors Student', 'Maintained 90%+ average in a course', '🌟', 'grades', 'gold', 250,
  '{"type": "course_average", "target": 90}'),

('perfect_score', 'Perfect Score', 'Achieved 100% on 3 assignments', '💯', 'grades', 'gold', 200,
  '{"type": "perfect_assignments", "target": 3}'),

-- Platinum
('dean_list', 'Dean''s List', 'Maintained 95%+ average across all courses', '🏅', 'grades', 'platinum', 750,
  '{"type": "overall_average", "target": 95}'),

('excellence_master', 'Excellence Master', 'Maintained 90%+ average in 3 courses simultaneously', '👑', 'grades', 'platinum', 1000,
  '{"type": "multiple_course_average", "target": 3, "threshold": 90}');

-- ============================================================================
-- AI TUTOR ACHIEVEMENTS
-- ============================================================================

INSERT INTO academic_achievements (achievement_key, name, description, icon, category, tier, points_reward, criteria) VALUES

-- Bronze
('curious_mind', 'Curious Mind', 'Asked 10 questions to AI tutor', '🤔', 'tutor', 'bronze', 50,
  '{"type": "tutor_questions", "target": 10}'),

('first_quiz', 'Quiz Novice', 'Generated your first practice quiz', '📝', 'tutor', 'bronze', 30,
  '{"type": "practice_quizzes", "target": 1}'),

-- Silver
('inquisitive_learner', 'Inquisitive Learner', 'Asked 25 questions to AI tutor', '💡', 'tutor', 'silver', 100,
  '{"type": "tutor_questions", "target": 25}'),

('quiz_enthusiast', 'Quiz Enthusiast', 'Completed 5 practice quizzes', '✅', 'tutor', 'silver', 125,
  '{"type": "practice_quizzes", "target": 5}'),

-- Gold
('tutor_expert', 'Tutor Expert', 'Asked 50+ questions to AI tutor', '🧠', 'tutor', 'gold', 200,
  '{"type": "tutor_questions", "target": 50}'),

('quiz_master', 'Quiz Master', 'Generated and completed 10 practice quizzes', '✍️', 'tutor', 'gold', 250,
  '{"type": "practice_quizzes", "target": 10}'),

-- Platinum
('ai_scholar', 'AI Scholar', 'Asked 100+ questions to AI tutor', '🤖', 'tutor', 'platinum', 500,
  '{"type": "tutor_questions", "target": 100}'),

('mastery_seeker', 'Mastery Seeker', 'Completed 25 practice quizzes with 85%+ average', '🎓', 'tutor', 'platinum', 800,
  '{"type": "practice_quizzes", "target": 25, "avg_score": 85}');

-- ============================================================================
-- PLANNER ACHIEVEMENTS
-- ============================================================================

INSERT INTO academic_achievements (achievement_key, name, description, icon, category, tier, points_reward, criteria) VALUES

-- Bronze
('planner_beginner', 'Planner Beginner', 'Created your first AI study plan', '📅', 'planner', 'bronze', 40,
  '{"type": "study_plans_created", "target": 1}'),

('plan_follower', 'Plan Follower', 'Followed AI study plan for 3 days', '✔️', 'planner', 'bronze', 50,
  '{"type": "plan_adherence", "target": 3, "unit": "days"}'),

-- Silver
('organized_student', 'Organized Student', 'Used study planner for 2 weeks', '🗂️', 'planner', 'silver', 100,
  '{"type": "planner_usage", "target": 14, "unit": "days"}'),

('session_completer', 'Session Completer', 'Completed 20 planned study sessions', '📌', 'planner', 'silver', 125,
  '{"type": "completed_sessions", "target": 20}'),

-- Gold
('planner_pro', 'Planner Pro', 'Followed AI study plan for 4 weeks with 80%+ adherence', '📆', 'planner', 'gold', 300,
  '{"type": "study_plan_adherence", "target": 4, "unit": "weeks", "threshold": 80}'),

('time_manager', 'Time Manager', 'Completed 50 planned study sessions', '⏰', 'planner', 'gold', 250,
  '{"type": "completed_sessions", "target": 50}'),

-- Platinum
('planning_master', 'Planning Master', 'Followed AI study plan for 12 weeks with 85%+ adherence', '🎯', 'planner', 'platinum', 750,
  '{"type": "study_plan_adherence", "target": 12, "unit": "weeks", "threshold": 85}'),

('organization_legend', 'Organization Legend', 'Completed 100 planned study sessions with 90%+ completion rate', '👑', 'planner', 'platinum', 1000,
  '{"type": "completed_sessions", "target": 100, "completion_rate": 90}');

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Count achievements by category and tier
DO $$
DECLARE
  total_count integer;
  category_counts jsonb;
  tier_counts jsonb;
BEGIN
  SELECT COUNT(*) INTO total_count FROM academic_achievements;

  SELECT jsonb_object_agg(category, count) INTO category_counts
  FROM (SELECT category, COUNT(*) as count FROM academic_achievements GROUP BY category) AS counts;

  SELECT jsonb_object_agg(tier, count) INTO tier_counts
  FROM (SELECT tier, COUNT(*) as count FROM academic_achievements GROUP BY tier) AS counts;

  RAISE NOTICE 'Seeded % total academic achievements', total_count;
  RAISE NOTICE 'By category: %', category_counts;
  RAISE NOTICE 'By tier: %', tier_counts;
END $$;
