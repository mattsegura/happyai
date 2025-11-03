-- =====================================================
-- SEED NOTIFICATION TEMPLATES
-- =====================================================
-- This migration populates the notification_templates table with
-- predefined notification types for the smart notification system
-- =====================================================

-- =====================================================
-- 1. DEADLINE NOTIFICATIONS
-- =====================================================

INSERT INTO notification_templates (
  template_key,
  type,
  title_template,
  body_template,
  action_url_template,
  action_label,
  priority,
  description
) VALUES

-- Assignment due tomorrow
('assignment_due_tomorrow', 'deadline',
  'Assignment Due Tomorrow',
  '{{assignment_name}} is due tomorrow at {{due_time}}. Have you started working on it?',
  '/academics?view=grades',
  'View Assignment',
  80,
  'Sent 1 day before assignment due date'),

-- Assignment due today
('assignment_due_today', 'deadline',
  'Assignment Due Today!',
  '{{assignment_name}} is due today at {{due_time}}. {{hours_left}} hours remaining.',
  '/academics?view=grades',
  'View Assignment',
  90,
  'Sent on day of assignment due date if less than 12 hours remain'),

-- Quiz tomorrow
('quiz_tomorrow', 'deadline',
  'Quiz Tomorrow',
  'You have a quiz in {{course_name}} tomorrow at {{quiz_time}}. Ready to ace it?',
  '/academics?view=calendar',
  'View Calendar',
  85,
  'Sent 1 day before quiz'),

-- Study session starting
('study_session_starting', 'deadline',
  'Study Session Starting Soon',
  'Your {{session_name}} starts in 15 minutes. Time to focus!',
  '/academics?view=planner',
  'View Planner',
  70,
  'Sent 15 minutes before scheduled study session'),

-- Exam coming up
('exam_coming_up', 'deadline',
  'Exam in {{days}} Days',
  'Your {{course_name}} exam is on {{exam_date}}. Have you started reviewing?',
  '/academics?view=tutor',
  'Start Review',
  85,
  'Sent 3-7 days before exam');

-- =====================================================
-- 2. MOOD-TRIGGERED NOTIFICATIONS
-- =====================================================

INSERT INTO notification_templates (
  template_key,
  type,
  title_template,
  body_template,
  action_url_template,
  action_label,
  priority,
  description
) VALUES

-- Heavy workload + low mood
('heavy_load_low_mood', 'mood',
  'Take Care of Yourself',
  'You have {{assignment_count}} assignments due soon and your mood has been low. Consider taking a break or reaching out for support.',
  '/student/hapilab',
  'Talk to HapiLab',
  95,
  'Triggered when mood average < 3 and 3+ assignments due within 7 days'),

-- Stressed with deadlines
('stressed_with_deadlines', 'mood',
  'Feeling Stressed?',
  'You seem stressed and have multiple deadlines coming up. Would you like help creating a manageable study plan?',
  '/academics?view=planner',
  'Generate Study Plan',
  90,
  'Triggered when latest mood is 1-2 (negative) and 2+ assignments due within 3 days'),

-- Consistently low mood
('consistently_low_mood', 'mood',
  'We''re Here for You',
  'Your mood has been low for {{days}} days. Remember, it''s okay to ask for help. Consider talking to someone.',
  '/student/hapilab',
  'Get Support',
  95,
  'Triggered when mood average < 2.5 for 5+ consecutive days'),

-- Improved mood after struggle
('mood_improvement', 'mood',
  'Great Progress!',
  'Your mood has improved significantly! Keep up the positive momentum.',
  '/academics',
  'View Dashboard',
  50,
  'Triggered when mood jumps from < 3 to > 4 over 3 days');

-- =====================================================
-- 3. PERFORMANCE-TRIGGERED NOTIFICATIONS
-- =====================================================

INSERT INTO notification_templates (
  template_key,
  type,
  title_template,
  body_template,
  action_url_template,
  action_label,
  priority,
  description
) VALUES

-- Grade dropped
('grade_dropped', 'performance',
  'Grade Alert',
  'Your grade in {{course_name}} has dropped to {{new_grade}}%. Let''s create a plan to improve it.',
  '/academics?view=grades&course={{course_id}}',
  'View Course',
  85,
  'Triggered when course grade drops by 5% or more'),

-- Missing assignments
('missing_assignments', 'performance',
  'Missing Assignments',
  'You have {{count}} missing assignments. Would you like to create a catch-up plan?',
  '/academics?view=planner',
  'Create Plan',
  80,
  'Triggered when 2+ assignments are marked as missing'),

-- Low quiz score
('low_quiz_score', 'performance',
  'Quiz Review Needed',
  'You scored {{score}}% on the recent {{quiz_name}}. Consider reviewing the material or asking for help.',
  '/academics?view=tutor',
  'Get Help',
  75,
  'Triggered when quiz score is below 70%'),

-- Multiple late submissions
('late_submissions', 'performance',
  'Late Submission Pattern',
  'You''ve had {{count}} late submissions recently. Let''s adjust your schedule to stay on track.',
  '/academics?view=planner',
  'Adjust Schedule',
  80,
  'Triggered when 3+ assignments submitted late in past 2 weeks'),

-- Course grade at risk
('grade_at_risk', 'performance',
  'Course Grade Alert',
  'Your current grade in {{course_name}} is {{grade}}%. You need {{points_needed}} points to reach {{target_grade}}%.',
  '/academics?view=grades&course={{course_id}}',
  'View Details',
  85,
  'Triggered when course grade falls below 70%');

-- =====================================================
-- 4. AI-GENERATED SUGGESTIONS
-- =====================================================

INSERT INTO notification_templates (
  template_key,
  type,
  title_template,
  body_template,
  action_url_template,
  action_label,
  priority,
  description
) VALUES

-- AI suggests study block
('ai_study_block', 'ai_suggestion',
  'Study Suggestion',
  'Based on your schedule and upcoming assignments, I suggest a {{duration}}-hour study block {{when}}.',
  '/academics?view=planner',
  'Add to Calendar',
  60,
  'AI-generated study block suggestion based on workload analysis'),

-- Review recommendation
('ai_review_recommendation', 'ai_suggestion',
  'Review Recommendation',
  'Your {{course_name}} exam is in {{days}} days. I recommend reviewing: {{topics}}.',
  '/academics?view=tutor',
  'Start Review',
  70,
  'AI-generated review recommendation before exams'),

-- Workload warning
('ai_workload_warning', 'ai_suggestion',
  'Workload Alert',
  'Next week looks very busy with {{load}}% capacity. Consider rescheduling some tasks or starting early.',
  '/academics?view=planner',
  'Adjust Schedule',
  65,
  'AI-detected workload spike for upcoming week'),

-- Study break reminder
('ai_break_reminder', 'ai_suggestion',
  'Time for a Break',
  'You''ve been studying for {{hours}} hours. Taking regular breaks improves retention and focus.',
  '/academics',
  'Got It',
  45,
  'AI reminds user to take breaks during long study sessions'),

-- Optimal study time
('ai_optimal_time', 'ai_suggestion',
  'Best Time to Study',
  'Based on your past performance, you focus best {{time_of_day}}. Plan important tasks accordingly.',
  '/academics?view=planner',
  'View Planner',
  55,
  'AI identifies user''s optimal study times based on performance patterns');

-- =====================================================
-- 5. ACHIEVEMENT NOTIFICATIONS
-- =====================================================

INSERT INTO notification_templates (
  template_key,
  type,
  title_template,
  body_template,
  action_url_template,
  action_label,
  priority,
  description
) VALUES

-- Achievement unlocked
('achievement_unlocked', 'achievement',
  'Achievement Unlocked!',
  'Congratulations! You''ve unlocked {{achievement_name}}: {{achievement_description}}',
  '/academics?view=achievements',
  'View Achievements',
  50,
  'Notification when user earns a new achievement'),

-- Streak milestone
('streak_milestone', 'achievement',
  'Streak Milestone!',
  'Amazing! You''ve maintained a {{days}}-day study streak! Keep it up!',
  '/academics?view=achievements',
  'View Streak',
  55,
  'Notification for study streak milestones (7, 14, 30, etc. days)'),

-- Perfect week
('perfect_week', 'achievement',
  'Perfect Week!',
  'You completed all {{count}} assignments on time this week. Excellent work!',
  '/academics?view=achievements',
  'Celebrate',
  60,
  'Notification when all assignments submitted on time in a week'),

-- Grade improvement
('grade_improvement', 'achievement',
  'Grade Improvement!',
  'Your grade in {{course_name}} improved from {{old_grade}}% to {{new_grade}}%! Great progress!',
  '/academics?view=grades&course={{course_id}}',
  'View Grade',
  65,
  'Notification when course grade improves by 10% or more'),

-- Study plan completion
('study_plan_complete', 'achievement',
  'Study Plan Completed!',
  'You completed {{percentage}}% of your AI-generated study plan this week. Well done!',
  '/academics?view=planner',
  'View Planner',
  55,
  'Notification when weekly study plan is mostly or fully completed');

-- =====================================================
-- 6. ADDITIONAL HELPFUL NOTIFICATIONS
-- =====================================================

INSERT INTO notification_templates (
  template_key,
  type,
  title_template,
  body_template,
  action_url_template,
  action_label,
  priority,
  description
) VALUES

-- New assignment posted
('new_assignment_posted', 'deadline',
  'New Assignment Posted',
  '{{course_name}}: {{assignment_name}} has been posted. Due {{due_date}}.',
  '/academics?view=grades',
  'View Assignment',
  70,
  'Notification when instructor posts a new assignment'),

-- Grade posted
('grade_posted', 'performance',
  'Grade Posted',
  'Your grade for {{assignment_name}} is now available: {{grade}}',
  '/academics?view=grades',
  'View Grade',
  75,
  'Notification when assignment grade is posted'),

-- Feedback available
('feedback_available', 'performance',
  'Instructor Feedback Available',
  '{{instructor_name}} left feedback on {{assignment_name}}.',
  '/academics?view=feedback',
  'View Feedback',
  70,
  'Notification when instructor provides feedback on submission'),

-- Course average available
('course_average_updated', 'performance',
  'Course Average Updated',
  'The class average for {{course_name}} is now {{average}}%. You''re {{comparison}} the average.',
  '/academics?view=grades&course={{course_id}}',
  'View Details',
  60,
  'Notification when course average is calculated'),

-- Weekly summary
('weekly_summary', 'ai_suggestion',
  'Your Week in Review',
  'This week: {{completed}} completed, {{upcoming}} upcoming, {{grade_change}} grade change. {{sentiment}}',
  '/academics',
  'View Dashboard',
  50,
  'Weekly summary of academic activity and performance');

-- =====================================================
-- SEEDING COMPLETE
-- =====================================================
-- All notification templates have been created!
-- These templates will be used by the SmartNotificationService
-- to generate contextual notifications for users.
-- =====================================================
