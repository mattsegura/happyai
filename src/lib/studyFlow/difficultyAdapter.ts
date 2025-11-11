export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface PerformanceMetric {
  recentAnswers: boolean[]; // true for correct, false for incorrect
  consecutiveCorrect: number;
  consecutiveWrong: number;
  overallAccuracy: number;
  timeSpent: number; // in seconds
}

export class DifficultyAdapter {
  private currentLevel: DifficultyLevel;
  private performanceHistory: PerformanceMetric;

  constructor(initialLevel: DifficultyLevel = 'beginner') {
    this.currentLevel = initialLevel;
    this.performanceHistory = {
      recentAnswers: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      overallAccuracy: 0,
      timeSpent: 0,
    };
  }

  recordAnswer(isCorrect: boolean, timeSpent: number) {
    this.performanceHistory.recentAnswers.push(isCorrect);
    
    // Keep only last 10 answers
    if (this.performanceHistory.recentAnswers.length > 10) {
      this.performanceHistory.recentAnswers.shift();
    }

    if (isCorrect) {
      this.performanceHistory.consecutiveCorrect++;
      this.performanceHistory.consecutiveWrong = 0;
    } else {
      this.performanceHistory.consecutiveWrong++;
      this.performanceHistory.consecutiveCorrect = 0;
    }

    this.performanceHistory.timeSpent += timeSpent;
    this.updateAccuracy();
  }

  private updateAccuracy() {
    const correct = this.performanceHistory.recentAnswers.filter(a => a).length;
    const total = this.performanceHistory.recentAnswers.length;
    this.performanceHistory.overallAccuracy = total > 0 ? correct / total : 0;
  }

  shouldAdjustDifficulty(): { shouldAdjust: boolean; direction?: 'up' | 'down'; reason?: string } {
    const { consecutiveCorrect, consecutiveWrong, overallAccuracy, recentAnswers } = this.performanceHistory;

    // Need at least 3 answers to adjust
    if (recentAnswers.length < 3) {
      return { shouldAdjust: false };
    }

    // Increase difficulty if doing very well
    if (consecutiveCorrect >= 4 && overallAccuracy >= 0.85) {
      return {
        shouldAdjust: true,
        direction: 'up',
        reason: "You're mastering this! Let's challenge you with harder material."
      };
    }

    // Decrease difficulty if struggling
    if (consecutiveWrong >= 3 || (overallAccuracy < 0.50 && recentAnswers.length >= 5)) {
      return {
        shouldAdjust: true,
        direction: 'down',
        reason: "Let's slow down and reinforce the fundamentals."
      };
    }

    return { shouldAdjust: false };
  }

  adjustDifficulty(direction: 'up' | 'down'): DifficultyLevel {
    const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = levels.indexOf(this.currentLevel);

    if (direction === 'up' && currentIndex < levels.length - 1) {
      this.currentLevel = levels[currentIndex + 1];
      // Reset consecutive counters after adjustment
      this.performanceHistory.consecutiveCorrect = 0;
    } else if (direction === 'down' && currentIndex > 0) {
      this.currentLevel = levels[currentIndex - 1];
      // Reset consecutive counters after adjustment
      this.performanceHistory.consecutiveWrong = 0;
    }

    return this.currentLevel;
  }

  getCurrentLevel(): DifficultyLevel {
    return this.currentLevel;
  }

  getPerformanceMetrics(): PerformanceMetric {
    return { ...this.performanceHistory };
  }

  reset() {
    this.performanceHistory = {
      recentAnswers: [],
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      overallAccuracy: 0,
      timeSpent: 0,
    };
  }
}

