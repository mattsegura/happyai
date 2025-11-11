import { StudyPlan, StudyFile, Flashcard, Quiz } from '../types/studyPlan';
import { DifficultyLevel } from './difficultyAdapter';

export type StudyPhaseType =
  | 'introduction'
  | 'material_review'
  | 'concept_check'
  | 'flashcard_practice'
  | 'quiz_prompt'
  | 'active_quiz'
  | 'break_prompt'
  | 'summary_review'
  | 'completion';

export interface StudyPhase {
  type: StudyPhaseType;
  data: any;
  estimatedDuration?: number; // in minutes
}

export interface SessionStats {
  totalTime: number;
  topicsCovered: string[];
  tasksCompleted: number;
  questionsAnswered: number;
  accuracy: number;
  finalDifficulty: DifficultyLevel;
}

export class PhaseManager {
  private studyPlan: StudyPlan;
  private currentPhaseIndex: number = 0;
  private phases: StudyPhase[] = [];
  private sessionStartTime: Date;
  private stats: SessionStats;

  constructor(studyPlan: StudyPlan) {
    this.studyPlan = studyPlan;
    this.sessionStartTime = new Date();
    this.stats = {
      totalTime: 0,
      topicsCovered: [],
      tasksCompleted: 0,
      questionsAnswered: 0,
      accuracy: 0,
      finalDifficulty: 'beginner',
    };
    this.initializePhases();
  }

  private initializePhases() {
    // Introduction
    this.phases.push({
      type: 'introduction',
      data: {
        overview: `Welcome to your study session for ${this.studyPlan.title}! Today we'll cover: ${this.studyPlan.topics.slice(0, 3).join(', ')}.`,
        topics: this.studyPlan.topics,
        goalDate: this.studyPlan.goalDate,
      },
      estimatedDuration: 1,
    });

    // Material Review - for each uploaded file
    if (this.studyPlan.uploadedFiles.length > 0) {
      const filesToReview = this.studyPlan.uploadedFiles.slice(0, 2); // Review first 2 files
      filesToReview.forEach((file: StudyFile) => {
        this.phases.push({
          type: 'material_review',
          data: {
            material: file,
            duration: 5,
          },
          estimatedDuration: 5,
        });
      });
    }

    // Concept Checks - one for each major topic
    this.studyPlan.topics.slice(0, 2).forEach((topic: string) => {
      this.phases.push({
        type: 'concept_check',
        data: {
          prompt: `Let's check your understanding of ${topic}. Can you explain the key concept in your own words?`,
          concept: topic,
        },
        estimatedDuration: 3,
      });
    });

    // Break prompt after ~25 minutes
    if (this.studyPlan.studyPreferences.sessionDuration >= 30) {
      this.phases.push({
        type: 'break_prompt',
        data: {
          duration: 5,
          reason: 'You\'ve been studying for a while. A short break will help you stay focused!',
        },
        estimatedDuration: 5,
      });
    }

    // Flashcard Practice if available
    if (this.studyPlan.generatedTools.flashcards.length > 0) {
      this.phases.push({
        type: 'flashcard_practice',
        data: {
          cards: this.studyPlan.generatedTools.flashcards.slice(0, 10),
          progress: 0,
        },
        estimatedDuration: 10,
      });
    }

    // Quiz Prompt
    this.phases.push({
      type: 'quiz_prompt',
      data: {
        message: 'You\'ve made great progress! Ready to test your knowledge with a quiz?',
        quizId: 'adaptive-quiz-1',
      },
      estimatedDuration: 1,
    });

    // Summary Review if available
    if (this.studyPlan.generatedTools.summaries.length > 0) {
      this.phases.push({
        type: 'summary_review',
        data: {
          summary: this.studyPlan.generatedTools.summaries[0],
        },
        estimatedDuration: 5,
      });
    }

    // Completion
    this.phases.push({
      type: 'completion',
      data: {
        stats: this.stats,
      },
      estimatedDuration: 2,
    });
  }

  getCurrentPhase(): StudyPhase | null {
    if (this.currentPhaseIndex >= this.phases.length) {
      return null;
    }
    return this.phases[this.currentPhaseIndex];
  }

  getNextPhase(): StudyPhase | null {
    if (this.currentPhaseIndex + 1 >= this.phases.length) {
      return null;
    }
    return this.phases[this.currentPhaseIndex + 1];
  }

  advancePhase(): StudyPhase | null {
    this.currentPhaseIndex++;
    return this.getCurrentPhase();
  }

  getProgress(): number {
    if (this.phases.length === 0) return 0;
    return (this.currentPhaseIndex / this.phases.length) * 100;
  }

  getTotalPhases(): number {
    return this.phases.length;
  }

  getCurrentPhaseNumber(): number {
    return this.currentPhaseIndex + 1;
  }

  updateStats(updates: Partial<SessionStats>) {
    this.stats = { ...this.stats, ...updates };
  }

  getSessionStats(): SessionStats {
    const now = new Date();
    const totalMinutes = (now.getTime() - this.sessionStartTime.getTime()) / (1000 * 60);
    return {
      ...this.stats,
      totalTime: Math.round(totalMinutes),
    };
  }

  insertPhase(phase: StudyPhase, afterCurrent: boolean = true) {
    const insertIndex = afterCurrent ? this.currentPhaseIndex + 1 : this.currentPhaseIndex;
    this.phases.splice(insertIndex, 0, phase);
  }

  skipCurrentPhase() {
    this.currentPhaseIndex++;
    return this.getCurrentPhase();
  }
}

