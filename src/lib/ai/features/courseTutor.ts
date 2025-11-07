/**
 * Course Tutor AI (Powered by Chatbase)
 *
 * Context-aware tutoring system that:
 * - Answers course-related questions
 * - Generates practice quizzes
 * - Summarizes assignment instructions
 * - Creates quick review materials
 */

import { getAIService } from '../aiService';
import * as chatbaseProvider from '../providers/chatbaseProvider';
import {
  COURSE_TUTOR_PROMPT,
  GENERATE_QUIZ_PROMPT,
  fillTemplate,
} from '../promptTemplates';
import { supabase } from '../../supabase';

// =====================================================
// TYPES
// =====================================================

export interface TutorContext {
  courseId: string;
  courseName: string;
  courseCode: string;
  moduleId?: string;
  moduleName?: string;
  assignmentId?: string;
  assignmentName?: string;
  additionalContext?: string;
}

export interface TutorResponse {
  answer: string;
  relatedTopics: string[];
  additionalResources: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface QuizQuestion {
  id: number;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  quizTitle: string;
  estimatedTime: string;
  questions: QuizQuestion[];
}

export interface AssignmentSummary {
  title: string;
  keyRequirements: string[];
  deliverables: string[];
  estimatedTimeHours: number;
  tips: string[];
}

export interface ReviewMaterials {
  summary: string;
  keyPoints: string[];
  flashcards: Array<{ front: string; back: string }>;
  practiceProblems: Array<{ problem: string; solution: string }>;
}

// =====================================================
// AI COURSE TUTOR CLASS
// =====================================================

export class AICourseTutor {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Answer course-related question using Chatbase
   */
  async answerQuestion(
    question: string,
    context: TutorContext
  ): Promise<TutorResponse> {
    try {
      // Check if Chatbase is configured
      if (!chatbaseProvider.isChatbaseConfigured()) {
        throw new Error('Chatbase is not configured. Please add API keys to .env');
      }

      // Build context-aware prompt
      const promptContext = {
        courseName: context.courseName,
        courseCode: context.courseCode,
        moduleName: context.moduleName || 'N/A',
        assignmentName: context.assignmentName || 'N/A',
        question,
        additionalContext: context.additionalContext || '',
      };

      const prompt = fillTemplate(COURSE_TUTOR_PROMPT.template, promptContext);

      // Use Chatbase directly for conversational Q&A
      const response = await chatbaseProvider.complete({
        prompt,
        featureType: 'course_tutor',
        options: {
          temperature: 0.7,
          maxTokens: 1500,
        },
      });

      // Extract related topics (simple heuristic)
      const relatedTopics = this.extractRelatedTopics(response.content);

      // Find additional resources
      const resources = await this.findResources(context.courseId, question);

      return {
        answer: response.content,
        relatedTopics,
        additionalResources: resources,
        confidence: 'high',
      };
    } catch (error) {
      console.error('[Course Tutor] Error answering question:', error);
      throw new Error('Failed to get answer. Please try again.');
    }
  }

  /**
   * Generate practice quiz
   */
  async generatePracticeQuiz(
    courseId: string,
    moduleId: string,
    options: {
      topics?: string[];
      difficulty?: 'easy' | 'medium' | 'hard';
      questionCount?: number;
    } = {}
  ): Promise<Quiz> {
    try {
      // Get course and module details
      const { data: course } = await supabase
        .from('canvas_courses')
        .select('name, canvas_course_code')
        .eq('id', courseId)
        .single();

      const { data: module } = await supabase
        .from('canvas_modules')
        .select('name')
        .eq('id', moduleId)
        .single();

      if (!course || !module) {
        throw new Error('Course or module not found');
      }

      // Build prompt
      const promptContext = {
        courseName: course.name,
        moduleName: module.name,
        topics: (options.topics || ['general course material']).join(', '),
        difficulty: options.difficulty || 'medium',
        questionCount: String(options.questionCount || 5),
        learningObjectives: 'Review and test understanding of module concepts',
      };

      const aiService = getAIService();
      aiService.setUserId(this.userId);

      const prompt = fillTemplate(GENERATE_QUIZ_PROMPT.template, promptContext);

      const response = await aiService.complete({
        prompt,
        featureType: 'course_tutor',
        promptVersion: GENERATE_QUIZ_PROMPT.version,
        options: {
          model: 'claude-3-sonnet-20240229',
          temperature: 0.8,
          maxTokens: 2000,
          responseFormat: 'json',
        },
      });

      return JSON.parse(response.content) as Quiz;
    } catch (error) {
      console.error('[Course Tutor] Error generating quiz:', error);
      throw new Error('Failed to generate practice quiz');
    }
  }

  /**
   * Summarize assignment instructions
   */
  async summarizeAssignment(assignmentId: string): Promise<AssignmentSummary> {
    try {
      // Get assignment details
      const { data: assignment } = await supabase
        .from('canvas_assignments')
        .select('name, description, points_possible, due_at')
        .eq('id', assignmentId)
        .single();

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Use AI to extract key information
      const aiService = getAIService();
      aiService.setUserId(this.userId);

      const prompt = `Summarize this assignment and extract key information:

**Assignment:** ${assignment.name}
**Description:** ${assignment.description || 'No description provided'}
**Points:** ${assignment.points_possible}
**Due Date:** ${assignment.due_at}

Extract:
1. Key requirements (what must be done)
2. Deliverables (what to submit)
3. Estimated time needed (in hours)
4. Tips for success

Return as JSON with keys: keyRequirements, deliverables, estimatedTimeHours, tips`;

      const response = await aiService.complete({
        prompt,
        featureType: 'course_tutor',
        options: {
          model: 'claude-3-haiku-20240307',
          temperature: 0.3,
          maxTokens: 1000,
          responseFormat: 'json',
        },
      });

      const parsed = JSON.parse(response.content);

      return {
        title: assignment.name,
        keyRequirements: parsed.keyRequirements || [],
        deliverables: parsed.deliverables || [],
        estimatedTimeHours: parsed.estimatedTimeHours || 2,
        tips: parsed.tips || [],
      };
    } catch (error) {
      console.error('[Course Tutor] Error summarizing assignment:', error);
      throw new Error('Failed to summarize assignment');
    }
  }

  /**
   * Generate quick review materials
   */
  async generateQuickReview(
    courseId: string,
    _moduleIds: string[]
  ): Promise<ReviewMaterials> {
    try {
      // Get course info
      const { data: course } = await supabase
        .from('canvas_courses')
        .select('name')
        .eq('id', courseId)
        .single();

      // Get recent assignments for this course
      const { data: assignments } = await supabase
        .from('canvas_assignments')
        .select('name, description')
        .eq('course_id', courseId)
        .order('due_at', { ascending: false })
        .limit(5);

      if (!course) {
        throw new Error('Course not found');
      }

      const aiService = getAIService();
      aiService.setUserId(this.userId);

      const prompt = `Create quick review materials for this course:

**Course:** ${course.name}
**Recent Topics:** ${(assignments || []).map((a) => a.name).join(', ')}

Generate:
1. Brief summary of key concepts
2. 5 key points to remember
3. 5 flashcards (front and back)
4. 3 practice problems with solutions

Return as JSON with keys: summary, keyPoints, flashcards, practiceProblems`;

      const response = await aiService.complete({
        prompt,
        featureType: 'course_tutor',
        options: {
          model: 'claude-3-sonnet-20240229',
          temperature: 0.7,
          maxTokens: 2000,
          responseFormat: 'json',
        },
      });

      return JSON.parse(response.content) as ReviewMaterials;
    } catch (error) {
      console.error('[Course Tutor] Error generating review:', error);
      throw new Error('Failed to generate review materials');
    }
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private extractRelatedTopics(content: string): string[] {
    // Simple extraction - could be enhanced with NLP
    const topics: string[] = [];

    // Look for common phrases that indicate topics
    const topicIndicators = [
      'related to',
      'similar to',
      'also see',
      'you might want to review',
      'connected to',
    ];

    topicIndicators.forEach((indicator) => {
      const index = content.toLowerCase().indexOf(indicator);
      if (index !== -1) {
        // Extract text after indicator (simplified)
        const afterIndicator = content.substring(index + indicator.length, index + 100);
        const match = afterIndicator.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/);
        if (match) {
          topics.push(match[0]);
        }
      }
    });

    return [...new Set(topics)].slice(0, 3);
  }

  private async findResources(
    courseId: string,
    _question: string
  ): Promise<string[]> {
    // In a full implementation, this would search Canvas pages/files
    // For now, return generic resources
    const { data: modules } = await supabase
      .from('canvas_modules')
      .select('name')
      .eq('course_id', courseId)
      .limit(3);

    return (modules || []).map((m) => `Module: ${m.name}`);
  }
}

// =====================================================
// CONVENIENCE FUNCTIONS
// =====================================================

export async function askTutor(
  userId: string,
  question: string,
  context: TutorContext
): Promise<TutorResponse> {
  const tutor = new AICourseTutor(userId);
  return await tutor.answerQuestion(question, context);
}

export async function generateQuiz(
  userId: string,
  courseId: string,
  moduleId: string,
  options?: { topics?: string[]; difficulty?: 'easy' | 'medium' | 'hard'; questionCount?: number }
): Promise<Quiz> {
  const tutor = new AICourseTutor(userId);
  return await tutor.generatePracticeQuiz(courseId, moduleId, options);
}

export default AICourseTutor;
