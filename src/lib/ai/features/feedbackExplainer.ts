/**
 * Feedback Explainer
 *
 * AI-powered service that helps students understand instructor feedback:
 * - Parses and explains feedback in simple language
 * - Identifies strengths and areas for improvement
 * - Generates actionable improvement plans
 */

import { getAIService } from '../aiService';
import { supabase } from '../../supabase';

// =====================================================
// TYPES
// =====================================================

export interface FeedbackExplanation {
  submissionId: string;
  assignmentName: string;
  score: number;
  pointsPossible: number;
  percentage: number;
  originalFeedback: string;
  aiExplanation: string;
  strengths: string[];
  areasForImprovement: string[];
  actionableAdvice: string[];
  encouragingMessage: string;
  rubricBreakdown?: RubricBreakdown[];
}

export interface RubricBreakdown {
  criterion: string;
  pointsEarned: number;
  pointsPossible: number;
  rating: string;
  comments?: string;
}

export interface ImprovementPlan {
  feedbackId: string;
  goals: ImprovementGoal[];
  estimatedTimeToImprove: string;
  successCriteria: string[];
  resources: ResourceRecommendation[];
}

export interface ImprovementGoal {
  id: string;
  title: string;
  description: string;
  actionItems: ActionItem[];
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface ActionItem {
  id: string;
  description: string;
  deadline?: string;
  completed: boolean;
}

export interface ResourceRecommendation {
  title: string;
  type: 'article' | 'video' | 'practice' | 'tool';
  url?: string;
  description: string;
}

// =====================================================
// FEEDBACK EXPLAINER SERVICE
// =====================================================

export class FeedbackExplainerService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Explain instructor feedback using AI
   */
  async explainFeedback(submissionId: string): Promise<FeedbackExplanation> {
    try {
      // 1. Get submission data
      const { data: submission, error: submissionError } = await supabase
        .from('canvas_submissions')
        .select(`
          id,
          score,
          grade,
          graded_at,
          submission_comments,
          canvas_assignments!inner (
            id,
            name,
            points_possible,
            rubric,
            description
          )
        `)
        .eq('id', submissionId)
        .eq('user_id', this.userId)
        .single();

      if (submissionError || !submission) {
        throw new Error('Submission not found');
      }

      // 2. Check cache first
      const cached = await this.getCachedExplanation(submissionId);
      if (cached) {
        return cached;
      }

      // 3. Parse feedback text
      const feedbackText = this.extractFeedbackText(submission);
      if (!feedbackText || feedbackText.trim().length === 0) {
        // No feedback to explain
        return this.createMinimalExplanation(submission);
      }

      // 4. Get AI explanation
      const aiExplanation = await this.getAIExplanation(submission, feedbackText);

      // 5. Parse rubric breakdown if available
      const rubricBreakdown = this.parseRubric(submission);

      // 6. Build final explanation
      const explanation: FeedbackExplanation = {
        submissionId,
        assignmentName: (submission as any).canvas_assignments.name,
        score: submission.score || 0,
        pointsPossible: (submission as any).canvas_assignments.points_possible,
        percentage: ((submission.score || 0) / (submission as any).canvas_assignments.points_possible) * 100,
        originalFeedback: feedbackText,
        aiExplanation: aiExplanation.explanation,
        strengths: aiExplanation.strengths,
        areasForImprovement: aiExplanation.areasForImprovement,
        actionableAdvice: aiExplanation.actionableAdvice,
        encouragingMessage: aiExplanation.encouragingMessage,
        rubricBreakdown,
      };

      // 7. Cache the explanation
      await this.cacheExplanation(explanation);

      return explanation;
    } catch (error) {
      console.error('[Feedback Explainer] Error explaining feedback:', error);
      throw new Error('Failed to explain feedback');
    }
  }

  /**
   * Generate improvement plan from feedback
   */
  async generateImprovementPlan(
    feedbackExplanation: FeedbackExplanation
  ): Promise<ImprovementPlan> {
    try {
      const aiService = getAIService();
      aiService.setUserId(this.userId);

      const prompt = `You are helping a student create an actionable improvement plan based on instructor feedback.

Assignment: ${feedbackExplanation.assignmentName}
Score: ${feedbackExplanation.score}/${feedbackExplanation.pointsPossible} (${feedbackExplanation.percentage.toFixed(1)}%)

Feedback Analysis:
${feedbackExplanation.aiExplanation}

Areas for Improvement:
${feedbackExplanation.areasForImprovement.map((area, i) => `${i + 1}. ${area}`).join('\n')}

Create a detailed improvement plan with:
1. **Goals**: 3-5 specific, measurable goals addressing the areas for improvement
2. **Action Items**: For each goal, provide 2-4 concrete action items with suggested deadlines
3. **Success Criteria**: How to know when each goal is achieved
4. **Resources**: Recommend specific resources (articles, videos, practice tools)
5. **Timeline**: Estimated time to see improvement (be realistic)

Respond in JSON format:
{
  "goals": [
    {
      "title": "Goal title",
      "description": "Detailed description",
      "actionItems": [
        {
          "description": "Action item",
          "deadline": "relative deadline like '1 week' or '3 days'"
        }
      ],
      "priority": "high" | "medium" | "low"
    }
  ],
  "successCriteria": ["criterion 1", "criterion 2"],
  "resources": [
    {
      "title": "Resource title",
      "type": "article" | "video" | "practice" | "tool",
      "description": "Why this helps"
    }
  ],
  "estimatedTimeToImprove": "e.g., 2-3 weeks"
}`;

      const response = await aiService.complete({
        prompt,
        featureType: 'feedback_analyzer',
        options: {
          model: 'claude-3-haiku-20240307',
          temperature: 0.4,
          maxTokens: 2000,
          responseFormat: 'json',
        },
      });

      const parsedPlan = JSON.parse(response.content);

      // Add IDs to goals and action items
      const planWithIds: ImprovementPlan = {
        feedbackId: feedbackExplanation.submissionId,
        goals: parsedPlan.goals.map((goal: any, goalIndex: number) => ({
          id: `goal-${goalIndex}`,
          title: goal.title,
          description: goal.description,
          priority: goal.priority,
          completed: false,
          actionItems: goal.actionItems.map((item: any, itemIndex: number) => ({
            id: `goal-${goalIndex}-item-${itemIndex}`,
            description: item.description,
            deadline: item.deadline,
            completed: false,
          })),
        })),
        estimatedTimeToImprove: parsedPlan.estimatedTimeToImprove,
        successCriteria: parsedPlan.successCriteria,
        resources: parsedPlan.resources,
      };

      // Store plan in database
      await this.storeImprovementPlan(planWithIds);

      return planWithIds;
    } catch (error) {
      console.error('[Feedback Explainer] Error generating improvement plan:', error);
      throw new Error('Failed to generate improvement plan');
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private extractFeedbackText(submission: any): string {
    const comments = submission.submission_comments || [];
    const feedbackComments = comments
      .filter((c: any) => c.author_id !== this.userId) // Only instructor comments
      .map((c: any) => c.comment)
      .join('\n\n');

    return feedbackComments;
  }

  private async getAIExplanation(
    submission: any,
    feedbackText: string
  ): Promise<{
    explanation: string;
    strengths: string[];
    areasForImprovement: string[];
    actionableAdvice: string[];
    encouragingMessage: string;
  }> {
    const aiService = getAIService();
    aiService.setUserId(this.userId);

    const prompt = `You are helping a student understand instructor feedback.

Assignment: ${submission.canvas_assignments.name}
Student Score: ${submission.score}/${submission.canvas_assignments.points_possible} (${((submission.score / submission.canvas_assignments.points_possible) * 100).toFixed(1)}%)

Instructor Feedback:
${feedbackText}

Provide:
1. **Clear Explanation**: Explain the feedback in simple, student-friendly language
2. **Strengths**: What the student did well (2-4 points)
3. **Areas for Improvement**: What needs work (2-4 points)
4. **Actionable Advice**: Specific steps for next assignment (3-5 points)
5. **Encouraging Message**: A supportive, motivational message

Be constructive and supportive. Use simple language. Focus on growth.

Respond in JSON format:
{
  "explanation": "Clear explanation of feedback",
  "strengths": ["strength 1", "strength 2"],
  "areasForImprovement": ["area 1", "area 2"],
  "actionableAdvice": ["advice 1", "advice 2"],
  "encouragingMessage": "Encouraging message"
}`;

    const response = await aiService.complete({
      prompt,
      featureType: 'feedback_analyzer',
      options: {
        model: 'claude-3-haiku-20240307',
        temperature: 0.5,
        maxTokens: 1500,
        responseFormat: 'json',
      },
    });

    return JSON.parse(response.content);
  }

  private parseRubric(submission: any): RubricBreakdown[] | undefined {
    const rubric = submission.canvas_assignments.rubric;
    if (!rubric || !Array.isArray(rubric)) return undefined;

    return rubric.map((criterion: any) => ({
      criterion: criterion.description || 'Unnamed criterion',
      pointsEarned: criterion.points || 0,
      pointsPossible: criterion.points_possible || 0,
      rating: criterion.rating?.description || 'N/A',
      comments: criterion.comments,
    }));
  }

  private createMinimalExplanation(submission: any): FeedbackExplanation {
    const score = submission.score || 0;
    const pointsPossible = submission.canvas_assignments.points_possible;
    const percentage = (score / pointsPossible) * 100;

    let message = '';
    if (percentage >= 90) {
      message = 'Excellent work! Keep up the great performance.';
    } else if (percentage >= 80) {
      message = 'Good job! You\'re doing well.';
    } else if (percentage >= 70) {
      message = 'Decent work. Consider reviewing areas where you lost points.';
    } else {
      message = 'There\'s room for improvement. Consider seeking help or reviewing the material.';
    }

    return {
      submissionId: submission.id,
      assignmentName: submission.canvas_assignments.name,
      score,
      pointsPossible,
      percentage,
      originalFeedback: 'No feedback provided by instructor.',
      aiExplanation: message,
      strengths: [],
      areasForImprovement: [],
      actionableAdvice: [],
      encouragingMessage: message,
    };
  }

  private async getCachedExplanation(
    submissionId: string
  ): Promise<FeedbackExplanation | null> {
    try {
      const { data, error } = await supabase
        .from('instructor_feedback')
        .select('*')
        .eq('submission_id', submissionId)
        .eq('user_id', this.userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        submissionId: data.submission_id,
        assignmentName: data.assignment_name,
        score: data.score,
        pointsPossible: data.points_possible,
        percentage: (data.score / data.points_possible) * 100,
        originalFeedback: data.original_feedback,
        aiExplanation: data.ai_explanation,
        strengths: data.strengths || [],
        areasForImprovement: data.areas_for_improvement || [],
        actionableAdvice: data.actionable_advice || [],
        encouragingMessage: data.encouraging_message,
        rubricBreakdown: data.rubric_breakdown,
      };
    } catch (error) {
      console.error('[Feedback Explainer] Cache retrieval error:', error);
      return null;
    }
  }

  private async cacheExplanation(explanation: FeedbackExplanation): Promise<void> {
    try {
      await supabase.from('instructor_feedback').upsert({
        user_id: this.userId,
        submission_id: explanation.submissionId,
        assignment_name: explanation.assignmentName,
        score: explanation.score,
        points_possible: explanation.pointsPossible,
        original_feedback: explanation.originalFeedback,
        ai_explanation: explanation.aiExplanation,
        strengths: explanation.strengths,
        areas_for_improvement: explanation.areasForImprovement,
        actionable_advice: explanation.actionableAdvice,
        encouraging_message: explanation.encouragingMessage,
        rubric_breakdown: explanation.rubricBreakdown,
        analyzed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Feedback Explainer] Cache storage error:', error);
    }
  }

  private async storeImprovementPlan(plan: ImprovementPlan): Promise<void> {
    try {
      await supabase.from('improvement_plans').insert({
        user_id: this.userId,
        feedback_id: plan.feedbackId,
        plan_data: plan,
        status: 'active',
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Feedback Explainer] Plan storage error:', error);
    }
  }
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export async function explainFeedback(
  userId: string,
  submissionId: string
): Promise<FeedbackExplanation> {
  const service = new FeedbackExplainerService(userId);
  return await service.explainFeedback(submissionId);
}

export async function generateImprovementPlan(
  userId: string,
  feedbackExplanation: FeedbackExplanation
): Promise<ImprovementPlan> {
  const service = new FeedbackExplainerService(userId);
  return await service.generateImprovementPlan(feedbackExplanation);
}

export default FeedbackExplainerService;
