// Action Detection - Identifies actionable items in AI responses

export type ActionType =
  | 'create_study_plan'
  | 'add_to_calendar'
  | 'generate_flashcards'
  | 'create_quiz'
  | 'set_reminder'
  | 'start_assignment'
  | 'view_analytics'
  | 'check_mood'
  | 'schedule_break'
  | 'connect_with_support';

export interface DetectedAction {
  type: ActionType;
  label: string;
  route?: string;
  icon: string;
  context?: {
    topic?: string;
    subject?: string;
    deadline?: string;
    [key: string]: any;
  };
}

// Action detection patterns
const ACTION_PATTERNS: {
  pattern: RegExp;
  type: ActionType;
  label: string;
  route?: string;
  icon: string;
}[] = [
  {
    pattern: /(create|make|generate|build).*study plan/i,
    type: 'create_study_plan',
    label: 'Create Study Plan',
    route: '/dashboard/study-buddy/create',
    icon: 'Brain',
  },
  {
    pattern: /(add to|put in|schedule).*calendar/i,
    type: 'add_to_calendar',
    label: 'Add to Calendar',
    route: '/dashboard/planner',
    icon: 'Calendar',
  },
  {
    pattern: /(generate|create|make).*flashcard/i,
    type: 'generate_flashcards',
    label: 'Generate Flashcards',
    route: '/dashboard/flashcards',
    icon: 'Sparkles',
  },
  {
    pattern: /(generate|create|make|practice).*quiz/i,
    type: 'create_quiz',
    label: 'Create Practice Quiz',
    route: '/dashboard/quizzes',
    icon: 'FileText',
  },
  {
    pattern: /(set|create).*reminder/i,
    type: 'set_reminder',
    label: 'Set Reminder',
    icon: 'Clock',
  },
  {
    pattern: /(start|begin|work on).*(assignment|essay|project)/i,
    type: 'start_assignment',
    label: 'Start Assignment',
    route: '/dashboard/assignments',
    icon: 'Target',
  },
  {
    pattern: /(check|view|see).*analytics/i,
    type: 'view_analytics',
    label: 'View Analytics',
    route: '/dashboard/analytics',
    icon: 'TrendingUp',
  },
  {
    pattern: /(check|track|log).*mood/i,
    type: 'check_mood',
    label: 'Check Mood',
    route: '/dashboard/wellbeing',
    icon: 'Heart',
  },
  {
    pattern: /(take|schedule|need).*break/i,
    type: 'schedule_break',
    label: 'Schedule a Break',
    icon: 'Coffee',
  },
];

/**
 * Detect actionable items from AI response
 */
export function detectActions(aiResponse: string, userMessage?: string): DetectedAction[] {
  const actions: DetectedAction[] = [];
  const combinedText = `${aiResponse} ${userMessage || ''}`.toLowerCase();
  
  // Check each pattern
  ACTION_PATTERNS.forEach((pattern) => {
    if (pattern.pattern.test(combinedText)) {
      // Extract context from the text
      const context = extractActionContext(combinedText, pattern.type);
      
      actions.push({
        type: pattern.type,
        label: pattern.label,
        route: pattern.route,
        icon: pattern.icon,
        context,
      });
    }
  });
  
  // Remove duplicates by type
  const uniqueActions = actions.filter(
    (action, index, self) =>
      index === self.findIndex((a) => a.type === action.type)
  );
  
  return uniqueActions;
}

/**
 * Extract relevant context for an action from text
 */
function extractActionContext(
  text: string,
  actionType: ActionType
): Record<string, any> {
  const context: Record<string, any> = {};
  
  // Extract topic/subject
  const subjectMatch = text.match(/(calculus|biology|chemistry|physics|literature|history|math|science|english)/i);
  if (subjectMatch) {
    context.subject = subjectMatch[0];
  }
  
  // Extract time-related info
  const timeMatch = text.match(/(tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (timeMatch) {
    context.deadline = timeMatch[0];
  }
  
  // Action-specific context
  switch (actionType) {
    case 'create_study_plan':
    case 'generate_flashcards':
    case 'create_quiz':
      // Extract topic before "study plan" or "flashcards"
      const topicMatch = text.match(/(?:for|about|on|covering)\s+([a-z\s]+?)(?:\s+study|\s+flashcard|\s+quiz)/i);
      if (topicMatch) {
        context.topic = topicMatch[1].trim();
      }
      break;
      
    case 'start_assignment':
      // Extract assignment name
      const assignmentMatch = text.match(/(?:assignment|essay|project)[\s:]+([a-z0-9\s]+?)(?:\.|,|\s+due|\s+is)/i);
      if (assignmentMatch) {
        context.assignmentName = assignmentMatch[1].trim();
      }
      break;
  }
  
  return context;
}

/**
 * Generate smart actions based on conversation context
 */
export function generateContextualActions(
  messages: Array<{ role: string; content: string }>,
  currentClasses: string[] = []
): DetectedAction[] {
  const actions: DetectedAction[] = [];
  
  // Analyze recent messages (last 5)
  const recentMessages = messages.slice(-5);
  const conversationText = recentMessages
    .map((m) => m.content)
    .join(' ')
    .toLowerCase();
  
  // If discussing specific classes, suggest study resources
  currentClasses.forEach((className) => {
    if (conversationText.includes(className.toLowerCase())) {
      actions.push({
        type: 'create_study_plan',
        label: `Study Plan for ${className}`,
        route: '/dashboard/study-buddy/create',
        icon: 'Brain',
        context: { subject: className },
      });
    }
  });
  
  // If mentioned deadlines, suggest calendar
  if (conversationText.includes('due') || conversationText.includes('deadline')) {
    actions.push({
      type: 'add_to_calendar',
      label: 'View Calendar',
      route: '/dashboard/planner',
      icon: 'Calendar',
    });
  }
  
  // If mentioned stress/overwhelm, suggest wellbeing check
  if (
    conversationText.includes('stress') ||
    conversationText.includes('overwhelm') ||
    conversationText.includes('anxious')
  ) {
    actions.push({
      type: 'check_mood',
      label: 'Track Your Mood',
      route: '/dashboard/wellbeing',
      icon: 'Heart',
    });
    
    actions.push({
      type: 'schedule_break',
      label: 'Schedule a Break',
      icon: 'Coffee',
    });
  }
  
  // Remove duplicates
  return actions.filter(
    (action, index, self) =>
      index === self.findIndex((a) => a.type === action.type)
  );
}

/**
 * Priority order for displaying actions
 */
export function prioritizeActions(actions: DetectedAction[]): DetectedAction[] {
  const priority: ActionType[] = [
    'start_assignment',
    'create_study_plan',
    'add_to_calendar',
    'set_reminder',
    'check_mood',
    'generate_flashcards',
    'create_quiz',
    'view_analytics',
    'schedule_break',
    'connect_with_support',
  ];
  
  return actions.sort((a, b) => {
    const aIndex = priority.indexOf(a.type);
    const bIndex = priority.indexOf(b.type);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}

