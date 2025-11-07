/**
 * Grade Path Projection
 *
 * Calculates projected final grades with AI insights:
 * - "If you average 88% on remaining assignments, you'll finish with an A-"
 * - Scenario generation (what-if calculator)
 * - AI recommendations based on performance trends
 */

import { getAIService } from '../aiService';
import { GRADE_PROJECTION_INSIGHTS_PROMPT, fillTemplate } from '../promptTemplates';
import { supabase } from '../../supabase';
import { canvasApi } from '../../canvasApiMock';

// Check if we're using mock data
const USE_ACADEMICS_MOCK = import.meta.env.VITE_USE_ACADEMICS_MOCK === 'true';

// =====================================================
// TYPES
// =====================================================

export interface GradeProjection {
  courseId: string;
  courseName: string;
  currentGrade: number;
  currentLetterGrade: string;
  projectedFinalGrade: number;
  projectedLetterGrade: string;
  confidenceLevel: number; // 0-1
  completedWeight: number; // percentage
  remainingWeight: number; // percentage
  scenarios: Scenario[];
  insights: ProjectionInsights;
  calculationMethod: 'weighted_average' | 'ai_prediction';
}

export interface Scenario {
  targetScore: number; // average needed on remaining work
  projectedGrade: number; // resulting final grade
  letterGrade: string;
  achievable: boolean;
  description: string;
}

export interface ProjectionInsights {
  targetAchievable: boolean;
  confidence: 'low' | 'medium' | 'high';
  keyInsights: string[];
  priorityAssignments: Array<{
    name: string;
    weight: string;
    targetScore: string;
    reason: string;
  }>;
  recommendations: string[];
  warnings: string[];
}

interface AssignmentWithSubmission {
  id: string;
  name: string;
  points_possible: number;
  canvas_assignment_group_id: string;
  submission?: {
    score: number;
  };
}

// =====================================================
// GRADE PROJECTION SERVICE
// =====================================================

export class GradeProjectionService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Calculate grade projection for a course
   */
  async calculateProjection(
    courseId: string,
    targetGrade?: number
  ): Promise<GradeProjection> {
    try {
      // 1. Get course data
      let course: { name: string; current_score?: number } | null = null;

      if (USE_ACADEMICS_MOCK) {
        // Use mock data
        const courses = await canvasApi.getCourses();
        const mockCourse = courses.find(c => c.id === courseId);
        if (mockCourse) {
          course = {
            name: mockCourse.name,
            current_score: mockCourse.enrollments[0]?.current_score || 0
          };
        }
      } else {
        // Use real database
        const { data } = await supabase
          .from('canvas_courses')
          .select('name, current_score')
          .eq('id', courseId)
          .eq('user_id', this.userId)
          .single();
        course = data;
      }

      if (!course) {
        throw new Error('Course not found');
      }

      // 2. Calculate algorithmically
      const algorithmicProjection = await this.calculateAlgorithmically(courseId);

      // 3. Get AI insights
      const context = await this.gatherProjectionContext(courseId, algorithmicProjection);
      const aiInsights = await this.getAIInsights(context, targetGrade || 90);

      // 4. Generate scenarios
      const scenarios = this.generateScenarios(algorithmicProjection);

      // 5. Build final projection
      const projection: GradeProjection = {
        courseId,
        courseName: course.name,
        currentGrade: algorithmicProjection.currentGrade,
        currentLetterGrade: this.getLetterGrade(algorithmicProjection.currentGrade),
        projectedFinalGrade: algorithmicProjection.projectedGrade,
        projectedLetterGrade: this.getLetterGrade(algorithmicProjection.projectedGrade),
        confidenceLevel: this.calculateConfidence(context),
        completedWeight: algorithmicProjection.completedWeight,
        remainingWeight: algorithmicProjection.remainingWeight,
        scenarios,
        insights: aiInsights,
        calculationMethod: 'weighted_average',
      };

      // 6. Cache the projection
      await this.cacheProjection(projection);

      return projection;
    } catch (error) {
      console.error('[Grade Projection] Error calculating projection:', error);
      throw new Error('Failed to calculate grade projection');
    }
  }

  // =====================================================
  // ALGORITHMIC CALCULATION
  // =====================================================

  private async calculateAlgorithmically(courseId: string): Promise<{
    currentGrade: number;
    projectedGrade: number;
    completedWeight: number;
    remainingWeight: number;
    totalPointsEarned: number;
    totalPointsPossible: number;
  }> {
    // Get all assignments for this course
    let assignments: AssignmentWithSubmission[] = [];

    if (USE_ACADEMICS_MOCK) {
      // Use mock data
      const allAssignments = await canvasApi.getAssignments();
      const courseAssignments = allAssignments.filter(a => a.course_id === courseId);

      // Get submissions for each assignment
      assignments = await Promise.all(
        courseAssignments.map(async (assignment) => {
          const submissions = await canvasApi.getSubmissions(assignment.id);
          const submission = submissions[0];
          return {
            id: assignment.id,
            name: assignment.name,
            points_possible: assignment.points_possible,
            canvas_assignment_group_id: assignment.assignment_group_id,
            submission: submission && submission.score !== null && submission.score !== undefined
              ? { score: submission.score }
              : undefined
          };
        })
      );
    } else {
      // Use real database
      const { data } = await supabase
        .from('canvas_assignments')
        .select(`
          id,
          name,
          points_possible,
          canvas_assignment_group_id,
          canvas_submissions (score)
        `)
        .eq('course_id', courseId);
      assignments = (data as unknown as AssignmentWithSubmission[]) || [];
    }

    if (!assignments || assignments.length === 0) {
      return {
        currentGrade: 0,
        projectedGrade: 0,
        completedWeight: 0,
        remainingWeight: 100,
        totalPointsEarned: 0,
        totalPointsPossible: 0,
      };
    }

    // Calculate current grade
    let totalPointsEarned = 0;
    let totalPointsPossible = 0;
    let completedPoints = 0;
    let completedPossible = 0;

    assignments.forEach((assignment) => {
      totalPointsPossible += assignment.points_possible;

      if (assignment.submission && assignment.submission.score !== null && assignment.submission.score !== undefined) {
        totalPointsEarned += assignment.submission.score;
        completedPoints += assignment.submission.score;
        completedPossible += assignment.points_possible;
      }
    });

    const currentGrade = completedPossible > 0
      ? (completedPoints / completedPossible) * 100
      : 0;

    const completedWeight = totalPointsPossible > 0
      ? (completedPossible / totalPointsPossible) * 100
      : 0;

    const remainingWeight = 100 - completedWeight;

    // Project final grade (assuming student maintains current performance)
    const projectedGrade = totalPointsPossible > 0
      ? ((completedPoints + (totalPointsPossible - completedPossible) * (currentGrade / 100)) /
          totalPointsPossible) *
        100
      : 0;

    return {
      currentGrade: Math.round(currentGrade * 100) / 100,
      projectedGrade: Math.round(projectedGrade * 100) / 100,
      completedWeight: Math.round(completedWeight * 100) / 100,
      remainingWeight: Math.round(remainingWeight * 100) / 100,
      totalPointsEarned,
      totalPointsPossible,
    };
  }

  // =====================================================
  // AI INSIGHTS
  // =====================================================

  private async gatherProjectionContext(
    courseId: string,
    algorithmicProjection: {
      currentGrade: number;
      completedWeight: number;
      remainingWeight: number;
    }
  ): Promise<Record<string, string>> {
    let courseName = 'Unknown';
    let submissions: any[] = [];
    let remaining: any[] = [];

    if (USE_ACADEMICS_MOCK) {
      // Use mock data
      const courses = await canvasApi.getCourses();
      const course = courses.find(c => c.id === courseId);
      courseName = course?.name || 'Unknown';

      // Get all assignments and submissions
      const allAssignments = await canvasApi.getAssignments();
      const courseAssignments = allAssignments.filter(a => a.course_id === courseId);

      // Get recent graded submissions
      const gradedSubmissions = [];
      for (const assignment of courseAssignments) {
        const subs = await canvasApi.getSubmissions(assignment.id);
        const sub = subs[0];
        if (sub && sub.score !== null && sub.score !== undefined) {
          gradedSubmissions.push({
            score: sub.score,
            graded_at: sub.graded_at,
            canvas_assignments: {
              name: assignment.name,
              points_possible: assignment.points_possible
            }
          });
        }
      }
      submissions = gradedSubmissions.slice(0, 5);

      // Get remaining assignments
      remaining = courseAssignments
        .filter(a => {
          // Check if has no submission
          return true; // Simplified for mock
        })
        .map(a => ({
          name: a.name,
          points_possible: a.points_possible,
          due_at: a.due_at
        }));
    } else {
      // Use real database
      const { data: course } = await supabase
        .from('canvas_courses')
        .select('name')
        .eq('id', courseId)
        .single();
      courseName = course?.name || 'Unknown';

      // Get recent grades
      const { data: subs } = await supabase
        .from('canvas_submissions')
        .select(`
          score,
          graded_at,
          canvas_assignments (name, points_possible)
        `)
        .eq('course_id', courseId)
        .eq('user_id', this.userId)
        .not('score', 'is', null)
        .order('graded_at', { ascending: false })
        .limit(5);
      submissions = subs || [];

      // Get remaining assignments
      const { data: rem } = await supabase
        .from('canvas_assignments')
        .select('name, points_possible, due_at')
        .eq('course_id', courseId)
        .is('canvas_submissions.score', null)
        .order('due_at');
      remaining = rem || [];
    }

    // Determine trend
    const scores = submissions.map((s: any) => s.score);
    const trend = this.calculateTrend(scores);

    return {
      courseName,
      currentGrade: String(algorithmicProjection.currentGrade),
      completedWeight: String(algorithmicProjection.completedWeight),
      remainingWeight: String(algorithmicProjection.remainingWeight),
      recentGrades: JSON.stringify(submissions),
      trend,
      remainingAssignments: JSON.stringify(remaining),
      projectedGrade: String(algorithmicProjection.currentGrade), // simplified
      targetGrade: '90',
    };
  }

  private async getAIInsights(
    context: Record<string, string>,
    targetGrade: number
  ): Promise<ProjectionInsights> {
    try {
      context.targetGrade = String(targetGrade);

      const aiService = getAIService();
      aiService.setUserId(this.userId);

      const prompt = fillTemplate(GRADE_PROJECTION_INSIGHTS_PROMPT.template, context);

      const response = await aiService.complete({
        prompt,
        featureType: 'grade_projection',
        promptVersion: GRADE_PROJECTION_INSIGHTS_PROMPT.version,
        options: {
          model: 'claude-3-haiku-20240307',
          temperature: 0.3,
          maxTokens: 1500,
          responseFormat: 'json',
        },
      });

      return JSON.parse(response.content) as ProjectionInsights;
    } catch (error) {
      console.error('[Grade Projection] Error getting AI insights:', error);
      // Return default insights if AI fails
      return {
        targetAchievable: true,
        confidence: 'medium',
        keyInsights: ['Continue your current performance to maintain your grade'],
        priorityAssignments: [],
        recommendations: ['Stay consistent with your study habits'],
        warnings: [],
      };
    }
  }

  // =====================================================
  // SCENARIO GENERATION
  // =====================================================

  private generateScenarios(projection: {
    currentGrade: number;
    completedWeight: number;
    remainingWeight: number;
    totalPointsEarned: number;
    totalPointsPossible: number;
  }): Scenario[] {
    const scenarios: Scenario[] = [];
    const targetScores = [100, 95, 90, 85, 80, 75, 70];

    targetScores.forEach((targetScore) => {
      const projectedGrade = this.calculateScenarioGrade(
        projection.totalPointsEarned,
        projection.totalPointsPossible,
        projection.completedWeight,
        targetScore
      );

      scenarios.push({
        targetScore,
        projectedGrade: Math.round(projectedGrade * 100) / 100,
        letterGrade: this.getLetterGrade(projectedGrade),
        achievable: targetScore <= 100,
        description: `Average ${targetScore}% on remaining work → ${this.getLetterGrade(projectedGrade)}`,
      });
    });

    return scenarios;
  }

  private calculateScenarioGrade(
    earnedPoints: number,
    totalPoints: number,
    completedWeight: number,
    targetScore: number
  ): number {
    const remainingWeight = 100 - completedWeight;
    const remainingPoints = totalPoints * (remainingWeight / 100);
    const futurePoints = remainingPoints * (targetScore / 100);

    return ((earnedPoints + futurePoints) / totalPoints) * 100;
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private getLetterGrade(percentage: number): string {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  private calculateTrend(scores: number[]): string {
    if (scores.length < 2) return 'stable';

    const recent = scores.slice(0, Math.ceil(scores.length / 2));
    const older = scores.slice(Math.ceil(scores.length / 2));

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  }

  private calculateConfidence(context: Record<string, string>): number {
    const completedWeight = parseFloat(context.completedWeight);

    // Higher confidence with more completed work
    if (completedWeight > 70) return 0.9;
    if (completedWeight > 50) return 0.75;
    if (completedWeight > 30) return 0.6;
    return 0.4;
  }

  private async cacheProjection(projection: GradeProjection): Promise<void> {
    if (USE_ACADEMICS_MOCK) {
      // Skip caching in mock mode
      console.log('[Grade Projection] Skipping cache in mock mode');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1-hour cache

    await supabase.from('grade_projections').insert({
      user_id: this.userId,
      course_id: projection.courseId,
      current_grade: projection.currentGrade,
      projected_grade: projection.projectedFinalGrade,
      confidence_level: projection.confidenceLevel,
      scenario_data: { scenarios: projection.scenarios },
      calculation_method: projection.calculationMethod,
      expires_at: expiresAt.toISOString(),
    });
  }
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export async function calculateGradeProjection(
  userId: string,
  courseId: string,
  targetGrade?: number
): Promise<GradeProjection> {
  const service = new GradeProjectionService(userId);
  return await service.calculateProjection(courseId, targetGrade);
}

export default GradeProjectionService;
