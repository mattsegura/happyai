/**
 * Feedback Analyzer
 *
 * Analyzes instructor feedback with AI to:
 * - Provide plain-language explanations
 * - Extract sentiment and themes
 * - Detect patterns across multiple assignments
 * - Generate improvement plans
 */

import { getAIService } from '../aiService';
import {
  ANALYZE_FEEDBACK_PROMPT,
  DETECT_FEEDBACK_PATTERNS_PROMPT,
  fillTemplate,
} from '../promptTemplates';
import { supabase } from '../../supabase';

// =====================================================
// TYPES
// =====================================================

export interface FeedbackAnalysis {
  submissionId: string;
  assignmentName: string;
  courseName: string;
  originalFeedback: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  sentimentScore: number; // -1 to 1
  strengths: string[];
  improvements: string[];
  actionItems: string[];
  keyThemes: string[];
}

export interface FeedbackPattern {
  theme: string;
  count: number;
  type: 'strength' | 'weakness' | 'neutral';
  description: string;
  trend?: 'improving' | 'declining' | 'stable';
  recommendation?: string;
}

export interface ImprovementPlan {
  title: string;
  goals: Array<{
    goal: string;
    priority: 'high' | 'medium' | 'low';
    steps: string[];
    resources: string[];
  }>;
  timeline: string;
  checklistItems: string[];
}

// =====================================================
// FEEDBACK ANALYZER CLASS
// =====================================================

export class FeedbackAnalyzer {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Analyze instructor feedback for a submission
   */
  async analyzeFeedback(submissionId: string): Promise<FeedbackAnalysis> {
    try {
      // 1. Get submission and feedback
      const { data: submission } = await supabase
        .from('canvas_submissions')
        .select(`
          id,
          feedback_text,
          rubric_assessment,
          canvas_assignments (
            name,
            canvas_courses (name)
          )
        `)
        .eq('id', submissionId)
        .eq('user_id', this.userId)
        .single();

      if (!submission || !submission.feedback_text) {
        throw new Error('Feedback not found for this submission');
      }

      // 2. Build context
      const assignment = submission.canvas_assignments as { name: string; canvas_courses: { name: string } };
      const promptContext = {
        assignmentName: assignment.name,
        courseName: assignment.canvas_courses.name,
        feedback: submission.feedback_text,
        rubricScores: JSON.stringify(submission.rubric_assessment || {}, null, 2),
      };

      // 3. Get AI analysis
      const aiService = getAIService();
      aiService.setUserId(this.userId);

      const prompt = fillTemplate(ANALYZE_FEEDBACK_PROMPT.template, promptContext);

      const response = await aiService.complete({
        prompt,
        featureType: 'feedback_analyzer',
        promptVersion: ANALYZE_FEEDBACK_PROMPT.version,
        options: {
          model: 'claude-3-haiku-20240307',
          temperature: 0.3,
          maxTokens: 1500,
          responseFormat: 'json',
        },
      });

      const analysis = JSON.parse(response.content);

      // 4. Save analysis to database
      await this.saveFeedbackAnalysis(submissionId, analysis);

      return {
        submissionId,
        assignmentName: assignment.name,
        courseName: assignment.canvas_courses.name,
        originalFeedback: submission.feedback_text,
        ...analysis,
      };
    } catch (error) {
      console.error('[Feedback Analyzer] Error analyzing feedback:', error);
      throw new Error('Failed to analyze feedback');
    }
  }

  /**
   * Detect patterns across multiple feedback instances
   */
  async detectPatterns(timePeriod: 'month' | 'semester' | 'all' = 'semester'): Promise<{
    overallTrend: string;
    patterns: FeedbackPattern[];
    recommendations: string[];
  }> {
    try {
      // 1. Get user's feedback history
      const feedbackHistory = await this.getUserFeedback(timePeriod);

      if (feedbackHistory.length === 0) {
        return {
          overallTrend: 'insufficient_data',
          patterns: [],
          recommendations: ['Complete more assignments to see feedback patterns'],
        };
      }

      // 2. Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', this.userId)
        .single();

      // 3. Build context
      const promptContext = {
        studentName: profile?.full_name || 'Student',
        timePeriod: this.getTimePeriodLabel(timePeriod),
        assignmentCount: String(feedbackHistory.length),
        feedbackHistory: JSON.stringify(feedbackHistory, null, 2),
      };

      // 4. Get AI pattern detection
      const aiService = getAIService();
      aiService.setUserId(this.userId);

      const prompt = fillTemplate(
        DETECT_FEEDBACK_PATTERNS_PROMPT.template,
        promptContext
      );

      const response = await aiService.complete({
        prompt,
        featureType: 'feedback_analyzer',
        promptVersion: DETECT_FEEDBACK_PATTERNS_PROMPT.version,
        options: {
          model: 'claude-3-haiku-20240307',
          temperature: 0.3,
          maxTokens: 2000,
          responseFormat: 'json',
        },
      });

      const result = JSON.parse(response.content);

      // 5. Convert to pattern format
      const patterns: FeedbackPattern[] = [
        ...(result.commonStrengths || []).map((s: { theme: string; count: number; description: string }) => ({
          theme: s.theme,
          count: s.count,
          type: 'strength' as const,
          description: s.description,
        })),
        ...(result.commonWeaknesses || []).map((w: { theme: string; count: number; description: string }) => ({
          theme: w.theme,
          count: w.count,
          type: 'weakness' as const,
          description: w.description,
        })),
      ];

      return {
        overallTrend: result.overallTrend || 'stable',
        patterns,
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      console.error('[Feedback Analyzer] Error detecting patterns:', error);
      throw new Error('Failed to detect feedback patterns');
    }
  }

  /**
   * Generate improvement plan from feedback analysis
   */
  async generateImprovementPlan(
    feedbackAnalyses: FeedbackAnalysis[]
  ): Promise<ImprovementPlan> {
    try {
      // Extract all improvements and themes
      const allImprovements = feedbackAnalyses.flatMap((f) => f.improvements);
      const allThemes = feedbackAnalyses.flatMap((f) => f.keyThemes);

      // Group by theme
      const themeGroups = this.groupByTheme(allImprovements, allThemes);

      // Build goals
      const goals = Object.entries(themeGroups).map(([theme, items]) => {
        const priority = items.length >= 3 ? 'high' : items.length >= 2 ? 'medium' : 'low';

        return {
          goal: `Improve ${theme}`,
          priority: priority as 'high' | 'medium' | 'low',
          steps: items.slice(0, 3), // Top 3 action items
          resources: this.suggestResources(theme),
        };
      });

      // Create checklist
      const checklistItems = feedbackAnalyses
        .flatMap((f) => f.actionItems)
        .slice(0, 10); // Top 10 actions

      return {
        title: 'Academic Improvement Plan',
        goals: goals.slice(0, 5), // Top 5 goals
        timeline: '4-6 weeks',
        checklistItems,
      };
    } catch (error) {
      console.error('[Feedback Analyzer] Error generating plan:', error);
      throw new Error('Failed to generate improvement plan');
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private async getUserFeedback(timePeriod: 'month' | 'semester' | 'all'): Promise<
    Array<{
      assignment: string;
      course: string;
      feedback: string;
      score: number;
      date: string;
    }>
  > {
    let dateFilter = new Date();

    switch (timePeriod) {
      case 'month':
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case 'semester':
        dateFilter.setMonth(dateFilter.getMonth() - 4);
        break;
      case 'all':
        dateFilter = new Date('2000-01-01'); // Very old date
        break;
    }

    const { data } = await supabase
      .from('canvas_submissions')
      .select(`
        score,
        feedback_text,
        graded_at,
        canvas_assignments (
          name,
          canvas_courses (name)
        )
      `)
      .eq('user_id', this.userId)
      .not('feedback_text', 'is', null)
      .gte('graded_at', dateFilter.toISOString())
      .order('graded_at', { ascending: false });

    return (data || []).map((item) => {
      const assignment = item.canvas_assignments as { name: string; canvas_courses: { name: string } };
      return {
        assignment: assignment.name,
        course: assignment.canvas_courses.name,
        feedback: item.feedback_text || '',
        score: item.score || 0,
        date: item.graded_at || '',
      };
    });
  }

  private getTimePeriodLabel(period: 'month' | 'semester' | 'all'): string {
    switch (period) {
      case 'month':
        return 'Past month';
      case 'semester':
        return 'This semester';
      case 'all':
        return 'All time';
    }
  }

  private groupByTheme(
    improvements: string[],
    themes: string[]
  ): Record<string, string[]> {
    const groups: Record<string, string[]> = {};

    themes.forEach((theme) => {
      groups[theme] = improvements.filter((imp) =>
        imp.toLowerCase().includes(theme.toLowerCase())
      );
    });

    return groups;
  }

  private suggestResources(theme: string): string[] {
    // Generic resources - could be enhanced with real links
    const resourceMap: Record<string, string[]> = {
      structure: ['Essay structure guide', 'Outlining tutorial', 'Organization workshop'],
      citation: ['Citation style guide', 'Reference management tool', 'Citation workshop'],
      analysis: ['Critical thinking guide', 'Analysis framework', 'Discussion examples'],
      grammar: ['Grammar checker', 'Writing center appointment', 'Style guide'],
    };

    return (
      resourceMap[theme.toLowerCase()] || ['Writing center', 'Office hours', 'Study group']
    );
  }

  private async saveFeedbackAnalysis(
    submissionId: string,
    analysis: Partial<FeedbackAnalysis>
  ): Promise<void> {
    await supabase.from('instructor_feedback').upsert({
      user_id: this.userId,
      submission_id: submissionId,
      feedback_text: analysis.originalFeedback,
      sentiment_score: analysis.sentimentScore,
      sentiment_label: analysis.sentiment,
      key_themes: analysis.keyThemes,
      actionable_items: analysis.actionItems,
      analyzed_at: new Date().toISOString(),
      ai_model: 'claude-3-haiku-20240307',
    });
  }
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export async function analyzeFeedback(
  userId: string,
  submissionId: string
): Promise<FeedbackAnalysis> {
  const analyzer = new FeedbackAnalyzer(userId);
  return await analyzer.analyzeFeedback(submissionId);
}

export async function detectFeedbackPatterns(
  userId: string,
  timePeriod?: 'month' | 'semester' | 'all'
): Promise<{
  overallTrend: string;
  patterns: FeedbackPattern[];
  recommendations: string[];
}> {
  const analyzer = new FeedbackAnalyzer(userId);
  return await analyzer.detectPatterns(timePeriod);
}

export async function generateImprovementPlan(
  userId: string,
  feedbackAnalyses: FeedbackAnalysis[]
): Promise<ImprovementPlan> {
  const analyzer = new FeedbackAnalyzer(userId);
  return await analyzer.generateImprovementPlan(feedbackAnalyses);
}

export default FeedbackAnalyzer;
