/**
 * Mock Temporal Analytics Data
 *
 * Provides realistic mock data for time-based analytics features when Canvas API is not available.
 * This supports Phase 4 - Week 1: Time-Based Analytics
 *
 * Usage: Set VITE_USE_TEMPORAL_ANALYTICS_MOCK=true in .env to use this data
 *
 * Features Supported:
 * - Feature 21: Mood by Time of Semester
 * - Feature 22: Engagement Heatmap by Day
 * - Feature 8: Department Performance Trends
 */

export interface AcademicEvent {
  weekNumber: number;
  eventName: string;
  eventType: 'exam' | 'break' | 'project_due' | 'holiday';
  date: string;
}

export interface WeeklySentimentData {
  weekNumber: number;
  weekStartDate: string;
  averageSentiment: number;
  assignmentCount: number;
  pulseCompletionRate: number;
  studentCount: number;
  sentiment1Count: number; // Scared, Sad, Lonely
  sentiment2Count: number; // Frustrated, Worried, Nervous
  sentiment3Count: number; // Tired, Bored, Careless
  sentiment4Count: number; // Peaceful, Relieved, Content
  sentiment5Count: number; // Hopeful, Proud
  sentiment6Count: number; // Happy, Excited, Inspired
}

export interface DailyEngagementData {
  weekNumber: number;
  monday: { pulseRate: number; sentiment: number; loginCount: number };
  tuesday: { pulseRate: number; sentiment: number; loginCount: number };
  wednesday: { pulseRate: number; sentiment: number; loginCount: number };
  thursday: { pulseRate: number; sentiment: number; loginCount: number };
  friday: { pulseRate: number; sentiment: number; loginCount: number };
}

export interface DepartmentTrendData {
  department: string;
  currentAvgGrade: number;
  previousAvgGrade: number;
  trend: 'improving' | 'stable' | 'declining';
  trendPercentage: number;
  currentEngagement: number;
  previousEngagement: number;
  currentCompletionRate: number;
  previousCompletionRate: number;
  topContributingClasses: string[];
  bottomContributingClasses: string[];
  aiExplanation: string;
}

// Academic Calendar - Typical 16-week semester
export const mockAcademicCalendar: AcademicEvent[] = [
  { weekNumber: 1, eventName: 'Semester Begins', eventType: 'holiday', date: '2024-09-02' },
  { weekNumber: 3, eventName: 'Add/Drop Deadline', eventType: 'holiday', date: '2024-09-16' },
  { weekNumber: 5, eventName: 'First Exams', eventType: 'exam', date: '2024-09-30' },
  { weekNumber: 7, eventName: 'Midterm Exams', eventType: 'exam', date: '2024-10-14' },
  { weekNumber: 8, eventName: 'Fall Break', eventType: 'break', date: '2024-10-21' },
  { weekNumber: 10, eventName: 'Major Projects Due', eventType: 'project_due', date: '2024-11-04' },
  { weekNumber: 12, eventName: 'Thanksgiving Break', eventType: 'break', date: '2024-11-25' },
  { weekNumber: 14, eventName: 'Final Projects Due', eventType: 'project_due', date: '2024-12-09' },
  { weekNumber: 15, eventName: 'Reading Week', eventType: 'break', date: '2024-12-16' },
  { weekNumber: 16, eventName: 'Final Exams', eventType: 'exam', date: '2024-12-20' },
];

// Weekly Sentiment Data - Shows realistic patterns throughout semester
export const mockWeeklySentimentData: WeeklySentimentData[] = [
  // Week 1-2: High optimism at semester start
  { weekNumber: 1, weekStartDate: '2024-09-02', averageSentiment: 5.2, assignmentCount: 5, pulseCompletionRate: 0.92, studentCount: 450, sentiment1Count: 10, sentiment2Count: 25, sentiment3Count: 40, sentiment4Count: 120, sentiment5Count: 150, sentiment6Count: 105 },
  { weekNumber: 2, weekStartDate: '2024-09-09', averageSentiment: 5.0, assignmentCount: 8, pulseCompletionRate: 0.89, studentCount: 445, sentiment1Count: 12, sentiment2Count: 30, sentiment3Count: 50, sentiment4Count: 130, sentiment5Count: 140, sentiment6Count: 83 },

  // Week 3-4: Reality sets in, moderate stress
  { weekNumber: 3, weekStartDate: '2024-09-16', averageSentiment: 4.5, assignmentCount: 12, pulseCompletionRate: 0.85, studentCount: 440, sentiment1Count: 18, sentiment2Count: 45, sentiment3Count: 70, sentiment4Count: 140, sentiment5Count: 110, sentiment6Count: 57 },
  { weekNumber: 4, weekStartDate: '2024-09-23', averageSentiment: 4.3, assignmentCount: 15, pulseCompletionRate: 0.82, studentCount: 438, sentiment1Count: 22, sentiment2Count: 55, sentiment3Count: 85, sentiment4Count: 135, sentiment5Count: 95, sentiment6Count: 46 },

  // Week 5-6: First exams approaching, stress increases
  { weekNumber: 5, weekStartDate: '2024-09-30', averageSentiment: 3.8, assignmentCount: 18, pulseCompletionRate: 0.78, studentCount: 435, sentiment1Count: 35, sentiment2Count: 75, sentiment3Count: 110, sentiment4Count: 120, sentiment5Count: 70, sentiment6Count: 25 },
  { weekNumber: 6, weekStartDate: '2024-10-07', averageSentiment: 3.6, assignmentCount: 20, pulseCompletionRate: 0.74, studentCount: 432, sentiment1Count: 42, sentiment2Count: 88, sentiment3Count: 120, sentiment4Count: 110, sentiment5Count: 55, sentiment6Count: 17 },

  // Week 7: Midterm week - HIGHEST STRESS
  { weekNumber: 7, weekStartDate: '2024-10-14', averageSentiment: 3.2, assignmentCount: 22, pulseCompletionRate: 0.68, studentCount: 428, sentiment1Count: 58, sentiment2Count: 105, sentiment3Count: 135, sentiment4Count: 85, sentiment5Count: 35, sentiment6Count: 10 },

  // Week 8: Fall break - MOOD BOOST
  { weekNumber: 8, weekStartDate: '2024-10-21', averageSentiment: 4.9, assignmentCount: 6, pulseCompletionRate: 0.88, studentCount: 425, sentiment1Count: 15, sentiment2Count: 32, sentiment3Count: 55, sentiment4Count: 128, sentiment5Count: 125, sentiment6Count: 70 },

  // Week 9-11: Post-break productivity, moderate stress
  { weekNumber: 9, weekStartDate: '2024-10-28', averageSentiment: 4.4, assignmentCount: 14, pulseCompletionRate: 0.84, studentCount: 430, sentiment1Count: 20, sentiment2Count: 48, sentiment3Count: 75, sentiment4Count: 145, sentiment5Count: 100, sentiment6Count: 42 },
  { weekNumber: 10, weekStartDate: '2024-11-04', averageSentiment: 4.1, assignmentCount: 17, pulseCompletionRate: 0.80, studentCount: 428, sentiment1Count: 28, sentiment2Count: 62, sentiment3Count: 92, sentiment4Count: 130, sentiment5Count: 85, sentiment6Count: 31 },
  { weekNumber: 11, weekStartDate: '2024-11-11', averageSentiment: 3.9, assignmentCount: 19, pulseCompletionRate: 0.76, studentCount: 425, sentiment1Count: 35, sentiment2Count: 70, sentiment3Count: 105, sentiment4Count: 120, sentiment5Count: 72, sentiment6Count: 23 },

  // Week 12: Thanksgiving break - MOOD BOOST
  { weekNumber: 12, weekStartDate: '2024-11-25', averageSentiment: 4.7, assignmentCount: 8, pulseCompletionRate: 0.86, studentCount: 420, sentiment1Count: 18, sentiment2Count: 35, sentiment3Count: 60, sentiment4Count: 130, sentiment5Count: 115, sentiment6Count: 62 },

  // Week 13-14: Final projects crunch, high stress
  { weekNumber: 13, weekStartDate: '2024-12-02', averageSentiment: 3.7, assignmentCount: 21, pulseCompletionRate: 0.73, studentCount: 422, sentiment1Count: 40, sentiment2Count: 80, sentiment3Count: 115, sentiment4Count: 110, sentiment5Count: 60, sentiment6Count: 17 },
  { weekNumber: 14, weekStartDate: '2024-12-09', averageSentiment: 3.4, assignmentCount: 24, pulseCompletionRate: 0.69, studentCount: 418, sentiment1Count: 52, sentiment2Count: 95, sentiment3Count: 125, sentiment4Count: 95, sentiment5Count: 42, sentiment6Count: 9 },

  // Week 15: Reading week - slight relief
  { weekNumber: 15, weekStartDate: '2024-12-16', averageSentiment: 3.8, assignmentCount: 10, pulseCompletionRate: 0.75, studentCount: 415, sentiment1Count: 35, sentiment2Count: 72, sentiment3Count: 100, sentiment4Count: 118, sentiment5Count: 68, sentiment6Count: 22 },

  // Week 16: Finals week - MAXIMUM STRESS
  { weekNumber: 16, weekStartDate: '2024-12-20', averageSentiment: 3.0, assignmentCount: 15, pulseCompletionRate: 0.65, studentCount: 412, sentiment1Count: 65, sentiment2Count: 110, sentiment3Count: 140, sentiment4Count: 75, sentiment5Count: 20, sentiment6Count: 2 },
];

// Daily Engagement Heatmap - Shows Monday blues and Friday excitement
export const mockDailyEngagementData: DailyEngagementData[] = [
  {
    weekNumber: 1,
    monday: { pulseRate: 0.85, sentiment: 4.8, loginCount: 380 },
    tuesday: { pulseRate: 0.88, sentiment: 5.0, loginCount: 395 },
    wednesday: { pulseRate: 0.92, sentiment: 5.2, loginCount: 410 },
    thursday: { pulseRate: 0.90, sentiment: 5.1, loginCount: 405 },
    friday: { pulseRate: 0.94, sentiment: 5.4, loginCount: 425 }
  },
  {
    weekNumber: 2,
    monday: { pulseRate: 0.82, sentiment: 4.6, loginCount: 370 },
    tuesday: { pulseRate: 0.86, sentiment: 4.9, loginCount: 385 },
    wednesday: { pulseRate: 0.90, sentiment: 5.1, loginCount: 400 },
    thursday: { pulseRate: 0.88, sentiment: 5.0, loginCount: 395 },
    friday: { pulseRate: 0.91, sentiment: 5.3, loginCount: 415 }
  },
  {
    weekNumber: 7, // Midterm week - all days stressful
    monday: { pulseRate: 0.65, sentiment: 3.0, loginCount: 280 },
    tuesday: { pulseRate: 0.68, sentiment: 3.1, loginCount: 290 },
    wednesday: { pulseRate: 0.70, sentiment: 3.3, loginCount: 300 },
    thursday: { pulseRate: 0.67, sentiment: 3.2, loginCount: 285 },
    friday: { pulseRate: 0.72, sentiment: 3.5, loginCount: 310 }
  },
  {
    weekNumber: 16, // Finals week - extreme stress
    monday: { pulseRate: 0.60, sentiment: 2.8, loginCount: 250 },
    tuesday: { pulseRate: 0.62, sentiment: 2.9, loginCount: 260 },
    wednesday: { pulseRate: 0.65, sentiment: 3.1, loginCount: 270 },
    thursday: { pulseRate: 0.63, sentiment: 3.0, loginCount: 265 },
    friday: { pulseRate: 0.68, sentiment: 3.2, loginCount: 280 }
  },
];

// Department Performance Trends
export const mockDepartmentTrends: DepartmentTrendData[] = [
  {
    department: 'Computer Science',
    currentAvgGrade: 85.2,
    previousAvgGrade: 82.8,
    trend: 'improving',
    trendPercentage: 2.9,
    currentEngagement: 0.87,
    previousEngagement: 0.82,
    currentCompletionRate: 0.91,
    previousCompletionRate: 0.88,
    topContributingClasses: ['CS 101 - Intro to Programming', 'CS 201 - Data Structures'],
    bottomContributingClasses: ['CS 401 - Advanced Algorithms'],
    aiExplanation: 'Computer Science department showing strong improvement (+2.9%) driven by increased office hours utilization (up 23%) and higher peer tutoring participation. CS 101 and CS 201 showing exceptional engagement with new interactive coding labs.'
  },
  {
    department: 'Mathematics',
    currentAvgGrade: 78.5,
    previousAvgGrade: 79.8,
    trend: 'declining',
    trendPercentage: -1.6,
    currentEngagement: 0.74,
    previousEngagement: 0.79,
    currentCompletionRate: 0.82,
    previousCompletionRate: 0.86,
    topContributingClasses: ['MATH 101 - Calculus I'],
    bottomContributingClasses: ['MATH 301 - Linear Algebra', 'MATH 302 - Differential Equations'],
    aiExplanation: 'Mathematics department experiencing slight decline (-1.6%) correlating with reduced student engagement in upper-level courses. MATH 301 and 302 showing 15% drop in office hours attendance. Recommend additional support resources for advanced mathematics.'
  },
  {
    department: 'English Literature',
    currentAvgGrade: 88.3,
    previousAvgGrade: 87.9,
    trend: 'stable',
    trendPercentage: 0.5,
    currentEngagement: 0.91,
    previousEngagement: 0.90,
    currentCompletionRate: 0.94,
    previousCompletionRate: 0.93,
    topContributingClasses: ['ENG 201 - Shakespeare Studies', 'ENG 301 - Modern Poetry'],
    bottomContributingClasses: [],
    aiExplanation: 'English Literature maintaining stable high performance (+0.5%). Consistent engagement levels and excellent assignment completion rates. Writing workshops and peer review sessions showing positive impact.'
  },
  {
    department: 'Biology',
    currentAvgGrade: 81.7,
    previousAvgGrade: 79.2,
    trend: 'improving',
    trendPercentage: 3.2,
    currentEngagement: 0.85,
    previousEngagement: 0.78,
    currentCompletionRate: 0.89,
    previousCompletionRate: 0.83,
    topContributingClasses: ['BIO 101 - General Biology', 'BIO 201 - Genetics'],
    bottomContributingClasses: [],
    aiExplanation: 'Biology department showing significant improvement (+3.2%) following introduction of virtual lab simulations and enhanced study groups. Student engagement up 9% with particularly strong performance in BIO 101 and BIO 201.'
  },
  {
    department: 'Psychology',
    currentAvgGrade: 86.4,
    previousAvgGrade: 86.1,
    trend: 'stable',
    trendPercentage: 0.3,
    currentEngagement: 0.89,
    previousEngagement: 0.88,
    currentCompletionRate: 0.92,
    previousCompletionRate: 0.91,
    topContributingClasses: ['PSY 101 - Introduction to Psychology', 'PSY 301 - Cognitive Psychology'],
    bottomContributingClasses: [],
    aiExplanation: 'Psychology department maintaining consistent high performance (+0.3%). Strong student engagement and assignment completion. Research participation opportunities contributing to practical learning.'
  },
  {
    department: 'History',
    currentAvgGrade: 83.9,
    previousAvgGrade: 85.2,
    trend: 'declining',
    trendPercentage: -1.5,
    currentEngagement: 0.80,
    previousEngagement: 0.84,
    currentCompletionRate: 0.85,
    previousCompletionRate: 0.88,
    topContributingClasses: ['HIST 101 - World History I'],
    bottomContributingClasses: ['HIST 401 - Advanced American History'],
    aiExplanation: 'History department showing slight decline (-1.5%) with reduced engagement in upper-level courses. HIST 401 experiencing 20% drop in discussion participation. Consider implementing more interactive seminar formats.'
  },
  {
    department: 'Chemistry',
    currentAvgGrade: 77.3,
    previousAvgGrade: 78.1,
    trend: 'declining',
    trendPercentage: -1.0,
    currentEngagement: 0.76,
    previousEngagement: 0.79,
    currentCompletionRate: 0.81,
    previousCompletionRate: 0.84,
    topContributingClasses: ['CHEM 101 - General Chemistry I'],
    bottomContributingClasses: ['CHEM 301 - Organic Chemistry II'],
    aiExplanation: 'Chemistry department experiencing modest decline (-1.0%) primarily in CHEM 301 where lab report completion dropped 12%. Recommend enhanced TA support and additional lab hours for organic chemistry.'
  },
  {
    department: 'Business',
    currentAvgGrade: 84.8,
    previousAvgGrade: 82.5,
    trend: 'improving',
    trendPercentage: 2.8,
    currentEngagement: 0.86,
    previousEngagement: 0.81,
    currentCompletionRate: 0.90,
    previousCompletionRate: 0.86,
    topContributingClasses: ['BUS 301 - Marketing Strategies', 'BUS 401 - Business Analytics'],
    bottomContributingClasses: [],
    aiExplanation: 'Business department showing strong improvement (+2.8%) driven by new case study methodology and guest speaker series. Student engagement increased 6% with particularly strong performance in marketing and analytics courses.'
  },
];

// Helper function to get sentiment data by week range
export function getWeeklySentimentByRange(startWeek: number, endWeek: number): WeeklySentimentData[] {
  return mockWeeklySentimentData.filter(
    (data) => data.weekNumber >= startWeek && data.weekNumber <= endWeek
  );
}

// Helper function to get department trends with filters
export function getDepartmentTrendsByFilter(filter?: 'improving' | 'stable' | 'declining'): DepartmentTrendData[] {
  if (!filter) return mockDepartmentTrends;
  return mockDepartmentTrends.filter((dept) => dept.trend === filter);
}

// Helper function to calculate insights for a specific week
export function getWeeklyInsights(weekNumber: number): string[] {
  const weekData = mockWeeklySentimentData.find((w) => w.weekNumber === weekNumber);
  if (!weekData) return [];

  const insights: string[] = [];

  // Sentiment insights
  if (weekData.averageSentiment < 3.5) {
    insights.push(`⚠️ High stress week detected (avg sentiment: ${weekData.averageSentiment.toFixed(1)})`);
  } else if (weekData.averageSentiment > 4.8) {
    insights.push(`✅ Positive mood week (avg sentiment: ${weekData.averageSentiment.toFixed(1)})`);
  }

  // Workload insights
  if (weekData.assignmentCount > 20) {
    insights.push(`📚 Heavy workload: ${weekData.assignmentCount} assignments due`);
  }

  // Engagement insights
  if (weekData.pulseCompletionRate < 0.70) {
    insights.push(`📉 Low engagement: Only ${(weekData.pulseCompletionRate * 100).toFixed(0)}% pulse completion`);
  }

  // Event-based insights
  const event = mockAcademicCalendar.find((e) => e.weekNumber === weekNumber);
  if (event) {
    if (event.eventType === 'exam') {
      insights.push(`🎓 ${event.eventName} - expect increased stress`);
    } else if (event.eventType === 'break') {
      insights.push(`🌴 ${event.eventName} - mood boost expected`);
    }
  }

  return insights;
}
