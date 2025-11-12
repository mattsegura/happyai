/**
 * Personalized Recommendation Engine
 * 
 * Analyzes study patterns and provides intelligent recommendations:
 * - Best times to study specific topics based on performance
 * - Which study tools work best for the user
 * - Topics that need more review based on quiz/flashcard data
 * - Related topics to study together
 */

import { StudyPlan, MasteryProfile, Recommendation } from '../types/studyPlan';
import { PerformanceDataPoint } from './adaptiveLearning';

export interface StudyTimeRecommendation {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  days: string[];
  topics: string[];
  reason: string;
  confidence: number;
  expectedEffectiveness: number; // 0-100
}

export interface ToolEffectivenessAnalysis {
  toolType: 'flashcard' | 'quiz' | 'summary' | 'video' | 'practice';
  effectiveness: number; // 0-100
  usageCount: number;
  avgPerformanceIncrease: number;
  bestFor: string[]; // Topics where this tool works best
  recommendation: string;
}

export interface TopicRelationship {
  topic1: string;
  topic2: string;
  relationshipType: 'prerequisite' | 'complementary' | 'sequential' | 'contrasting';
  strength: number; // 0-1
  recommendation: string;
}

export interface ReviewPriority {
  topic: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  daysSinceLastReview: number;
  currentMastery: number;
  retentionRisk: number; // 0-100, higher = more likely to forget
  recommendedAction: string;
}

/**
 * Analyze best study times based on performance history
 */
export function recommendStudyTimes(
  studyPlans: StudyPlan[],
  performanceData: Map<string, PerformanceDataPoint[]>
): StudyTimeRecommendation[] {
  const recommendations: StudyTimeRecommendation[] = [];
  
  // Analyze performance by time of day
  const performanceByTime: { [key: string]: { scores: number[]; topics: Set<string> } } = {
    morning: { scores: [], topics: new Set() },
    afternoon: { scores: [], topics: new Set() },
    evening: { scores: [], topics: new Set() },
    night: { scores: [], topics: new Set() }
  };
  
  performanceData.forEach((dataPoints, topic) => {
    dataPoints.forEach(point => {
      const hour = new Date(point.date).getHours();
      const timeOfDay = getTimeOfDay(hour);
      
      performanceByTime[timeOfDay].scores.push(point.score);
      performanceByTime[timeOfDay].topics.add(topic);
    });
  });
  
  // Find best performing times
  const timeEffectiveness = Object.entries(performanceByTime).map(([time, data]) => ({
    time: time as any,
    avgScore: data.scores.length > 0 
      ? data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length 
      : 0,
    topics: Array.from(data.topics),
    dataPoints: data.scores.length
  }));
  
  // Sort by effectiveness
  timeEffectiveness.sort((a, b) => b.avgScore - a.avgScore);
  
  // Generate recommendations for top 2 times
  timeEffectiveness.slice(0, 2).forEach((timeData, index) => {
    if (timeData.dataPoints >= 3) { // Need minimum data
      recommendations.push({
        timeOfDay: timeData.time,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Can be refined
        topics: timeData.topics,
        reason: index === 0 
          ? `Your peak performance time - ${timeData.avgScore.toFixed(0)}% average score`
          : `Secondary optimal time - ${timeData.avgScore.toFixed(0)}% average score`,
        confidence: Math.min(100, (timeData.dataPoints / 10) * 100) / 100,
        expectedEffectiveness: timeData.avgScore
      });
    }
  });
  
  return recommendations;
}

/**
 * Analyze which study tools are most effective for the user
 */
export function analyzeToolEffectiveness(
  studyPlan: StudyPlan,
  performanceData: PerformanceDataPoint[]
): ToolEffectivenessAnalysis[] {
  const toolData: Map<string, { scores: number[]; topics: Set<string>; beforeScores: number[] }> = new Map();
  
  // Initialize tools
  ['flashcard', 'quiz', 'summary'].forEach(tool => {
    toolData.set(tool, { scores: [], topics: new Set(), beforeScores: [] });
  });
  
  // Analyze performance by tool
  performanceData.forEach((point, index) => {
    const data = toolData.get(point.toolType);
    if (data) {
      data.scores.push(point.score);
      
      // Track performance improvement (compare to previous attempt)
      if (index > 0 && performanceData[index - 1].toolType === point.toolType) {
        data.beforeScores.push(performanceData[index - 1].score);
      }
    }
  });
  
  const analyses: ToolEffectivenessAnalysis[] = [];
  
  toolData.forEach((data, toolType) => {
    if (data.scores.length > 0) {
      const avgScore = data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length;
      const avgImprovement = data.beforeScores.length > 0
        ? data.scores.slice(-data.beforeScores.length).reduce((sum, s, i) => sum + (s - data.beforeScores[i]), 0) / data.beforeScores.length
        : 0;
      
      let recommendation = '';
      if (avgScore > 80) {
        recommendation = `${toolType}s are highly effective for you - use them frequently`;
      } else if (avgScore > 60) {
        recommendation = `${toolType}s work well - consider pairing with other methods`;
      } else {
        recommendation = `${toolType}s may not be optimal for you - try alternative study methods`;
      }
      
      analyses.push({
        toolType: toolType as any,
        effectiveness: avgScore,
        usageCount: data.scores.length,
        avgPerformanceIncrease: avgImprovement,
        bestFor: Array.from(data.topics),
        recommendation
      });
    }
  });
  
  return analyses.sort((a, b) => b.effectiveness - a.effectiveness);
}

/**
 * Identify topics that need review based on forgetting curve
 */
export function identifyReviewPriorities(
  studyPlan: StudyPlan,
  masteryProfiles: MasteryProfile[]
): ReviewPriority[] {
  const priorities: ReviewPriority[] = [];
  
  masteryProfiles.forEach(profile => {
    const daysSinceReview = calculateDaysSince(profile.lastPracticed);
    
    // Calculate retention risk using forgetting curve
    // Risk increases with time and decreases with mastery
    const timeRisk = Math.min(100, (daysSinceReview / 7) * 50); // Peaks at 7 days
    const masteryProtection = profile.masteryScore / 2; // High mastery reduces risk
    const retentionRisk = Math.max(0, timeRisk - masteryProtection);
    
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let recommendedAction = '';
    
    if (retentionRisk > 70 || daysSinceReview > 14) {
      urgency = 'critical';
      recommendedAction = 'Review immediately - high risk of forgetting';
    } else if (retentionRisk > 50 || daysSinceReview > 7) {
      urgency = 'high';
      recommendedAction = 'Schedule review within 2 days';
    } else if (retentionRisk > 30 || daysSinceReview > 4) {
      urgency = 'medium';
      recommendedAction = 'Plan review this week';
    } else {
      urgency = 'low';
      recommendedAction = 'Continue with current schedule';
    }
    
    priorities.push({
      topic: profile.topicName,
      urgency,
      reason: daysSinceReview > 10 
        ? `Not reviewed in ${daysSinceReview} days - forgetting likely`
        : `${Math.round(retentionRisk)}% retention risk`,
      daysSinceLastReview: daysSinceReview,
      currentMastery: profile.masteryScore,
      retentionRisk: Math.round(retentionRisk),
      recommendedAction
    });
  });
  
  // Sort by urgency and retention risk
  return priorities.sort((a, b) => {
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    return b.retentionRisk - a.retentionRisk;
  });
}

/**
 * Suggest related topics to study together
 */
export function findRelatedTopics(
  studyPlan: StudyPlan,
  allStudyPlans: StudyPlan[]
): TopicRelationship[] {
  const relationships: TopicRelationship[] = [];
  
  // Analyze topics within same course
  studyPlan.topics.forEach((topic1, i) => {
    studyPlan.topics.forEach((topic2, j) => {
      if (i < j) { // Avoid duplicates
        // Determine relationship type based on naming patterns and position
        let relationshipType: TopicRelationship['relationshipType'] = 'complementary';
        let strength = 0.5;
        let recommendation = '';
        
        // Sequential topics (e.g., "Chapter 1", "Chapter 2")
        if (isSequential(topic1, topic2)) {
          relationshipType = 'sequential';
          strength = 0.9;
          recommendation = `Study ${topic1} before ${topic2} for better understanding`;
        }
        // Prerequisite topics
        else if (isPrerequisite(topic1, topic2)) {
          relationshipType = 'prerequisite';
          strength = 0.85;
          recommendation = `Master ${topic1} first as it's foundational for ${topic2}`;
        }
        // Complementary topics
        else if (areComplementary(topic1, topic2)) {
          relationshipType = 'complementary';
          strength = 0.7;
          recommendation = `Study ${topic1} and ${topic2} together for deeper insights`;
        }
        // Contrasting topics
        else if (areContrasting(topic1, topic2)) {
          relationshipType = 'contrasting';
          strength = 0.6;
          recommendation = `Compare ${topic1} and ${topic2} to understand differences`;
        }
        
        if (strength > 0.5) {
          relationships.push({
            topic1,
            topic2,
            relationshipType,
            strength,
            recommendation
          });
        }
      }
    });
  });
  
  return relationships.sort((a, b) => b.strength - a.strength);
}

/**
 * Generate personalized recommendations for the day
 */
export function generateDailyRecommendations(
  studyPlan: StudyPlan,
  masteryProfiles: MasteryProfile[],
  userPreferences: any
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const now = new Date();
  
  // Morning motivation
  if (now.getHours() < 10 && userPreferences.studyTimePreference === 'morning') {
    recommendations.push({
      id: `rec-morning-${Date.now()}`,
      type: 'study-time',
      content: 'Perfect time for your morning study session! Your focus is typically highest now.',
      priority: 'high',
      timestamp: now.toISOString(),
      actionable: true,
      actionLabel: 'Start Session',
      dismissed: false
    });
  }
  
  // Review reminders based on forgetting curve
  const priorities = identifyReviewPriorities(studyPlan, masteryProfiles);
  const urgentReviews = priorities.filter(p => p.urgency === 'critical' || p.urgency === 'high');
  
  if (urgentReviews.length > 0) {
    recommendations.push({
      id: `rec-review-${Date.now()}`,
      type: 'topic-review',
      content: `${urgentReviews[0].topic} needs review - it's been ${urgentReviews[0].daysSinceLastReview} days!`,
      priority: 'high',
      timestamp: now.toISOString(),
      actionable: true,
      actionLabel: 'Review Now',
      dismissed: false
    });
  }
  
  // Difficulty adjustment
  const strugglingTopics = masteryProfiles.filter(p => p.masteryScore < 60);
  if (strugglingTopics.length > 0) {
    recommendations.push({
      id: `rec-difficulty-${Date.now()}`,
      type: 'difficulty-adjustment',
      content: `Consider easier materials for ${strugglingTopics[0].topicName} to build confidence`,
      priority: 'medium',
      timestamp: now.toISOString(),
      actionable: true,
      actionLabel: 'Adjust',
      dismissed: false
    });
  }
  
  // Break reminder for long sessions
  if (studyPlan.lastStudySession && studyPlan.lastStudySession.duration > 90) {
    recommendations.push({
      id: `rec-break-${Date.now()}`,
      type: 'break-reminder',
      content: 'Remember to take regular breaks during long study sessions for better retention',
      priority: 'low',
      timestamp: now.toISOString(),
      actionable: false,
      dismissed: false
    });
  }
  
  // Tool suggestion based on effectiveness
  const toolType = getPreferredToolType(studyPlan);
  if (toolType) {
    recommendations.push({
      id: `rec-tool-${Date.now()}`,
      type: 'tool-suggestion',
      content: `${toolType}s work best for you - generate some for today's topics!`,
      priority: 'medium',
      timestamp: now.toISOString(),
      actionable: true,
      actionLabel: 'Generate',
      dismissed: false
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// Helper functions

function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function calculateDaysSince(dateStr: string): number {
  if (dateStr === 'Never') return 999;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function isSequential(topic1: string, topic2: string): boolean {
  // Check for chapter numbers, part numbers, etc.
  const regex = /chapter\s*(\d+)|part\s*(\d+)|section\s*(\d+)/i;
  const match1 = topic1.match(regex);
  const match2 = topic2.match(regex);
  
  if (match1 && match2) {
    const num1 = parseInt(match1[1] || match1[2] || match1[3]);
    const num2 = parseInt(match2[1] || match2[2] || match2[3]);
    return Math.abs(num1 - num2) === 1;
  }
  
  return false;
}

function isPrerequisite(topic1: string, topic2: string): boolean {
  // Basic prerequisite keywords
  const basicTopics = ['introduction', 'basics', 'fundamentals', 'overview'];
  const advancedTopics = ['advanced', 'applications', 'case studies', 'projects'];
  
  const topic1Lower = topic1.toLowerCase();
  const topic2Lower = topic2.toLowerCase();
  
  return basicTopics.some(t => topic1Lower.includes(t)) && 
         advancedTopics.some(t => topic2Lower.includes(t));
}

function areComplementary(topic1: string, topic2: string): boolean {
  // Topics in same domain are often complementary
  const commonWords = getCommonWords(topic1, topic2);
  return commonWords.length > 0;
}

function areContrasting(topic1: string, topic2: string): boolean {
  // Look for contrasting keywords
  const contrastWords = ['vs', 'versus', 'compared', 'difference'];
  const combined = `${topic1} ${topic2}`.toLowerCase();
  return contrastWords.some(word => combined.includes(word));
}

function getCommonWords(str1: string, str2: string): string[] {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  return words1.filter(word => words2.includes(word) && word.length > 3);
}

function getPreferredToolType(studyPlan: StudyPlan): string | null {
  const tools = studyPlan.generatedTools;
  
  // Simple heuristic: recommend most used tool type
  if (tools.flashcards.length > tools.quizzes.length && tools.flashcards.length > 0) {
    return 'Flashcard';
  }
  if (tools.quizzes.length > 0) {
    return 'Quiz';
  }
  if (tools.summaries.length > 0) {
    return 'Summary';
  }
  
  return null;
}

