/**
 * Course Tutor AI - Type Definitions
 *
 * Types for the AI-powered course tutoring system including
 * quiz generation, assignment summaries, flashcards, and Q&A
 */

import type { CanvasModuleItem } from '../../canvasApiMock';

// =====================================================
// TUTOR CONTEXT & RESPONSES
// =====================================================

export interface TutorContext {
  userId: string;
  courseId: string;
  courseName: string;
  moduleId?: string;
  moduleName?: string;
  moduleContent?: string;
  assignmentId?: string;
  assignmentName?: string;
  learningObjectives?: string[];
  relatedModuleItems?: CanvasModuleItem[];
}

export interface TutorResponse {
  answer: string;
  relatedTopics: string[];
  additionalResources: Resource[];
  confidence: number; // 0-1
  citations?: string[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'page' | 'file' | 'video' | 'external';
}

// =====================================================
// PRACTICE QUIZ
// =====================================================

export interface QuizContext {
  userId: string;
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleName: string;
  topics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  learningObjectives?: string[];
  contentSummary?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  createdAt: Date;
  moduleId: string;
  courseName: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string;
  explanation: string;
  hints: string[];
  relatedTopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  quizId: string;
  userId: string;
  answers: Record<string, string>; // questionId -> answer
  score: number; // percentage
  completedAt: Date;
  timeSpentMinutes: number;
}

// =====================================================
// ASSIGNMENT SUMMARY
// =====================================================

export interface AssignmentSummary {
  assignmentId: string;
  summary: string;
  keyRequirements: string[];
  deliverables: string[];
  estimatedHours: number;
  suggestedSteps: string[];
  commonMistakes: string[];
  recommendedResources: Resource[];
  dueDate: string;
  pointsWorth: number;
}

// =====================================================
// QUICK REVIEW MATERIALS
// =====================================================

export interface ReviewMaterials {
  id: string;
  courseId: string;
  courseName: string;
  moduleIds: string[];
  keyConcepts: KeyConcept[];
  flashcards: Flashcard[];
  practiceProblems: PracticeProblem[];
  studyTips: string[];
  createdAt: Date;
}

export interface KeyConcept {
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
  relatedTopics: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  moduleId?: string;
}

export interface PracticeProblem {
  id: string;
  question: string;
  solution: string;
  steps: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

// =====================================================
// CHAT MESSAGE TYPES
// =====================================================

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedTopics?: string[];
  resources?: Resource[];
  attachments?: TutorAttachment[];
}

export interface TutorAttachment {
  type: 'quiz' | 'flashcard_set' | 'summary' | 'resource';
  data: Quiz | Flashcard[] | AssignmentSummary | Resource;
}

// =====================================================
// COURSE CONTENT ANALYSIS
// =====================================================

export interface ContentAnalysis {
  moduleId: string;
  topics: string[];
  keyTerms: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedStudyTime: number; // hours
  prerequisites: string[];
}

// =====================================================
// TUTOR SESSION
// =====================================================

export interface TutorSession {
  id: string;
  userId: string;
  courseId: string;
  startedAt: Date;
  endedAt?: Date;
  messages: TutorMessage[];
  generatedMaterials: {
    quizzes: string[]; // Quiz IDs
    flashcards: string[]; // Flashcard set IDs
    summaries: string[]; // Summary IDs
  };
  tokensUsed: number;
  costCents: number;
}

// =====================================================
// ERROR TYPES
// =====================================================

export class CourseTutorError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CourseTutorError';
  }
}
