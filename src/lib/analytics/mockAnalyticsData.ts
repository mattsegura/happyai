/**
 * Mock Analytics Data
 *
 * Provides realistic mock data for academic analytics features
 * Used when VITE_USE_ANALYTICS_MOCK=true in .env
 */

import type {
  ClassAverageGrade,
  GradeDistribution,
  SubmissionStats,
  ParticipationRate,
  MoodPerformanceData,
} from './academicAnalytics';

// Mock classes
export const mockClasses = [
  {
    id: 'class-1',
    name: 'Introduction to Computer Science',
    code: 'CS 101',
    studentCount: 28,
  },
  {
    id: 'class-2',
    name: 'Data Structures and Algorithms',
    code: 'CS 201',
    studentCount: 32,
  },
  {
    id: 'class-3',
    name: 'Web Development Fundamentals',
    code: 'CS 150',
    studentCount: 25,
  },
];

// Mock Class Average Grades
export const mockClassAverageGrades: Record<string, ClassAverageGrade> = {
  'class-1': {
    classId: 'class-1',
    className: 'Introduction to Computer Science',
    averagePercentage: 87.3,
    letterGrade: 'B+',
    trend: 'improving',
    studentCount: 28,
    lastUpdated: new Date().toISOString(),
  },
  'class-2': {
    classId: 'class-2',
    className: 'Data Structures and Algorithms',
    averagePercentage: 76.8,
    letterGrade: 'C+',
    trend: 'stable',
    studentCount: 32,
    lastUpdated: new Date().toISOString(),
  },
  'class-3': {
    classId: 'class-3',
    className: 'Web Development Fundamentals',
    averagePercentage: 91.2,
    letterGrade: 'A-',
    trend: 'improving',
    studentCount: 25,
    lastUpdated: new Date().toISOString(),
  },
};

// Mock Grade Distributions
export const mockGradeDistributions: Record<string, GradeDistribution> = {
  'class-1': {
    classId: 'class-1',
    className: 'Introduction to Computer Science',
    distribution: {
      A: 8, // 28.6%
      B: 12, // 42.9%
      C: 6, // 21.4%
      D: 2, // 7.1%
      F: 0, // 0%
    },
    total: 28,
    healthStatus: 'healthy',
    lastUpdated: new Date().toISOString(),
  },
  'class-2': {
    classId: 'class-2',
    className: 'Data Structures and Algorithms',
    distribution: {
      A: 5, // 15.6%
      B: 10, // 31.3%
      C: 12, // 37.5%
      D: 3, // 9.4%
      F: 2, // 6.3%
    },
    total: 32,
    healthStatus: 'moderate',
    lastUpdated: new Date().toISOString(),
  },
  'class-3': {
    classId: 'class-3',
    className: 'Web Development Fundamentals',
    distribution: {
      A: 15, // 60%
      B: 8, // 32%
      C: 2, // 8%
      D: 0, // 0%
      F: 0, // 0%
    },
    total: 25,
    healthStatus: 'healthy',
    lastUpdated: new Date().toISOString(),
  },
};

// Mock Submission Stats
export const mockSubmissionStats: Record<string, SubmissionStats> = {
  'class-1': {
    classId: 'class-1',
    className: 'Introduction to Computer Science',
    missing: {
      count: 12,
      percentage: 8.5,
      students: [
        { id: 's1', name: 'Alex Johnson', count: 3 },
        { id: 's2', name: 'Maria Garcia', count: 2 },
        { id: 's3', name: 'James Wilson', count: 2 },
        { id: 's4', name: 'Sarah Davis', count: 2 },
        { id: 's5', name: 'Michael Brown', count: 1 },
        { id: 's6', name: 'Emily Chen', count: 1 },
        { id: 's7', name: 'David Lee', count: 1 },
      ],
    },
    late: {
      count: 18,
      percentage: 12.7,
      students: [
        { id: 's8', name: 'Jessica Martinez', count: 4 },
        { id: 's9', name: 'Kevin Anderson', count: 3 },
        { id: 's10', name: 'Lisa Thompson', count: 3 },
        { id: 's11', name: 'Ryan Taylor', count: 2 },
        { id: 's12', name: 'Amanda White', count: 2 },
        { id: 's13', name: 'Chris Moore', count: 2 },
        { id: 's14', name: 'Nicole Harris', count: 1 },
        { id: 's15', name: 'Brandon Clark', count: 1 },
      ],
    },
    total: 140,
    trend: 'stable',
    lastUpdated: new Date().toISOString(),
  },
  'class-2': {
    classId: 'class-2',
    className: 'Data Structures and Algorithms',
    missing: {
      count: 24,
      percentage: 15.0,
      students: [
        { id: 's20', name: 'Tyler Robinson', count: 5 },
        { id: 's21', name: 'Ashley Walker', count: 4 },
        { id: 's22', name: 'Jordan Hall', count: 3 },
        { id: 's23', name: 'Taylor Allen', count: 3 },
        { id: 's24', name: 'Morgan Young', count: 2 },
        { id: 's25', name: 'Casey King', count: 2 },
        { id: 's26', name: 'Dakota Wright', count: 2 },
        { id: 's27', name: 'Riley Lopez', count: 2 },
        { id: 's28', name: 'Quinn Hill', count: 1 },
      ],
    },
    late: {
      count: 28,
      percentage: 17.5,
      students: [
        { id: 's30', name: 'Avery Scott', count: 5 },
        { id: 's31', name: 'Cameron Green', count: 4 },
        { id: 's32', name: 'Skyler Adams', count: 4 },
        { id: 's33', name: 'Peyton Baker', count: 3 },
        { id: 's34', name: 'Parker Nelson', count: 3 },
        { id: 's35', name: 'Drew Carter', count: 2 },
        { id: 's36', name: 'Reese Mitchell', count: 2 },
        { id: 's37', name: 'Logan Perez', count: 2 },
        { id: 's38', name: 'River Roberts', count: 2 },
        { id: 's39', name: 'Sage Turner', count: 1 },
      ],
    },
    total: 160,
    trend: 'declining',
    lastUpdated: new Date().toISOString(),
  },
  'class-3': {
    classId: 'class-3',
    className: 'Web Development Fundamentals',
    missing: {
      count: 5,
      percentage: 4.0,
      students: [
        { id: 's40', name: 'Phoenix Phillips', count: 2 },
        { id: 's41', name: 'Sage Campbell', count: 1 },
        { id: 's42', name: 'Jamie Parker', count: 1 },
        { id: 's43', name: 'Finley Evans', count: 1 },
      ],
    },
    late: {
      count: 8,
      percentage: 6.4,
      students: [
        { id: 's44', name: 'Rowan Edwards', count: 2 },
        { id: 's45', name: 'Charlie Collins', count: 2 },
        { id: 's46', name: 'Sawyer Stewart', count: 2 },
        { id: 's47', name: 'Blake Morris', count: 1 },
        { id: 's48', name: 'Hayden Rogers', count: 1 },
      ],
    },
    total: 125,
    trend: 'improving',
    lastUpdated: new Date().toISOString(),
  },
};

// Mock Participation Rates
export const mockParticipationRates: Record<string, ParticipationRate> = {
  'class-1': {
    classId: 'class-1',
    className: 'Introduction to Computer Science',
    byType: {
      homework: 91.5,
      quizzes: 95.2,
      projects: 88.7,
      exams: 98.5,
      discussions: 76.3,
      classPulses: 82.4,
      morningPulses: 79.6,
    },
    overall: 87.5,
    studentCount: 28,
    lastUpdated: new Date().toISOString(),
  },
  'class-2': {
    classId: 'class-2',
    className: 'Data Structures and Algorithms',
    byType: {
      homework: 82.8,
      quizzes: 87.5,
      projects: 75.0,
      exams: 93.8,
      discussions: 68.4,
      classPulses: 71.9,
      morningPulses: 65.6,
    },
    overall: 77.9,
    studentCount: 32,
    lastUpdated: new Date().toISOString(),
  },
  'class-3': {
    classId: 'class-3',
    className: 'Web Development Fundamentals',
    byType: {
      homework: 96.0,
      quizzes: 98.0,
      projects: 94.0,
      exams: 100.0,
      discussions: 84.0,
      classPulses: 88.0,
      morningPulses: 86.0,
    },
    overall: 92.3,
    studentCount: 25,
    lastUpdated: new Date().toISOString(),
  },
};

// Mock Mood-Performance Correlation Data
export const mockMoodPerformanceData: Record<string, MoodPerformanceData> = {
  'class-1': {
    classId: 'class-1',
    className: 'Introduction to Computer Science',
    correlation: 0.68,
    correlationStrength: 'moderate',
    scatterData: [
      { studentId: 's1', studentName: 'Alex Johnson', sentiment: 3.2, grade: 72.5 },
      { studentId: 's2', studentName: 'Maria Garcia', sentiment: 4.8, grade: 88.3 },
      { studentId: 's3', studentName: 'James Wilson', sentiment: 5.1, grade: 91.2 },
      { studentId: 's4', studentName: 'Sarah Davis', sentiment: 3.8, grade: 78.9 },
      { studentId: 's5', studentName: 'Michael Brown', sentiment: 4.5, grade: 85.7 },
      { studentId: 's6', studentName: 'Emily Chen', sentiment: 5.4, grade: 94.2 },
      { studentId: 's7', studentName: 'David Lee', sentiment: 4.2, grade: 82.1 },
      { studentId: 's8', studentName: 'Jessica Martinez', sentiment: 3.5, grade: 75.8 },
      { studentId: 's9', studentName: 'Kevin Anderson', sentiment: 4.9, grade: 89.5 },
      { studentId: 's10', studentName: 'Lisa Thompson', sentiment: 5.2, grade: 92.7 },
      { studentId: 's11', studentName: 'Ryan Taylor', sentiment: 4.0, grade: 80.3 },
      { studentId: 's12', studentName: 'Amanda White', sentiment: 4.7, grade: 87.6 },
      { studentId: 's13', studentName: 'Chris Moore', sentiment: 3.9, grade: 79.4 },
      { studentId: 's14', studentName: 'Nicole Harris', sentiment: 5.0, grade: 90.1 },
      { studentId: 's15', studentName: 'Brandon Clark', sentiment: 4.3, grade: 83.8 },
      { studentId: 's16', studentName: 'Samantha Lee', sentiment: 3.6, grade: 76.2 },
      { studentId: 's17', studentName: 'Daniel Kim', sentiment: 4.8, grade: 88.9 },
      { studentId: 's18', studentName: 'Olivia Martinez', sentiment: 5.3, grade: 93.4 },
      { studentId: 's19', studentName: 'Ethan Brown', sentiment: 4.1, grade: 81.5 },
      { studentId: 's20', studentName: 'Sophia Johnson', sentiment: 4.6, grade: 86.7 },
    ],
    regressionLine: {
      slope: 4.2,
      intercept: 67.8,
    },
    insights: [
      'Students with higher sentiment (Tier 5-6) average 8.4% higher grades than those with lower sentiment (Tier 1-2)',
      'Moderate positive correlation suggests mood has a noticeable impact on performance',
    ],
    timeframe: 'month',
    lastUpdated: new Date().toISOString(),
  },
  'class-2': {
    classId: 'class-2',
    className: 'Data Structures and Algorithms',
    correlation: 0.82,
    correlationStrength: 'strong',
    scatterData: [
      { studentId: 's20', studentName: 'Tyler Robinson', sentiment: 2.8, grade: 62.5 },
      { studentId: 's21', studentName: 'Ashley Walker', sentiment: 3.2, grade: 68.9 },
      { studentId: 's22', studentName: 'Jordan Hall', sentiment: 4.1, grade: 79.2 },
      { studentId: 's23', studentName: 'Taylor Allen', sentiment: 3.5, grade: 71.8 },
      { studentId: 's24', studentName: 'Morgan Young', sentiment: 4.8, grade: 87.3 },
      { studentId: 's25', studentName: 'Casey King', sentiment: 5.1, grade: 91.5 },
      { studentId: 's26', studentName: 'Dakota Wright', sentiment: 3.9, grade: 76.2 },
      { studentId: 's27', studentName: 'Riley Lopez', sentiment: 4.5, grade: 83.7 },
      { studentId: 's28', studentName: 'Quinn Hill', sentiment: 5.3, grade: 94.1 },
      { studentId: 's29', studentName: 'Avery Scott', sentiment: 4.2, grade: 80.5 },
      { studentId: 's30', studentName: 'Cameron Green', sentiment: 3.7, grade: 73.8 },
      { studentId: 's31', studentName: 'Skyler Adams', sentiment: 4.9, grade: 88.6 },
      { studentId: 's32', studentName: 'Peyton Baker', sentiment: 5.2, grade: 92.9 },
    ],
    regressionLine: {
      slope: 6.8,
      intercept: 54.2,
    },
    insights: [
      'Students with higher sentiment (Tier 5-6) average 13.6% higher grades than those with lower sentiment (Tier 1-2)',
      'Strong positive correlation suggests mood significantly impacts performance',
    ],
    timeframe: 'month',
    lastUpdated: new Date().toISOString(),
  },
  'class-3': {
    classId: 'class-3',
    className: 'Web Development Fundamentals',
    correlation: 0.54,
    correlationStrength: 'moderate',
    scatterData: [
      { studentId: 's40', studentName: 'Phoenix Phillips', sentiment: 4.2, grade: 89.3 },
      { studentId: 's41', studentName: 'Sage Campbell', sentiment: 5.1, grade: 95.7 },
      { studentId: 's42', studentName: 'Jamie Parker', sentiment: 4.8, grade: 92.1 },
      { studentId: 's43', studentName: 'Finley Evans', sentiment: 4.5, grade: 87.9 },
      { studentId: 's44', studentName: 'Rowan Edwards', sentiment: 5.3, grade: 96.8 },
      { studentId: 's45', studentName: 'Charlie Collins', sentiment: 4.9, grade: 93.5 },
      { studentId: 's46', studentName: 'Sawyer Stewart', sentiment: 4.7, grade: 91.2 },
      { studentId: 's47', studentName: 'Blake Morris', sentiment: 5.0, grade: 94.3 },
      { studentId: 's48', studentName: 'Hayden Rogers', sentiment: 4.6, grade: 90.1 },
      { studentId: 's49', studentName: 'Emerson Cruz', sentiment: 5.2, grade: 95.9 },
      { studentId: 's50', studentName: 'Kai Ramirez', sentiment: 4.3, grade: 88.7 },
    ],
    regressionLine: {
      slope: 3.5,
      intercept: 76.2,
    },
    insights: [
      'Students with higher sentiment (Tier 5-6) average 7.0% higher grades than those with lower sentiment (Tier 1-2)',
      'Moderate positive correlation observed between mood and performance',
    ],
    timeframe: 'month',
    lastUpdated: new Date().toISOString(),
  },
};

// Helper function to get all analytics for a class
export function getMockAnalyticsForClass(classId: string) {
  return {
    averageGrade: mockClassAverageGrades[classId] || null,
    distribution: mockGradeDistributions[classId] || null,
    submissions: mockSubmissionStats[classId] || null,
    participation: mockParticipationRates[classId] || null,
    moodCorrelation: mockMoodPerformanceData[classId] || null,
  };
}
