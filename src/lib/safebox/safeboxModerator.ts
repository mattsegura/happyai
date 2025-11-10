/**
 * SafeBox AI Moderation Service
 *
 * Provides content moderation for anonymous student feedback messages.
 * Detects inappropriate content, extracts themes, analyzes sentiment,
 * and flags urgent safety concerns.
 *
 * Uses mock data when VITE_USE_SAFEBOX_MOCK=true (default for development)
 */

// =============================================
// Types
// =============================================

export type ModerationStatus = 'pending' | 'approved' | 'flagged' | 'rejected';

export type SafeBoxTheme =
  | 'homework_load'
  | 'teaching_style'
  | 'class_pace'
  | 'grading_fairness'
  | 'classroom_environment'
  | 'assignment_clarity'
  | 'test_difficulty'
  | 'student_relationships'
  | 'mental_health'
  | 'safety_concern'
  | 'positive_feedback'
  | 'negative_feedback'
  | 'suggestion'
  | 'question'
  | 'other';

export interface ModerationResult {
  status: ModerationStatus;
  moderated_message: string; // Cleaned message with profanity removed
  sentiment: number; // 1-6 scale
  detected_themes: SafeBoxTheme[];
  is_urgent: boolean;
  moderation_notes?: string;
  confidence: number; // 0-1 scale
}

// =============================================
// Mock Moderation Implementation
// =============================================

/**
 * Mock AI moderation - Uses rule-based logic instead of real AI
 */
function mockModeration(message: string): ModerationResult {
  const lowerMessage = message.toLowerCase();

  // Profanity filter (basic example)
  const profanityWords = ['fuck', 'shit', 'damn', 'hell', 'crap', 'ass'];
  let cleaned_message = message;
  profanityWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    cleaned_message = cleaned_message.replace(regex, '*'.repeat(word.length));
  });

  // Detect urgent keywords
  const urgentKeywords = ['suicide', 'kill myself', 'self harm', 'hurt myself', 'bullying', 'harassment', 'unsafe', 'abuse'];
  const is_urgent = urgentKeywords.some(keyword => lowerMessage.includes(keyword));

  // Detect themes based on keywords
  const themes: SafeBoxTheme[] = [];

  if (lowerMessage.includes('homework') || lowerMessage.includes('assignment') || lowerMessage.includes('workload')) {
    themes.push('homework_load');
  }
  if (lowerMessage.includes('teaching') || lowerMessage.includes('explain') || lowerMessage.includes('lecture')) {
    themes.push('teaching_style');
  }
  if (lowerMessage.includes('pace') || lowerMessage.includes('too fast') || lowerMessage.includes('too slow')) {
    themes.push('class_pace');
  }
  if (lowerMessage.includes('grading') || lowerMessage.includes('grade') || lowerMessage.includes('unfair')) {
    themes.push('grading_fairness');
  }
  if (lowerMessage.includes('environment') || lowerMessage.includes('atmosphere') || lowerMessage.includes('classroom')) {
    themes.push('classroom_environment');
  }
  if (lowerMessage.includes('unclear') || lowerMessage.includes('confusing') || lowerMessage.includes('don\'t understand')) {
    themes.push('assignment_clarity');
  }
  if (lowerMessage.includes('test') || lowerMessage.includes('exam') || lowerMessage.includes('quiz')) {
    themes.push('test_difficulty');
  }
  if (lowerMessage.includes('students') || lowerMessage.includes('classmates') || lowerMessage.includes('peers')) {
    themes.push('student_relationships');
  }
  if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('overwhelm')) {
    themes.push('mental_health');
  }
  if (lowerMessage.includes('thank') || lowerMessage.includes('great') || lowerMessage.includes('love') || lowerMessage.includes('appreciate')) {
    themes.push('positive_feedback');
  }
  if (lowerMessage.includes('hate') || lowerMessage.includes('worst') || lowerMessage.includes('terrible')) {
    themes.push('negative_feedback');
  }
  if (lowerMessage.includes('suggest') || lowerMessage.includes('could') || lowerMessage.includes('maybe')) {
    themes.push('suggestion');
  }
  if (lowerMessage.includes('?')) {
    themes.push('question');
  }

  // Safety concern detection
  if (is_urgent) {
    themes.push('safety_concern');
  }

  if (themes.length === 0) {
    themes.push('other');
  }

  // Simple sentiment analysis
  const positiveWords = ['great', 'awesome', 'love', 'enjoy', 'appreciate', 'thank', 'excellent', 'amazing', 'helpful'];
  const negativeWords = ['hate', 'terrible', 'awful', 'worst', 'horrible', 'confusing', 'unfair', 'stress', 'overwhelm'];

  let sentiment_score = 3; // Neutral default
  const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;

  if (positiveCount > negativeCount) {
    sentiment_score = 5; // Positive
  } else if (negativeCount > positiveCount) {
    sentiment_score = 2; // Negative
  }

  // Determine moderation status
  let status: ModerationStatus = 'approved';
  let moderation_notes: string | undefined;

  if (is_urgent) {
    status = 'flagged';
    moderation_notes = 'Message flagged for urgent safety concern. Admin review required.';
  } else if (cleaned_message !== message) {
    status = 'flagged';
    moderation_notes = 'Message contains inappropriate language and has been cleaned.';
  }

  // Check for bullying/harassment
  const bullyingKeywords = ['bully', 'harassment', 'harass', 'threaten', 'intimidat'];
  if (bullyingKeywords.some(keyword => lowerMessage.includes(keyword))) {
    status = 'flagged';
    moderation_notes = 'Message contains potential bullying/harassment content.';
  }

  return {
    status,
    moderated_message: cleaned_message,
    sentiment: sentiment_score,
    detected_themes: themes,
    is_urgent,
    moderation_notes,
    confidence: 0.85, // Mock confidence
  };
}

// =============================================
// Real AI Moderation (placeholder)
// =============================================

/**
 * Real AI moderation using OpenAI/Anthropic
 * @requires VITE_OPENAI_API_KEY or VITE_ANTHROPIC_API_KEY
 */
async function realAIModeration(message: string): Promise<ModerationResult> {
  // TODO: Implement real AI moderation when API keys are available
  // This would use OpenAI's Moderation API or Anthropic's Claude API
  // For now, return mock result with a warning

  console.warn('Real AI moderation not implemented. Using mock moderation instead.');
  return mockModeration(message);
}

// =============================================
// Main Moderation Function
// =============================================

/**
 * Moderate a SafeBox message
 *
 * @param message - The student's feedback message
 * @returns ModerationResult with cleaned message, sentiment, themes, and urgency flags
 *
 * @example
 * ```ts
 * const result = await moderateSafeBoxMessage("The homework load is too much");
 * console.log(result.detected_themes); // ['homework_load']
 * console.log(result.sentiment); // 2 (negative)
 * ```
 */
export async function moderateSafeBoxMessage(message: string): Promise<ModerationResult> {
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  if (message.length > 2000) {
    throw new Error('Message exceeds maximum length of 2000 characters');
  }

  if (message.length < 10) {
    throw new Error('Message must be at least 10 characters');
  }

  // Check if using mock data
  const useMock = import.meta.env.VITE_USE_SAFEBOX_MOCK === 'true';

  try {
    if (useMock) {
      // Use mock moderation (no API calls)
      return mockModeration(message);
    } else {
      // Use real AI moderation
      return await realAIModeration(message);
    }
  } catch (error) {
    console.error('Moderation error:', error);
    // Fallback to mock moderation on error
    return mockModeration(message);
  }
}

// =============================================
// Helper Functions
// =============================================

/**
 * Get human-readable theme name
 */
export function getThemeLabel(theme: SafeBoxTheme): string {
  const labels: Record<SafeBoxTheme, string> = {
    homework_load: 'Homework Load',
    teaching_style: 'Teaching Style',
    class_pace: 'Class Pace',
    grading_fairness: 'Grading Fairness',
    classroom_environment: 'Classroom Environment',
    assignment_clarity: 'Assignment Clarity',
    test_difficulty: 'Test Difficulty',
    student_relationships: 'Student Relationships',
    mental_health: 'Mental Health',
    safety_concern: 'Safety Concern',
    positive_feedback: 'Positive Feedback',
    negative_feedback: 'Negative Feedback',
    suggestion: 'Suggestion',
    question: 'Question',
    other: 'Other',
  };

  return labels[theme] || theme;
}

/**
 * Get sentiment label and color
 */
export function getSentimentInfo(sentiment: number): { label: string; color: string } {
  if (sentiment >= 5) {
    return { label: 'Positive', color: 'green' };
  } else if (sentiment >= 4) {
    return { label: 'Slightly Positive', color: 'lightgreen' };
  } else if (sentiment >= 3) {
    return { label: 'Neutral', color: 'gray' };
  } else if (sentiment >= 2) {
    return { label: 'Slightly Negative', color: 'orange' };
  } else {
    return { label: 'Negative', color: 'red' };
  }
}

/**
 * Get moderation status badge info
 */
export function getModerationStatusInfo(status: ModerationStatus): { label: string; color: string } {
  const statusInfo: Record<ModerationStatus, { label: string; color: string }> = {
    pending: { label: 'Pending Review', color: 'yellow' },
    approved: { label: 'Approved', color: 'green' },
    flagged: { label: 'Flagged', color: 'orange' },
    rejected: { label: 'Rejected', color: 'red' },
  };

  return statusInfo[status];
}
