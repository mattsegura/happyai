/**
 * Proactive Suggestions Generator
 *
 * Generates AI-powered proactive suggestions for teachers based on:
 * - New care alerts
 * - Low participation patterns
 * - Student check-in gaps
 * - Upcoming deadlines
 * - Class sentiment changes
 *
 * Appears as notifications/badges to prompt teacher action.
 */

import { getAIService } from './aiService';
import type { CompletionRequest } from './aiTypes';

// =====================================================
// TYPES
// =====================================================

export interface ProactiveSuggestion {
  id: string;
  type: 'care_alert' | 'participation' | 'deadline' | 'sentiment' | 'engagement' | 'celebration';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  createdAt: Date;
  read: boolean;
  data?: any; // Additional context data
}

export interface GenerateProactiveSuggestionsOptions {
  teacherId: string;
  includeTypes?: ProactiveSuggestion['type'][];
  maxSuggestions?: number;
}

// =====================================================
// MOCK DATA GENERATOR
// =====================================================

function generateMockProactiveSuggestions(_teacherId: string): ProactiveSuggestion[] {
  const now = new Date();

  const suggestions: ProactiveSuggestion[] = [
    {
      id: 'ps-1',
      type: 'care_alert',
      priority: 'high',
      title: 'You have 4 new care alerts',
      message: '4 students need your attention: Alex Kim (academic + emotional), Jordan Smith (declining grades), Maria Garcia (persistent low mood), Chris Taylor (low participation). Would you like to review them?',
      actionLabel: 'Review Alerts',
      actionUrl: '/teacher/students?filter=care-alerts',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      data: {
        alertCount: 4,
        students: ['Alex Kim', 'Jordan Smith', 'Maria Garcia', 'Chris Taylor'],
      },
    },
    {
      id: 'ps-2',
      type: 'participation',
      priority: 'high',
      title: 'Period 3 has low participation today',
      message: 'Only 60% of Period 3 students have completed today\'s morning pulse (vs 85% average). Consider posting an engaging class pulse to boost involvement.',
      actionLabel: 'Create Pulse',
      actionUrl: '/teacher/create-pulse',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      read: false,
      data: {
        className: 'Period 3 - Chemistry',
        participationRate: 60,
        averageRate: 85,
      },
    },
    {
      id: 'ps-3',
      type: 'engagement',
      priority: 'medium',
      title: '3 students haven\'t checked in this week',
      message: 'Emma Rodriguez, Sam Lee, and Casey Martinez haven\'t completed any morning pulses this week. They may need a wellness check.',
      actionLabel: 'View Students',
      actionUrl: '/teacher/students?filter=no-checkin',
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      data: {
        students: ['Emma Rodriguez', 'Sam Lee', 'Casey Martinez'],
        daysMissed: 5,
      },
    },
    {
      id: 'ps-4',
      type: 'sentiment',
      priority: 'medium',
      title: 'Period 5 sentiment dropped 12% this week',
      message: 'Class average sentiment fell from 4.8/6 to 4.2/6. This coincides with the new physics unit introduction. Consider posting encouragement or offering support session.',
      actionLabel: 'View Trends',
      actionUrl: '/teacher/sentiment?class=period-5',
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: false,
      data: {
        className: 'Period 5 - Physics',
        oldSentiment: 4.8,
        newSentiment: 4.2,
        change: -0.6,
      },
    },
    {
      id: 'ps-5',
      type: 'deadline',
      priority: 'low',
      title: 'Lab reports due tomorrow',
      message: 'Period 1 Biology lab reports are due tomorrow. 12 students haven\'t submitted yet. Send a friendly reminder?',
      actionLabel: 'Send Reminder',
      actionUrl: '/teacher/assignments?action=remind',
      createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
      read: false,
      data: {
        assignmentName: 'Cell Biology Lab Report',
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        notSubmitted: 12,
      },
    },
    {
      id: 'ps-6',
      type: 'celebration',
      priority: 'low',
      title: 'Period 1 achieved 100% participation!',
      message: 'Every student in Period 1 completed Wednesday\'s class pulse. Celebrate this win with a Hapi Moment to the entire class?',
      actionLabel: 'Celebrate',
      actionUrl: '/teacher/moments?action=send',
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
      read: true, // Already read
      data: {
        className: 'Period 1 - Biology',
        achievement: '100% participation',
      },
    },
    {
      id: 'ps-7',
      type: 'participation',
      priority: 'medium',
      title: 'Office hours attendance at all-time high',
      message: 'You had 18 office hours appointments this week (up from 14 last week). Students are actively seeking help! Consider adding an extra session next week.',
      actionLabel: 'Manage Schedule',
      actionUrl: '/teacher/office-hours',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      data: {
        thisWeek: 18,
        lastWeek: 14,
        increase: 4,
      },
    },
  ];

  return suggestions;
}

// =====================================================
// AI PROMPT BUILDER
// =====================================================

function buildProactiveSuggestionsPrompt(teacherData: {
  teacherName: string;
  recentAlerts: any[];
  classData: any[];
  sentimentChanges: any[];
  upcomingDeadlines: any[];
}): string {
  return `You are an AI assistant generating proactive suggestions for a teacher to help them stay on top of their classes.

**Teacher:** ${teacherData.teacherName}
**Time:** ${new Date().toLocaleString()}

**Current Situation:**
- Recent Care Alerts: ${teacherData.recentAlerts.length}
- Classes: ${teacherData.classData.length}
- Sentiment Changes: ${teacherData.sentimentChanges.length} notable changes
- Upcoming Deadlines: ${teacherData.upcomingDeadlines.length}

**Instructions:**
1. Analyze the data to identify opportunities for teacher action
2. Prioritize suggestions by urgency and impact
3. Keep suggestions concise and actionable
4. Include both challenges (alerts, issues) and celebrations (wins, achievements)
5. Suggest no more than 5-7 items

**Suggestion Types:**
- **care_alert**: Students needing support or intervention
- **participation**: Low engagement patterns
- **deadline**: Upcoming assignments or events
- **sentiment**: Mood changes requiring attention
- **engagement**: Student check-in gaps or patterns
- **celebration**: Positive achievements to acknowledge

**Output Format:** JSON array of suggestions, each with:
- type: suggestion type
- priority: high/medium/low
- title: Short headline (5-10 words)
- message: Clear explanation (1-2 sentences)
- actionLabel: Optional CTA button text
- actionUrl: Optional action link

Generate 5-7 proactive suggestions now in JSON format.`;
}

// =====================================================
// MAIN GENERATION FUNCTION
// =====================================================

export async function generateProactiveSuggestions(
  options: GenerateProactiveSuggestionsOptions
): Promise<ProactiveSuggestion[]> {
  const useMockAI = import.meta.env.VITE_USE_MOCK_AI === 'true';

  // Use mock data if enabled
  if (useMockAI) {
    console.log('[Proactive Suggestions] Using mock data');
    let suggestions = generateMockProactiveSuggestions(options.teacherId);

    // Filter by types if specified
    if (options.includeTypes && options.includeTypes.length > 0) {
      suggestions = suggestions.filter((s) => options.includeTypes!.includes(s.type));
    }

    // Limit number of suggestions
    if (options.maxSuggestions) {
      suggestions = suggestions.slice(0, options.maxSuggestions);
    }

    return suggestions;
  }

  // Real AI generation (when APIs are available)
  try {
    // TODO: Fetch real teacher data from Supabase
    const teacherData = {
      teacherName: 'Teacher',
      recentAlerts: [],
      classData: [],
      sentimentChanges: [],
      upcomingDeadlines: [],
    };

    const prompt = buildProactiveSuggestionsPrompt(teacherData);

    const aiService = getAIService();
    if (options.teacherId) {
      aiService.setUserId(options.teacherId);
    }

    const request: CompletionRequest = {
      prompt,
      featureType: 'proactive_suggestion',
      options: {
        responseFormat: 'json',
        temperature: 0.5,
        maxTokens: 800,
      },
    };

    const response = await aiService.complete(request);

    // Parse AI response
    const suggestionsData = JSON.parse(response.content);

    return suggestionsData.map((s: any, index: number) => ({
      id: `ps-${Date.now()}-${index}`,
      ...s,
      createdAt: new Date(),
      read: false,
    }));
  } catch (error) {
    console.error('[Proactive Suggestions] AI generation failed:', error);
    // Fallback to mock data on error
    return generateMockProactiveSuggestions(options.teacherId);
  }
}

/**
 * Get unread suggestion count
 */
export function getUnreadSuggestionCount(suggestions: ProactiveSuggestion[]): number {
  return suggestions.filter((s) => !s.read).length;
}

/**
 * Get high-priority suggestions
 */
export function getHighPrioritySuggestions(suggestions: ProactiveSuggestion[]): ProactiveSuggestion[] {
  return suggestions.filter((s) => s.priority === 'high' && !s.read);
}

/**
 * Mark suggestion as read
 */
export function markSuggestionAsRead(
  suggestions: ProactiveSuggestion[],
  suggestionId: string
): ProactiveSuggestion[] {
  return suggestions.map((s) =>
    s.id === suggestionId ? { ...s, read: true } : s
  );
}

/**
 * Filter suggestions by type
 */
export function filterSuggestionsByType(
  suggestions: ProactiveSuggestion[],
  types: ProactiveSuggestion['type'][]
): ProactiveSuggestion[] {
  return suggestions.filter((s) => types.includes(s.type));
}
