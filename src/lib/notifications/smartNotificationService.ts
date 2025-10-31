/**
 * Smart Notification Service
 *
 * This service handles the intelligent notification system for the Academics Tab.
 * It checks various triggers (deadlines, mood, performance, AI suggestions) and
 * creates notifications based on user context and preferences.
 *
 * @module smartNotificationService
 */

import { supabase } from '../supabase';
import { getEmotionSentimentValue } from '../emotionConfig';
import {
  NotificationQueue,
  NotificationPreferences,
  UserContext,
  CreateNotificationParams,
  MoodTrendContext,
  AIStudySuggestion,
} from './types';
import {
  daysBetween,
  hoursUntil,
  minutesUntil,
  formatTime,
  startOfDay,
  addDays,
  isQuietHours,
  calculateOptimalSendTime,
  renderTemplate,
  getEnabledChannels,
  adjustPriority,
  calculateAverageSentiment,
  detectMoodTrend,
  countConsecutiveLowDays,
  calculateWorkloadPercentage,
} from './notificationHelpers';

export class SmartNotificationService {
  // =====================================================
  // MAIN SCHEDULER
  // =====================================================

  /**
   * Main entry point - checks all triggers for a user
   * This method should be called periodically by a background job
   */
  async checkAndCreateNotifications(userId: string): Promise<void> {
    try {
      console.log(`[NotificationService] Checking notifications for user: ${userId}`);

      // Get user preferences
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) {
        console.log('[NotificationService] No preferences found, creating defaults');
        return;
      }

      // Check if user can receive notifications
      const canSend = await this.canSendNotifications(prefs);
      if (!canSend) {
        console.log('[NotificationService] User cannot receive notifications (rate limit/disabled)');
        return;
      }

      // Get user context (all relevant data)
      const context = await this.getUserContext(userId);

      // Check all trigger types
      await Promise.all([
        this.checkDeadlineTriggers(userId, context, prefs),
        this.checkMoodTriggers(userId, context, prefs),
        this.checkPerformanceTriggers(userId, context, prefs),
        this.checkAISuggestions(userId, context, prefs),
        this.checkAchievementTriggers(userId, context, prefs),
      ]);

      console.log('[NotificationService] Notification check complete');
    } catch (error) {
      console.error('[NotificationService] Error checking notifications:', error);
    }
  }

  // =====================================================
  // DEADLINE-BASED TRIGGERS
  // =====================================================

  private async checkDeadlineTriggers(
    userId: string,
    context: UserContext,
    prefs: NotificationPreferences
  ): Promise<void> {
    if (!prefs.deadline_notifications) return;

    console.log('[NotificationService] Checking deadline triggers...');

    const now = new Date();

    for (const assignment of context.upcomingAssignments) {
      if (!assignment.due_at) continue;

      const dueDate = new Date(assignment.due_at);
      const daysDiff = daysBetween(now, dueDate);
      const hoursLeft = hoursUntil(dueDate);

      // Assignment due tomorrow
      if (daysDiff === 1) {
        await this.createNotification(userId, {
          templateKey: 'assignment_due_tomorrow',
          variables: {
            assignment_name: assignment.name,
            due_time: formatTime(dueDate),
          },
          scheduledFor: calculateOptimalSendTime(
            userId,
            { type: 'morning', hour: 9 },
            prefs
          ),
          priority: 80,
          metadata: {
            assignment_id: assignment.id,
            course_id: assignment.course_id,
          },
        });
      }

      // Assignment due today (less than 12 hours)
      if (daysDiff === 0 && hoursLeft <= 12 && hoursLeft > 0) {
        await this.createNotification(userId, {
          templateKey: 'assignment_due_today',
          variables: {
            assignment_name: assignment.name,
            due_time: formatTime(dueDate),
            hours_left: hoursLeft,
          },
          scheduledFor: now, // Send immediately
          priority: adjustPriority(90, { hoursUntilDeadline: hoursLeft }),
          metadata: {
            assignment_id: assignment.id,
            course_id: assignment.course_id,
          },
        });
      }
    }

    // Quiz/Exam tomorrow
    for (const event of context.calendarEvents) {
      if (
        !event.event_type ||
        !['quiz', 'exam'].includes(event.event_type.toLowerCase())
      )
        continue;

      const eventDate = new Date(event.start_at);
      const daysDiff = daysBetween(now, eventDate);

      if (daysDiff === 1) {
        await this.createNotification(userId, {
          templateKey: 'quiz_tomorrow',
          variables: {
            course_name: event.title || 'your course',
            quiz_time: formatTime(eventDate),
          },
          scheduledFor: calculateOptimalSendTime(
            userId,
            { type: 'evening', hour: 19 },
            prefs
          ),
          priority: 85,
          metadata: {
            event_id: event.id,
            course_id: event.course_id,
          },
        });
      }
    }

    // Study session starting soon
    for (const session of context.upcomingSessions) {
      const minutesLeft = minutesUntil(session.start_time);

      if (minutesLeft === 15) {
        await this.createNotification(userId, {
          templateKey: 'study_session_starting',
          variables: {
            session_name: session.title,
          },
          scheduledFor: now, // Send immediately
          priority: 70,
          metadata: {
            session_id: session.id,
          },
        });
      }
    }
  }

  // =====================================================
  // MOOD-TRIGGERED NOTIFICATIONS
  // =====================================================

  private async checkMoodTriggers(
    userId: string,
    context: UserContext,
    prefs: NotificationPreferences
  ): Promise<void> {
    if (!prefs.mood_notifications) return;

    console.log('[NotificationService] Checking mood triggers...');

    const moodTrend = context.moodTrend;

    // Heavy workload + low mood
    if (moodTrend.average < 3 && context.assignmentCount >= 3) {
      const isDuplicate = await this.checkDuplicateNotification(
        userId,
        'heavy_load_low_mood',
        48
      );
      if (!isDuplicate) {
        await this.createNotification(userId, {
          templateKey: 'heavy_load_low_mood',
          variables: {
            assignment_count: context.assignmentCount,
          },
          scheduledFor: calculateOptimalSendTime(
            userId,
            { type: 'afternoon', hour: 14 },
            prefs
          ),
          priority: adjustPriority(95, { moodSentiment: moodTrend.average }),
        });
      }
    }

    // Stressed with approaching deadlines
    if (
      context.recentMood &&
      context.recentMood.sentiment <= 2 &&
      context.upcomingAssignments.filter(
        (a) => a.due_at && daysBetween(new Date(), a.due_at) <= 3
      ).length >= 2
    ) {
      const isDuplicate = await this.checkDuplicateNotification(
        userId,
        'stressed_with_deadlines',
        24
      );
      if (!isDuplicate) {
        await this.createNotification(userId, {
          templateKey: 'stressed_with_deadlines',
          variables: {
            assignment_count: context.upcomingAssignments.filter(
              (a) => a.due_at && daysBetween(new Date(), a.due_at) <= 3
            ).length,
          },
          scheduledFor: calculateOptimalSendTime(
            userId,
            { type: 'evening', hour: 19 },
            prefs
          ),
          priority: 90,
        });
      }
    }

    // Consistently low mood (5+ consecutive days)
    if (moodTrend.consecutiveLowDays >= 5) {
      const isDuplicate = await this.checkDuplicateNotification(
        userId,
        'consistently_low_mood',
        72
      );
      if (!isDuplicate) {
        await this.createNotification(userId, {
          templateKey: 'consistently_low_mood',
          variables: {
            days: moodTrend.consecutiveLowDays,
          },
          scheduledFor: calculateOptimalSendTime(
            userId,
            { type: 'morning', hour: 10 },
            prefs
          ),
          priority: 95,
        });
      }
    }

    // Mood improvement (from low to high)
    if (moodTrend.trend === 'improving' && moodTrend.recentMoods.length >= 3) {
      const oldAvg = calculateAverageSentiment(moodTrend.recentMoods.slice(0, 3));
      const newAvg = calculateAverageSentiment(moodTrend.recentMoods.slice(-3));

      if (oldAvg < 3 && newAvg > 4) {
        const isDuplicate = await this.checkDuplicateNotification(
          userId,
          'mood_improvement',
          168
        );
        if (!isDuplicate) {
          await this.createNotification(userId, {
            templateKey: 'mood_improvement',
            variables: {},
            scheduledFor: new Date(), // Immediate positive reinforcement
            priority: 50,
          });
        }
      }
    }
  }

  // =====================================================
  // PERFORMANCE-TRIGGERED NOTIFICATIONS
  // =====================================================

  private async checkPerformanceTriggers(
    userId: string,
    context: UserContext,
    prefs: NotificationPreferences
  ): Promise<void> {
    if (!prefs.performance_notifications) return;

    console.log('[NotificationService] Checking performance triggers...');

    // Grade dropped significantly
    for (const course of context.courses) {
      if (
        course.previousGrade &&
        course.currentGrade &&
        course.previousGrade - course.currentGrade >= 5
      ) {
        const isDuplicate = await this.checkDuplicateNotification(
          userId,
          `grade_dropped_${course.id}`,
          14 * 24
        );
        if (!isDuplicate) {
          await this.createNotification(userId, {
            templateKey: 'grade_dropped',
            variables: {
              course_name: course.name,
              new_grade: course.currentGrade.toFixed(1),
            },
            scheduledFor: calculateOptimalSendTime(
              userId,
              { type: 'afternoon', hour: 14 },
              prefs
            ),
            priority: 85,
            metadata: {
              course_id: course.id,
            },
          });
        }
      }
    }

    // Missing assignments
    const missingCount = context.missingAssignments.length;
    if (missingCount >= 2) {
      const isDuplicate = await this.checkDuplicateNotification(
        userId,
        'missing_assignments',
        7 * 24
      );
      if (!isDuplicate) {
        await this.createNotification(userId, {
          templateKey: 'missing_assignments',
          variables: {
            count: missingCount,
          },
          scheduledFor: calculateOptimalSendTime(
            userId,
            { type: 'morning', hour: 9 },
            prefs
          ),
          priority: 80,
        });
      }
    }

    // Low quiz scores (recent)
    for (const submission of context.recentGrades) {
      if (
        submission.score !== undefined &&
        submission.score !== null &&
        submission.graded_at
      ) {
        const assignment = context.assignments.find(
          (a) => a.id === submission.assignment_id
        );
        if (assignment && assignment.grading_type === 'quiz') {
          const percentage =
            (submission.score / (assignment.points_possible || 100)) * 100;
          if (percentage < 70) {
            const isDuplicate = await this.checkDuplicateNotification(
              userId,
              `low_quiz_${submission.assignment_id}`,
              168
            );
            if (!isDuplicate) {
              await this.createNotification(userId, {
                templateKey: 'low_quiz_score',
                variables: {
                  quiz_name: assignment.name,
                  score: percentage.toFixed(1),
                  course_name: 'your course',
                },
                scheduledFor: calculateOptimalSendTime(
                  userId,
                  { type: 'afternoon', hour: 15 },
                  prefs
                ),
                priority: 75,
                metadata: {
                  assignment_id: assignment.id,
                  submission_id: submission.id,
                },
              });
            }
          }
        }
      }
    }

    // Multiple late submissions
    const lateCount = context.lateSubmissions.filter((s) => {
      if (!s.submitted_at) return false;
      const daysSince = daysBetween(new Date(s.submitted_at), new Date());
      return daysSince <= 14;
    }).length;

    if (lateCount >= 3) {
      const isDuplicate = await this.checkDuplicateNotification(
        userId,
        'late_submissions',
        7 * 24
      );
      if (!isDuplicate) {
        await this.createNotification(userId, {
          templateKey: 'late_submissions',
          variables: {
            count: lateCount,
          },
          scheduledFor: calculateOptimalSendTime(
            userId,
            { type: 'morning', hour: 10 },
            prefs
          ),
          priority: 80,
        });
      }
    }
  }

  // =====================================================
  // AI-GENERATED SUGGESTIONS
  // =====================================================

  private async checkAISuggestions(
    userId: string,
    context: UserContext,
    prefs: NotificationPreferences
  ): Promise<void> {
    if (!prefs.ai_suggestions) return;

    console.log('[NotificationService] Checking AI suggestions...');

    // AI study block suggestion
    const studySuggestion = await this.getAIStudySuggestion(userId, context);
    if (studySuggestion) {
      const isDuplicate = await this.checkDuplicateNotification(
        userId,
        'ai_study_block',
        12
      );
      if (!isDuplicate) {
        await this.createNotification(userId, {
          templateKey: 'ai_study_block',
          variables: {
            duration: studySuggestion.duration,
            when: studySuggestion.when,
          },
          scheduledFor: studySuggestion.suggestedTime || new Date(),
          priority: 60,
        });
      }
    }

    // Workload warning for next week
    const today = new Date();
    if (today.getDay() === 5 || today.getDay() === 6) {
      // Friday or Saturday
      const nextWeekLoad = await this.calculateNextWeekLoad(userId, context);
      if (nextWeekLoad > 80) {
        const isDuplicate = await this.checkDuplicateNotification(
          userId,
          'ai_workload_warning',
          7 * 24
        );
        if (!isDuplicate) {
          await this.createNotification(userId, {
            templateKey: 'ai_workload_warning',
            variables: {
              load: nextWeekLoad,
            },
            scheduledFor: calculateOptimalSendTime(
              userId,
              { type: 'weekend', hour: 10 },
              prefs
            ),
            priority: 65,
          });
        }
      }
    }

    // Review recommendation before exam
    for (const event of context.calendarEvents) {
      if (
        event.event_type &&
        event.event_type.toLowerCase() === 'exam' &&
        event.start_at
      ) {
        const daysUntil = daysBetween(new Date(), event.start_at);
        if (daysUntil >= 3 && daysUntil <= 7) {
          const isDuplicate = await this.checkDuplicateNotification(
            userId,
            `ai_review_${event.id}`,
            7 * 24
          );
          if (!isDuplicate) {
            await this.createNotification(userId, {
              templateKey: 'ai_review_recommendation',
              variables: {
                course_name: event.title || 'your course',
                days: daysUntil,
                topics: 'key concepts from recent lectures',
              },
              scheduledFor: calculateOptimalSendTime(
                userId,
                { type: 'afternoon', hour: 14 },
                prefs
              ),
              priority: 70,
              metadata: {
                event_id: event.id,
              },
            });
          }
        }
      }
    }
  }

  // =====================================================
  // ACHIEVEMENT TRIGGERS
  // =====================================================

  private async checkAchievementTriggers(
    userId: string,
    context: UserContext,
    prefs: NotificationPreferences
  ): Promise<void> {
    if (!prefs.achievement_notifications) return;

    console.log('[NotificationService] Checking achievement triggers...');

    // Note: Achievement notifications are typically triggered by events,
    // not by this periodic check. This is a placeholder for event-driven achievements.

    // Streak milestones would be checked here
    // Perfect week completion would be checked here
    // Grade improvements would be checked here
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  /**
   * Get user notification preferences
   */
  private async getUserPreferences(
    userId: string
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('[NotificationService] Error fetching preferences:', error);
        return null;
      }

      return data as NotificationPreferences;
    } catch (error) {
      console.error('[NotificationService] Error:', error);
      return null;
    }
  }

  /**
   * Check if user can receive notifications (rate limiting)
   */
  private async canSendNotifications(prefs: NotificationPreferences): Promise<boolean> {
    try {
      // Check if in quiet hours
      const now = new Date();
      if (isQuietHours(now, prefs)) {
        return false;
      }

      // Check daily limit
      const todayCount = await this.getTodayNotificationCount(prefs.user_id);
      if (todayCount >= prefs.max_notifications_per_day) {
        await this.logTrigger(
          prefs.user_id,
          'rate_limit',
          false,
          'Daily limit reached',
          {}
        );
        return false;
      }

      // Check minimum time between notifications
      const lastNotification = await this.getLastNotification(prefs.user_id);
      if (lastNotification && lastNotification.sent_at) {
        const hoursSince =
          (Date.now() - new Date(lastNotification.sent_at).getTime()) / 3600000;
        if (hoursSince < prefs.min_hours_between_notifications) {
          await this.logTrigger(
            prefs.user_id,
            'rate_limit',
            false,
            'Too soon after last notification',
            { hours_since: hoursSince }
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('[NotificationService] Error checking rate limits:', error);
      return false;
    }
  }

  /**
   * Get count of notifications sent today
   */
  private async getTodayNotificationCount(userId: string): Promise<number> {
    const today = startOfDay();
    const { count, error } = await supabase
      .from('notification_queue')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'sent')
      .gte('sent_at', today.toISOString());

    if (error) {
      console.error('[NotificationService] Error counting notifications:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get last notification for user
   */
  private async getLastNotification(
    userId: string
  ): Promise<NotificationQueue | null> {
    const { data, error } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('[NotificationService] Error fetching last notification:', error);
      return null;
    }

    return data as NotificationQueue | null;
  }

  /**
   * Check for duplicate notification
   */
  private async checkDuplicateNotification(
    userId: string,
    templateKey: string,
    timeWindowHours: number = 24
  ): Promise<boolean> {
    const cutoff = new Date(Date.now() - timeWindowHours * 3600000);

    const { data, error } = await supabase
      .from('notification_queue')
      .select('id')
      .eq('user_id', userId)
      .eq('template_key', templateKey)
      .gte('created_at', cutoff.toISOString())
      .in('status', ['pending', 'sent']);

    if (error) {
      console.error('[NotificationService] Error checking duplicates:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Get user context (all relevant data for trigger evaluation)
   */
  private async getUserContext(userId: string): Promise<UserContext> {
    // This is a comprehensive data fetch
    // In production, optimize with specific queries and caching

    const [
      coursesData,
      assignmentsData,
      submissionsData,
      studySessionsData,
      calendarEventsData,
      moodsData,
    ] = await Promise.all([
      supabase.from('canvas_courses').select('*').eq('user_id', userId),
      supabase
        .from('canvas_assignments')
        .select('*, canvas_courses!inner(user_id)')
        .eq('canvas_courses.user_id', userId)
        .gte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true }),
      supabase.from('canvas_submissions').select('*').eq('user_id', userId),
      supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true }),
      supabase
        .from('canvas_calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true }),
      supabase
        .from('pulse_checks')
        .select('*')
        .eq('user_id', userId)
        .order('check_date', { ascending: false })
        .limit(30),
    ]);

    // Get university_id from first course (or profile)
    const universityId = coursesData.data?.[0]?.university_id || '';

    // Process mood data
    const moods =
      moodsData.data?.map((m: any) => ({
        emotion: m.emotion,
        sentiment: getEmotionSentimentValue(m.emotion),
        intensity: m.intensity,
        check_date: m.check_date,
      })) || [];

    const moodTrend: MoodTrendContext = {
      average: calculateAverageSentiment(moods),
      trend: detectMoodTrend(moods),
      recentMoods: moods.slice(0, 7),
      consecutiveLowDays: countConsecutiveLowDays(moods),
    };

    // Get upcoming assignments (next 14 days)
    const twoWeeksLater = addDays(new Date(), 14);
    const upcomingAssignments =
      assignmentsData.data?.filter((a: any) => {
        if (!a.due_at) return false;
        const dueDate = new Date(a.due_at);
        return dueDate <= twoWeeksLater;
      }) || [];

    return {
      userId,
      universityId,
      upcomingAssignments: upcomingAssignments as any,
      courses: (coursesData.data || []) as any,
      assignments: (assignmentsData.data || []) as any,
      submissions: (submissionsData.data || []) as any,
      upcomingSessions: (studySessionsData.data || []) as any,
      calendarEvents: (calendarEventsData.data || []) as any,
      recentMood: moods[0],
      moodTrend,
      missingAssignments:
        (assignmentsData.data?.filter((a: any) => a.missing) as any) || [],
      lateSubmissions:
        (submissionsData.data?.filter((s: any) => s.late) as any) || [],
      recentGrades:
        (submissionsData.data
          ?.filter((s: any) => s.graded_at)
          .slice(0, 10) as any) || [],
      assignmentCount: upcomingAssignments.length,
    };
  }

  /**
   * AI study suggestion (simplified version)
   */
  private async getAIStudySuggestion(
    _userId: string,
    context: UserContext
  ): Promise<AIStudySuggestion | null> {
    // Simplified rule-based suggestion
    // In production, this would use actual AI/ML models

    if (context.upcomingAssignments.length === 0) return null;

    // Find next assignment due
    const nextAssignment = context.upcomingAssignments[0];
    if (!nextAssignment.due_at) return null;

    const daysUntil = daysBetween(new Date(), nextAssignment.due_at);

    if (daysUntil >= 2 && daysUntil <= 5) {
      return {
        duration: 2,
        when: daysUntil === 2 ? 'this evening' : 'in the next few days',
        reason: `to prepare for ${nextAssignment.name}`,
      };
    }

    return null;
  }

  /**
   * Calculate next week workload percentage
   */
  private async calculateNextWeekLoad(
    _userId: string,
    context: UserContext
  ): Promise<number> {
    const startOfNextWeek = addDays(startOfDay(), 7 - new Date().getDay());
    const endOfNextWeek = addDays(startOfNextWeek, 7);

    return calculateWorkloadPercentage(
      context.assignments,
      context.upcomingSessions,
      context.calendarEvents,
      startOfNextWeek,
      endOfNextWeek
    );
  }

  /**
   * Create a notification
   */
  private async createNotification(
    userId: string,
    params: CreateNotificationParams
  ): Promise<void> {
    try {
      // Check for duplicate
      const isDuplicate = await this.checkDuplicateNotification(
        userId,
        params.templateKey,
        24
      );
      if (isDuplicate) {
        await this.logTrigger(
          userId,
          params.templateKey,
          false,
          'Duplicate notification',
          params.variables
        );
        return;
      }

      // Get template
      const { data: template, error: templateError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('template_key', params.templateKey)
        .eq('is_active', true)
        .single();

      if (templateError || !template) {
        console.error('[NotificationService] Template not found:', params.templateKey);
        return;
      }

      // Get user preferences for channels
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) return;

      // Render template
      const title = renderTemplate(template.title_template, params.variables);
      const body = renderTemplate(template.body_template, params.variables);
      const actionUrl = template.action_url_template
        ? renderTemplate(template.action_url_template, params.metadata || {})
        : undefined;

      // Get university_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('university_id')
        .eq('id', userId)
        .single();

      // Insert notification
      const { data: notification, error: insertError } = await supabase
        .from('notification_queue')
        .insert({
          user_id: userId,
          university_id: profile?.university_id,
          template_key: params.templateKey,
          notification_type: template.type,
          trigger_type: template.type,
          title,
          body,
          action_url: actionUrl,
          action_label: template.action_label,
          priority: params.priority || template.priority,
          scheduled_for: params.scheduledFor.toISOString(),
          channels: getEnabledChannels(prefs),
          metadata: params.metadata,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error('[NotificationService] Error creating notification:', insertError);
        await this.logTrigger(
          userId,
          params.templateKey,
          false,
          `Error: ${insertError.message}`,
          params.variables
        );
        return;
      }

      // Log success
      await this.logTrigger(
        userId,
        params.templateKey,
        true,
        'Notification created',
        params.variables,
        notification.id
      );

      console.log('[NotificationService] Created notification:', notification.id);
    } catch (error) {
      console.error('[NotificationService] Error in createNotification:', error);
    }
  }

  /**
   * Log trigger evaluation
   */
  private async logTrigger(
    userId: string,
    triggerType: string,
    created: boolean,
    reason: string,
    data: Record<string, any>,
    notificationId?: string
  ): Promise<void> {
    try {
      await supabase.from('notification_triggers_log').insert({
        user_id: userId,
        trigger_type: triggerType,
        trigger_data: data,
        notification_created: created,
        notification_id: notificationId,
        reason,
      });
    } catch (error) {
      console.error('[NotificationService] Error logging trigger:', error);
    }
  }
}

// Export singleton instance
export const smartNotificationService = new SmartNotificationService();
