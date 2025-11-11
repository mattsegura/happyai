/**
 * Academic Tutor AI Agent
 * Specialized personality and response logic for academic support
 */

export interface AcademicContext {
  currentGrades?: Record<string, string>;
  upcomingDeadlines?: Array<{ title: string; dueDate: Date; course: string }>;
  weakSubjects?: string[];
  studyStreak?: number;
  recentTopics?: string[];
}

export interface AcademicResponse {
  content: string;
  actions?: string[];
  suggestHandoff?: boolean;
  handoffReason?: string;
}

/**
 * Generate response with academic personality
 * - Socratic method (asking leading questions)
 * - Growth mindset encouragement
 * - Structured, logical approach
 * - Focus on understanding over memorization
 */
export function generateAcademicResponse(
  userMessage: string,
  context: AcademicContext,
  conversationHistory: Array<{ role: string; content: string }>
): AcademicResponse {
  const lowerMessage = userMessage.toLowerCase();

  // Detect emotional distress - suggest handoff to Wellbeing Coach
  const stressIndicators = ['overwhelm', 'anxious', 'stress', 'can\'t handle', 'too much', 'depressed', 'give up'];
  const hasStressIndicator = stressIndicators.some(indicator => lowerMessage.includes(indicator));

  if (hasStressIndicator && lowerMessage.length > 50) {
    return {
      content: "I notice you might be feeling overwhelmed. While I'm here to help with the academic side of things, it sounds like you could also benefit from talking to your Wellbeing Coach. They're great at helping manage stress and finding balance.\n\nWould you like to connect with them? In the meantime, let's break this down into smaller, manageable steps. What's the most pressing thing we need to tackle?",
      actions: ['switch_to_wellbeing', 'create_study_plan', 'break_down_tasks'],
      suggestHandoff: true,
      handoffReason: 'emotional_distress'
    };
  }

  // Concept explanation requests
  if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how does')) {
    return {
      content: "Great question! Let's break this down using the Feynman Technique:\n\n1. First, let me explain it in simple terms\n2. Then we'll identify what's still unclear\n3. Finally, we'll solidify your understanding with examples\n\nBefore I explain, what's your current understanding? Even a rough guess helps me tailor the explanation to you.",
      actions: ['generate_flashcards', 'create_concept_map', 'find_examples']
    };
  }

  // Study strategy requests
  if (lowerMessage.includes('study') || lowerMessage.includes('prepare') || lowerMessage.includes('review')) {
    const hasDeadlines = context.upcomingDeadlines && context.upcomingDeadlines.length > 0;
    const deadlineInfo = hasDeadlines
      ? `\n\nI see you have ${context.upcomingDeadlines!.length} upcoming deadline(s). Let's prioritize those!`
      : '';

    return {
      content: `Let's create an effective study plan! Research shows that spaced repetition and active recall are most effective.${deadlineInfo}\n\nHere's what I recommend:\n• **Short, focused sessions** (25-45 minutes)\n• **Active practice** over passive reading\n• **Teach-back method** to test understanding\n• **Mix topics** for better retention\n\nWhat subject are we focusing on today?`,
      actions: ['build_study_plan', 'generate_quiz', 'start_timer', 'add_to_calendar']
    };
  }

  // Problem-solving requests
  if (lowerMessage.includes('problem') || lowerMessage.includes('solve') || lowerMessage.includes('calculate')) {
    return {
      content: "I'm here to help you learn, not just give answers! Let's solve this together:\n\n1. **Understand:** What is the problem asking?\n2. **Plan:** What concepts/formulas are relevant?\n3. **Execute:** Let's work through it step-by-step\n4. **Verify:** Does our answer make sense?\n\nWhat's the first step you think we should take?",
      actions: ['show_worked_example', 'generate_practice_problems', 'explain_concept']
    };
  }

  // Grade/performance discussions - handle with growth mindset
  if (lowerMessage.includes('grade') || lowerMessage.includes('score') || lowerMessage.includes('failed') || lowerMessage.includes('bad')) {
    const encouragement = context.studyStreak && context.studyStreak > 3
      ? `I've noticed you've been consistently showing up (${context.studyStreak} day streak!), which is what really matters.`
      : 'What matters now is how we move forward.';

    return {
      content: `Grades are feedback, not a measure of your worth or potential. ${encouragement}\n\nLet's do a growth-focused analysis:\n• What concepts are still unclear?\n• What study strategies can we adjust?\n• What resources can help?\n\nEvery expert was once a beginner. Ready to identify what we can improve?`,
      actions: ['analyze_weak_areas', 'create_improvement_plan', 'find_resources']
    };
  }

  // Check if we need to reconnect with current context
  if (context.weakSubjects && context.weakSubjects.length > 0 && Math.random() > 0.7) {
    return {
      content: `I'm here to help! I noticed you've been working on ${context.weakSubjects[0]} recently. Want to continue with that, or are we tackling something new today?\n\nI can help with:\n• Concept explanations\n• Study plans & time management\n• Practice problems & quizzes\n• Exam preparation strategies\n\nWhat would be most helpful right now?`,
      actions: ['generate_flashcards', 'create_quiz', 'build_study_plan']
    };
  }

  // Default academic response
  return {
    content: "I'm your Academic Tutor - think of me as your study partner who's here to help you truly understand, not just memorize.\n\nI can help you with:\n✓ Breaking down complex concepts\n✓ Creating personalized study plans\n✓ Generating practice materials\n✓ Developing effective learning strategies\n✓ Preparing for exams\n\nWhat are you working on today?",
    actions: ['generate_flashcards', 'create_quiz', 'build_study_plan', 'start_timer']
  };
}

/**
 * Detect if message should suggest switching to Wellbeing Coach
 */
export function detectWellbeingNeed(userMessage: string): boolean {
  const emotionalKeywords = [
    'stress', 'anxious', 'overwhelm', 'depressed', 'sad', 'cry',
    'panic', 'worried', 'scared', 'burnout', 'exhausted',
    'can\'t sleep', 'give up', 'hopeless', 'alone'
  ];

  const lowerMessage = userMessage.toLowerCase();
  return emotionalKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Generate proactive academic suggestions based on context
 */
export function generateProactiveSuggestions(context: AcademicContext): string[] {
  const suggestions: string[] = [];

  if (context.upcomingDeadlines && context.upcomingDeadlines.length > 0) {
    const urgentDeadlines = context.upcomingDeadlines.filter(d => {
      const daysUntil = Math.ceil((d.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 3;
    });

    if (urgentDeadlines.length > 0) {
      suggestions.push(`⚠️ You have ${urgentDeadlines.length} deadline(s) in the next 3 days. Want to review your study plan?`);
    }
  }

  if (context.weakSubjects && context.weakSubjects.length > 0) {
    suggestions.push(`💡 I noticed ${context.weakSubjects[0]} might need some extra attention. Want to do a quick review session?`);
  }

  if (context.studyStreak && context.studyStreak > 0 && context.studyStreak % 7 === 0) {
    suggestions.push(`🎉 ${context.studyStreak}-day study streak! You're building great habits. Keep it up!`);
  }

  return suggestions;
}

