/**
 * Cross-AI Handoff Logic
 * Enables seamless transitions between Academic Tutor and Wellbeing Coach
 */

import { detectWellbeingNeed } from './academicAgent';
import { detectAcademicNeed } from './wellbeingAgent';

export type AIType = 'tutor' | 'coach';

export interface HandoffSuggestion {
  shouldHandoff: boolean;
  targetAI: AIType;
  reason: string;
  message: string;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Analyze conversation and determine if AI handoff should be suggested
 */
export function analyzeForHandoff(
  currentAI: AIType,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): HandoffSuggestion | null {
  if (currentAI === 'tutor') {
    return analyzeTutorToCoachHandoff(userMessage, conversationHistory);
  } else {
    return analyzeCoachToTutorHandoff(userMessage, conversationHistory);
  }
}

/**
 * Analyze if Academic Tutor should suggest Wellbeing Coach
 */
function analyzeTutorToCoachHandoff(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): HandoffSuggestion | null {
  const needsWellbeing = detectWellbeingNeed(userMessage);

  if (!needsWellbeing) {
    return null;
  }

  // Check conversation history for repeated stress mentions
  const recentMessages = conversationHistory.slice(-5);
  const stressCount = recentMessages.filter(m =>
    m.role === 'user' && (
      m.content.toLowerCase().includes('stress') ||
      m.content.toLowerCase().includes('anxious') ||
      m.content.toLowerCase().includes('overwhelm')
    )
  ).length;

  const confidence: 'low' | 'medium' | 'high' = stressCount >= 3 ? 'high' : stressCount >= 2 ? 'medium' : 'low';

  // Craft appropriate handoff message based on confidence
  const messages = {
    high: "I can tell this is really weighing on you emotionally. While I'm here to help with the academic strategies, it sounds like talking to your Wellbeing Coach could really help manage these feelings of stress and overwhelm. They're trained in techniques that can make a big difference.\n\nWould you like to talk with them? I'll stay available for the academic planning whenever you're ready.",
    medium: "I hear that you're feeling stressed about this. I can help with the study strategies, but if the stress itself is becoming hard to manage, your Wellbeing Coach might be really helpful. They specialize in stress management and emotional support.\n\nWant to connect with them?",
    low: "It sounds like you might be feeling a bit overwhelmed. That's completely normal! Your Wellbeing Coach is available if you'd like to talk through those feelings. I'm here for the academic side whenever you need me."
  };

  return {
    shouldHandoff: confidence === 'high',
    targetAI: 'coach',
    reason: 'emotional_distress_detected',
    message: messages[confidence],
    confidence
  };
}

/**
 * Analyze if Wellbeing Coach should suggest Academic Tutor
 */
function analyzeCoachToTutorHandoff(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): HandoffSuggestion | null {
  const needsAcademic = detectAcademicNeed(userMessage);

  if (!needsAcademic) {
    return null;
  }

  // Check if stress is coming from specific academic tasks
  const lowerMessage = userMessage.toLowerCase();
  const hasSpecificTask = (
    lowerMessage.includes('assignment') ||
    lowerMessage.includes('project') ||
    lowerMessage.includes('exam') ||
    lowerMessage.includes('deadline')
  );

  // Check if they're feeling better emotionally
  const recentMessages = conversationHistory.slice(-3);
  const hasPositiveShift = recentMessages.some(m =>
    m.role === 'user' && (
      m.content.toLowerCase().includes('better') ||
      m.content.toLowerCase().includes('calmer') ||
      m.content.toLowerCase().includes('okay')
    )
  );

  const confidence: 'low' | 'medium' | 'high' = 
    hasSpecificTask && hasPositiveShift ? 'high' :
    hasSpecificTask ? 'medium' : 'low';

  const messages = {
    high: "I'm so glad you're feeling a bit better. Now that we've worked on managing those feelings, it might help to tackle the practical side of things.\n\nYour Academic Tutor can help break down that workload into manageable pieces and create a realistic study plan. Sometimes having a clear plan makes everything feel less overwhelming.\n\nWould you like to connect with them?",
    medium: "It sounds like the academic workload is a big part of what's stressing you. While I'm here for the emotional support, your Academic Tutor is really good at helping organize and prioritize tasks.\n\nWant to talk with them about creating a plan?",
    low: "If the academic side needs attention, your Academic Tutor is available. But there's no rush - we can keep working through the emotional stuff first if that feels more important right now."
  };

  return {
    shouldHandoff: confidence === 'high',
    targetAI: 'tutor',
    reason: 'academic_planning_needed',
    message: messages[confidence],
    confidence
  };
}

/**
 * Create handoff transition message with context
 */
export function createHandoffMessage(
  fromAI: AIType,
  toAI: AIType,
  userContext: string,
  reason: string
): string {
  const aiNames = {
    tutor: 'Academic Tutor',
    coach: 'Wellbeing Coach'
  };

  const contextSummary = userContext.length > 100
    ? userContext.substring(0, 100) + '...'
    : userContext;

  if (fromAI === 'tutor' && toAI === 'coach') {
    return `Hi! Your Academic Tutor thought I could help. They mentioned you've been dealing with: "${contextSummary}"\n\nI'm here to support you with the emotional side of things. There's no judgment here - just a safe space to talk. How are you feeling right now?`;
  } else {
    return `Hey! Your Wellbeing Coach thought I might be able to help with the practical side. They mentioned: "${contextSummary}"\n\nI'm here to help break down the work and create a manageable plan. We'll take this step by step. What's the biggest thing on your plate right now?`;
  }
}

/**
 * Generate handoff button/action for UI
 */
export interface HandoffAction {
  label: string;
  targetPath: string;
  icon: 'brain' | 'heart';
  message: string;
}

export function generateHandoffAction(
  currentAI: AIType,
  targetAI: AIType,
  reason: string
): HandoffAction {
  if (targetAI === 'coach') {
    return {
      label: 'Talk to Wellbeing Coach',
      targetPath: '/dashboard/ai-chat/coach',
      icon: 'heart',
      message: 'Switch to emotional support and stress management'
    };
  } else {
    return {
      label: 'Get Help from Academic Tutor',
      targetPath: '/dashboard/ai-chat/tutor',
      icon: 'brain',
      message: 'Switch to study planning and academic strategies'
    };
  }
}

/**
 * Track handoff analytics (for future implementation)
 */
export interface HandoffAnalytics {
  timestamp: Date;
  fromAI: AIType;
  toAI: AIType;
  reason: string;
  userAccepted: boolean;
}

export function logHandoff(analytics: HandoffAnalytics): void {
  // In a real implementation, this would send to an analytics service
  console.log('[AI Handoff]', analytics);

  // Store in localStorage for now (could be moved to database)
  const stored = localStorage.getItem('ai_handoffs');
  const handoffs = stored ? JSON.parse(stored) : [];
  handoffs.push(analytics);
  localStorage.setItem('ai_handoffs', JSON.stringify(handoffs.slice(-50))); // Keep last 50
}

/**
 * Get handoff history for analysis
 */
export function getHandoffHistory(): HandoffAnalytics[] {
  const stored = localStorage.getItem('ai_handoffs');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Analyze handoff patterns to improve suggestions
 */
export function analyzeHandoffPatterns(): {
  totalHandoffs: number;
  acceptanceRate: number;
  mostCommonReason: string;
  tutorToCoachRate: number;
  coachToTutorRate: number;
} {
  const history = getHandoffHistory();

  if (history.length === 0) {
    return {
      totalHandoffs: 0,
      acceptanceRate: 0,
      mostCommonReason: 'none',
      tutorToCoachRate: 0,
      coachToTutorRate: 0
    };
  }

  const accepted = history.filter(h => h.userAccepted).length;
  const acceptanceRate = (accepted / history.length) * 100;

  const tutorToCoach = history.filter(h => h.fromAI === 'tutor').length;
  const coachToTutor = history.filter(h => h.fromAI === 'coach').length;

  // Count reasons
  const reasons: Record<string, number> = {};
  history.forEach(h => {
    reasons[h.reason] = (reasons[h.reason] || 0) + 1;
  });

  const mostCommonReason = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

  return {
    totalHandoffs: history.length,
    acceptanceRate,
    mostCommonReason,
    tutorToCoachRate: (tutorToCoach / history.length) * 100,
    coachToTutorRate: (coachToTutor / history.length) * 100
  };
}

