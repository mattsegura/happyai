/**
 * AI Teacher Assistant (Feature 20)
 *
 * Conversational AI assistant for teachers providing:
 * - Data retrieval queries
 * - Analysis and insights
 * - Recommendations
 * - Planning assistance
 * - Student insights
 *
 * Supports both real AI conversation and mock responses.
 */

import { getAIService } from './aiService';
import type { CompletionRequest } from './aiTypes';

// =====================================================
// TYPES
// =====================================================

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  includesVisualization?: boolean;
  visualizationType?: 'chart' | 'table' | 'list';
  visualizationData?: any;
}

export interface AssistantResponse {
  message: AssistantMessage;
  suggestedFollowUps?: string[];
}

export interface TeacherAssistantContext {
  teacherId: string;
  teacherName?: string;
  classes?: any[];
  conversationHistory?: AssistantMessage[];
}

export interface QueryTeacherAssistantOptions {
  query: string;
  context: TeacherAssistantContext;
  includeHistory?: boolean;
}

// =====================================================
// QUERY INTENT DETECTION
// =====================================================

type QueryIntent =
  | 'data_retrieval'
  | 'analysis'
  | 'recommendation'
  | 'planning'
  | 'student_insight'
  | 'general';

function detectQueryIntent(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase();

  // Data retrieval patterns
  if (
    lowerQuery.includes('show me') ||
    lowerQuery.includes('who has') ||
    lowerQuery.includes('list') ||
    lowerQuery.includes('which students') ||
    lowerQuery.includes('how many')
  ) {
    return 'data_retrieval';
  }

  // Analysis patterns
  if (
    lowerQuery.includes('why') ||
    lowerQuery.includes('what caused') ||
    lowerQuery.includes('analyze') ||
    lowerQuery.includes('compare') ||
    lowerQuery.includes('trend')
  ) {
    return 'analysis';
  }

  // Recommendation patterns
  if (
    lowerQuery.includes('what should i') ||
    lowerQuery.includes('how can i') ||
    lowerQuery.includes('suggest') ||
    lowerQuery.includes('recommend') ||
    lowerQuery.includes('help me')
  ) {
    return 'recommendation';
  }

  // Planning patterns
  if (
    lowerQuery.includes('plan') ||
    lowerQuery.includes('schedule') ||
    lowerQuery.includes('when should') ||
    lowerQuery.includes('next week')
  ) {
    return 'planning';
  }

  // Student insight patterns
  if (
    lowerQuery.includes('tell me about') ||
    lowerQuery.includes('student') ||
    lowerQuery.includes('how is')
  ) {
    return 'student_insight';
  }

  return 'general';
}

// =====================================================
// MOCK RESPONSE GENERATOR
// =====================================================

function generateMockAssistantResponse(
  query: string,
  context: TeacherAssistantContext
): AssistantResponse {
  const intent = detectQueryIntent(query);
  const teacherName = context.teacherName || 'there';

  const responses: Record<QueryIntent, { message: string; followUps: string[] }> = {
    data_retrieval: {
      message: `Based on your current data, I found the following:

**Students with Missing Assignments:**
- Alex Kim - 3 missing (Biology lab reports)
- Jordan Smith - 2 missing (Chemistry problem sets)
- Taylor Brown - 1 missing (Physics homework)

**Overall Statistics:**
- Total missing assignments across all classes: 12
- Period 5 has the most missing work (6 assignments)
- Assignment completion rate: 92% (up from 88% last week)

Would you like me to help you draft reminder messages for these students?`,
      followUps: [
        'Draft reminder messages for students with missing work',
        'Show me which assignments have the most missing submissions',
        'Compare missing assignment rates across my classes',
      ],
    },
    analysis: {
      message: `Great question! Let me analyze the sentiment drop in Period 3:

**Key Findings:**
1. **Timing Correlation:** The sentiment drop (4.5 → 3.6) coincided with the introduction of stoichiometry unit this week
2. **Student Feedback:** 3 students mentioned feeling overwhelmed in SafeBox anonymous feedback
3. **Performance Impact:** Quiz scores on stoichiometry were 8% lower than previous unit average
4. **Comparison:** This pattern mirrors what happened last semester during the same unit

**Root Cause:** The stoichiometry unit is conceptually challenging and requires strong foundational algebra skills. Some students may have math gaps affecting their confidence.

**Recommended Actions:**
- Offer optional review session focusing on stoichiometry basics
- Post encouraging class pulse acknowledging the difficulty
- Consider breaking down concepts into smaller, more digestible parts

Would you like help planning the review session?`,
      followUps: [
        'Help me plan a stoichiometry review session',
        'Show me which students are struggling most with this unit',
        'What teaching strategies work best for challenging concepts?',
      ],
    },
    recommendation: {
      message: `Based on your current priorities and data, here's what I recommend focusing on this week:

**🔴 High Priority:**
1. **Address Care Alerts** - You have 4 active care alerts:
   - Alex Kim (3 missing assignments + low mood)
   - Jordan Smith (declining grades B→C)
   - Maria Garcia (persistent low mood for 6 days)
   - Chris Taylor (low participation + emotional volatility)

2. **Period 3 Support** - Sentiment dropped to 3.6/6 due to midterm stress
   - Post encouraging class pulse today
   - Offer optional review session for Thursday

**🟡 Medium Priority:**
3. **Missing Assignments Follow-up** - 12 total across all classes
   - Send gentle reminder with clear deadline
   - Offer office hours support

4. **Celebrate Wins** - Sarah Chen helped 3 peers this week
   - Send her a Hapi Moment to recognize her leadership

**🟢 Low Priority:**
5. **Review SafeBox Feedback** - 5 messages about homework workload
   - Consider adjusting next week's assignment load

I can help you take action on any of these. What would you like to tackle first?`,
      followUps: [
        'Help me draft messages to students with care alerts',
        'Create an encouraging class pulse for Period 3',
        'Review the SafeBox feedback in detail',
      ],
    },
    planning: {
      message: `Let me help you plan next week's assignments while avoiding student overload:

**Current Workload Analysis:**
- Next week (March 10-16) already has 8 assignments across your students' schedules
- Period 3 midterm exam is scheduled for Thursday March 13
- School-wide Science Fair prep is happening this week

**Recommendations:**
📅 **Monday (March 10):** Light day - assign reading only (30 min)
📅 **Tuesday (March 11):** No new assignments - Period 3 students need to study for midterm
📅 **Wednesday (March 12):** Post-midterm recovery day - optional practice problems
📅 **Thursday (March 13):** Science Fair work session - no homework
📅 **Friday (March 14):** Light assignment (45 min max) since week was busy

**Suggested Assignments:**
- Period 1: Lab write-up (due next Monday, giving them weekend)
- Period 5: Problem set (8 problems, ~45 minutes)
- Period 3: Rest and review after midterm

This approach balances learning continuity with student wellbeing. Would you like me to adjust this plan or add anything?`,
      followUps: [
        'Show me the complete semester assignment calendar',
        'When is the best time to schedule the next major exam?',
        'How does my assignment load compare to other teachers?',
      ],
    },
    student_insight: {
      message: `Let me pull up the latest information on Alex Kim:

**Academic Overview:**
- Current Grade: 89% (B+) - slightly below their usual A- range
- Recent Trend: Declined from 94% three weeks ago
- Missing Work: 3 lab reports (Biology)
- Last Assignment: Quiz on cellular respiration - scored 82% (below their average of 92%)

**Emotional Wellbeing:**
- Current Mood: Tier 2 (Frustrated/Worried)
- Recent Pattern: Sentiment dropped from Tier 5 to Tier 2 over past 6 days
- Most Reported Emotions: "Worried" (3x), "Tired" (3x), "Frustrated" (2x)
- Care Alert: Triggered yesterday due to persistent low mood

**Engagement:**
- Morning Pulse: Completed 6 out of 7 days this week
- Class Pulse: 100% participation rate
- Office Hours: Hasn't attended in 2 weeks (unusual - they used to come weekly)
- Hapi Moments: Received 2 this week from peers

**Assessment:**
Alex is showing signs of stress that are impacting both mood and performance. The missing lab reports and declining quiz score are unusual for them. The absence from office hours is a red flag - they typically use that time well.

**Recommended Action:**
- **Immediate:** Schedule 1-on-1 check-in within 24-48 hours
- **Ask About:** What's causing the stress, any external factors, how you can help
- **Offer:** Extension on missing labs, extra support session, counselor referral if needed
- **Follow-Up:** Send encouraging Hapi Moment acknowledging their usual strong performance

Would you like me to help draft that check-in message or Hapi Moment?`,
      followUps: [
        'Draft a check-in message for Alex',
        'Show me other students with similar patterns',
        'What interventions have worked well for stressed high achievers?',
      ],
    },
    general: {
      message: `Hello ${teacherName}! I'm your AI teaching assistant. I can help you with:

📊 **Data Queries:**
- "Show me students with missing assignments"
- "What's the average sentiment in Period 3?"
- "Who triggered care alerts this week?"

🔍 **Analysis:**
- "Why did sentiment drop in Period 5?"
- "Compare participation rates across my classes"
- "Which students are at risk of failing?"

💡 **Recommendations:**
- "What should I prioritize this week?"
- "How can I improve engagement?"
- "What interventions work best for low mood?"

📅 **Planning:**
- "Help me plan next week's assignments"
- "When should I schedule the next exam?"

👤 **Student Insights:**
- "Tell me about Emma's recent performance"
- "Why is Marcus's grade declining?"

What would you like to know?`,
      followUps: [
        'Show me my care alerts',
        'What should I focus on today?',
        'Analyze sentiment trends across my classes',
      ],
    },
  };

  const response = responses[intent];

  return {
    message: {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
    },
    suggestedFollowUps: response.followUps,
  };
}

// =====================================================
// AI PROMPT BUILDER
// =====================================================

function buildAssistantPrompt(
  query: string,
  context: TeacherAssistantContext,
  conversationHistory?: AssistantMessage[]
): string {
  let prompt = `You are Hapi AI, an intelligent teaching assistant helping ${context.teacherName || 'a teacher'} with their classroom management and student support.

**Current Context:**
- Teacher: ${context.teacherName || 'Unknown'}
- Classes: ${context.classes?.length || 0}
- Conversation: ${conversationHistory ? 'Ongoing' : 'New'}

**Your Capabilities:**
1. Data Retrieval: Answer questions about students, grades, sentiment, participation
2. Analysis: Explain patterns, trends, and correlations in the data
3. Recommendations: Suggest actions, interventions, and strategies
4. Planning: Help plan lessons, assignments, and schedule management
5. Student Insights: Provide detailed information about individual students

**Guidelines:**
- Be professional, supportive, and encouraging
- Provide specific, actionable advice
- Use data to back up recommendations
- Acknowledge the teacher's expertise
- Keep responses concise but thorough (2-3 paragraphs)
- Suggest 2-3 relevant follow-up questions

`;

  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `**Conversation History:**\n`;
    conversationHistory.slice(-5).forEach((msg) => {
      prompt += `${msg.role === 'user' ? 'Teacher' : 'Assistant'}: ${msg.content}\n`;
    });
    prompt += '\n';
  }

  prompt += `**Teacher's Question:**\n${query}\n\nRespond to the teacher's question now in a helpful, professional manner.`;

  return prompt;
}

// =====================================================
// MAIN QUERY FUNCTION
// =====================================================

export async function queryTeacherAssistant(
  options: QueryTeacherAssistantOptions
): Promise<AssistantResponse> {
  const useMockAI = import.meta.env.VITE_USE_MOCK_AI === 'true';

  // Use mock data if enabled
  if (useMockAI) {
    console.log('[Teacher Assistant] Using mock response');
    return generateMockAssistantResponse(options.query, options.context);
  }

  // Real AI conversation (when APIs are available)
  try {
    const prompt = buildAssistantPrompt(
      options.query,
      options.context,
      options.includeHistory ? options.context.conversationHistory : undefined
    );

    const aiService = getAIService();
    if (options.context.teacherId) {
      aiService.setUserId(options.context.teacherId);
    }

    const request: CompletionRequest = {
      prompt,
      featureType: 'teacher_assistant',
      options: {
        temperature: 0.6,
        maxTokens: 2000,
      },
    };

    const response = await aiService.complete(request);

    return {
      message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      },
      suggestedFollowUps: [
        'Tell me more about this',
        'What should I do next?',
        'Can you provide examples?',
      ],
    };
  } catch (error) {
    console.error('[Teacher Assistant] AI query failed:', error);
    // Fallback to mock response on error
    return generateMockAssistantResponse(options.query, options.context);
  }
}

/**
 * Stream responses for real-time conversation
 */
export async function* streamTeacherAssistantResponse(
  options: QueryTeacherAssistantOptions
): AsyncIterableIterator<string> {
  const useMockAI = import.meta.env.VITE_USE_MOCK_AI === 'true';

  if (useMockAI) {
    // Simulate streaming for mock response
    const mockResponse = generateMockAssistantResponse(options.query, options.context);
    const words = mockResponse.message.content.split(' ');

    for (const word of words) {
      yield word + ' ';
      await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate typing delay
    }
    return;
  }

  // Real AI streaming
  try {
    const prompt = buildAssistantPrompt(
      options.query,
      options.context,
      options.includeHistory ? options.context.conversationHistory : undefined
    );

    const aiService = getAIService();
    if (options.context.teacherId) {
      aiService.setUserId(options.context.teacherId);
    }

    const request: CompletionRequest = {
      prompt,
      featureType: 'teacher_assistant',
      options: {
        temperature: 0.6,
        maxTokens: 2000,
        stream: true,
      },
    };

    const stream = aiService.streamComplete(request);

    for await (const chunk of stream) {
      yield chunk.content;
    }
  } catch (error) {
    console.error('[Teacher Assistant] Streaming failed:', error);
    yield 'Sorry, I encountered an error. Please try again.';
  }
}
