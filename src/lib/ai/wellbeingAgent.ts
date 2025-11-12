/**
 * Wellbeing Coach AI Agent
 * Specialized personality and response logic for emotional support and mental health
 */

export interface WellbeingContext {
  recentMoodTrend?: 'improving' | 'declining' | 'stable';
  averageMood?: number; // 1-10 scale
  stressLevel?: 'low' | 'medium' | 'high' | 'critical';
  sleepQuality?: number; // 1-10 scale
  lastCheckIn?: Date;
  commonTriggers?: string[];
}

export interface WellbeingResponse {
  content: string;
  actions?: string[];
  urgency?: 'low' | 'medium' | 'high' | 'crisis';
  suggestHandoff?: boolean;
  handoffReason?: string;
}

/**
 * Generate response with therapeutic personality
 * - Empathetic and validating
 * - Non-judgmental
 * - Trauma-informed
 * - Solution-focused when appropriate
 * - Strength-based approach
 */
export function generateWellbeingResponse(
  userMessage: string,
  context: WellbeingContext,
  conversationHistory: Array<{ role: string; content: string }>
): WellbeingResponse {
  const lowerMessage = userMessage.toLowerCase();

  // CRISIS DETECTION - Highest priority
  const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'harm myself', 'not worth living', 'better off dead'];
  const hasCrisisIndicator = crisisKeywords.some(keyword => lowerMessage.includes(keyword));

  if (hasCrisisIndicator) {
    return {
      content: "I hear that you're in a lot of pain right now, and I want you to know that your safety is the most important thing. Please reach out to someone who can provide immediate support:\n\n🆘 **Crisis Resources - Available 24/7:**\n• **National Suicide Prevention Lifeline:** 988\n• **Crisis Text Line:** Text HOME to 741741\n• **International Helplines:** findahelpline.com\n\nYou are not alone, and these feelings can change. Please reach out - people care and want to help.\n\nAre you safe right now? Do you have someone you trust nearby?",
      urgency: 'crisis',
      actions: ['crisis_resources']
    };
  }

  // Self-harm detection
  if (lowerMessage.includes('hurt myself') || lowerMessage.includes('self-harm') || lowerMessage.includes('cutting')) {
    return {
      content: "Thank you for trusting me with this. What you're feeling is valid, and I'm glad you're here. Self-harm can feel like a way to cope, but there are healthier alternatives that can help.\n\n**Immediate Support:**\n• Crisis Text Line: Text HOME to 741741\n• National Helpline: 988\n\nWould you like to explore some grounding techniques that might help when you're feeling this way? You deserve support and care.",
      urgency: 'high',
      actions: ['crisis_resources', 'grounding_technique', 'breathing_exercise']
    };
  }

  // Detect academic overload - suggest handoff to Academic Tutor
  const academicKeywords = ['assignment', 'test', 'exam', 'study', 'grade', 'homework', 'deadline', 'project'];
  const hasMultipleAcademicKeywords = academicKeywords.filter(keyword => lowerMessage.includes(keyword)).length >= 2;

  if (hasMultipleAcademicKeywords && lowerMessage.length > 40) {
    return {
      content: "I hear that academic pressures are weighing on you. That's completely valid - school stress is real stress. Let's work on managing those feelings first.\n\nHave you also talked with your Academic Tutor? They can help break down your workload into manageable pieces, which often helps reduce the overwhelm. I'm here for the emotional side, and they're great at the practical study strategies.\n\nFor now, let's focus on you. How are you feeling right now, in this moment?",
      actions: ['switch_to_tutor', 'breathing_exercise', 'mood_check'],
      suggestHandoff: true,
      handoffReason: 'academic_planning_needed'
    };
  }

  // Anxiety and stress responses
  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('panic')) {
    return {
      content: "Anxiety can feel really overwhelming, and I want you to know it's a valid response your body is having. You're not broken or weak - you're experiencing something difficult.\n\nRight now, would it help to:\n• Try a breathing exercise to calm your nervous system?\n• Talk through what's triggering these feelings?\n• Learn about grounding techniques for future episodes?\n\nThere's no pressure to have it all figured out. We can take this one step at a time.",
      actions: ['breathing_exercise', 'grounding_technique', 'anxiety_education'],
      urgency: 'medium'
    };
  }

  // Depression and low mood responses
  if (lowerMessage.includes('depressed') || lowerMessage.includes('hopeless') || lowerMessage.includes('no point')) {
    return {
      content: "I'm really sorry you're feeling this way. Depression can make everything feel heavy and pointless, and it takes courage to reach out when you're in that space. Thank you for being here.\n\nDepression lies to us - it tells us things won't get better, but that's the illness talking, not truth. Small steps matter, even when they don't feel like enough.\n\nWhat feels most important right now? We can:\n• Just talk about what you're experiencing\n• Explore tiny actions that might bring relief\n• Work on self-compassion\n\nNo pressure. I'm here.",
      actions: ['mood_check', 'self_compassion', 'small_wins'],
      urgency: 'high'
    };
  }

  // Stress and overwhelm
  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelm') || lowerMessage.includes('too much')) {
    const moodInfo = context.recentMoodTrend === 'declining'
      ? 'I\'ve noticed your mood has been lower recently. '
      : '';

    return {
      content: `${moodInfo}Feeling overwhelmed is your mind's way of saying "this is a lot right now." And you're right - it probably is.\n\nLet's try something: Can you take a slow, deep breath with me? In through your nose for 4... hold for 4... out through your mouth for 6.\n\nBetter? Even a tiny bit? When we're overwhelmed, our first job is to calm the nervous system, then we can look at the situation more clearly.\n\nWhat feels like the biggest weight right now?`,
      actions: ['breathing_exercise', 'break_down_stressors', 'grounding_technique']
    };
  }

  // Sleep issues
  if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('can\'t sleep') || lowerMessage.includes('tired')) {
    return {
      content: "Sleep problems are so tough because they affect everything else. And worrying about not sleeping makes it even harder to sleep - it's a frustrating cycle.\n\nLet's look at this from a few angles:\n• **Sleep hygiene:** What's your bedtime routine like?\n• **Racing thoughts:** Are worries keeping you up?\n• **Physical relaxation:** Is your body tense?\n\nWe can work on techniques for each of these. What do you think is the biggest barrier to your sleep right now?",
      actions: ['sleep_hygiene', 'relaxation_guide', 'worry_management']
    };
  }

  // Positive check-ins - celebrate and maintain
  if (lowerMessage.includes('better') || lowerMessage.includes('good') || lowerMessage.includes('happy')) {
    return {
      content: "It's wonderful to hear you're feeling better! 🌟 These moments are so important to notice and celebrate, especially when things have been hard.\n\nCan you tell me what's contributing to feeling this way? Understanding what helps us feel good is just as valuable as understanding what brings us down.\n\nLet's savor this moment for a second. What are you grateful for right now?",
      actions: ['mood_check', 'gratitude_prompt', 'identify_positive_patterns']
    };
  }

  // Loneliness and isolation
  if (lowerMessage.includes('alone') || lowerMessage.includes('lonely') || lowerMessage.includes('no one')) {
    return {
      content: "Loneliness is such a painful feeling, and I'm sorry you're experiencing it. It's important to know that feeling alone doesn't mean you are alone, even though it really feels that way.\n\nConnection can feel really hard when we're low, but even small interactions can help:\n• Is there one person you feel even a little comfortable reaching out to?\n• What about online communities around your interests?\n• Sometimes starting small (a smile to a cashier) helps\n\nYou don't have to solve this all at once. And right now, you're not alone - I'm here with you.",
      actions: ['social_connection_strategies', 'self_compassion', 'small_wins']
    };
  }

  // Check for patterns in context
  if (context.recentMoodTrend === 'declining' && Math.random() > 0.7) {
    return {
      content: "I've noticed your mood has been trending downward lately, and I wanted to check in. Sometimes patterns are easier to see from the outside.\n\nYou don't have to have this all figured out. But I'm wondering:\n• What's been different recently?\n• Are there any patterns you've noticed?\n• What used to help when you felt this way before?\n\nWe can explore this together, or we can just talk about right now. What feels right?",
      actions: ['mood_check', 'identify_triggers', 'coping_strategies']
    };
  }

  // Default empathetic response
  return {
    content: "Thank you for being here. This is a safe, judgment-free space where you can share whatever's on your mind.\n\nI'm your Wellbeing Coach - think of me as a supportive companion for your emotional health. I use evidence-based techniques like CBT, mindfulness, and self-compassion practices, but mostly I'm here to listen and support you.\n\nYou don't have to have everything figured out. How are you feeling today?",
    actions: ['mood_check', 'breathing_exercise', 'emotion_wheel']
  };
}

/**
 * Detect if message should suggest switching to Academic Tutor
 */
export function detectAcademicNeed(userMessage: string): boolean {
  const academicKeywords = [
    'study', 'exam', 'test', 'assignment', 'homework', 'grade',
    'class', 'course', 'lecture', 'professor', 'deadline', 'project',
    'quiz', 'paper', 'essay'
  ];

  const lowerMessage = userMessage.toLowerCase();
  const academicCount = academicKeywords.filter(keyword => lowerMessage.includes(keyword)).length;

  // Need at least 2 academic keywords to suggest handoff
  return academicCount >= 2;
}

/**
 * Generate proactive wellbeing check-ins based on context
 */
export function generateProactiveCheckIns(context: WellbeingContext): string[] {
  const checkIns: string[] = [];

  if (context.recentMoodTrend === 'declining') {
    checkIns.push("💜 I noticed your mood has been lower recently. Want to talk about what's been going on?");
  }

  if (context.stressLevel === 'high' || context.stressLevel === 'critical') {
    checkIns.push("🌊 Your stress levels seem elevated. How about a quick breathing exercise to help you feel grounded?");
  }

  if (context.sleepQuality && context.sleepQuality < 5) {
    checkIns.push("😴 I see sleep hasn't been great lately. Poor sleep affects everything. Want to work on some sleep strategies?");
  }

  if (context.lastCheckIn && (Date.now() - context.lastCheckIn.getTime()) > 24 * 60 * 60 * 1000 * 3) {
    checkIns.push("👋 It's been a few days since we last talked. How have things been?");
  }

  if (context.averageMood && context.averageMood >= 7 && context.recentMoodTrend === 'improving') {
    checkIns.push("✨ You seem to be doing really well lately! That's wonderful to see. What's been helping?");
  }

  return checkIns;
}

/**
 * Assess urgency level based on message content
 */
export function assessUrgency(userMessage: string): 'low' | 'medium' | 'high' | 'crisis' {
  const lowerMessage = userMessage.toLowerCase();

  // Crisis level
  const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'harm myself'];
  if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'crisis';
  }

  // High urgency
  const highKeywords = ['panic', 'can\'t breathe', 'emergency', 'hopeless', 'self-harm'];
  if (highKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'high';
  }

  // Medium urgency
  const mediumKeywords = ['anxious', 'depressed', 'overwhelm', 'crying'];
  if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'medium';
  }

  return 'low';
}

