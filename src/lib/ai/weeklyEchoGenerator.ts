/**
 * Weekly Echo Generator (Feature 19)
 *
 * Generates comprehensive weekly AI summaries for teachers covering:
 * - Executive Summary
 * - Academic Performance
 * - Emotional Wellbeing
 * - Engagement
 * - Class-by-Class Breakdown
 * - Action Items
 * - Looking Ahead
 * - Positive Highlights
 *
 * Supports both real AI (when available) and mock data mode.
 */

import { getAIService } from './aiService';
import type { CompletionRequest } from './aiTypes';

// =====================================================
// TYPES
// =====================================================

export interface WeeklySummary {
  id?: string;
  teacherId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  generatedAt: Date;
  summary: {
    executiveSummary: string[];
    academicPerformance: AcademicPerformanceSummary;
    emotionalWellbeing: EmotionalWellbeingSummary;
    engagement: EngagementSummary;
    classByClass: ClassBreakdown[];
    actionItems: ActionItem[];
    lookingAhead: LookingAheadSummary;
    positiveHighlights: string[];
  };
}

export interface AcademicPerformanceSummary {
  gradeTrends: string;
  assignmentCompletion: string;
  missingSubmissions: string;
  topPerformers: string[];
  strugglingStudents: string[];
}

export interface EmotionalWellbeingSummary {
  classSentimentTrends: string;
  careAlertsSummary: string;
  moodPatterns: string;
  positiveDevelopments: string;
}

export interface EngagementSummary {
  pulseParticipation: string;
  hapiMomentsActivity: string;
  officeHoursAttendance: string;
  safeBoxThemes?: string;
}

export interface ClassBreakdown {
  className: string;
  classId: string;
  highlights: string;
  concerns: string;
  recommendedPriorities: string[];
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  action: string;
  students?: string[];
}

export interface LookingAheadSummary {
  upcomingEvents: string[];
  predictedChallenges: string[];
  suggestedActions: string[];
}

export interface GenerateWeeklySummaryOptions {
  teacherId: string;
  weekStartDate?: Date;
  weekEndDate?: Date;
  includeAllClasses?: boolean;
  classIds?: string[];
}

// =====================================================
// MOCK DATA GENERATOR
// =====================================================

function generateMockWeeklySummary(
  teacherId: string,
  weekStartDate: Date,
  weekEndDate: Date
): WeeklySummary {
  return {
    teacherId,
    weekStartDate,
    weekEndDate,
    generatedAt: new Date(),
    summary: {
      executiveSummary: [
        'Overall positive week with strong engagement in Period 1 Biology',
        'Period 3 Chemistry showing declining sentiment - midterm stress likely factor',
        '4 new care alerts requiring follow-up, all related to academic performance',
        'Office hours attendance increased by 25% compared to last week',
      ],
      academicPerformance: {
        gradeTrends: 'Class averages remain stable across all periods (Period 1: 87%, Period 3: 82%, Period 5: 84%). Period 3 showed a slight 2% decline compared to last week, likely due to challenging midterm material.',
        assignmentCompletion: 'Assignment completion rate improved to 92% this week (up from 88% last week). The new deadline reminder system appears to be working well.',
        missingSubmissions: '12 total missing assignments across all classes (down from 18 last week). Period 5 has the most missing work with 6 assignments.',
        topPerformers: [
          'Sarah Chen - Consistent A grades, helped 3 peers with lab work',
          'Marcus Johnson - Perfect attendance and participation',
          'Emma Rodriguez - Improved from B to A- this week',
        ],
        strugglingStudents: [
          'Alex Kim - Missing 3 assignments, care alert triggered',
          'Jordan Smith - Declining grades (B to C), needs check-in',
          'Taylor Brown - Low participation in discussions',
        ],
      },
      emotionalWellbeing: {
        classSentimentTrends: 'Average sentiment across all classes: 4.2/6 (moderate-positive range). Period 1 leads with 4.8/6, while Period 3 dipped to 3.6/6 this week. The class-wide drop in Period 3 correlates with midterm stress.',
        careAlertsSummary: '4 new care alerts this week: 3 academic (missing assignments, declining grades), 1 emotional (persistent low mood for 5 days). All students have been contacted.',
        moodPatterns: 'Sentiment tends to be highest on Tuesdays and Wednesdays, lowest on Mondays. Students report feeling "Tired" most frequently (32%), followed by "Hopeful" (24%) and "Peaceful" (18%).',
        positiveDevelopments: 'Emotional recovery rate improved to 82% this week. 9 out of 11 students who received interventions showed mood improvement within 5 days.',
      },
      engagement: {
        pulseParticipation: 'Morning pulse completion: 85% (up from 78%). Class pulse participation: 91% average across all periods. Period 1 had perfect 100% participation on Wednesday\'s discussion question.',
        hapiMomentsActivity: '47 Hapi Moments sent this week (student-to-student: 32, teacher-to-student: 15). Top themes: "Thanks for help with homework" (18), "Great job on presentation" (12), "Positive attitude" (9).',
        officeHoursAttendance: '18 office hours appointments held this week (up from 14 last week). 94% attendance rate. Most common topics: exam prep (40%), assignment help (35%), career advice (15%).',
        safeBoxThemes: '5 anonymous feedback messages received. Common themes: "Homework workload feels heavy" (2 mentions), "Appreciate the review sessions" (2 mentions), "More group work please" (1 mention).',
      },
      classByClass: [
        {
          className: 'Period 1 - Biology',
          classId: 'bio-101',
          highlights: 'Excellent engagement with 96% class pulse participation. Students showed strong understanding of cell biology unit. Lab activities were well-received.',
          concerns: 'One student (Alex Kim) has missed 3 labs and is falling behind. May need intervention.',
          recommendedPriorities: [
            'Schedule 1-on-1 with Alex Kim to discuss makeup labs',
            'Continue current teaching approach - students are thriving',
            'Plan next unit\'s group activities based on positive lab feedback',
          ],
        },
        {
          className: 'Period 3 - Chemistry',
          classId: 'chem-201',
          highlights: 'Strong test performance with 78% of students scoring B or higher on last quiz. Office hours well-utilized by this class.',
          concerns: 'Sentiment dropped to 3.6/6 this week due to midterm stress. 3 students expressed feeling overwhelmed via SafeBox. Some students struggling with stoichiometry concepts.',
          recommendedPriorities: [
            'Post an encouraging class pulse to acknowledge midterm stress',
            'Offer optional review session for stoichiometry',
            'Check in with students who gave SafeBox feedback',
          ],
        },
        {
          className: 'Period 5 - Physics',
          classId: 'phys-101',
          highlights: 'Class average stable at 84%. Strong peer collaboration with 12 Hapi Moments exchanged within the class. Students enjoy the real-world problem sets.',
          concerns: '6 missing assignments (highest across all classes). 2 students haven\'t checked in via morning pulse this week.',
          recommendedPriorities: [
            'Send reminder about missing assignments with clear deadline',
            'Follow up with students who haven\'t done morning pulses',
            'Continue real-world problem approach - it\'s working well',
          ],
        },
      ],
      actionItems: [
        {
          priority: 'high',
          action: 'Schedule 1-on-1 meetings with 4 students who triggered care alerts',
          students: ['Alex Kim', 'Jordan Smith', 'Maria Garcia', 'Chris Taylor'],
        },
        {
          priority: 'high',
          action: 'Post encouraging class pulse to Period 3 to address midterm stress',
        },
        {
          priority: 'medium',
          action: 'Offer optional stoichiometry review session for Period 3',
        },
        {
          priority: 'medium',
          action: 'Send missing assignment reminders to Period 5 students',
          students: ['Taylor Brown', 'Sam Lee', 'Casey Martinez', 'Jamie Wilson', 'Drew Anderson', 'Morgan Davis'],
        },
        {
          priority: 'low',
          action: 'Celebrate Sarah Chen\'s peer helping behavior with a Hapi Moment',
          students: ['Sarah Chen'],
        },
        {
          priority: 'low',
          action: 'Review SafeBox feedback and adjust homework workload if needed',
        },
      ],
      lookingAhead: {
        upcomingEvents: [
          'Period 3 Midterm Exam (Next Thursday) - expect sentiment dip',
          'School-wide Science Fair (2 weeks) - opportunity for extra credit',
          'Spring Break (3 weeks) - good timing for mental health reset',
        ],
        predictedChallenges: [
          'Post-midterm grade anxiety in Period 3 after exam results',
          'Potential missing assignment spike during Science Fair prep week',
          'Energy/motivation dip in final week before Spring Break',
        ],
        suggestedActions: [
          'Schedule Period 3 midterm review sessions this week',
          'Promote Science Fair participation as extra credit opportunity',
          'Plan lighter homework load for week before Spring Break',
          'Consider posting extra encouragement pulses during predicted stress periods',
        ],
      },
      positiveHighlights: [
        '🎉 Period 1 achieved 100% class pulse participation on Wednesday!',
        '📈 Overall assignment completion improved by 4% this week',
        '💪 9 students showed emotional recovery after teacher interventions (82% success rate)',
        '❤️ Students sent 32 Hapi Moments to each other - building positive class culture',
        '⭐ Sarah Chen went above and beyond helping 3 peers with lab work',
        '📚 Office hours attendance hit all-time high with 18 appointments',
      ],
    },
  };
}

// =====================================================
// AI PROMPT BUILDER
// =====================================================

function buildWeeklySummaryPrompt(
  teacherData: {
    teacherName: string;
    classes: any[];
    weekData: {
      academicData: any;
      sentimentData: any;
      engagementData: any;
      careAlerts: any[];
    };
  }
): string {
  return `You are an AI assistant helping a teacher understand their week. Generate a comprehensive weekly summary.

**Teacher:** ${teacherData.teacherName}
**Week:** ${new Date().toLocaleDateString()} - ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}

**Data Overview:**
- Classes: ${teacherData.classes.length}
- Total Students: ${teacherData.classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)}
- Care Alerts: ${teacherData.weekData.careAlerts.length}

**Instructions:**
1. Analyze the week's data holistically
2. Identify key patterns, trends, and insights
3. Provide actionable recommendations
4. Maintain a professional, encouraging tone
5. Focus on both challenges and successes

**Output Format:** JSON with 8 sections:
- executiveSummary (3-5 key takeaways as array of strings)
- academicPerformance (object with gradeTrends, assignmentCompletion, etc.)
- emotionalWellbeing (object with sentiment analysis)
- engagement (object with participation metrics)
- classByClass (array of objects with per-class breakdown)
- actionItems (array of prioritized actions)
- lookingAhead (object with upcoming events and predictions)
- positiveHighlights (array of wins to celebrate)

Generate the summary now in JSON format.`;
}

// =====================================================
// MAIN GENERATION FUNCTION
// =====================================================

export async function generateWeeklySummary(
  options: GenerateWeeklySummaryOptions
): Promise<WeeklySummary> {
  const useMockAI = import.meta.env.VITE_USE_MOCK_AI === 'true';

  const weekStartDate = options.weekStartDate || getWeekStart();
  const weekEndDate = options.weekEndDate || getWeekEnd();

  // Use mock data if enabled
  if (useMockAI) {
    console.log('[Weekly Echo] Using mock data');
    return generateMockWeeklySummary(options.teacherId, weekStartDate, weekEndDate);
  }

  // Real AI generation (when APIs are available)
  try {
    // TODO: Fetch real teacher data from Supabase
    const teacherData = {
      teacherName: 'Teacher',
      classes: [],
      weekData: {
        academicData: {},
        sentimentData: {},
        engagementData: {},
        careAlerts: [],
      },
    };

    const prompt = buildWeeklySummaryPrompt(teacherData);

    const aiService = getAIService();
    if (options.teacherId) {
      aiService.setUserId(options.teacherId);
    }

    const request: CompletionRequest = {
      prompt,
      featureType: 'weekly_summary',
      options: {
        responseFormat: 'json',
        temperature: 0.4,
        maxTokens: 3000,
      },
    };

    const response = await aiService.complete(request);

    // Parse AI response and structure it
    const summaryData = JSON.parse(response.content);

    return {
      teacherId: options.teacherId,
      weekStartDate,
      weekEndDate,
      generatedAt: new Date(),
      summary: summaryData,
    };
  } catch (error) {
    console.error('[Weekly Echo] AI generation failed:', error);
    // Fallback to mock data on error
    return generateMockWeeklySummary(options.teacherId, weekStartDate, weekEndDate);
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday as start
  return new Date(d.setDate(diff));
}

function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date);
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
}

/**
 * Get week range for a specific date
 */
export function getWeekRange(date: Date = new Date()): {
  weekStartDate: Date;
  weekEndDate: Date;
} {
  return {
    weekStartDate: getWeekStart(date),
    weekEndDate: getWeekEnd(date),
  };
}

/**
 * Format week range as string
 */
export function formatWeekRange(weekStartDate: Date, weekEndDate: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${weekStartDate.toLocaleDateString('en-US', options)} - ${weekEndDate.toLocaleDateString('en-US', options)}`;
}
