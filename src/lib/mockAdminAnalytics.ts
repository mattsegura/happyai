/**
 * Mock Admin Analytics Data
 *
 * Provides realistic mock data for admin-level analytics features when Canvas API is not available.
 * This follows the same pattern as VITE_USE_CANVAS_MOCK and VITE_USE_ANALYTICS_MOCK.
 *
 * Usage: Set VITE_USE_ADMIN_ANALYTICS_MOCK=true in .env to use this data
 *
 * Phase 1 Features Supported:
 * - Feature 1: Average Grade Across All Classes
 * - Feature 2: Grade Distribution Report
 * - Feature 4: Assignment Submission Rate
 * - Feature 5: Late/Missing Submissions %
 */

export interface DepartmentGradeStats {
  department: string;
  averageGrade: number;
  gradeDistribution: {
    'A': number;
    'A-': number;
    'B+': number;
    'B': number;
    'B-': number;
    'C+': number;
    'C': number;
    'C-': number;
    'D+': number;
    'D': number;
    'F': number;
  };
  totalStudents: number;
  medianGrade: string;
  standardDeviation: number;
}

export interface GradeLevelStats {
  gradeLevel: number;
  averageGrade: number;
  totalStudents: number;
  sentimentAverage: number;
}

export interface AssignmentStats {
  totalAssignments: number;
  submittedOnTime: number;
  submittedLate: number;
  missing: number;
  submissionRate: number;
  lateRate: number;
  missingRate: number;
}

export interface DepartmentAssignmentStats extends AssignmentStats {
  department: string;
}

// =====================================================
// MOCK DATA: GRADE STATISTICS
// =====================================================

export const mockDepartmentGrades: DepartmentGradeStats[] = [
  {
    department: 'mathematics',
    averageGrade: 82.5,
    gradeDistribution: {
      'A': 18,
      'A-': 15,
      'B+': 22,
      'B': 20,
      'B-': 12,
      'C+': 8,
      'C': 3,
      'C-': 1,
      'D+': 1,
      'D': 0,
      'F': 0,
    },
    totalStudents: 100,
    medianGrade: 'B+',
    standardDeviation: 8.2,
  },
  {
    department: 'science',
    averageGrade: 84.1,
    gradeDistribution: {
      'A': 22,
      'A-': 18,
      'B+': 20,
      'B': 18,
      'B-': 10,
      'C+': 7,
      'C': 3,
      'C-': 2,
      'D+': 0,
      'D': 0,
      'F': 0,
    },
    totalStudents: 100,
    medianGrade: 'B+',
    standardDeviation: 7.8,
  },
  {
    department: 'english',
    averageGrade: 86.3,
    gradeDistribution: {
      'A': 25,
      'A-': 22,
      'B+': 18,
      'B': 15,
      'B-': 10,
      'C+': 6,
      'C': 3,
      'C-': 1,
      'D+': 0,
      'D': 0,
      'F': 0,
    },
    totalStudents: 100,
    medianGrade: 'A-',
    standardDeviation: 7.5,
  },
  {
    department: 'history',
    averageGrade: 83.7,
    gradeDistribution: {
      'A': 20,
      'A-': 17,
      'B+': 21,
      'B': 19,
      'B-': 11,
      'C+': 7,
      'C': 3,
      'C-': 2,
      'D+': 0,
      'D': 0,
      'F': 0,
    },
    totalStudents: 100,
    medianGrade: 'B+',
    standardDeviation: 7.9,
  },
  {
    department: 'arts',
    averageGrade: 89.2,
    gradeDistribution: {
      'A': 35,
      'A-': 25,
      'B+': 20,
      'B': 12,
      'B-': 5,
      'C+': 2,
      'C': 1,
      'C-': 0,
      'D+': 0,
      'D': 0,
      'F': 0,
    },
    totalStudents: 100,
    medianGrade: 'A',
    standardDeviation: 6.5,
  },
  {
    department: 'physical_education',
    averageGrade: 91.5,
    gradeDistribution: {
      'A': 45,
      'A-': 30,
      'B+': 15,
      'B': 7,
      'B-': 2,
      'C+': 1,
      'C': 0,
      'C-': 0,
      'D+': 0,
      'D': 0,
      'F': 0,
    },
    totalStudents: 100,
    medianGrade: 'A',
    standardDeviation: 5.8,
  },
  {
    department: 'technology',
    averageGrade: 85.8,
    gradeDistribution: {
      'A': 28,
      'A-': 20,
      'B+': 18,
      'B': 16,
      'B-': 9,
      'C+': 5,
      'C': 3,
      'C-': 1,
      'D+': 0,
      'D': 0,
      'F': 0,
    },
    totalStudents: 100,
    medianGrade: 'A-',
    standardDeviation: 7.2,
  },
  {
    department: 'languages',
    averageGrade: 84.9,
    gradeDistribution: {
      'A': 24,
      'A-': 19,
      'B+': 19,
      'B': 17,
      'B-': 10,
      'C+': 6,
      'C': 3,
      'C-': 2,
      'D+': 0,
      'D': 0,
      'F': 0,
    },
    totalStudents: 100,
    medianGrade: 'B+',
    standardDeviation: 7.6,
  },
];

export const mockGradeLevelStats: GradeLevelStats[] = [
  {
    gradeLevel: 9,
    averageGrade: 85.2,
    totalStudents: 250,
    sentimentAverage: 4.3,
  },
  {
    gradeLevel: 10,
    averageGrade: 84.8,
    totalStudents: 245,
    sentimentAverage: 4.1,
  },
  {
    gradeLevel: 11,
    averageGrade: 83.5,
    totalStudents: 240,
    sentimentAverage: 3.7,
  },
  {
    gradeLevel: 12,
    averageGrade: 86.1,
    totalStudents: 235,
    sentimentAverage: 4.5,
  },
];

// =====================================================
// MOCK DATA: ASSIGNMENT SUBMISSION STATISTICS
// =====================================================

export const mockOverallSubmissionStats: AssignmentStats = {
  totalAssignments: 8456,
  submittedOnTime: 7234,
  submittedLate: 892,
  missing: 330,
  submissionRate: 85.5, // (7234 / 8456) * 100
  lateRate: 10.6, // (892 / 8456) * 100
  missingRate: 3.9, // (330 / 8456) * 100
};

export const mockDepartmentSubmissionStats: DepartmentAssignmentStats[] = [
  {
    department: 'mathematics',
    totalAssignments: 1200,
    submittedOnTime: 980,
    submittedLate: 165,
    missing: 55,
    submissionRate: 81.7,
    lateRate: 13.8,
    missingRate: 4.6,
  },
  {
    department: 'science',
    totalAssignments: 1100,
    submittedOnTime: 920,
    submittedLate: 130,
    missing: 50,
    submissionRate: 83.6,
    lateRate: 11.8,
    missingRate: 4.5,
  },
  {
    department: 'english',
    totalAssignments: 1300,
    submittedOnTime: 1150,
    submittedLate: 115,
    missing: 35,
    submissionRate: 88.5,
    lateRate: 8.8,
    missingRate: 2.7,
  },
  {
    department: 'history',
    totalAssignments: 1050,
    submittedOnTime: 890,
    submittedLate: 120,
    missing: 40,
    submissionRate: 84.8,
    lateRate: 11.4,
    missingRate: 3.8,
  },
  {
    department: 'arts',
    totalAssignments: 950,
    submittedOnTime: 860,
    submittedLate: 70,
    missing: 20,
    submissionRate: 90.5,
    lateRate: 7.4,
    missingRate: 2.1,
  },
  {
    department: 'physical_education',
    totalAssignments: 650,
    submittedOnTime: 610,
    submittedLate: 30,
    missing: 10,
    submissionRate: 93.8,
    lateRate: 4.6,
    missingRate: 1.5,
  },
  {
    department: 'technology',
    totalAssignments: 1056,
    submittedOnTime: 894,
    submittedLate: 122,
    missing: 40,
    submissionRate: 84.7,
    lateRate: 11.6,
    missingRate: 3.8,
  },
  {
    department: 'languages',
    totalAssignments: 1150,
    submittedOnTime: 930,
    submittedLate: 140,
    missing: 80,
    submissionRate: 80.9,
    lateRate: 12.2,
    missingRate: 7.0,
  },
];

// =====================================================
// MOCK DATA: HISTORICAL TRENDS
// =====================================================

export const mockGradeTrends = {
  current: 84.9,
  previous: 83.2,
  changePercent: 2.0,
  trend: 'up' as const,
};

export const mockSubmissionRateTrends = [
  { week: 'Week 1', rate: 88.2 },
  { week: 'Week 2', rate: 87.5 },
  { week: 'Week 3', rate: 86.8 },
  { week: 'Week 4', rate: 85.9 },
  { week: 'Week 5', rate: 85.5 },
  { week: 'Week 6', rate: 84.8 },
  { week: 'Week 7', rate: 83.2 },
  { week: 'Week 8', rate: 85.5 }, // Current week
];

// =====================================================
// MOCK DATA: SENTIMENT BY GRADE LEVEL/DEPARTMENT
// =====================================================

export const mockDepartmentSentiment = [
  { department: 'mathematics', avgSentiment: 3.8, totalCheckIns: 850 },
  { department: 'science', avgSentiment: 4.1, totalCheckIns: 820 },
  { department: 'english', avgSentiment: 4.3, totalCheckIns: 890 },
  { department: 'history', avgSentiment: 4.0, totalCheckIns: 780 },
  { department: 'arts', avgSentiment: 4.8, totalCheckIns: 720 },
  { department: 'physical_education', avgSentiment: 4.9, totalCheckIns: 650 },
  { department: 'technology', avgSentiment: 4.2, totalCheckIns: 740 },
  { department: 'languages', avgSentiment: 4.1, totalCheckIns: 710 },
];

export const mockGradeLevelSentiment = [
  { gradeLevel: 9, avgSentiment: 4.3, label: '9th Grade' },
  { gradeLevel: 10, avgSentiment: 4.1, label: '10th Grade' },
  { gradeLevel: 11, avgSentiment: 3.7, label: '11th Grade' },
  { gradeLevel: 12, avgSentiment: 4.5, label: '12th Grade' },
];

// =====================================================
// MOCK DATA: POSITIVE/NEGATIVE RATIO
// =====================================================

export const mockSentimentRatio = {
  positive: 756, // Tier 4-6
  negative: 234, // Tier 1-3
  ratio: 3.23,
  ratioLabel: '3.23:1',
  isHealthy: true, // >= 3:1
};

export const mockDepartmentSentimentRatio = [
  { department: 'mathematics', positive: 680, negative: 170, ratio: 4.0 },
  { department: 'science', positive: 695, negative: 125, ratio: 5.56 },
  { department: 'english', positive: 760, negative: 130, ratio: 5.85 },
  { department: 'history', positive: 650, negative: 130, ratio: 5.0 },
  { department: 'arts', positive: 690, negative: 30, ratio: 23.0 },
  { department: 'physical_education', positive: 630, negative: 20, ratio: 31.5 },
  { department: 'technology', positive: 640, negative: 100, ratio: 6.4 },
  { department: 'languages', positive: 610, negative: 100, ratio: 6.1 },
];

// =====================================================
// MOCK DATA: EMOTIONAL STABILITY (STANDARD DEVIATION)
// =====================================================

export interface EmotionalStabilityData {
  className: string;
  department: string;
  teacher: string;
  stabilitySD: number;
  stabilityLabel: 'Very Stable' | 'Stable' | 'Moderate' | 'Volatile' | 'Very Volatile';
  avgSentiment: number;
  studentCount: number;
}

export const mockEmotionalStability: EmotionalStabilityData[] = [
  {
    className: 'Algebra II - Period 1',
    department: 'mathematics',
    teacher: 'Ms. Johnson',
    stabilitySD: 0.3,
    stabilityLabel: 'Very Stable',
    avgSentiment: 4.2,
    studentCount: 28,
  },
  {
    className: 'Chemistry - Period 3',
    department: 'science',
    teacher: 'Mr. Chen',
    stabilitySD: 0.6,
    stabilityLabel: 'Stable',
    avgSentiment: 4.1,
    studentCount: 26,
  },
  {
    className: 'AP English - Period 2',
    department: 'english',
    teacher: 'Dr. Williams',
    stabilitySD: 1.2,
    stabilityLabel: 'Moderate',
    avgSentiment: 3.8,
    studentCount: 24,
  },
  {
    className: 'US History - Period 4',
    department: 'history',
    teacher: 'Mr. Davis',
    stabilitySD: 1.5,
    stabilityLabel: 'Volatile',
    avgSentiment: 3.5,
    studentCount: 30,
  },
  {
    className: 'AP Calculus - Period 5',
    department: 'mathematics',
    teacher: 'Ms. Rodriguez',
    stabilitySD: 1.8,
    stabilityLabel: 'Very Volatile',
    avgSentiment: 3.2,
    studentCount: 22,
  },
  {
    className: 'Art History - Period 1',
    department: 'arts',
    teacher: 'Ms. Taylor',
    stabilitySD: 0.2,
    stabilityLabel: 'Very Stable',
    avgSentiment: 4.9,
    studentCount: 20,
  },
  {
    className: 'Spanish III - Period 3',
    department: 'languages',
    teacher: 'Señora Martinez',
    stabilitySD: 0.7,
    stabilityLabel: 'Stable',
    avgSentiment: 4.3,
    studentCount: 25,
  },
  {
    className: 'Computer Science - Period 2',
    department: 'technology',
    teacher: 'Mr. Patel',
    stabilitySD: 0.9,
    stabilityLabel: 'Moderate',
    avgSentiment: 4.0,
    studentCount: 27,
  },
];

// Helper function to get stability label from SD value
export function getStabilityLabel(sd: number): EmotionalStabilityData['stabilityLabel'] {
  if (sd < 0.5) return 'Very Stable';
  if (sd < 1.0) return 'Stable';
  if (sd < 1.5) return 'Moderate';
  if (sd < 2.0) return 'Volatile';
  return 'Very Volatile';
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Check if mock mode is enabled
export function isAdminAnalyticsMockEnabled(): boolean {
  return import.meta.env.VITE_USE_ADMIN_ANALYTICS_MOCK === 'true';
}

// Get filtered grade data
export function getMockGradesByDepartment(department?: string): DepartmentGradeStats[] {
  if (!department) return mockDepartmentGrades;
  return mockDepartmentGrades.filter(d => d.department === department);
}

// Get filtered submission stats
export function getMockSubmissionStatsByDepartment(department?: string): DepartmentAssignmentStats[] {
  if (!department) return mockDepartmentSubmissionStats;
  return mockDepartmentSubmissionStats.filter(d => d.department === department);
}

// Calculate institution-wide average grade
export function getMockInstitutionAverageGrade(): number {
  const totalGradePoints = mockDepartmentGrades.reduce(
    (sum, dept) => sum + (dept.averageGrade * dept.totalStudents),
    0
  );
  const totalStudents = mockDepartmentGrades.reduce(
    (sum, dept) => sum + dept.totalStudents,
    0
  );
  return parseFloat((totalGradePoints / totalStudents).toFixed(1));
}
