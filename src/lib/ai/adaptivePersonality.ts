// Adaptive AI Personality - Seamlessly switches between Academic & Wellbeing modes

export type PersonalityMode = 'academic' | 'wellbeing' | 'neutral';

interface PersonalityContext {
  mode: PersonalityMode;
  confidence: number; // 0-1 scale
  detectedKeywords: string[];
  suggestedTone: 'direct' | 'empathetic' | 'encouraging' | 'informative';
}

// Academic keywords and phrases
const ACADEMIC_KEYWORDS = [
  'homework', 'assignment', 'test', 'exam', 'quiz', 'study', 'grade', 'gpa',
  'course', 'class', 'lecture', 'professor', 'teacher', 'deadline', 'due',
  'essay', 'paper', 'project', 'research', 'thesis', 'textbook', 'notes',
  'midterm', 'final', 'presentation', 'lab', 'report', 'calculus', 'biology',
  'chemistry', 'physics', 'literature', 'history', 'math', 'science',
  'reading', 'chapter', 'problem set', 'worksheet', 'flashcard', 'memorize',
  'learn', 'understand', 'explain', 'review', 'practice', 'tutor',
  'college', 'university', 'semester', 'transcript', 'credit', 'schedule'
];

// Wellbeing / emotional keywords
const WELLBEING_KEYWORDS = [
  'stress', 'stressed', 'anxious', 'anxiety', 'worry', 'worried', 'nervous',
  'overwhelmed', 'exhausted', 'tired', 'burnout', 'burnt out', 'depressed',
  'sad', 'crying', 'frustrated', 'angry', 'upset', 'scared', 'afraid',
  'lonely', 'isolated', 'hopeless', 'helpless', 'panic', 'breakdown',
  'can\'t cope', 'too much', 'falling apart', 'struggling', 'drowning',
  'mental health', 'therapy', 'therapist', 'counseling', 'emotional',
  'feelings', 'mood', 'sleep', 'eating', 'self-care', 'break', 'rest',
  'balance', 'meditation', 'breathe', 'calm', 'relax', 'peace',
  'support', 'help me', 'i need', 'i feel', 'feeling'
];

// Crisis indicators (require immediate support)
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'self harm', 'cutting',
  'want to die', 'no point', 'give up', 'can\'t go on'
];

/**
 * Analyze user message to determine personality mode
 */
export function detectPersonalityMode(message: string): PersonalityContext {
  const lowerMessage = message.toLowerCase();
  
  // Check for crisis indicators first
  const hasCrisisKeyword = CRISIS_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (hasCrisisKeyword) {
    return {
      mode: 'wellbeing',
      confidence: 1.0,
      detectedKeywords: CRISIS_KEYWORDS.filter(k => lowerMessage.includes(k)),
      suggestedTone: 'empathetic',
    };
  }
  
  // Count keyword matches
  const academicMatches = ACADEMIC_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  );
  
  const wellbeingMatches = WELLBEING_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword)
  );
  
  const academicScore = academicMatches.length;
  const wellbeingScore = wellbeingMatches.length;
  
  // Determine mode based on scores
  if (wellbeingScore > academicScore) {
    return {
      mode: 'wellbeing',
      confidence: Math.min(wellbeingScore / 3, 1.0), // Normalize to 0-1
      detectedKeywords: wellbeingMatches,
      suggestedTone: 'empathetic',
    };
  } else if (academicScore > wellbeingScore) {
    return {
      mode: 'academic',
      confidence: Math.min(academicScore / 3, 1.0),
      detectedKeywords: academicMatches,
      suggestedTone: 'informative',
    };
  } else if (academicScore > 0 && wellbeingScore > 0) {
    // Both present - stressed about academics
    return {
      mode: 'wellbeing',
      confidence: 0.7,
      detectedKeywords: [...wellbeingMatches, ...academicMatches],
      suggestedTone: 'encouraging',
    };
  }
  
  // No clear indicators
  return {
    mode: 'neutral',
    confidence: 0.3,
    detectedKeywords: [],
    suggestedTone: 'direct',
  };
}

/**
 * Generate response style guide based on personality context
 */
export function getResponseStyle(context: PersonalityContext): {
  openingStyle: string;
  approachGuideline: string;
  examplePhrases: string[];
} {
  switch (context.mode) {
    case 'wellbeing':
      return {
        openingStyle: 'empathetic_validation',
        approachGuideline: 
          'Lead with validation and emotional support. Acknowledge their feelings. ' +
          'Ask open-ended questions. Offer coping strategies gently. ' +
          'Avoid being dismissive or overly solution-focused immediately.',
        examplePhrases: [
          'It sounds like you\'re going through a really tough time...',
          'I hear you, and what you\'re feeling is completely valid.',
          'That must feel really overwhelming. You\'re not alone in this.',
          'Let\'s take this one step at a time together.',
          'It\'s okay to feel this way. How can I best support you right now?',
        ],
      };
      
    case 'academic':
      return {
        openingStyle: 'direct_helpful',
        approachGuideline:
          'Be clear, direct, and action-oriented. Break down complex topics. ' +
          'Provide concrete next steps. Focus on solutions and strategies. ' +
          'Reference specific deadlines and requirements.',
        examplePhrases: [
          'Let\'s tackle this systematically...',
          'Here\'s what I recommend as your next steps:',
          'Based on your deadline, here\'s a plan:',
          'Let me break this down into manageable pieces:',
          'I can help you create a study plan for this.',
        ],
      };
      
    case 'neutral':
    default:
      return {
        openingStyle: 'friendly_open',
        approachGuideline:
          'Be warm and open. Let the conversation develop naturally. ' +
          'Ask clarifying questions. Be ready to shift tone based on their response.',
        examplePhrases: [
          'Tell me more about what\'s on your mind.',
          'I\'m here to help! What do you need support with?',
          'How can I assist you today?',
          'Let\'s figure this out together.',
        ],
      };
  }
}

/**
 * Check if response needs crisis resources
 */
export function needsCrisisResources(context: PersonalityContext): boolean {
  return CRISIS_KEYWORDS.some(keyword =>
    context.detectedKeywords.includes(keyword)
  );
}

/**
 * Get crisis resources message
 */
export function getCrisisResourcesMessage(): string {
  return `
🆘 **Immediate Support Available**

If you're in crisis or having thoughts of self-harm, please reach out to these resources immediately:

📞 **National Suicide Prevention Lifeline**: 988
💬 **Crisis Text Line**: Text HOME to 741741
🌐 **Online Chat**: suicidepreventionlifeline.org/chat

These services are:
- Free and confidential
- Available 24/7
- Staffed by trained counselors

You matter, and there are people who want to help. Please reach out to them right now.

I'm an AI and can't provide emergency support, but I'm here to listen and can help you connect with the right resources.
`.trim();
}

/**
 * Generate conversation context summary for AI
 */
export function generatePersonalityPrompt(
  context: PersonalityContext,
  userMessage: string
): string {
  const style = getResponseStyle(context);
  
  let prompt = `You are an AI learning companion with dual expertise as both an academic advisor and emotional wellbeing counselor.\n\n`;
  
  prompt += `**Current Context Analysis:**\n`;
  prompt += `- Detected Mode: ${context.mode}\n`;
  prompt += `- Confidence: ${(context.confidence * 100).toFixed(0)}%\n`;
  prompt += `- Suggested Tone: ${context.suggestedTone}\n\n`;
  
  prompt += `**Response Guidelines:**\n`;
  prompt += `${style.approachGuideline}\n\n`;
  
  prompt += `**Example Opening Styles:**\n`;
  style.examplePhrases.forEach((phrase, i) => {
    prompt += `${i + 1}. "${phrase}"\n`;
  });
  
  prompt += `\n**User Message:**\n${userMessage}\n\n`;
  
  if (needsCrisisResources(context)) {
    prompt += `⚠️ IMPORTANT: Crisis indicators detected. Include crisis resources in your response.\n\n`;
  }
  
  prompt += `Now respond in character, seamlessly blending ${context.mode} expertise with genuine care.`;
  
  return prompt;
}

