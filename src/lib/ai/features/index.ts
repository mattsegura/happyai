/**
 * AI Features - Entry Point
 *
 * Exports all AI-powered academic features for easy importing
 */

// Study Coach
export {
  AIStudyCoach,
  generateStudyPlan,
  adjustStudyPlan,
  type StudyPlan,
  type StudySession,
  type StudyDay,
  type Assignment,
  type GradeData,
  type MoodData,
  type StudyPreferences,
  type AdjustmentTrigger,
} from './studyCoach';

// Scheduling Assistant
export {
  AISchedulingAssistant,
  processSchedulingRequest,
  executeSchedulingAction,
  type SchedulingAction,
  type SchedulingActionType,
} from './schedulingAssistant';

// Course Tutor
export {
  AICourseTutor,
  askTutor,
  generateQuiz,
  type TutorContext,
  type TutorResponse,
  type Quiz,
  type QuizQuestion,
  type AssignmentSummary,
  type ReviewMaterials,
} from './courseTutor';

// Grade Projection
export {
  GradeProjectionService,
  calculateGradeProjection,
  type GradeProjection,
  type Scenario,
  type ProjectionInsights,
} from './gradeProjection';

// Feedback Analyzer
export {
  FeedbackAnalyzer,
  analyzeFeedback,
  detectFeedbackPatterns,
  generateImprovementPlan,
  type FeedbackAnalysis,
  type FeedbackPattern,
  type ImprovementPlan,
} from './feedbackAnalyzer';
