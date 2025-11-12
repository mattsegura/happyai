/**
 * Adaptive Learning System
 * 
 * Tracks student performance and adjusts difficulty dynamically:
 * - Analyzes quiz scores, flashcard mastery, practice performance
 * - Adjusts difficulty of generated content based on mastery
 * - Provides difficulty recommendations for future sessions
 * - Offers confidence boost or challenge mode options
 */

import { StudyPlan, Quiz, Flashcard, QuizAttempt } from '../types/studyPlan';

export interface MasteryProfile {
  topicId: string;
  topicName: string;
  masteryLevel: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  masteryScore: number; // 0-100
  confidence: number; // 0-100
  streakDays: number;
  totalPracticeTime: number; // minutes
  lastPracticed: string;
  performanceHistory: PerformanceDataPoint[];
  weakAreas: string[];
  strongAreas: string[];
  recommendedDifficulty: 1 | 2 | 3 | 4 | 5;
}

export interface PerformanceDataPoint {
  date: string;
  score: number;
  toolType: 'quiz' | 'flashcard' | 'practice';
  difficulty: number;
  timeSpent: number;
}

export interface DifficultyAdjustment {
  currentDifficulty: 1 | 2 | 3 | 4 | 5;
  recommendedDifficulty: 1 | 2 | 3 | 4 | 5;
  reason: string;
  confidence: number;
  expectedImpact: string;
}

export interface LearningInsight {
  type: 'strength' | 'weakness' | 'plateau' | 'breakthrough' | 'regression';
  topic: string;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}

/**
 * Analyze student's mastery across all topics
 */
export function analyzeMastery(studyPlan: StudyPlan): MasteryProfile[] {
  const profiles: MasteryProfile[] = [];
  
  studyPlan.topics.forEach(topic => {
    // Calculate mastery from quizzes
    const topicQuizzes = studyPlan.generatedTools.quizzes.filter(q =>
      q.questions.some(question => question.topic === topic)
    );
    
    const quizScores = topicQuizzes.flatMap(quiz =>
      quiz.attempts.map(attempt => ({
        score: attempt.score,
        date: attempt.completedAt || attempt.startedAt,
        toolType: 'quiz' as const,
        difficulty: 3,
        timeSpent: attempt.timeSpent
      }))
    );
    
    // Calculate mastery from flashcards
    const topicFlashcards = studyPlan.generatedTools.flashcards.filter(f => f.topic === topic);
    const flashcardScores = topicFlashcards.map(card => ({
      score: card.masteryScore,
      date: card.lastReviewed || card.createdAt,
      toolType: 'flashcard' as const,
      difficulty: card.difficulty === 'easy' ? 1 : card.difficulty === 'medium' ? 3 : 5,
      timeSpent: 5 // Estimate
    }));
    
    const allPerformance = [...quizScores, ...flashcardScores];
    
    // Calculate average mastery score
    const avgScore = allPerformance.length > 0
      ? allPerformance.reduce((sum, p) => sum + p.score, 0) / allPerformance.length
      : 0;
    
    // Determine mastery level
    const masteryLevel = getMasteryLevel(avgScore);
    
    // Calculate confidence (based on consistency)
    const scoreVariance = calculateVariance(allPerformance.map(p => p.score));
    const confidence = Math.max(0, 100 - scoreVariance);
    
    // Identify weak and strong areas
    const recentPerformance = allPerformance.slice(-5);
    const recentAvg = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length
      : avgScore;
    
    const weakAreas: string[] = [];
    const strongAreas: string[] = [];
    
    if (recentAvg < 60) {
      weakAreas.push('Recent performance below expectations');
    }
    if (scoreVariance > 30) {
      weakAreas.push('Inconsistent performance - needs more practice');
    }
    if (recentAvg > 80) {
      strongAreas.push('Consistently high performance');
    }
    if (allPerformance.length > 10 && avgScore > 75) {
      strongAreas.push('Well practiced and understood');
    }
    
    // Recommend difficulty
    const recommendedDifficulty = calculateRecommendedDifficulty(avgScore, confidence);
    
    profiles.push({
      topicId: topic,
      topicName: topic,
      masteryLevel,
      masteryScore: Math.round(avgScore),
      confidence: Math.round(confidence),
      streakDays: calculateStreak(allPerformance),
      totalPracticeTime: allPerformance.reduce((sum, p) => sum + p.timeSpent, 0),
      lastPracticed: allPerformance.length > 0 ? allPerformance[allPerformance.length - 1].date : 'Never',
      performanceHistory: allPerformance,
      weakAreas,
      strongAreas,
      recommendedDifficulty
    });
  });
  
  return profiles;
}

/**
 * Generate difficulty adjustment recommendation
 */
export function recommendDifficultyAdjustment(
  currentDifficulty: 1 | 2 | 3 | 4 | 5,
  recentPerformance: PerformanceDataPoint[]
): DifficultyAdjustment {
  if (recentPerformance.length === 0) {
    return {
      currentDifficulty,
      recommendedDifficulty: currentDifficulty,
      reason: 'No performance data available',
      confidence: 0,
      expectedImpact: 'N/A'
    };
  }
  
  const avgScore = recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length;
  const trend = calculateTrend(recentPerformance);
  
  let recommendedDifficulty = currentDifficulty;
  let reason = '';
  let expectedImpact = '';
  
  // Too easy - increase difficulty
  if (avgScore > 90 && trend >= 0) {
    recommendedDifficulty = Math.min(5, currentDifficulty + 1) as any;
    reason = 'Consistently high scores indicate readiness for more challenge';
    expectedImpact = 'Accelerated learning and deeper understanding';
  }
  // Slightly too easy
  else if (avgScore > 80 && trend > 0) {
    recommendedDifficulty = Math.min(5, currentDifficulty + 1) as any;
    reason = 'Improving performance suggests readiness for next level';
    expectedImpact = 'Continued growth and skill development';
  }
  // Just right
  else if (avgScore >= 60 && avgScore <= 80) {
    recommendedDifficulty = currentDifficulty;
    reason = 'Current difficulty level is optimal for learning';
    expectedImpact = 'Steady progress and skill consolidation';
  }
  // Too hard - decrease difficulty
  else if (avgScore < 50 && trend < 0) {
    recommendedDifficulty = Math.max(1, currentDifficulty - 1) as any;
    reason = 'Struggling with current level - build confidence with easier material';
    expectedImpact = 'Improved confidence and stronger foundation';
  }
  // Slightly too hard
  else if (avgScore < 60) {
    recommendedDifficulty = Math.max(1, currentDifficulty - 1) as any;
    reason = 'Below target performance - adjust for better learning pace';
    expectedImpact = 'More effective learning and better retention';
  }
  
  const confidence = calculateConfidence(recentPerformance, avgScore);
  
  return {
    currentDifficulty,
    recommendedDifficulty,
    reason,
    confidence,
    expectedImpact
  };
}

/**
 * Generate learning insights from performance data
 */
export function generateLearningInsights(profiles: MasteryProfile[]): LearningInsight[] {
  const insights: LearningInsight[] = [];
  
  profiles.forEach(profile => {
    // Identify strengths
    if (profile.masteryScore > 85 && profile.confidence > 75) {
      insights.push({
        type: 'strength',
        topic: profile.topicName,
        description: `Excellent mastery of ${profile.topicName}`,
        recommendation: 'Consider teaching this topic to reinforce knowledge',
        priority: 'low',
        actionable: false
      });
    }
    
    // Identify weaknesses
    if (profile.masteryScore < 60) {
      insights.push({
        type: 'weakness',
        topic: profile.topicName,
        description: `${profile.topicName} needs more attention`,
        recommendation: profile.recommendedDifficulty > 3
          ? 'Start with easier materials to build foundation'
          : 'Practice more with current difficulty level',
        priority: 'high',
        actionable: true
      });
    }
    
    // Identify plateaus
    if (profile.performanceHistory.length >= 5) {
      const recent5 = profile.performanceHistory.slice(-5);
      const variance = calculateVariance(recent5.map(p => p.score));
      if (variance < 5 && profile.masteryScore < 85) {
        insights.push({
          type: 'plateau',
          topic: profile.topicName,
          description: `Progress has plateaued on ${profile.topicName}`,
          recommendation: 'Try different study methods or increase difficulty',
          priority: 'medium',
          actionable: true
        });
      }
    }
    
    // Identify breakthroughs
    if (profile.performanceHistory.length >= 3) {
      const recent3 = profile.performanceHistory.slice(-3);
      const improvement = recent3[2].score - recent3[0].score;
      if (improvement > 20) {
        insights.push({
          type: 'breakthrough',
          topic: profile.topicName,
          description: `Significant improvement in ${profile.topicName}!`,
          recommendation: 'Keep up the momentum - ready for more challenge',
          priority: 'low',
          actionable: false
        });
      }
    }
    
    // Identify regression
    if (profile.performanceHistory.length >= 3) {
      const recent3 = profile.performanceHistory.slice(-3);
      const decline = recent3[0].score - recent3[2].score;
      if (decline > 15) {
        insights.push({
          type: 'regression',
          topic: profile.topicName,
          description: `Recent decline in ${profile.topicName} performance`,
          recommendation: 'Review fundamentals and reduce difficulty temporarily',
          priority: 'high',
          actionable: true
        });
      }
    }
  });
  
  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Suggest confidence boost or challenge mode
 */
export function suggestMode(profile: MasteryProfile): 'confidence-boost' | 'challenge' | 'balanced' {
  if (profile.masteryScore < 60 || profile.confidence < 50) {
    return 'confidence-boost';
  }
  
  if (profile.masteryScore > 85 && profile.confidence > 75) {
    return 'challenge';
  }
  
  return 'balanced';
}

// Helper functions

function getMasteryLevel(score: number): 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (score < 30) return 'novice';
  if (score < 50) return 'beginner';
  if (score < 70) return 'intermediate';
  if (score < 90) return 'advanced';
  return 'expert';
}

function calculateVariance(scores: number[]): number {
  if (scores.length === 0) return 0;
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length);
}

function calculateStreak(performance: PerformanceDataPoint[]): number {
  if (performance.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = performance.length - 1; i >= 0; i--) {
    const perfDate = new Date(performance[i].date);
    const daysDiff = Math.floor((today.getTime() - perfDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }
  
  return streak;
}

function calculateTrend(performance: PerformanceDataPoint[]): number {
  if (performance.length < 2) return 0;
  
  const recent = performance.slice(-3);
  const older = performance.slice(0, Math.max(1, performance.length - 3));
  
  const recentAvg = recent.reduce((sum, p) => sum + p.score, 0) / recent.length;
  const olderAvg = older.reduce((sum, p) => sum + p.score, 0) / older.length;
  
  return recentAvg - olderAvg;
}

function calculateConfidence(performance: PerformanceDataPoint[], avgScore: number): number {
  const variance = calculateVariance(performance.map(p => p.score));
  const dataPoints = performance.length;
  
  // High confidence if: low variance, more data points, score close to extremes
  let confidence = 0.5;
  
  if (variance < 10) confidence += 0.2;
  if (dataPoints > 5) confidence += 0.2;
  if (avgScore > 85 || avgScore < 40) confidence += 0.1;
  
  return Math.min(1, confidence);
}

function calculateRecommendedDifficulty(avgScore: number, confidence: number): 1 | 2 | 3 | 4 | 5 {
  if (avgScore > 90 && confidence > 70) return 5;
  if (avgScore > 80 && confidence > 60) return 4;
  if (avgScore > 60) return 3;
  if (avgScore > 40) return 2;
  return 1;
}

