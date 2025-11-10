/**
 * Mock AI Insights Data
 *
 * Provides realistic mock data for AI-powered analytics features when AI APIs are not available.
 * This follows the same pattern as VITE_USE_RISK_DETECTION_MOCK.
 *
 * Usage: Set VITE_USE_RISK_DETECTION_MOCK=true in .env to use this data
 *
 * Phase 3 Features Supported:
 * - Features 13 & 49: Wellness-Performance Correlation
 * - Feature 46: Top 3 Emotional Trends
 * - Feature 47: Top 3 Academic Risk Drivers
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface CorrelationAnalysis {
  // Statistical data
  correlationCoefficient: number; // Pearson r value (-1 to 1)
  pValue: number; // Statistical significance
  sampleSize: number;
  strength: 'Very Strong' | 'Strong' | 'Moderate' | 'Weak' | 'Very Weak';
  direction: 'Positive' | 'Negative' | 'None';

  // Data points for scatter plot
  dataPoints: {
    sentiment: number; // 1-6
    gpa: number; // 0-100
  }[];

  // Breakdown
  byDepartment: {
    department: string;
    r: number;
    pValue: number;
    avgGpa: number;
    avgSentiment: number;
  }[];

  byGradeLevel: {
    gradeLevel: number;
    r: number;
    pValue: number;
    avgGpa: number;
    avgSentiment: number;
  }[];

  byTimeOfYear: {
    period: string;
    r: number;
    avgGpa: number;
    avgSentiment: number;
  }[];

  // AI-generated insights
  aiSummary: string;
  aiInsights: string[];
  aiRecommendations: string[];

  // Lead/lag analysis
  leadLagAnalysis: {
    moodChangeLeadsGradeChange: boolean;
    lagWeeks: number;
    description: string;
  };
}

export interface EmotionalTrend {
  emotion: string;
  tier: number;
  frequency: number; // percentage
  count: number;
  change: number; // percentage change from previous period
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface EmotionalTrendsAnalysis {
  // Top 3 most common emotions
  commonEmotions: EmotionalTrend[];

  // Top 3 concerning trends
  concerningTrends: {
    trend: string;
    severity: 'High' | 'Medium' | 'Low';
    affectedStudents: number;
    percentage: number;
    description: string;
  }[];

  // AI insights
  aiAnalysis: string;
  aiRecommendation: string;

  // Time-based patterns
  patterns: {
    dayOfWeek?: string;
    timeOfDay?: string;
    weekNumber?: string;
    description: string;
  }[];
}

export interface AcademicRiskDriver {
  driver: string;
  studentsAffected: number;
  percentOfStudents: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
  aiRecommendations: string[];
}

export interface AcademicRiskDriversAnalysis {
  // Top 3 risk drivers
  topDrivers: AcademicRiskDriver[];

  // Overlap analysis (Venn diagram data)
  overlapAnalysis: {
    missedAssignmentsOnly: number;
    lowGradesOnly: number;
    inactivityOnly: number;
    missedAndLow: number;
    missedAndInactive: number;
    lowAndInactive: number;
    allThree: number;
  };

  // Department breakdown
  departmentBreakdown: {
    department: string;
    primaryDriver: string;
    studentsAffected: number;
  }[];

  // AI-generated intervention strategies
  aiInterventions: {
    driver: string;
    strategies: string[];
  }[];
}

// =====================================================
// MOCK DATA: WELLNESS-PERFORMANCE CORRELATION (Features 13 & 49)
// =====================================================

export const mockCorrelationAnalysis: CorrelationAnalysis = {
  // Strong positive correlation
  correlationCoefficient: 0.68,
  pValue: 0.001,
  sampleSize: 970,
  strength: 'Strong',
  direction: 'Positive',

  // Scatter plot data points (sample of 100 for visualization)
  dataPoints: [
    { sentiment: 5.5, gpa: 92 },
    { sentiment: 5.2, gpa: 88 },
    { sentiment: 5.0, gpa: 85 },
    { sentiment: 4.8, gpa: 86 },
    { sentiment: 4.5, gpa: 82 },
    { sentiment: 4.2, gpa: 80 },
    { sentiment: 4.0, gpa: 78 },
    { sentiment: 3.8, gpa: 75 },
    { sentiment: 3.5, gpa: 72 },
    { sentiment: 3.2, gpa: 70 },
    { sentiment: 3.0, gpa: 68 },
    { sentiment: 2.8, gpa: 66 },
    { sentiment: 2.5, gpa: 64 },
    { sentiment: 2.2, gpa: 62 },
    { sentiment: 2.0, gpa: 60 },
    // Add more data points for realistic scatter
    { sentiment: 5.3, gpa: 90 },
    { sentiment: 4.9, gpa: 84 },
    { sentiment: 4.6, gpa: 81 },
    { sentiment: 4.3, gpa: 79 },
    { sentiment: 3.9, gpa: 76 },
    { sentiment: 3.6, gpa: 73 },
    { sentiment: 3.3, gpa: 71 },
    { sentiment: 2.9, gpa: 67 },
    { sentiment: 2.6, gpa: 65 },
    { sentiment: 2.3, gpa: 63 },
  ],

  // Breakdown by department
  byDepartment: [
    { department: 'mathematics', r: 0.72, pValue: 0.001, avgGpa: 82.5, avgSentiment: 3.8 },
    { department: 'science', r: 0.70, pValue: 0.001, avgGpa: 84.1, avgSentiment: 4.1 },
    { department: 'english', r: 0.65, pValue: 0.002, avgGpa: 86.3, avgSentiment: 4.3 },
    { department: 'history', r: 0.68, pValue: 0.001, avgGpa: 83.7, avgSentiment: 4.0 },
    { department: 'arts', r: 0.58, pValue: 0.005, avgGpa: 89.2, avgSentiment: 4.8 },
    { department: 'physical_education', r: 0.45, pValue: 0.02, avgGpa: 91.5, avgSentiment: 4.9 },
    { department: 'technology', r: 0.69, pValue: 0.001, avgGpa: 85.8, avgSentiment: 4.2 },
    { department: 'languages', r: 0.66, pValue: 0.002, avgGpa: 84.9, avgSentiment: 4.1 },
  ],

  // Breakdown by grade level
  byGradeLevel: [
    { gradeLevel: 9, r: 0.65, pValue: 0.002, avgGpa: 85.2, avgSentiment: 4.3 },
    { gradeLevel: 10, r: 0.67, pValue: 0.001, avgGpa: 84.8, avgSentiment: 4.1 },
    { gradeLevel: 11, r: 0.73, pValue: 0.001, avgGpa: 83.5, avgSentiment: 3.7 },
    { gradeLevel: 12, r: 0.64, pValue: 0.002, avgGpa: 86.1, avgSentiment: 4.5 },
  ],

  // Breakdown by time of year
  byTimeOfYear: [
    { period: 'Regular Weeks', r: 0.68, avgGpa: 84.9, avgSentiment: 4.2 },
    { period: 'Midterm Period', r: 0.74, avgGpa: 81.2, avgSentiment: 3.5 },
    { period: 'Finals Period', r: 0.76, avgGpa: 82.5, avgSentiment: 3.6 },
    { period: 'Post-Break', r: 0.62, avgGpa: 86.1, avgSentiment: 4.6 },
  ],

  // AI-generated insights
  aiSummary:
    'A strong positive correlation (r=0.68, p<0.001) exists between student emotional wellbeing and academic performance. Students with consistently positive sentiment (Tier 5-6) average 12.5 percentage points higher in GPA compared to students with low sentiment (Tier 1-2).',

  aiInsights: [
    'Students with Tier 5-6 sentiment average 0.4 GPA points (4 percentage points) higher than school average',
    'Mood stability (low variability) correlates with 15% better assignment completion rates',
    'The correlation is strongest during high-stress periods (midterms, finals), suggesting emotional support is most critical during these times',
    'Mathematics and STEM subjects show the strongest correlation (r=0.72), indicating these courses may benefit most from wellbeing interventions',
  ],

  aiRecommendations: [
    'Implement targeted emotional support interventions during midterm and final exam periods, which could yield an estimated 0.3 GPA improvement',
    'Prioritize wellbeing check-ins for mathematics and science students, where the sentiment-performance link is strongest',
  ],

  // Lead/lag analysis
  leadLagAnalysis: {
    moodChangeLeadsGradeChange: true,
    lagWeeks: 2,
    description:
      'Mood improvements predict future grade improvements with a 2-week lag. Students who show consistent sentiment improvement typically see grade improvements 2 weeks later.',
  },
};

// =====================================================
// MOCK DATA: EMOTIONAL TRENDS (Feature 46)
// =====================================================

export const mockEmotionalTrendsAnalysis: EmotionalTrendsAnalysis = {
  // Top 3 most common emotions
  commonEmotions: [
    {
      emotion: 'Tired',
      tier: 3,
      frequency: 22.5,
      count: 218,
      change: 8.2,
      trend: 'increasing',
    },
    {
      emotion: 'Content',
      tier: 4,
      frequency: 18.3,
      count: 177,
      change: -2.1,
      trend: 'stable',
    },
    {
      emotion: 'Hopeful',
      tier: 5,
      frequency: 15.7,
      count: 152,
      change: 3.5,
      trend: 'increasing',
    },
  ],

  // Top 3 concerning trends
  concerningTrends: [
    {
      trend: 'Monday Fatigue Pattern',
      severity: 'High',
      affectedStudents: 340,
      percentage: 35.1,
      description:
        'Students consistently report "Tired" on Mondays at 35% higher rates than other weekdays, suggesting inadequate weekend rest or Sunday anxiety.',
    },
    {
      trend: '11th Grade Anxiety Spike',
      severity: 'High',
      affectedStudents: 125,
      percentage: 52.1,
      description:
        '11th graders show 52% increase in anxiety-related emotions (Worried, Nervous) during weeks 7-8, coinciding with SAT/ACT prep and college planning.',
    },
    {
      trend: 'Math Subject Frustration',
      severity: 'Medium',
      affectedStudents: 87,
      percentage: 18.2,
      description:
        'Mathematics students report "Frustrated" at 18% higher rates than students in other subjects, particularly in AP Calculus classes.',
    },
  ],

  // AI analysis
  aiAnalysis:
    'The most prominent emotional pattern is widespread fatigue, particularly on Mondays. This suggests students may not be getting adequate rest over weekends, or may be experiencing Sunday anxiety about the upcoming week. The 11th grade anxiety spike aligns with college preparation stressors. Mathematics frustration indicates potential curriculum pacing or teaching approach adjustments may be needed.',

  aiRecommendation:
    'Consider implementing: (1) Wellness education about sleep hygiene and weekend recovery, (2) Lighter Monday schedules or more engaging Monday activities to counteract fatigue, (3) Additional emotional support resources for 11th graders during college prep season, (4) Math department review of AP Calculus pacing and support structures.',

  // Time-based patterns
  patterns: [
    {
      dayOfWeek: 'Monday',
      description: 'Fatigue peaks on Mondays (35% higher than other days)',
    },
    {
      weekNumber: 'Weeks 7-8',
      description: 'Anxiety increases during midterm period and college prep season',
    },
    {
      dayOfWeek: 'Friday',
      description: 'Positive emotions increase on Fridays (relief, hopeful)',
    },
  ],
};

// =====================================================
// MOCK DATA: ACADEMIC RISK DRIVERS (Feature 47)
// =====================================================

export const mockAcademicRiskDriversAnalysis: AcademicRiskDriversAnalysis = {
  // Top 3 risk drivers
  topDrivers: [
    {
      driver: 'Missed Assignments',
      studentsAffected: 216,
      percentOfStudents: 22.3,
      severity: 'Critical',
      trend: 'increasing',
      description: 'Students with 3+ missed assignments in the last 2 weeks. This is the #1 predictor of academic decline.',
      aiRecommendations: [
        'Implement automated assignment reminders 24 hours before deadlines',
        'Offer grace periods or late submission policies for struggling students',
        'Identify students with 2+ consecutive missed assignments for early intervention',
        'Provide time management workshops for chronically late students',
      ],
    },
    {
      driver: 'Low Grades (<70%)',
      studentsAffected: 143,
      percentOfStudents: 14.7,
      severity: 'High',
      trend: 'stable',
      description: 'Students currently earning below 70% in one or more courses. Mathematics department accounts for 40% of these cases.',
      aiRecommendations: [
        'Offer targeted tutoring for mathematics students (highest concentration)',
        'Implement peer tutoring programs to increase support capacity',
        'Review grading policies to ensure assessments measure understanding',
        'Provide test-taking strategy workshops',
      ],
    },
    {
      driver: 'Platform Inactivity',
      studentsAffected: 87,
      percentOfStudents: 9.0,
      severity: 'Medium',
      trend: 'decreasing',
      description: 'Students logging in <2 times per week for 2+ consecutive weeks. Often indicates disengagement or external challenges.',
      aiRecommendations: [
        'Contact students and families to identify barriers to participation',
        'Offer flexible learning options for students with external obligations',
        'Gamify platform engagement to increase motivation',
        'Assign peer buddies to re-engage isolated students',
      ],
    },
  ],

  // Overlap analysis (Venn diagram)
  overlapAnalysis: {
    missedAssignmentsOnly: 95,
    lowGradesOnly: 48,
    inactivityOnly: 32,
    missedAndLow: 68,
    missedAndInactive: 35,
    lowAndInactive: 18,
    allThree: 27,
  },

  // Department breakdown
  departmentBreakdown: [
    { department: 'mathematics', primaryDriver: 'Low Grades', studentsAffected: 57 },
    { department: 'science', primaryDriver: 'Missed Assignments', studentsAffected: 48 },
    { department: 'history', primaryDriver: 'Missed Assignments', studentsAffected: 42 },
    { department: 'english', primaryDriver: 'Platform Inactivity', studentsAffected: 28 },
    { department: 'languages', primaryDriver: 'Missed Assignments', studentsAffected: 38 },
    { department: 'technology', primaryDriver: 'Low Grades', studentsAffected: 32 },
    { department: 'arts', primaryDriver: 'Platform Inactivity', studentsAffected: 12 },
    { department: 'physical_education', primaryDriver: 'Missed Assignments', studentsAffected: 8 },
  ],

  // AI-generated interventions
  aiInterventions: [
    {
      driver: 'Missed Assignments',
      strategies: [
        'Automated SMS/email reminders 24 hours before deadline',
        'Weekly assignment completion dashboard for students',
        'Parent notifications when assignments are 2+ days overdue',
        'Study hall periods for students with chronic missing work',
      ],
    },
    {
      driver: 'Low Grades',
      strategies: [
        'Mandatory peer tutoring for students below 70%',
        'Office hours attendance tracking and incentives',
        'Mastery-based retake opportunities for failed assessments',
        'Department-specific intervention programs (especially math)',
      ],
    },
    {
      driver: 'Platform Inactivity',
      strategies: [
        'Wellness check-in calls for students with 0-1 logins/week',
        'Flexible access options (mobile app, offline assignments)',
        'Engagement gamification (points, streaks, rewards)',
        'Peer outreach program ("buddy system")',
      ],
    },
  ],
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Check if AI insights mock mode is enabled
export function isAIInsightsMockEnabled(): boolean {
  return import.meta.env.VITE_USE_RISK_DETECTION_MOCK === 'true';
}

// Get correlation strength label
export function getCorrelationStrength(r: number): CorrelationAnalysis['strength'] {
  const absR = Math.abs(r);
  if (absR >= 0.7) return 'Very Strong';
  if (absR >= 0.5) return 'Strong';
  if (absR >= 0.3) return 'Moderate';
  if (absR >= 0.1) return 'Weak';
  return 'Very Weak';
}

// Get correlation direction
export function getCorrelationDirection(r: number): CorrelationAnalysis['direction'] {
  if (r > 0.1) return 'Positive';
  if (r < -0.1) return 'Negative';
  return 'None';
}

// Get severity color
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Critical':
      return 'text-red-600 dark:text-red-400';
    case 'High':
      return 'text-orange-600 dark:text-orange-400';
    case 'Medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'Low':
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

// Get trend icon/direction
export function getTrendDirection(trend: 'increasing' | 'stable' | 'decreasing'): string {
  switch (trend) {
    case 'increasing':
      return '↑';
    case 'decreasing':
      return '↓';
    case 'stable':
      return '→';
    default:
      return '';
  }
}
