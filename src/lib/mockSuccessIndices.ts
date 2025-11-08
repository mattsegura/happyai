/**
 * Mock Success Indices Data
 *
 * Provides realistic mock data for student and teacher success metrics when Canvas/AI APIs are not available.
 * This follows the same pattern as VITE_USE_RISK_DETECTION_MOCK.
 *
 * Usage: Set VITE_USE_RISK_DETECTION_MOCK=true in .env to use this data
 *
 * Phase 3 Features Supported:
 * - Feature 11: Student Success Index
 * - Feature 12: Teacher Support Index
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface StudentSuccessScore {
  studentId: string;
  studentName: string;
  email: string;
  gradeLevel: number;
  department: string;

  // Overall success score (0-100)
  overallScore: number;
  category: 'Thriving' | 'Stable' | 'Struggling' | 'Intervention Needed';

  // Academic component (50% weight)
  academicScore: number; // 0-50
  currentGpa: number; // 0-100 (30% weight)
  assignmentCompletionRate: number; // 0-100% (10% weight)
  gradeTrend: number; // -2 to +2 letter grades (10% weight)

  // Emotional wellbeing component (50% weight)
  wellbeingScore: number; // 0-50
  avgSentiment: number; // 1-6 scale (30% weight)
  moodStability: number; // 0-100, inverse of SD (10% weight)
  positiveInteractionRate: number; // 0-100% (10% weight)
}

export interface SuccessDistribution {
  thriving: number; // 80-100
  stable: number; // 60-79
  struggling: number; // 40-59
  interventionNeeded: number; // 0-39
  totalStudents: number;
}

export interface TeacherSupportScore {
  teacherId: string;
  teacherName: string;
  email: string;
  department: string;

  // Overall support score (0-100)
  overallScore: number;
  category: 'Exemplary' | 'Performing Well' | 'Monitor Closely' | 'Immediate Support Needed';

  // Component scores
  classAvgSentiment: number; // 1-6 scale (40% weight)
  studentEngagementRate: number; // 0-100% (30% weight)
  workloadLevel: number; // 0-100, inverse (30% weight)

  // Workload details
  numberOfStudents: number;
  numberOfClasses: number;
  assignmentsCreated: number;
  avgGradingTurnaroundHours: number;

  // Support recommendations
  needsSupport: boolean;
  supportReasons: string[];
}

export interface DepartmentSuccessStats {
  department: string;
  avgStudentSuccessScore: number;
  avgTeacherSupportScore: number;
  thrivingStudentsCount: number;
  strugglingStudentsCount: number;
  teachersNeedingSupport: number;
}

// =====================================================
// MOCK DATA: STUDENT SUCCESS INDEX (Feature 11)
// =====================================================

export const mockStudentSuccessScores: StudentSuccessScore[] = [
  // Thriving Students (80-100)
  {
    studentId: 's010',
    studentName: 'Quinn Martinez',
    email: 'quinn.martinez@school.edu',
    gradeLevel: 9,
    department: 'languages',
    overallScore: 92,
    category: 'Thriving',
    academicScore: 46,
    currentGpa: 92,
    assignmentCompletionRate: 100,
    gradeTrend: 1.0,
    wellbeingScore: 46,
    avgSentiment: 5.2,
    moodStability: 95,
    positiveInteractionRate: 85,
  },
  {
    studentId: 's009',
    studentName: 'Cameron Brown',
    email: 'cameron.brown@school.edu',
    gradeLevel: 10,
    department: 'english',
    overallScore: 88,
    category: 'Thriving',
    academicScore: 44,
    currentGpa: 88,
    assignmentCompletionRate: 98,
    gradeTrend: 0.5,
    wellbeingScore: 44,
    avgSentiment: 4.5,
    moodStability: 90,
    positiveInteractionRate: 80,
  },
  {
    studentId: 's011',
    studentName: 'Emma Thompson',
    email: 'emma.thompson@school.edu',
    gradeLevel: 11,
    department: 'science',
    overallScore: 85,
    category: 'Thriving',
    academicScore: 42,
    currentGpa: 86,
    assignmentCompletionRate: 95,
    gradeTrend: 0.5,
    wellbeingScore: 43,
    avgSentiment: 4.8,
    moodStability: 88,
    positiveInteractionRate: 78,
  },

  // Stable Students (60-79)
  {
    studentId: 's012',
    studentName: 'Liam Chen',
    email: 'liam.chen@school.edu',
    gradeLevel: 10,
    department: 'mathematics',
    overallScore: 75,
    category: 'Stable',
    academicScore: 38,
    currentGpa: 82,
    assignmentCompletionRate: 90,
    gradeTrend: 0.0,
    wellbeingScore: 37,
    avgSentiment: 4.2,
    moodStability: 75,
    positiveInteractionRate: 70,
  },
  {
    studentId: 's013',
    studentName: 'Olivia Martinez',
    email: 'olivia.martinez@school.edu',
    gradeLevel: 11,
    department: 'history',
    overallScore: 72,
    category: 'Stable',
    academicScore: 36,
    currentGpa: 80,
    assignmentCompletionRate: 88,
    gradeTrend: 0.0,
    wellbeingScore: 36,
    avgSentiment: 4.0,
    moodStability: 72,
    positiveInteractionRate: 68,
  },
  {
    studentId: 's014',
    studentName: 'Noah Williams',
    email: 'noah.williams@school.edu',
    gradeLevel: 12,
    department: 'technology',
    overallScore: 68,
    category: 'Stable',
    academicScore: 34,
    currentGpa: 78,
    assignmentCompletionRate: 85,
    gradeTrend: -0.2,
    wellbeingScore: 34,
    avgSentiment: 3.8,
    moodStability: 70,
    positiveInteractionRate: 65,
  },

  // Struggling Students (40-59)
  {
    studentId: 's006',
    studentName: 'Sam Chen',
    email: 'sam.chen@school.edu',
    gradeLevel: 10,
    department: 'technology',
    overallScore: 55,
    category: 'Struggling',
    academicScore: 28,
    currentGpa: 78,
    assignmentCompletionRate: 80,
    gradeTrend: -0.5,
    wellbeingScore: 27,
    avgSentiment: 3.2,
    moodStability: 60,
    positiveInteractionRate: 55,
  },
  {
    studentId: 's007',
    studentName: 'Morgan Davis',
    email: 'morgan.davis@school.edu',
    gradeLevel: 11,
    department: 'science',
    overallScore: 48,
    category: 'Struggling',
    academicScore: 24,
    currentGpa: 68,
    assignmentCompletionRate: 75,
    gradeTrend: -0.8,
    wellbeingScore: 24,
    avgSentiment: 3.8,
    moodStability: 50,
    positiveInteractionRate: 48,
  },

  // Intervention Needed (0-39)
  {
    studentId: 's001',
    studentName: 'Alex Morgan',
    email: 'alex.morgan@school.edu',
    gradeLevel: 11,
    department: 'mathematics',
    overallScore: 28,
    category: 'Intervention Needed',
    academicScore: 12,
    currentGpa: 65,
    assignmentCompletionRate: 55,
    gradeTrend: -1.5,
    wellbeingScore: 16,
    avgSentiment: 2.1,
    moodStability: 25,
    positiveInteractionRate: 30,
  },
  {
    studentId: 's002',
    studentName: 'Jordan Lee',
    email: 'jordan.lee@school.edu',
    gradeLevel: 10,
    department: 'science',
    overallScore: 32,
    category: 'Intervention Needed',
    academicScore: 14,
    currentGpa: 68,
    assignmentCompletionRate: 60,
    gradeTrend: -1.0,
    wellbeingScore: 18,
    avgSentiment: 2.3,
    moodStability: 28,
    positiveInteractionRate: 35,
  },
];

// =====================================================
// MOCK DATA: SUCCESS DISTRIBUTION
// =====================================================

export const mockSuccessDistribution: SuccessDistribution = {
  thriving: 342, // 35.3%
  stable: 428, // 44.1%
  struggling: 152, // 15.7%
  interventionNeeded: 48, // 4.9%
  totalStudents: 970,
};

export const mockSuccessTrend = {
  current: 68.5,
  previous: 66.2,
  isImproving: true,
  changePercent: 3.5,
};

export const mockDepartmentSuccessStats: DepartmentSuccessStats[] = [
  {
    department: 'arts',
    avgStudentSuccessScore: 78.5,
    avgTeacherSupportScore: 85.2,
    thrivingStudentsCount: 62,
    strugglingStudentsCount: 8,
    teachersNeedingSupport: 0,
  },
  {
    department: 'physical_education',
    avgStudentSuccessScore: 82.1,
    avgTeacherSupportScore: 88.5,
    thrivingStudentsCount: 185,
    strugglingStudentsCount: 5,
    teachersNeedingSupport: 0,
  },
  {
    department: 'english',
    avgStudentSuccessScore: 72.3,
    avgTeacherSupportScore: 76.2,
    thrivingStudentsCount: 95,
    strugglingStudentsCount: 18,
    teachersNeedingSupport: 1,
  },
  {
    department: 'technology',
    avgStudentSuccessScore: 70.8,
    avgTeacherSupportScore: 74.5,
    thrivingStudentsCount: 72,
    strugglingStudentsCount: 22,
    teachersNeedingSupport: 0,
  },
  {
    department: 'science',
    avgStudentSuccessScore: 68.5,
    avgTeacherSupportScore: 72.8,
    thrivingStudentsCount: 78,
    strugglingStudentsCount: 28,
    teachersNeedingSupport: 1,
  },
  {
    department: 'languages',
    avgStudentSuccessScore: 67.2,
    avgTeacherSupportScore: 70.5,
    thrivingStudentsCount: 68,
    strugglingStudentsCount: 32,
    teachersNeedingSupport: 1,
  },
  {
    department: 'mathematics',
    avgStudentSuccessScore: 64.8,
    avgTeacherSupportScore: 65.2,
    thrivingStudentsCount: 58,
    strugglingStudentsCount: 42,
    teachersNeedingSupport: 2,
  },
  {
    department: 'history',
    avgStudentSuccessScore: 66.1,
    avgTeacherSupportScore: 68.8,
    thrivingStudentsCount: 62,
    strugglingStudentsCount: 38,
    teachersNeedingSupport: 1,
  },
];

// =====================================================
// MOCK DATA: TEACHER SUPPORT INDEX (Feature 12)
// =====================================================

export const mockTeacherSupportScores: TeacherSupportScore[] = [
  // Exemplary Teachers (85-100)
  {
    teacherId: 't3',
    teacherName: 'Ms. Taylor',
    email: 'taylor@school.edu',
    department: 'arts',
    overallScore: 92,
    category: 'Exemplary',
    classAvgSentiment: 4.9,
    studentEngagementRate: 90,
    workloadLevel: 25, // Low workload = high score
    numberOfStudents: 80,
    numberOfClasses: 4,
    assignmentsCreated: 12,
    avgGradingTurnaroundHours: 24.3,
    needsSupport: false,
    supportReasons: [],
  },
  {
    teacherId: 't11',
    teacherName: 'Mr. Thompson',
    email: 'thompson@school.edu',
    department: 'physical_education',
    overallScore: 88,
    category: 'Exemplary',
    classAvgSentiment: 4.9,
    studentEngagementRate: 94,
    workloadLevel: 20,
    numberOfStudents: 120,
    numberOfClasses: 5,
    assignmentsCreated: 8,
    avgGradingTurnaroundHours: 28.5,
    needsSupport: false,
    supportReasons: [],
  },
  {
    teacherId: 't1',
    teacherName: 'Dr. Williams',
    email: 'williams@school.edu',
    department: 'english',
    overallScore: 86,
    category: 'Exemplary',
    classAvgSentiment: 4.3,
    studentEngagementRate: 88,
    workloadLevel: 35,
    numberOfStudents: 120,
    numberOfClasses: 5,
    assignmentsCreated: 20,
    avgGradingTurnaroundHours: 36.2,
    needsSupport: false,
    supportReasons: [],
  },

  // Performing Well (70-84)
  {
    teacherId: 't2',
    teacherName: 'Mr. Patel',
    email: 'patel@school.edu',
    department: 'technology',
    overallScore: 78,
    category: 'Performing Well',
    classAvgSentiment: 4.2,
    studentEngagementRate: 82,
    workloadLevel: 45,
    numberOfStudents: 135,
    numberOfClasses: 5,
    assignmentsCreated: 24,
    avgGradingTurnaroundHours: 45.8,
    needsSupport: false,
    supportReasons: [],
  },
  {
    teacherId: 't5',
    teacherName: 'Mr. Chen',
    email: 'chen@school.edu',
    department: 'science',
    overallScore: 75,
    category: 'Performing Well',
    classAvgSentiment: 4.1,
    studentEngagementRate: 80,
    workloadLevel: 50,
    numberOfStudents: 130,
    numberOfClasses: 5,
    assignmentsCreated: 26,
    avgGradingTurnaroundHours: 52.3,
    needsSupport: false,
    supportReasons: [],
  },
  {
    teacherId: 't4',
    teacherName: 'Señora Martinez',
    email: 'martinez@school.edu',
    department: 'languages',
    overallScore: 72,
    category: 'Performing Well',
    classAvgSentiment: 4.1,
    studentEngagementRate: 78,
    workloadLevel: 48,
    numberOfStudents: 125,
    numberOfClasses: 5,
    assignmentsCreated: 25,
    avgGradingTurnaroundHours: 71.8,
    needsSupport: false,
    supportReasons: [],
  },

  // Monitor Closely (50-69)
  {
    teacherId: 't6',
    teacherName: 'Ms. Johnson',
    email: 'johnson@school.edu',
    department: 'mathematics',
    overallScore: 62,
    category: 'Monitor Closely',
    classAvgSentiment: 3.8,
    studentEngagementRate: 72,
    workloadLevel: 65,
    numberOfStudents: 140,
    numberOfClasses: 5,
    assignmentsCreated: 30,
    avgGradingTurnaroundHours: 56.2,
    needsSupport: false,
    supportReasons: [],
  },
  {
    teacherId: 't9',
    teacherName: 'Mr. Davis',
    email: 'davis@school.edu',
    department: 'history',
    overallScore: 58,
    category: 'Monitor Closely',
    classAvgSentiment: 3.5,
    studentEngagementRate: 68,
    workloadLevel: 68,
    numberOfStudents: 150,
    numberOfClasses: 5,
    assignmentsCreated: 28,
    avgGradingTurnaroundHours: 65.2,
    needsSupport: false,
    supportReasons: [],
  },

  // Immediate Support Needed (<50)
  {
    teacherId: 't7',
    teacherName: 'Ms. Rodriguez',
    email: 'rodriguez@school.edu',
    department: 'mathematics',
    overallScore: 45,
    category: 'Immediate Support Needed',
    classAvgSentiment: 3.2,
    studentEngagementRate: 58,
    workloadLevel: 82,
    numberOfStudents: 160,
    numberOfClasses: 6,
    assignmentsCreated: 36,
    avgGradingTurnaroundHours: 61.3,
    needsSupport: true,
    supportReasons: [
      'Low class sentiment (3.2/6)',
      'High workload (160 students, 6 classes)',
      'Below-target engagement (58%)',
    ],
  },
  {
    teacherId: 't8',
    teacherName: 'Dr. Kumar',
    email: 'kumar@school.edu',
    department: 'science',
    overallScore: 42,
    category: 'Immediate Support Needed',
    classAvgSentiment: 3.3,
    studentEngagementRate: 55,
    workloadLevel: 88,
    numberOfStudents: 155,
    numberOfClasses: 6,
    assignmentsCreated: 34,
    avgGradingTurnaroundHours: 185.5,
    needsSupport: true,
    supportReasons: [
      'Very high workload (155 students, 6 classes)',
      'Grading turnaround exceeds 7 days (185.5 hours)',
      'Low engagement rate (55%)',
    ],
  },
  {
    teacherId: 't10',
    teacherName: 'Ms. Anderson',
    email: 'anderson@school.edu',
    department: 'english',
    overallScore: 48,
    category: 'Immediate Support Needed',
    classAvgSentiment: 3.4,
    studentEngagementRate: 60,
    workloadLevel: 75,
    numberOfStudents: 145,
    numberOfClasses: 5,
    assignmentsCreated: 32,
    avgGradingTurnaroundHours: 48.0,
    needsSupport: true,
    supportReasons: ['Low class sentiment (3.4/6)', 'High workload (145 students)', 'Below-target engagement (60%)'],
  },
];

export const mockTeacherSupportDistribution = {
  exemplary: 3,
  performingWell: 3,
  monitorClosely: 2,
  immediateSupportNeeded: 3,
};

// Scatter plot: Teacher workload vs Class sentiment
export const mockWorkloadSentimentData = mockTeacherSupportScores.map((teacher) => ({
  teacherName: teacher.teacherName,
  workload: teacher.numberOfStudents,
  sentiment: teacher.classAvgSentiment,
  department: teacher.department,
}));

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Check if success indices mock mode is enabled
export function isSuccessIndicesMockEnabled(): boolean {
  return import.meta.env.VITE_USE_RISK_DETECTION_MOCK === 'true';
}

// Get students by success category
export function getStudentsByCategory(category: StudentSuccessScore['category']): StudentSuccessScore[] {
  return mockStudentSuccessScores.filter((s) => s.category === category);
}

// Get teachers by support category
export function getTeachersByCategory(category: TeacherSupportScore['category']): TeacherSupportScore[] {
  return mockTeacherSupportScores.filter((t) => t.category === category);
}

// Get teachers needing support
export function getTeachersNeedingSupport(): TeacherSupportScore[] {
  return mockTeacherSupportScores.filter((t) => t.needsSupport);
}

// Get success category color
export function getSuccessCategoryColor(category: string): string {
  switch (category) {
    case 'Thriving':
    case 'Exemplary':
      return 'text-green-600 dark:text-green-400';
    case 'Stable':
    case 'Performing Well':
      return 'text-blue-600 dark:text-blue-400';
    case 'Struggling':
    case 'Monitor Closely':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'Intervention Needed':
    case 'Immediate Support Needed':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

// Get success category background color
export function getSuccessCategoryBgColor(category: string): string {
  switch (category) {
    case 'Thriving':
    case 'Exemplary':
      return 'bg-green-100 dark:bg-green-900/20';
    case 'Stable':
    case 'Performing Well':
      return 'bg-blue-100 dark:bg-blue-900/20';
    case 'Struggling':
    case 'Monitor Closely':
      return 'bg-yellow-100 dark:bg-yellow-900/20';
    case 'Intervention Needed':
    case 'Immediate Support Needed':
      return 'bg-red-100 dark:bg-red-900/20';
    default:
      return 'bg-gray-100 dark:bg-gray-900/20';
  }
}

// Calculate overall institution success score
export function getInstitutionSuccessScore(): number {
  const totalScore = mockStudentSuccessScores.reduce((sum, student) => sum + student.overallScore, 0);
  return Math.round(totalScore / mockStudentSuccessScores.length);
}
