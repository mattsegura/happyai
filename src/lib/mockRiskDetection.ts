/**
 * Mock Risk Detection Data
 *
 * Provides realistic mock data for risk detection and early warning features when Canvas/AI APIs are not available.
 * This follows the same pattern as VITE_USE_ADMIN_ANALYTICS_MOCK and VITE_USE_ENGAGEMENT_MOCK.
 *
 * Usage: Set VITE_USE_RISK_DETECTION_MOCK=true in .env to use this data
 *
 * Phase 3 Features Supported:
 * - Feature 10: Cross-Risk Index (academic + emotional risk)
 * - Feature 23: Early Warning Index (school-wide risk score)
 * - Feature 41: Academically Disengaged Students
 * - Feature 15: Consistent Low Mood % (enhancement)
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface StudentRiskAssessment {
  studentId: string;
  studentName: string;
  email: string;
  gradeLevel: number;
  department: string;

  // Academic risk factors
  currentGrade: number;
  missingAssignments: number;
  gradeTrend: number; // -2 to +2 (letter grades)
  academicRiskScore: number; // 0-100

  // Emotional risk factors
  lowSentimentDays: number; // last 7 days in Tier 1-2
  avgSentiment: number; // 1-6 scale
  moodVariability: number; // standard deviation
  emotionalRiskScore: number; // 0-100

  // Cross-risk flag
  crossRiskFlag: boolean;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';

  // Interventions
  hasIntervention: boolean;
  lastInterventionDate?: string;
}

export interface RiskHeatMapData {
  department: string;
  gradeLevel: number;
  crossRiskCount: number;
  totalStudents: number;
  crossRiskPercentage: number;
}

export interface EarlyWarningIndex {
  overallScore: number; // 0-100
  riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  trend: 'increasing' | 'stable' | 'decreasing';

  // Component scores
  emotionallyFlaggedPercent: number; // weight: 30%
  academicallyFlaggedPercent: number; // weight: 30%
  crossRiskPercent: number; // weight: 20%
  avgSentimentTrend: number; // weight: 10%, -1 to +1
  avgGradeTrend: number; // weight: 10%, -1 to +1

  // Department breakdown
  departmentContribution: {
    department: string;
    contributionScore: number;
    studentCount: number;
  }[];

  // Historical trend
  weeklyTrend: {
    week: string;
    score: number;
  }[];
}

export interface DisengagedStudent {
  studentId: string;
  studentName: string;
  email: string;
  gradeLevel: number;
  department: string;
  disengagementScore: number; // 0-100

  // Disengagement indicators
  loginsPerWeek: number; // <2 is concerning
  consecutiveMissedDeadlines: number;
  discussionParticipation: number; // 0-100%
  gradeTrendChange: number; // letter grades

  // Reasons
  reasons: string[];

  // Intervention
  hasOutreach: boolean;
  engagementImproved: boolean;
}

export interface ConsistentLowMoodStudent {
  studentId: string;
  studentName: string;
  email: string;
  gradeLevel: number;
  department: string;

  // Mood tracking
  consecutiveLowDays: number; // days in Tier 1-2
  last7DaysLowCount: number; // out of 7
  avgSentiment: number;
  currentEmotion: string;

  // Intervention
  hasCounselingReferral: boolean;
  interventionType?: string;
  interventionDate?: string;
  interventionOutcome?: string;
}

// =====================================================
// MOCK DATA: STUDENT RISK ASSESSMENTS (Feature 10)
// =====================================================

export const mockStudentRiskAssessments: StudentRiskAssessment[] = [
  // Critical Risk Students (Both academic AND emotional)
  {
    studentId: 's001',
    studentName: 'Alex Morgan',
    email: 'alex.morgan@school.edu',
    gradeLevel: 11,
    department: 'mathematics',
    currentGrade: 65,
    missingAssignments: 5,
    gradeTrend: -1.5,
    academicRiskScore: 85,
    lowSentimentDays: 6,
    avgSentiment: 2.1,
    moodVariability: 1.8,
    emotionalRiskScore: 90,
    crossRiskFlag: true,
    riskLevel: 'Critical',
    hasIntervention: true,
    lastInterventionDate: '2025-02-05',
  },
  {
    studentId: 's002',
    studentName: 'Jordan Lee',
    email: 'jordan.lee@school.edu',
    gradeLevel: 10,
    department: 'science',
    currentGrade: 68,
    missingAssignments: 4,
    gradeTrend: -1.0,
    academicRiskScore: 75,
    lowSentimentDays: 5,
    avgSentiment: 2.3,
    moodVariability: 1.6,
    emotionalRiskScore: 80,
    crossRiskFlag: true,
    riskLevel: 'Critical',
    hasIntervention: true,
    lastInterventionDate: '2025-02-06',
  },

  // High Risk Students
  {
    studentId: 's003',
    studentName: 'Casey White',
    email: 'casey.white@school.edu',
    gradeLevel: 12,
    department: 'history',
    currentGrade: 72,
    missingAssignments: 3,
    gradeTrend: -0.5,
    academicRiskScore: 60,
    lowSentimentDays: 4,
    avgSentiment: 2.5,
    moodVariability: 1.4,
    emotionalRiskScore: 65,
    crossRiskFlag: true,
    riskLevel: 'High',
    hasIntervention: false,
  },
  {
    studentId: 's004',
    studentName: 'Taylor Kim',
    email: 'taylor.kim@school.edu',
    gradeLevel: 11,
    department: 'english',
    currentGrade: 75,
    missingAssignments: 2,
    gradeTrend: -1.0,
    academicRiskScore: 55,
    lowSentimentDays: 5,
    avgSentiment: 2.2,
    moodVariability: 1.5,
    emotionalRiskScore: 75,
    crossRiskFlag: true,
    riskLevel: 'High',
    hasIntervention: false,
  },
  {
    studentId: 's005',
    studentName: 'Riley Patel',
    email: 'riley.patel@school.edu',
    gradeLevel: 9,
    department: 'mathematics',
    currentGrade: 69,
    missingAssignments: 4,
    gradeTrend: -1.2,
    academicRiskScore: 80,
    lowSentimentDays: 3,
    avgSentiment: 2.8,
    moodVariability: 1.3,
    emotionalRiskScore: 55,
    crossRiskFlag: true,
    riskLevel: 'High',
    hasIntervention: true,
    lastInterventionDate: '2025-02-04',
  },

  // Medium Risk Students (One flag, at risk of second)
  {
    studentId: 's006',
    studentName: 'Sam Chen',
    email: 'sam.chen@school.edu',
    gradeLevel: 10,
    department: 'technology',
    currentGrade: 78,
    missingAssignments: 2,
    gradeTrend: -0.5,
    academicRiskScore: 40,
    lowSentimentDays: 2,
    avgSentiment: 3.2,
    moodVariability: 1.1,
    emotionalRiskScore: 40,
    crossRiskFlag: false,
    riskLevel: 'Medium',
    hasIntervention: false,
  },
  {
    studentId: 's007',
    studentName: 'Morgan Davis',
    email: 'morgan.davis@school.edu',
    gradeLevel: 11,
    department: 'science',
    currentGrade: 68,
    missingAssignments: 4,
    gradeTrend: -0.8,
    academicRiskScore: 70,
    lowSentimentDays: 1,
    avgSentiment: 3.8,
    moodVariability: 0.8,
    emotionalRiskScore: 25,
    crossRiskFlag: false,
    riskLevel: 'Medium',
    hasIntervention: false,
  },
  {
    studentId: 's008',
    studentName: 'Avery Johnson',
    email: 'avery.johnson@school.edu',
    gradeLevel: 12,
    department: 'arts',
    currentGrade: 85,
    missingAssignments: 0,
    gradeTrend: 0.0,
    academicRiskScore: 10,
    lowSentimentDays: 5,
    avgSentiment: 2.4,
    moodVariability: 1.6,
    emotionalRiskScore: 75,
    crossRiskFlag: false,
    riskLevel: 'Medium',
    hasIntervention: false,
  },

  // Low Risk Students (healthy)
  {
    studentId: 's009',
    studentName: 'Cameron Brown',
    email: 'cameron.brown@school.edu',
    gradeLevel: 10,
    department: 'english',
    currentGrade: 88,
    missingAssignments: 0,
    gradeTrend: 0.5,
    academicRiskScore: 5,
    lowSentimentDays: 0,
    avgSentiment: 4.5,
    moodVariability: 0.6,
    emotionalRiskScore: 10,
    crossRiskFlag: false,
    riskLevel: 'Low',
    hasIntervention: false,
  },
  {
    studentId: 's010',
    studentName: 'Quinn Martinez',
    email: 'quinn.martinez@school.edu',
    gradeLevel: 9,
    department: 'languages',
    currentGrade: 92,
    missingAssignments: 0,
    gradeTrend: 1.0,
    academicRiskScore: 2,
    lowSentimentDays: 0,
    avgSentiment: 5.2,
    moodVariability: 0.5,
    emotionalRiskScore: 5,
    crossRiskFlag: false,
    riskLevel: 'Low',
    hasIntervention: false,
  },
];

// =====================================================
// MOCK DATA: RISK HEAT MAP (Feature 10)
// =====================================================

export const mockRiskHeatMap: RiskHeatMapData[] = [
  // Mathematics
  { department: 'mathematics', gradeLevel: 9, crossRiskCount: 8, totalStudents: 62, crossRiskPercentage: 12.9 },
  { department: 'mathematics', gradeLevel: 10, crossRiskCount: 6, totalStudents: 58, crossRiskPercentage: 10.3 },
  { department: 'mathematics', gradeLevel: 11, crossRiskCount: 12, totalStudents: 55, crossRiskPercentage: 21.8 },
  { department: 'mathematics', gradeLevel: 12, crossRiskCount: 4, totalStudents: 50, crossRiskPercentage: 8.0 },

  // Science
  { department: 'science', gradeLevel: 9, crossRiskCount: 5, totalStudents: 60, crossRiskPercentage: 8.3 },
  { department: 'science', gradeLevel: 10, crossRiskCount: 7, totalStudents: 62, crossRiskPercentage: 11.3 },
  { department: 'science', gradeLevel: 11, crossRiskCount: 9, totalStudents: 58, crossRiskPercentage: 15.5 },
  { department: 'science', gradeLevel: 12, crossRiskCount: 3, totalStudents: 52, crossRiskPercentage: 5.8 },

  // English
  { department: 'english', gradeLevel: 9, crossRiskCount: 3, totalStudents: 65, crossRiskPercentage: 4.6 },
  { department: 'english', gradeLevel: 10, crossRiskCount: 4, totalStudents: 63, crossRiskPercentage: 6.3 },
  { department: 'english', gradeLevel: 11, crossRiskCount: 5, totalStudents: 60, crossRiskPercentage: 8.3 },
  { department: 'english', gradeLevel: 12, crossRiskCount: 2, totalStudents: 58, crossRiskPercentage: 3.4 },

  // History
  { department: 'history', gradeLevel: 9, crossRiskCount: 6, totalStudents: 58, crossRiskPercentage: 10.3 },
  { department: 'history', gradeLevel: 10, crossRiskCount: 8, totalStudents: 60, crossRiskPercentage: 13.3 },
  { department: 'history', gradeLevel: 11, crossRiskCount: 10, totalStudents: 57, crossRiskPercentage: 17.5 },
  { department: 'history', gradeLevel: 12, crossRiskCount: 5, totalStudents: 55, crossRiskPercentage: 9.1 },

  // Arts
  { department: 'arts', gradeLevel: 9, crossRiskCount: 1, totalStudents: 45, crossRiskPercentage: 2.2 },
  { department: 'arts', gradeLevel: 10, crossRiskCount: 2, totalStudents: 42, crossRiskPercentage: 4.8 },
  { department: 'arts', gradeLevel: 11, crossRiskCount: 1, totalStudents: 40, crossRiskPercentage: 2.5 },
  { department: 'arts', gradeLevel: 12, crossRiskCount: 0, totalStudents: 38, crossRiskPercentage: 0.0 },

  // Physical Education
  { department: 'physical_education', gradeLevel: 9, crossRiskCount: 0, totalStudents: 70, crossRiskPercentage: 0.0 },
  { department: 'physical_education', gradeLevel: 10, crossRiskCount: 1, totalStudents: 68, crossRiskPercentage: 1.5 },
  { department: 'physical_education', gradeLevel: 11, crossRiskCount: 1, totalStudents: 65, crossRiskPercentage: 1.5 },
  { department: 'physical_education', gradeLevel: 12, crossRiskCount: 0, totalStudents: 62, crossRiskPercentage: 0.0 },

  // Technology
  { department: 'technology', gradeLevel: 9, crossRiskCount: 4, totalStudents: 52, crossRiskPercentage: 7.7 },
  { department: 'technology', gradeLevel: 10, crossRiskCount: 5, totalStudents: 55, crossRiskPercentage: 9.1 },
  { department: 'technology', gradeLevel: 11, crossRiskCount: 6, totalStudents: 53, crossRiskPercentage: 11.3 },
  { department: 'technology', gradeLevel: 12, crossRiskCount: 3, totalStudents: 48, crossRiskPercentage: 6.3 },

  // Languages
  { department: 'languages', gradeLevel: 9, crossRiskCount: 5, totalStudents: 55, crossRiskPercentage: 9.1 },
  { department: 'languages', gradeLevel: 10, crossRiskCount: 6, totalStudents: 58, crossRiskPercentage: 10.3 },
  { department: 'languages', gradeLevel: 11, crossRiskCount: 7, totalStudents: 56, crossRiskPercentage: 12.5 },
  { department: 'languages', gradeLevel: 12, crossRiskCount: 4, totalStudents: 52, crossRiskPercentage: 7.7 },
];

// =====================================================
// MOCK DATA: EARLY WARNING INDEX (Feature 23)
// =====================================================

export const mockEarlyWarningIndex: EarlyWarningIndex = {
  overallScore: 42, // 0-100 (0-25 low, 26-50 moderate, 51-75 high, 76-100 critical)
  riskLevel: 'Moderate',
  trend: 'stable',

  // Component scores
  emotionallyFlaggedPercent: 18.5, // 30% weight
  academicallyFlaggedPercent: 22.3, // 30% weight
  crossRiskPercent: 8.7, // 20% weight
  avgSentimentTrend: -0.2, // 10% weight, -1 to +1
  avgGradeTrend: -0.1, // 10% weight, -1 to +1

  // Department contribution (which departments contribute most to risk?)
  departmentContribution: [
    { department: 'mathematics', contributionScore: 58, studentCount: 30 },
    { department: 'history', contributionScore: 52, studentCount: 29 },
    { department: 'science', contributionScore: 45, studentCount: 24 },
    { department: 'languages', contributionScore: 42, studentCount: 22 },
    { department: 'technology', contributionScore: 38, studentCount: 18 },
    { department: 'english', contributionScore: 28, studentCount: 14 },
    { department: 'arts', contributionScore: 15, studentCount: 4 },
    { department: 'physical_education', contributionScore: 8, studentCount: 2 },
  ],

  // Historical trend
  weeklyTrend: [
    { week: 'Week 1', score: 38 },
    { week: 'Week 2', score: 40 },
    { week: 'Week 3', score: 41 },
    { week: 'Week 4', score: 43 },
    { week: 'Week 5', score: 44 },
    { week: 'Week 6', score: 42 },
    { week: 'Week 7', score: 41 },
    { week: 'Week 8', score: 42 },
  ],
};

// =====================================================
// MOCK DATA: DISENGAGED STUDENTS (Feature 41)
// =====================================================

export const mockDisengagedStudents: DisengagedStudent[] = [
  {
    studentId: 's001',
    studentName: 'Alex Morgan',
    email: 'alex.morgan@school.edu',
    gradeLevel: 11,
    department: 'mathematics',
    disengagementScore: 85,
    loginsPerWeek: 0.5,
    consecutiveMissedDeadlines: 5,
    discussionParticipation: 0,
    gradeTrendChange: -1.5,
    reasons: ['Low login frequency', 'Missed assignments', 'No discussion activity', 'Grade decline'],
    hasOutreach: true,
    engagementImproved: false,
  },
  {
    studentId: 's002',
    studentName: 'Jordan Lee',
    email: 'jordan.lee@school.edu',
    gradeLevel: 10,
    department: 'science',
    disengagementScore: 75,
    loginsPerWeek: 1.0,
    consecutiveMissedDeadlines: 4,
    discussionParticipation: 5,
    gradeTrendChange: -1.0,
    reasons: ['Low login frequency', 'Missed assignments', 'Grade decline'],
    hasOutreach: true,
    engagementImproved: true,
  },
  {
    studentId: 's003',
    studentName: 'Casey White',
    email: 'casey.white@school.edu',
    gradeLevel: 12,
    department: 'history',
    disengagementScore: 70,
    loginsPerWeek: 1.5,
    consecutiveMissedDeadlines: 3,
    discussionParticipation: 10,
    gradeTrendChange: -0.5,
    reasons: ['Low login frequency', 'Missed assignments'],
    hasOutreach: false,
    engagementImproved: false,
  },
  {
    studentId: 's007',
    studentName: 'Morgan Davis',
    email: 'morgan.davis@school.edu',
    gradeLevel: 11,
    department: 'science',
    disengagementScore: 65,
    loginsPerWeek: 1.2,
    consecutiveMissedDeadlines: 4,
    discussionParticipation: 8,
    gradeTrendChange: -0.8,
    reasons: ['Missed assignments', 'Grade decline'],
    hasOutreach: false,
    engagementImproved: false,
  },
  {
    studentId: 's005',
    studentName: 'Riley Patel',
    email: 'riley.patel@school.edu',
    gradeLevel: 9,
    department: 'mathematics',
    disengagementScore: 60,
    loginsPerWeek: 1.8,
    consecutiveMissedDeadlines: 4,
    discussionParticipation: 12,
    gradeTrendChange: -1.2,
    reasons: ['Missed assignments', 'Grade decline'],
    hasOutreach: true,
    engagementImproved: false,
  },
];

// =====================================================
// MOCK DATA: CONSISTENT LOW MOOD (Feature 15)
// =====================================================

export const mockConsistentLowMoodStudents: ConsistentLowMoodStudent[] = [
  {
    studentId: 's001',
    studentName: 'Alex Morgan',
    email: 'alex.morgan@school.edu',
    gradeLevel: 11,
    department: 'mathematics',
    consecutiveLowDays: 6,
    last7DaysLowCount: 6,
    avgSentiment: 2.1,
    currentEmotion: 'Sad',
    hasCounselingReferral: true,
    interventionType: 'Individual Counseling',
    interventionDate: '2025-02-05',
    interventionOutcome: 'Ongoing',
  },
  {
    studentId: 's002',
    studentName: 'Jordan Lee',
    email: 'jordan.lee@school.edu',
    gradeLevel: 10,
    department: 'science',
    consecutiveLowDays: 5,
    last7DaysLowCount: 5,
    avgSentiment: 2.3,
    currentEmotion: 'Worried',
    hasCounselingReferral: true,
    interventionType: 'Parent Contact',
    interventionDate: '2025-02-06',
    interventionOutcome: 'In Progress',
  },
  {
    studentId: 's004',
    studentName: 'Taylor Kim',
    email: 'taylor.kim@school.edu',
    gradeLevel: 11,
    department: 'english',
    consecutiveLowDays: 5,
    last7DaysLowCount: 5,
    avgSentiment: 2.2,
    currentEmotion: 'Frustrated',
    hasCounselingReferral: false,
  },
  {
    studentId: 's008',
    studentName: 'Avery Johnson',
    email: 'avery.johnson@school.edu',
    gradeLevel: 12,
    department: 'arts',
    consecutiveLowDays: 5,
    last7DaysLowCount: 5,
    avgSentiment: 2.4,
    currentEmotion: 'Nervous',
    hasCounselingReferral: false,
  },
];

// =====================================================
// SUMMARY STATISTICS
// =====================================================

export const mockRiskSummary = {
  totalStudents: 970,
  criticalRiskCount: 2,
  highRiskCount: 3,
  mediumRiskCount: 3,
  crossRiskPercentage: 8.7,
  emotionallyFlaggedCount: 179,
  academicallyFlaggedCount: 216,
  disengagedStudentCount: 87,
  consistentLowMoodCount: 42,
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Check if risk detection mock mode is enabled
export function isRiskDetectionMockEnabled(): boolean {
  return import.meta.env.VITE_USE_RISK_DETECTION_MOCK === 'true';
}

// Get students by risk level
export function getStudentsByRiskLevel(level: StudentRiskAssessment['riskLevel']): StudentRiskAssessment[] {
  return mockStudentRiskAssessments.filter(s => s.riskLevel === level);
}

// Get cross-risk students
export function getCrossRiskStudents(): StudentRiskAssessment[] {
  return mockStudentRiskAssessments.filter(s => s.crossRiskFlag);
}

// Get heat map data for specific department
export function getHeatMapByDepartment(department?: string): RiskHeatMapData[] {
  if (!department) return mockRiskHeatMap;
  return mockRiskHeatMap.filter(h => h.department === department);
}

// Get disengaged students sorted by score
export function getDisengagedStudentsSorted(): DisengagedStudent[] {
  return [...mockDisengagedStudents].sort((a, b) => b.disengagementScore - a.disengagementScore);
}

// Get consistent low mood students sorted by consecutive days
export function getLowMoodStudentsSorted(): ConsistentLowMoodStudent[] {
  return [...mockConsistentLowMoodStudents].sort((a, b) => b.consecutiveLowDays - a.consecutiveLowDays);
}

// Calculate risk level from score
export function getRiskLevelFromScore(score: number): EarlyWarningIndex['riskLevel'] {
  if (score >= 76) return 'Critical';
  if (score >= 51) return 'High';
  if (score >= 26) return 'Moderate';
  return 'Low';
}

// Get risk level color
export function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'Critical': return 'text-red-600 dark:text-red-400';
    case 'High': return 'text-orange-600 dark:text-orange-400';
    case 'Medium':
    case 'Moderate': return 'text-yellow-600 dark:text-yellow-400';
    case 'Low': return 'text-green-600 dark:text-green-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
}

// Get risk level background color
export function getRiskLevelBgColor(level: string): string {
  switch (level) {
    case 'Critical': return 'bg-red-100 dark:bg-red-900/20';
    case 'High': return 'bg-orange-100 dark:bg-orange-900/20';
    case 'Medium':
    case 'Moderate': return 'bg-yellow-100 dark:bg-yellow-900/20';
    case 'Low': return 'bg-green-100 dark:bg-green-900/20';
    default: return 'bg-gray-100 dark:bg-gray-900/20';
  }
}
