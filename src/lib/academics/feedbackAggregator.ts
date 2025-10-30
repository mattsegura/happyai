/**
 * Feedback Aggregator Service
 *
 * Centralized service for aggregating and analyzing instructor feedback
 * across all courses. Provides sentiment analysis, pattern detection,
 * and improvement goal generation.
 */

import { supabase } from '../supabase';
import { getAIService } from '../ai/aiService';
import type { AIFeatureType } from '../ai/aiTypes';

// =====================================================
// TYPES
// =====================================================

export interface InstructorFeedback {
  id: string;
  userId: string;
  submissionId: string;
  courseId: string;
  courseName?: string;
  assignmentId: string;
  assignmentName?: string;
  instructorId?: string;
  instructorName?: string;
  feedbackText: string;
  rubricData?: any;
  score: number;
  pointsPossible: number;
  sentimentScore?: number;
  sentimentLabel?: 'positive' | 'neutral' | 'negative';
  keyThemes?: string[];
  strengths?: string[];
  improvements?: string[];
  analyzedAt?: string;
  aiExplanation?: string;
  createdAt: string;
}

export interface FeedbackPattern {
  id: string;
  userId: string;
  patternType: 'strength' | 'weakness' | 'trend' | 'instructor_style';
  category: string;
  description: string;
  evidence: any[];
  occurrences: number;
  coursesAffected: string[];
  assignmentsAffected?: string[];
  firstDetectedAt: string;
  lastDetectedAt: string;
  severity?: 'high' | 'medium' | 'low';
  confidence: number;
  improvementTrend?: 'improving' | 'stable' | 'declining';
}

export interface ImprovementGoal {
  id: string;
  userId: string;
  patternId?: string;
  goalTitle: string;
  goalDescription: string;
  goalCategory?: string;
  actionItems: ActionItem[];
  resources?: ResourceRecommendation[];
  successCriteria?: string[];
  targetCourses?: string[];
  targetTimeline?: string;
  status: 'active' | 'in_progress' | 'completed' | 'dismissed' | 'archived';
  progress: number;
  progressNotes?: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ActionItem {
  step: string;
  how: string;
  resources?: string[];
  completed?: boolean;
}

export interface ResourceRecommendation {
  title: string;
  type: 'article' | 'video' | 'practice' | 'tool';
  url?: string;
  description: string;
}

export interface SentimentStats {
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  average: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
}

export interface TimelineEntry {
  id: string;
  eventType: 'feedback_received' | 'pattern_detected' | 'goal_created' | 'goal_completed' | 'milestone_reached';
  eventTitle: string;
  eventDescription?: string;
  courseId?: string;
  courseName?: string;
  assignmentId?: string;
  assignmentName?: string;
  sentimentLabel?: string;
  score?: number;
  pointsPossible?: number;
  eventDate: string;
}

export interface FeedbackTrend {
  periodLabel: string;
  periodStart: string;
  averageSentiment: number;
  averageScorePercentage: number;
  feedbackCount: number;
}

// =====================================================
// FEEDBACK AGGREGATOR CLASS
// =====================================================

export class FeedbackAggregator {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Sync and analyze all feedback for a user
   */
  async syncUserFeedback(): Promise<void> {
    try {
      // 1. Fetch all submissions with feedback from Canvas tables
      const submissions = await this.getSubmissionsWithFeedback();

      // 2. For each submission, analyze feedback if not already analyzed
      for (const submission of submissions) {
        const exists = await this.feedbackExists(submission.id);
        if (!exists && submission.submission_comments) {
          await this.analyzeFeedback(submission);
        }
      }

      // 3. Detect patterns across all feedback (if we have enough data)
      const feedbackCount = await this.getFeedbackCount();
      if (feedbackCount >= 3) {
        await this.detectPatterns();
      }

      // 4. Generate improvement goals from patterns
      await this.generateImprovementGoals();
    } catch (error) {
      console.error('[Feedback Aggregator] Sync error:', error);
      throw new Error('Failed to sync feedback');
    }
  }

  /**
   * Get all feedback for a user
   */
  async getAllFeedback(): Promise<InstructorFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('instructor_feedback')
        .select(`
          *,
          canvas_courses (
            id,
            name,
            course_code
          ),
          canvas_assignments (
            id,
            name
          )
        `)
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapToInstructorFeedback);
    } catch (error) {
      console.error('[Feedback Aggregator] Get feedback error:', error);
      return [];
    }
  }

  /**
   * Get feedback patterns for a user
   */
  async getPatterns(): Promise<FeedbackPattern[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_patterns')
        .select('*')
        .eq('user_id', this.userId)
        .order('confidence', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapToFeedbackPattern);
    } catch (error) {
      console.error('[Feedback Aggregator] Get patterns error:', error);
      return [];
    }
  }

  /**
   * Get improvement goals for a user
   */
  async getImprovementGoals(): Promise<ImprovementGoal[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_improvement_goals')
        .select('*')
        .eq('user_id', this.userId)
        .in('status', ['active', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapToImprovementGoal);
    } catch (error) {
      console.error('[Feedback Aggregator] Get goals error:', error);
      return [];
    }
  }

  /**
   * Get sentiment distribution
   */
  async getSentimentDistribution(courseId?: string): Promise<SentimentStats> {
    try {
      const { data, error } = await supabase
        .rpc('get_feedback_sentiment_distribution', {
          p_user_id: this.userId,
          p_course_id: courseId || null,
        });

      if (error) throw error;

      const stats = data?.[0];
      if (!stats) {
        return {
          positive: 0,
          neutral: 0,
          negative: 0,
          total: 0,
          average: 0,
          positivePercentage: 0,
          neutralPercentage: 0,
          negativePercentage: 0,
        };
      }

      return {
        positive: parseInt(stats.positive_count),
        neutral: parseInt(stats.neutral_count),
        negative: parseInt(stats.negative_count),
        total: parseInt(stats.total_count),
        average: parseFloat(stats.average_sentiment || '0'),
        positivePercentage: parseFloat(stats.positive_percentage || '0'),
        neutralPercentage: parseFloat(stats.neutral_percentage || '0'),
        negativePercentage: parseFloat(stats.negative_percentage || '0'),
      };
    } catch (error) {
      console.error('[Feedback Aggregator] Get sentiment error:', error);
      return {
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0,
        average: 0,
        positivePercentage: 0,
        neutralPercentage: 0,
        negativePercentage: 0,
      };
    }
  }

  /**
   * Get feedback timeline
   */
  async getFeedbackTimeline(): Promise<TimelineEntry[]> {
    try {
      const { data, error } = await supabase
        .from('feedback_timeline_events')
        .select(`
          *,
          canvas_courses (
            name
          ),
          canvas_assignments (
            name
          )
        `)
        .eq('user_id', this.userId)
        .order('event_date', { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((event: any) => ({
        id: event.id,
        eventType: event.event_type,
        eventTitle: event.event_title,
        eventDescription: event.event_description,
        courseId: event.course_id,
        courseName: event.canvas_courses?.name,
        assignmentId: event.assignment_id,
        assignmentName: event.canvas_assignments?.name,
        sentimentLabel: event.sentiment_label,
        score: event.score,
        pointsPossible: event.points_possible,
        eventDate: event.event_date,
      }));
    } catch (error) {
      console.error('[Feedback Aggregator] Get timeline error:', error);
      return [];
    }
  }

  /**
   * Get feedback trend over time
   */
  async getFeedbackTrend(period: 'week' | 'month' | 'semester' = 'month', lookback = 6): Promise<FeedbackTrend[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_feedback_trend', {
          p_user_id: this.userId,
          p_period: period,
          p_lookback: lookback,
        });

      if (error) throw error;

      return (data || []).map((trend: any) => ({
        periodLabel: trend.period_label,
        periodStart: trend.period_start,
        averageSentiment: parseFloat(trend.average_sentiment || '0'),
        averageScorePercentage: parseFloat(trend.average_score_percentage || '0'),
        feedbackCount: parseInt(trend.feedback_count),
      }));
    } catch (error) {
      console.error('[Feedback Aggregator] Get trend error:', error);
      return [];
    }
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, progress: number, notes?: string): Promise<void> {
    try {
      const updateData: any = {
        progress,
        updated_at: new Date().toISOString(),
      };

      if (progress === 100) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      } else if (progress > 0) {
        updateData.status = 'in_progress';
        if (!updateData.started_at) {
          updateData.started_at = new Date().toISOString();
        }
      }

      if (notes) {
        const { data: goal } = await supabase
          .from('feedback_improvement_goals')
          .select('progress_notes')
          .eq('id', goalId)
          .single();

        const progressNotes = goal?.progress_notes || [];
        progressNotes.push(`${new Date().toISOString()}: ${notes}`);
        updateData.progress_notes = progressNotes;
      }

      const { error } = await supabase
        .from('feedback_improvement_goals')
        .update(updateData)
        .eq('id', goalId)
        .eq('user_id', this.userId);

      if (error) throw error;
    } catch (error) {
      console.error('[Feedback Aggregator] Update goal error:', error);
      throw new Error('Failed to update goal progress');
    }
  }

  /**
   * Dismiss a goal
   */
  async dismissGoal(goalId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('feedback_improvement_goals')
        .update({
          status: 'dismissed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)
        .eq('user_id', this.userId);

      if (error) throw error;
    } catch (error) {
      console.error('[Feedback Aggregator] Dismiss goal error:', error);
      throw new Error('Failed to dismiss goal');
    }
  }

  // =====================================================
  // PRIVATE METHODS
  // =====================================================

  private async getSubmissionsWithFeedback(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('canvas_submissions')
        .select(`
          id,
          score,
          grade,
          graded_at,
          submission_comments,
          course_id,
          assignment_id,
          canvas_courses (
            id,
            name,
            course_code
          ),
          canvas_assignments (
            id,
            name,
            points_possible,
            rubric
          )
        `)
        .eq('user_id', this.userId)
        .not('submission_comments', 'is', null)
        .order('graded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('[Feedback Aggregator] Get submissions error:', error);
      return [];
    }
  }

  private async feedbackExists(submissionId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('instructor_feedback')
        .select('id')
        .eq('submission_id', submissionId)
        .eq('user_id', this.userId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  private async getFeedbackCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('instructor_feedback')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('[Feedback Aggregator] Get count error:', error);
      return 0;
    }
  }

  private async analyzeFeedback(submission: any): Promise<void> {
    try {
      const aiService = getAIService();
      aiService.setUserId(this.userId);

      // Extract feedback text from comments
      const feedbackText = this.extractFeedbackText(submission.submission_comments);
      if (!feedbackText) return;

      const prompt = `Analyze this instructor feedback and provide a comprehensive assessment.

Assignment: ${submission.canvas_assignments.name}
Course: ${submission.canvas_courses.name}
Student Score: ${submission.score}/${submission.canvas_assignments.points_possible} (${((submission.score / submission.canvas_assignments.points_possible) * 100).toFixed(1)}%)

Instructor Feedback:
${feedbackText}

${submission.canvas_assignments.rubric ? `Rubric:\n${JSON.stringify(submission.canvas_assignments.rubric, null, 2)}` : ''}

Provide the following in JSON format:
{
  "sentiment": {
    "score": -1 to 1 (where -1 is very negative, 0 is neutral, 1 is very positive),
    "label": "positive" | "neutral" | "negative"
  },
  "keyThemes": ["theme1", "theme2", "theme3"],
  "strengths": ["What student did well"],
  "improvements": ["Areas that need work"],
  "plainLanguageExplanation": "Student-friendly explanation of the feedback"
}

Be objective and constructive. Focus on actionable insights.`;

      const response = await aiService.complete({
        prompt,
        featureType: 'feedback_analyzer' as AIFeatureType,
        options: {
          temperature: 0.5,
          maxTokens: 1000,
          responseFormat: 'json',
        },
      });

      const analysis = JSON.parse(response.content);

      // Store in database
      await supabase.from('instructor_feedback').insert({
        user_id: this.userId,
        submission_id: submission.id,
        course_id: submission.course_id,
        assignment_id: submission.assignment_id,
        instructor_id: this.extractInstructorId(submission.submission_comments),
        instructor_name: this.extractInstructorName(submission.submission_comments),
        feedback_text: feedbackText,
        rubric_data: submission.canvas_assignments.rubric,
        score: submission.score,
        points_possible: submission.canvas_assignments.points_possible,
        sentiment_score: analysis.sentiment.score,
        sentiment_label: analysis.sentiment.label,
        key_themes: analysis.keyThemes,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        ai_explanation: analysis.plainLanguageExplanation,
        ai_model: response.model,
        analyzed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Feedback Aggregator] Analyze feedback error:', error);
    }
  }

  private async detectPatterns(): Promise<void> {
    try {
      const aiService = getAIService();
      aiService.setUserId(this.userId);

      // Fetch all analyzed feedback
      const { data: allFeedback } = await supabase
        .from('instructor_feedback')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (!allFeedback || allFeedback.length < 3) return;

      const prompt = `Analyze these instructor feedback instances to detect patterns, trends, and themes.

Student Feedback History (${allFeedback.length} items):
${allFeedback.map(f => `
Course: ${f.course_id}
Date: ${f.created_at}
Score: ${f.score}/${f.points_possible}
Sentiment: ${f.sentiment_label}
Themes: ${(f.key_themes || []).join(', ')}
Strengths: ${(f.strengths || []).join('; ')}
Improvements: ${(f.improvements || []).join('; ')}
`).join('\n---\n')}

Identify:
1. **Consistent Strengths**: What does this student consistently do well?
2. **Recurring Weaknesses**: What areas repeatedly need improvement?
3. **Trends**: Is the student improving, declining, or staying consistent?
4. **Course-Specific Patterns**: Different feedback patterns in different courses?

Return in JSON format:
{
  "patterns": [
    {
      "type": "strength" | "weakness" | "trend" | "instructor_style",
      "category": "writing" | "analysis" | "organization" | "research" | "critical_thinking" | "creativity" | "technical" | "presentation" | "collaboration" | "other",
      "description": "Clear description of the pattern",
      "evidence": ["feedback examples that show this"],
      "severity": "high" | "medium" | "low",
      "confidence": 0-1,
      "coursesAffected": ["course IDs where this appears"],
      "improvementTrend": "improving" | "stable" | "declining"
    }
  ]
}

Be specific and actionable. Focus on patterns that appear in 30%+ of feedback.`;

      const response = await aiService.complete({
        prompt,
        featureType: 'feedback_analyzer' as AIFeatureType,
        options: {
          temperature: 0.6,
          maxTokens: 2000,
          responseFormat: 'json',
        },
      });

      const { patterns } = JSON.parse(response.content);

      // Store patterns in database (upsert to avoid duplicates)
      for (const pattern of patterns) {
        // Check if pattern already exists
        const { data: existing } = await supabase
          .from('feedback_patterns')
          .select('id')
          .eq('user_id', this.userId)
          .eq('description', pattern.description)
          .single();

        if (existing) {
          // Update existing pattern
          await supabase
            .from('feedback_patterns')
            .update({
              occurrences: pattern.evidence.length,
              last_detected_at: new Date().toISOString(),
              confidence: pattern.confidence,
              courses_affected: pattern.coursesAffected,
              improvement_trend: pattern.improvementTrend,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          // Insert new pattern
          await supabase.from('feedback_patterns').insert({
            user_id: this.userId,
            pattern_type: pattern.type,
            category: pattern.category,
            description: pattern.description,
            evidence: pattern.evidence,
            occurrences: pattern.evidence.length,
            courses_affected: pattern.coursesAffected,
            severity: pattern.severity,
            confidence: pattern.confidence,
            improvement_trend: pattern.improvementTrend,
          });
        }
      }
    } catch (error) {
      console.error('[Feedback Aggregator] Detect patterns error:', error);
    }
  }

  private async generateImprovementGoals(): Promise<void> {
    try {
      const aiService = getAIService();
      aiService.setUserId(this.userId);

      // Get high-severity weakness patterns
      const { data: weaknesses } = await supabase
        .from('feedback_patterns')
        .select('*')
        .eq('user_id', this.userId)
        .eq('pattern_type', 'weakness')
        .in('severity', ['high', 'medium'])
        .order('severity', { ascending: false });

      if (!weaknesses || weaknesses.length === 0) return;

      for (const weakness of weaknesses) {
        // Check if goal already exists for this pattern
        const { data: existingGoal } = await supabase
          .from('feedback_improvement_goals')
          .select('id')
          .eq('pattern_id', weakness.id)
          .eq('status', 'active')
          .single();

        if (existingGoal) continue;

        // Generate goal with AI
        const prompt = `Create an improvement goal for this student weakness:

Pattern: ${weakness.description}
Category: ${weakness.category}
Evidence: ${JSON.stringify(weakness.evidence)}
Severity: ${weakness.severity}

Create a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound) that:
1. Addresses this weakness directly
2. Provides 3-5 concrete action items
3. Can be tracked over time
4. Is encouraging and constructive

Return in JSON format:
{
  "title": "Goal title (concise)",
  "description": "What and why",
  "category": "${weakness.category}",
  "actionItems": [
    {
      "step": "Specific action to take",
      "how": "How to do it",
      "resources": ["Optional: resources that can help"]
    }
  ],
  "resources": [
    {
      "title": "Resource name",
      "type": "article" | "video" | "practice" | "tool",
      "description": "Why this helps"
    }
  ],
  "successCriteria": ["How to know you've achieved this"],
  "targetCourses": ["${weakness.courses_affected.join('", "')}"],
  "targetTimeline": "e.g., 2-3 weeks"
}`;

        const response = await aiService.complete({
          prompt,
          featureType: 'feedback_analyzer' as AIFeatureType,
          options: {
            temperature: 0.7,
            maxTokens: 1500,
            responseFormat: 'json',
          },
        });

        const goal = JSON.parse(response.content);

        // Store goal
        await supabase.from('feedback_improvement_goals').insert({
          user_id: this.userId,
          pattern_id: weakness.id,
          goal_title: goal.title,
          goal_description: goal.description,
          goal_category: goal.category,
          action_items: goal.actionItems,
          resources: goal.resources,
          success_criteria: goal.successCriteria,
          target_courses: goal.targetCourses,
          target_timeline: goal.targetTimeline,
          status: 'active',
        });
      }
    } catch (error) {
      console.error('[Feedback Aggregator] Generate goals error:', error);
    }
  }

  private extractFeedbackText(comments: any[]): string {
    if (!comments || !Array.isArray(comments)) return '';

    return comments
      .filter((c: any) => c.author_id !== this.userId)
      .map((c: any) => c.comment || c.text_comment || '')
      .filter(text => text.trim().length > 0)
      .join('\n\n');
  }

  private extractInstructorId(comments: any[]): string | null {
    const instructorComment = comments?.find((c: any) => c.author_id !== this.userId);
    return instructorComment?.author_id || null;
  }

  private extractInstructorName(comments: any[]): string | null {
    const instructorComment = comments?.find((c: any) => c.author_id !== this.userId);
    return instructorComment?.author_name || null;
  }

  private mapToInstructorFeedback(data: any): InstructorFeedback {
    return {
      id: data.id,
      userId: data.user_id,
      submissionId: data.submission_id,
      courseId: data.course_id,
      courseName: data.canvas_courses?.name,
      assignmentId: data.assignment_id,
      assignmentName: data.canvas_assignments?.name,
      instructorId: data.instructor_id,
      instructorName: data.instructor_name,
      feedbackText: data.feedback_text,
      rubricData: data.rubric_data,
      score: data.score,
      pointsPossible: data.points_possible,
      sentimentScore: data.sentiment_score,
      sentimentLabel: data.sentiment_label,
      keyThemes: data.key_themes,
      strengths: data.strengths,
      improvements: data.improvements,
      analyzedAt: data.analyzed_at,
      aiExplanation: data.ai_explanation,
      createdAt: data.created_at,
    };
  }

  private mapToFeedbackPattern(data: any): FeedbackPattern {
    return {
      id: data.id,
      userId: data.user_id,
      patternType: data.pattern_type,
      category: data.category,
      description: data.description,
      evidence: data.evidence || [],
      occurrences: data.occurrences,
      coursesAffected: data.courses_affected || [],
      assignmentsAffected: data.assignments_affected,
      firstDetectedAt: data.first_detected_at,
      lastDetectedAt: data.last_detected_at,
      severity: data.severity,
      confidence: data.confidence,
      improvementTrend: data.improvement_trend,
    };
  }

  private mapToImprovementGoal(data: any): ImprovementGoal {
    return {
      id: data.id,
      userId: data.user_id,
      patternId: data.pattern_id,
      goalTitle: data.goal_title,
      goalDescription: data.goal_description,
      goalCategory: data.goal_category,
      actionItems: data.action_items || [],
      resources: data.resources,
      successCriteria: data.success_criteria,
      targetCourses: data.target_courses,
      targetTimeline: data.target_timeline,
      status: data.status,
      progress: data.progress,
      progressNotes: data.progress_notes,
      createdAt: data.created_at,
      startedAt: data.started_at,
      completedAt: data.completed_at,
    };
  }
}

// =====================================================
// CONVENIENCE EXPORTS
// =====================================================

export async function createFeedbackAggregator(userId: string): Promise<FeedbackAggregator> {
  return new FeedbackAggregator(userId);
}