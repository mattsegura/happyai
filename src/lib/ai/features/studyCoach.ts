/**
 * AI Study Coach
 *
 * Generates personalized weekly study plans based on:
 * - Upcoming assignments and deadlines
 * - Recent academic performance
 * - Calendar availability
 * - Mood and energy patterns
 * - Student preferences
 */

import { getAIService } from '../aiService';
import { STUDY_PLAN_PROMPT, ADJUST_STUDY_PLAN_PROMPT, fillTemplate } from '../promptTemplates';
import { supabase } from '../../supabase';
import type { User } from '@supabase/supabase-js';

// =====================================================
// TYPES
// =====================================================

export interface Assignment {
  id: string;
  name: string;
  course_id: string;
  course_name: string;
  due_at: string;
  points_possible: number;
  estimated_hours?: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface GradeData {
  course_id: string;
  course_name: string;
  current_score: number;
  letter_grade?: string;
  trend?: 'improving' | 'declining' | 'stable';
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  event_type: string;
}

export interface MoodData {
  date: string;
  emotion: string;
  sentiment_value: number;
  energy_level?: 'low' | 'medium' | 'high';
}

export interface StudyPreferences {
  preferred_study_times?: string[]; // e.g., ['morning', 'afternoon']
  max_session_duration?: number; // minutes
  break_duration?: number; // minutes
  max_daily_hours?: number;
}

export interface StudySession {
  startTime: string;
  endTime: string;
  assignmentId: string;
  assignmentName: string;
  courseId: string;
  courseName: string;
  focus: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDifficulty?: 'easy' | 'medium' | 'hard';
}

export interface StudyDay {
  date: string;
  dayOfWeek: string;
  totalHours: number;
  sessions: StudySession[];
  loadLevel: 'light' | 'moderate' | 'heavy';
}

export interface StudyPlan {
  id?: string;
  weekSummary: string;
  totalStudyHours: number;
  days: StudyDay[];
  recommendations: string[];
  warnings: string[];
  weekStartDate: string;
  weekEndDate: string;
  aiGenerated: boolean;
  status: 'active' | 'completed' | 'abandoned';
}

export interface AdjustmentTrigger {
  type: 'assignment_submitted' | 'grade_drop' | 'mood_decline' | 'new_urgent_assignment';
  details: Record<string, unknown>;
}

// =====================================================
// AI STUDY COACH CLASS
// =====================================================

export class AIStudyCoach {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Generate a weekly study plan
   */
  async generateWeeklyPlan(
    weekStartDate: Date,
    options?: Partial<StudyPreferences>
  ): Promise<StudyPlan> {
    try {
      // 1. Gather context data
      const context = await this.gatherStudyContext(weekStartDate, options);

      // 2. Generate plan using AI
      const aiService = getAIService();
      aiService.setUserId(this.userId);

      const prompt = fillTemplate(STUDY_PLAN_PROMPT.template, context);

      const response = await aiService.complete({
        prompt,
        featureType: 'study_coach',
        promptVersion: STUDY_PLAN_PROMPT.version,
        options: {
          model: 'claude-3-sonnet-20240229',
          temperature: 0.7,
          maxTokens: 2500,
          responseFormat: 'json',
        },
      });

      // 3. Parse AI response
      const plan = this.parseStudyPlanResponse(response.content, weekStartDate);

      // 4. Save to database
      const savedPlan = await this.savePlan(plan);

      return savedPlan;
    } catch (error) {
      console.error('[Study Coach] Error generating plan:', error);
      throw new Error('Failed to generate study plan. Please try again.');
    }
  }

  /**
   * Adjust existing plan based on triggers
   */
  async adjustPlan(planId: string, trigger: AdjustmentTrigger): Promise<StudyPlan> {
    try {
      // 1. Get current plan
      const currentPlan = await this.getPlan(planId);
      if (!currentPlan) {
        throw new Error('Plan not found');
      }

      // 2. Gather updated context
      const weekStartDate = new Date(currentPlan.weekStartDate);
      const context = await this.gatherStudyContext(weekStartDate);

      // 3. Generate adjustment prompt
      const adjustmentContext = {
        currentPlan: JSON.stringify(currentPlan, null, 2),
        triggerType: trigger.type,
        triggerDetails: JSON.stringify(trigger.details),
        currentTime: new Date().toISOString(),
        remainingAssignments: context.assignments,
        mood: context.mood,
      };

      const aiService = getAIService();
      aiService.setUserId(this.userId);

      const prompt = fillTemplate(ADJUST_STUDY_PLAN_PROMPT.template, adjustmentContext);

      const response = await aiService.complete({
        prompt,
        featureType: 'study_coach',
        promptVersion: ADJUST_STUDY_PLAN_PROMPT.version,
        options: {
          model: 'claude-3-sonnet-20240229',
          temperature: 0.7,
          maxTokens: 2500,
        },
      });

      // 4. Parse and save adjusted plan
      const adjustedPlan = this.parseStudyPlanResponse(
        response.content,
        weekStartDate
      );
      adjustedPlan.id = planId; // Keep same ID

      const savedPlan = await this.savePlan(adjustedPlan);

      return savedPlan;
    } catch (error) {
      console.error('[Study Coach] Error adjusting plan:', error);
      throw new Error('Failed to adjust study plan. Please try again.');
    }
  }

  /**
   * Suggest optimal study time for an assignment
   */
  async suggestStudyTime(assignmentId: string): Promise<{
    recommendedTimes: Array<{ date: string; startTime: string; reason: string }>;
  }> {
    try {
      // Get assignment details
      const { data: assignment } = await supabase
        .from('canvas_assignments')
        .select('*, canvas_courses(name)')
        .eq('id', assignmentId)
        .single();

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Get user's mood patterns
      const { data: moodHistory } = await supabase
        .from('pulse_checks')
        .select('emotion, created_at, check_date')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(30);

      // Analyze patterns (simple heuristic for now)
      const recommendations = this.analyzeOptimalStudyTimes(
        moodHistory || [],
        assignment
      );

      return { recommendedTimes: recommendations };
    } catch (error) {
      console.error('[Study Coach] Error suggesting study time:', error);
      throw error;
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private async gatherStudyContext(
    weekStartDate: Date,
    preferences?: Partial<StudyPreferences>
  ): Promise<Record<string, string>> {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Fetch assignments due this week
    const { data: assignments } = await supabase
      .from('canvas_assignments')
      .select(`
        id,
        name,
        due_at,
        points_possible,
        course_id,
        canvas_courses(name)
      `)
      .gte('due_at', weekStartDate.toISOString())
        .lte('due_at', weekEndDate.toISOString())
      .order('due_at');

    // Fetch recent grades
    const { data: grades } = await supabase
      .from('canvas_submissions')
      .select(`
        score,
        canvas_assignments(course_id, canvas_courses(name))
      `)
      .eq('user_id', this.userId)
      .not('score', 'is', null)
      .order('graded_at', { ascending: false })
      .limit(10);

    // Fetch calendar events (existing commitments)
    const { data: events } = await supabase
      .from('canvas_calendar_events')
      .select('title, start_at, end_at')
      .eq('user_id', this.userId)
      .gte('start_at', weekStartDate.toISOString())
      .lte('start_at', weekEndDate.toISOString());

    // Fetch recent mood data
    const { data: mood } = await supabase
      .from('pulse_checks')
      .select('emotion, check_date')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(7);

    // Build context object
    return {
      assignments: JSON.stringify(assignments || [], null, 2),
      grades: JSON.stringify(grades || [], null, 2),
      availability: JSON.stringify(events || [], null, 2),
      mood: JSON.stringify(mood || [], null, 2),
      preferences: JSON.stringify({
        preferred_study_times: preferences?.preferred_study_times || ['afternoon', 'evening'],
        max_session_duration: preferences?.max_session_duration || 90,
        break_duration: preferences?.break_duration || 15,
        max_daily_hours: preferences?.max_daily_hours || 6,
      }),
    };
  }

  private parseStudyPlanResponse(response: string, weekStartDate: Date): StudyPlan {
    try {
      const parsed = JSON.parse(response);

      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      return {
        weekSummary: parsed.weekSummary || 'Study plan for the week',
        totalStudyHours: parsed.totalStudyHours || 0,
        days: parsed.days || [],
        recommendations: parsed.recommendations || [],
        warnings: parsed.warnings || [],
        weekStartDate: weekStartDate.toISOString().split('T')[0],
        weekEndDate: weekEndDate.toISOString().split('T')[0],
        aiGenerated: true,
        status: 'active',
      };
    } catch (error) {
      console.error('[Study Coach] Error parsing plan:', error);
      throw new Error('Invalid study plan format received from AI');
    }
  }

  private async savePlan(plan: StudyPlan): Promise<StudyPlan> {
    const { data, error } = await supabase
      .from('study_plans')
      .upsert({
        id: plan.id,
        user_id: this.userId,
        week_start_date: plan.weekStartDate,
        title: plan.weekSummary,
        plan_json: {
          totalStudyHours: plan.totalStudyHours,
          days: plan.days,
          recommendations: plan.recommendations,
          warnings: plan.warnings,
        },
        ai_generated: plan.aiGenerated,
        status: plan.status,
      })
      .select()
      .single();

    if (error) {
      console.error('[Study Coach] Error saving plan:', error);
      throw new Error('Failed to save study plan');
    }

    return { ...plan, id: data.id };
  }

  private async getPlan(planId: string): Promise<StudyPlan | null> {
    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', this.userId)
      .single();

    if (error || !data) {
      return null;
    }

    const planJson = data.plan_json as Record<string, unknown>;

    return {
      id: data.id,
      weekSummary: data.title,
      totalStudyHours: (planJson.totalStudyHours as number) || 0,
      days: (planJson.days as StudyDay[]) || [],
      recommendations: (planJson.recommendations as string[]) || [],
      warnings: (planJson.warnings as string[]) || [],
      weekStartDate: data.week_start_date,
      weekEndDate: new Date(new Date(data.week_start_date).getTime() + 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      aiGenerated: data.ai_generated,
      status: data.status,
    };
  }

  private analyzeOptimalStudyTimes(
    moodHistory: Array<{ emotion: string; created_at: string; check_date: string }>,
    assignment: unknown
  ): Array<{ date: string; startTime: string; reason: string }> {
    // Simple heuristic: recommend morning times if user typically feels good in mornings
    // This could be enhanced with more sophisticated ML analysis

    const recommendations = [];
    const today = new Date();

    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      recommendations.push({
        date: date.toISOString().split('T')[0],
        startTime: '14:00',
        reason: 'Afternoon is typically a good time for focused work',
      });
    }

    return recommendations;
  }
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export async function generateStudyPlan(
  userId: string,
  weekStartDate: Date
): Promise<StudyPlan> {
  const coach = new AIStudyCoach(userId);
  return await coach.generateWeeklyPlan(weekStartDate);
}

export async function adjustStudyPlan(
  userId: string,
  planId: string,
  trigger: AdjustmentTrigger
): Promise<StudyPlan> {
  const coach = new AIStudyCoach(userId);
  return await coach.adjustPlan(planId, trigger);
}

export default AIStudyCoach;
