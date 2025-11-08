/**
 * Mock Comparative Analytics Data
 *
 * Provides realistic mock data for comparative analytics features when Canvas API is not available.
 * This supports Phase 4 - Week 2: Comparative Analytics
 *
 * Usage: Set VITE_USE_COMPARATIVE_ANALYTICS_MOCK=true in .env to use this data
 *
 * Features Supported:
 * - Feature 6: Assignment Load Per Student
 * - Feature 52: Sentiment Growth Classes
 * - Feature 53: Class Size vs Sentiment
 * - Feature 25: Course Type Comparison
 */

export interface AssignmentLoadDistribution {
  range: string;
  studentCount: number;
  percentage: number;
  averageSentiment: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface StudentOverloadAlert {
  studentId: string;
  studentName: string;
  assignmentCount: number;
  courses: string[];
  averageSentiment: number;
  recentMissedAssignments: number;
}

export interface SentimentGrowthClass {
  classId: string;
  className: string;
  teacher: string;
  department: string;
  currentSentiment: number;
  previousSentiment: number;
  growthPercentage: number;
  studentCount: number;
  interventions: string[];
}

export interface ClassSizeSentimentData {
  classId: string;
  className: string;
  teacher: string;
  classSize: number;
  averageSentiment: number;
  engagementRate: number;
  completionRate: number;
}

export interface CourseTypeComparison {
  courseType: 'STEM' | 'Humanities' | 'Arts' | 'Social Sciences' | 'Business';
  averageSentiment: number;
  averageGrade: number;
  engagementRate: number;
  completionRate: number;
  studentCount: number;
  officeHoursUsage: number;
  studyGroupParticipation: number;
  averageWorkload: number;
}

export interface CourseTypeTimePattern {
  courseType: 'STEM' | 'Humanities' | 'Arts' | 'Social Sciences' | 'Business';
  mondaySentiment: number;
  tuesdaySentiment: number;
  wednesdaySentiment: number;
  thursdaySentiment: number;
  fridaySentiment: number;
  peakEngagementTime: string;
  lowEngagementTime: string;
}

// Feature 6: Assignment Load Distribution
export const mockAssignmentLoadDistribution: AssignmentLoadDistribution[] = [
  {
    range: '0-5 assignments/week',
    studentCount: 125,
    percentage: 27.8,
    averageSentiment: 5.1,
    riskLevel: 'low'
  },
  {
    range: '6-10 assignments/week',
    studentCount: 180,
    percentage: 40.0,
    averageSentiment: 4.5,
    riskLevel: 'low'
  },
  {
    range: '11-15 assignments/week',
    studentCount: 95,
    percentage: 21.1,
    averageSentiment: 3.8,
    riskLevel: 'medium'
  },
  {
    range: '16-20 assignments/week',
    studentCount: 35,
    percentage: 7.8,
    averageSentiment: 3.2,
    riskLevel: 'high'
  },
  {
    range: '20+ assignments/week',
    studentCount: 15,
    percentage: 3.3,
    averageSentiment: 2.6,
    riskLevel: 'critical'
  }
];

// Students with overload (>20 assignments/week)
export const mockStudentOverloadAlerts: StudentOverloadAlert[] = [
  {
    studentId: '1',
    studentName: 'Emily Johnson',
    assignmentCount: 24,
    courses: ['MATH 301', 'CS 201', 'PHYS 202', 'ENG 101', 'HIST 201'],
    averageSentiment: 2.4,
    recentMissedAssignments: 3
  },
  {
    studentId: '2',
    studentName: 'Michael Chen',
    assignmentCount: 22,
    courses: ['CS 401', 'MATH 401', 'CS 301', 'BUS 201'],
    averageSentiment: 2.8,
    recentMissedAssignments: 2
  },
  {
    studentId: '3',
    studentName: 'Sarah Williams',
    assignmentCount: 23,
    courses: ['BIO 301', 'CHEM 302', 'MATH 201', 'PSY 201', 'ENG 201'],
    averageSentiment: 2.5,
    recentMissedAssignments: 4
  },
  {
    studentId: '4',
    studentName: 'David Martinez',
    assignmentCount: 21,
    courses: ['CHEM 401', 'BIO 401', 'MATH 301', 'PHYS 301'],
    averageSentiment: 2.9,
    recentMissedAssignments: 1
  },
  {
    studentId: '5',
    studentName: 'Jessica Lee',
    assignmentCount: 25,
    courses: ['CS 301', 'MATH 301', 'PHYS 301', 'ENG 201', 'BUS 301'],
    averageSentiment: 2.3,
    recentMissedAssignments: 5
  },
  {
    studentId: '6',
    studentName: 'Ryan Thompson',
    assignmentCount: 22,
    courses: ['HIST 401', 'ENG 401', 'PSY 301', 'SOC 301'],
    averageSentiment: 2.7,
    recentMissedAssignments: 2
  },
  {
    studentId: '7',
    studentName: 'Amanda Garcia',
    assignmentCount: 21,
    courses: ['BUS 401', 'ECON 301', 'MATH 201', 'CS 201'],
    averageSentiment: 3.0,
    recentMissedAssignments: 1
  },
  {
    studentId: '8',
    studentName: 'Christopher Brown',
    assignmentCount: 23,
    courses: ['PHYS 401', 'MATH 401', 'CS 301', 'CHEM 301'],
    averageSentiment: 2.6,
    recentMissedAssignments: 3
  },
  {
    studentId: '9',
    studentName: 'Lisa Anderson',
    assignmentCount: 24,
    courses: ['BIO 401', 'CHEM 401', 'MATH 301', 'PSY 301', 'ENG 201'],
    averageSentiment: 2.4,
    recentMissedAssignments: 4
  },
  {
    studentId: '10',
    studentName: 'Daniel Kim',
    assignmentCount: 22,
    courses: ['CS 401', 'MATH 401', 'PHYS 301', 'BUS 301'],
    averageSentiment: 2.8,
    recentMissedAssignments: 2
  },
];

// Feature 52: Sentiment Growth Classes (Top 10)
export const mockSentimentGrowthClasses: SentimentGrowthClass[] = [
  {
    classId: 'cs101-001',
    className: 'CS 101 - Intro to Programming',
    teacher: 'Prof. Sarah Anderson',
    department: 'Computer Science',
    currentSentiment: 5.2,
    previousSentiment: 4.1,
    growthPercentage: 26.8,
    studentCount: 45,
    interventions: ['Added weekly office hours', 'Introduced peer programming sessions', 'Implemented interactive coding labs']
  },
  {
    classId: 'bio201-002',
    className: 'BIO 201 - Genetics',
    teacher: 'Dr. Michael Roberts',
    department: 'Biology',
    currentSentiment: 4.9,
    previousSentiment: 3.9,
    growthPercentage: 25.6,
    studentCount: 38,
    interventions: ['Virtual lab simulations', 'Study group formation support', 'Enhanced visualization tools']
  },
  {
    classId: 'bus301-001',
    className: 'BUS 301 - Marketing Strategies',
    teacher: 'Prof. Jennifer Lee',
    department: 'Business',
    currentSentiment: 5.1,
    previousSentiment: 4.2,
    growthPercentage: 21.4,
    studentCount: 52,
    interventions: ['Real-world case studies', 'Guest speaker series', 'Group project workshops']
  },
  {
    classId: 'psy201-001',
    className: 'PSY 201 - Developmental Psychology',
    teacher: 'Dr. David Martinez',
    department: 'Psychology',
    currentSentiment: 5.0,
    previousSentiment: 4.2,
    growthPercentage: 19.0,
    studentCount: 41,
    interventions: ['Research participation opportunities', 'Interactive discussions', 'Applied learning projects']
  },
  {
    classId: 'eng201-003',
    className: 'ENG 201 - Shakespeare Studies',
    teacher: 'Prof. Elizabeth Thompson',
    department: 'English Literature',
    currentSentiment: 4.8,
    previousSentiment: 4.1,
    growthPercentage: 17.1,
    studentCount: 35,
    interventions: ['Performance workshops', 'Peer review sessions', 'Theater trip attendance']
  },
  {
    classId: 'cs201-002',
    className: 'CS 201 - Data Structures',
    teacher: 'Dr. James Wilson',
    department: 'Computer Science',
    currentSentiment: 4.7,
    previousSentiment: 4.0,
    growthPercentage: 17.5,
    studentCount: 42,
    interventions: ['Algorithm visualization tools', 'Coding challenge workshops', 'Extended lab hours']
  },
  {
    classId: 'math101-004',
    className: 'MATH 101 - Calculus I',
    teacher: 'Prof. Linda Chen',
    department: 'Mathematics',
    currentSentiment: 4.5,
    previousSentiment: 3.9,
    growthPercentage: 15.4,
    studentCount: 48,
    interventions: ['Supplemental instruction sessions', 'Problem-solving workshops', 'Video lecture library']
  },
  {
    classId: 'hist201-001',
    className: 'HIST 201 - American History',
    teacher: 'Dr. Robert Davis',
    department: 'History',
    currentSentiment: 4.6,
    previousSentiment: 4.0,
    growthPercentage: 15.0,
    studentCount: 40,
    interventions: ['Primary source workshops', 'Museum field trips', 'Debate sessions']
  },
  {
    classId: 'chem101-002',
    className: 'CHEM 101 - General Chemistry I',
    teacher: 'Prof. Maria Garcia',
    department: 'Chemistry',
    currentSentiment: 4.4,
    previousSentiment: 3.9,
    growthPercentage: 12.8,
    studentCount: 44,
    interventions: ['Additional lab sessions', 'Chemistry tutoring center', 'Molecular modeling software']
  },
  {
    classId: 'bus401-001',
    className: 'BUS 401 - Business Analytics',
    teacher: 'Dr. Thomas Brown',
    department: 'Business',
    currentSentiment: 4.9,
    previousSentiment: 4.4,
    growthPercentage: 11.4,
    studentCount: 36,
    interventions: ['Industry project partnerships', 'Data analytics workshops', 'Career networking events']
  },
];

// Feature 53: Class Size vs Sentiment (scatter plot data)
export const mockClassSizeSentimentData: ClassSizeSentimentData[] = [
  // Small classes (15-25 students) - Generally higher sentiment
  { classId: 'eng401-001', className: 'Advanced Poetry', teacher: 'Prof. Emily White', classSize: 18, averageSentiment: 5.3, engagementRate: 0.94, completionRate: 0.96 },
  { classId: 'phil301-001', className: 'Ethics', teacher: 'Dr. Mark Johnson', classSize: 22, averageSentiment: 5.1, engagementRate: 0.91, completionRate: 0.93 },
  { classId: 'art201-002', className: 'Studio Art', teacher: 'Prof. Sarah Kim', classSize: 20, averageSentiment: 5.4, engagementRate: 0.95, completionRate: 0.97 },
  { classId: 'mus301-001', className: 'Music Theory', teacher: 'Dr. David Lee', classSize: 16, averageSentiment: 5.2, engagementRate: 0.92, completionRate: 0.94 },

  // Medium classes (26-45 students) - Moderate to high sentiment
  { classId: 'cs101-001', className: 'Intro to Programming', teacher: 'Prof. Sarah Anderson', classSize: 45, averageSentiment: 5.2, engagementRate: 0.88, completionRate: 0.91 },
  { classId: 'bio201-002', className: 'Genetics', teacher: 'Dr. Michael Roberts', classSize: 38, averageSentiment: 4.9, engagementRate: 0.85, completionRate: 0.89 },
  { classId: 'psy201-001', className: 'Developmental Psychology', teacher: 'Dr. David Martinez', classSize: 41, averageSentiment: 5.0, engagementRate: 0.87, completionRate: 0.90 },
  { classId: 'eng201-003', className: 'Shakespeare Studies', teacher: 'Prof. Elizabeth Thompson', classSize: 35, averageSentiment: 4.8, engagementRate: 0.86, completionRate: 0.88 },
  { classId: 'cs201-002', className: 'Data Structures', teacher: 'Dr. James Wilson', classSize: 42, averageSentiment: 4.7, engagementRate: 0.84, completionRate: 0.87 },
  { classId: 'math101-004', className: 'Calculus I', teacher: 'Prof. Linda Chen', classSize: 48, averageSentiment: 4.5, engagementRate: 0.82, completionRate: 0.85 },
  { classId: 'hist201-001', className: 'American History', teacher: 'Dr. Robert Davis', classSize: 40, averageSentiment: 4.6, engagementRate: 0.83, completionRate: 0.86 },
  { classId: 'chem101-002', className: 'General Chemistry I', teacher: 'Prof. Maria Garcia', classSize: 44, averageSentiment: 4.4, engagementRate: 0.80, completionRate: 0.84 },
  { classId: 'bus301-001', className: 'Marketing Strategies', teacher: 'Prof. Jennifer Lee', classSize: 52, averageSentiment: 5.1, engagementRate: 0.89, completionRate: 0.92 },
  { classId: 'bus401-001', className: 'Business Analytics', teacher: 'Dr. Thomas Brown', classSize: 36, averageSentiment: 4.9, engagementRate: 0.87, completionRate: 0.90 },

  // Large classes (50-80 students) - Variable sentiment
  { classId: 'math101-001', className: 'Calculus I', teacher: 'Prof. John Smith', classSize: 75, averageSentiment: 4.0, engagementRate: 0.72, completionRate: 0.76 },
  { classId: 'bio101-001', className: 'General Biology', teacher: 'Dr. Lisa Anderson', classSize: 68, averageSentiment: 4.2, engagementRate: 0.75, completionRate: 0.79 },
  { classId: 'chem101-001', className: 'General Chemistry I', teacher: 'Prof. Richard Brown', classSize: 72, averageSentiment: 3.9, engagementRate: 0.70, completionRate: 0.74 },
  { classId: 'psy101-001', className: 'Intro to Psychology', teacher: 'Dr. Jennifer White', classSize: 65, averageSentiment: 4.4, engagementRate: 0.78, completionRate: 0.82 },
  { classId: 'hist101-001', className: 'World History I', teacher: 'Prof. Michael Davis', classSize: 70, averageSentiment: 4.1, engagementRate: 0.73, completionRate: 0.77 },
  { classId: 'eng101-001', className: 'English Composition', teacher: 'Prof. Susan Martinez', classSize: 62, averageSentiment: 4.3, engagementRate: 0.76, completionRate: 0.80 },

  // Very large classes (80+ students) - Generally lower sentiment
  { classId: 'econ101-001', className: 'Intro to Economics', teacher: 'Dr. Andrew Wilson', classSize: 120, averageSentiment: 3.7, engagementRate: 0.65, completionRate: 0.70 },
  { classId: 'soc101-001', className: 'Introduction to Sociology', teacher: 'Prof. Karen Taylor', classSize: 95, averageSentiment: 3.8, engagementRate: 0.68, completionRate: 0.72 },
  { classId: 'bus101-001', className: 'Intro to Business', teacher: 'Dr. Robert Johnson', classSize: 110, averageSentiment: 3.6, engagementRate: 0.64, completionRate: 0.68 },
  { classId: 'phys101-001', className: 'General Physics I', teacher: 'Prof. Daniel Lee', classSize: 88, averageSentiment: 3.9, engagementRate: 0.69, completionRate: 0.73 },
];

// Feature 25: Course Type Comparison
export const mockCourseTypeComparison: CourseTypeComparison[] = [
  {
    courseType: 'STEM',
    averageSentiment: 4.1,
    averageGrade: 79.8,
    engagementRate: 0.81,
    completionRate: 0.85,
    studentCount: 185,
    officeHoursUsage: 0.68,
    studyGroupParticipation: 0.72,
    averageWorkload: 16.5
  },
  {
    courseType: 'Humanities',
    averageSentiment: 4.7,
    averageGrade: 86.2,
    engagementRate: 0.88,
    completionRate: 0.91,
    studentCount: 142,
    officeHoursUsage: 0.54,
    studyGroupParticipation: 0.61,
    averageWorkload: 13.2
  },
  {
    courseType: 'Arts',
    averageSentiment: 5.2,
    averageGrade: 88.7,
    engagementRate: 0.93,
    completionRate: 0.95,
    studentCount: 78,
    officeHoursUsage: 0.76,
    studyGroupParticipation: 0.58,
    averageWorkload: 14.8
  },
  {
    courseType: 'Social Sciences',
    averageSentiment: 4.5,
    averageGrade: 84.3,
    engagementRate: 0.85,
    completionRate: 0.88,
    studentCount: 128,
    officeHoursUsage: 0.61,
    studyGroupParticipation: 0.65,
    averageWorkload: 12.6
  },
  {
    courseType: 'Business',
    averageSentiment: 4.6,
    averageGrade: 83.9,
    engagementRate: 0.86,
    completionRate: 0.89,
    studentCount: 117,
    officeHoursUsage: 0.59,
    studyGroupParticipation: 0.70,
    averageWorkload: 13.8
  },
];

// Time-based patterns by course type
export const mockCourseTypeTimePatterns: CourseTypeTimePattern[] = [
  {
    courseType: 'STEM',
    mondaySentiment: 3.8,
    tuesdaySentiment: 4.0,
    wednesdaySentiment: 4.2,
    thursdaySentiment: 4.1,
    fridaySentiment: 4.4,
    peakEngagementTime: 'Wednesday 2-4pm',
    lowEngagementTime: 'Monday 8-10am'
  },
  {
    courseType: 'Humanities',
    mondaySentiment: 4.4,
    tuesdaySentiment: 4.6,
    wednesdaySentiment: 4.8,
    thursdaySentiment: 4.7,
    fridaySentiment: 5.0,
    peakEngagementTime: 'Thursday 10am-12pm',
    lowEngagementTime: 'Friday 3-5pm'
  },
  {
    courseType: 'Arts',
    mondaySentiment: 5.0,
    tuesdaySentiment: 5.1,
    wednesdaySentiment: 5.3,
    thursdaySentiment: 5.2,
    fridaySentiment: 5.4,
    peakEngagementTime: 'Tuesday 1-3pm',
    lowEngagementTime: 'Monday 8-10am'
  },
  {
    courseType: 'Social Sciences',
    mondaySentiment: 4.2,
    tuesdaySentiment: 4.4,
    wednesdaySentiment: 4.6,
    thursdaySentiment: 4.5,
    fridaySentiment: 4.8,
    peakEngagementTime: 'Wednesday 11am-1pm',
    lowEngagementTime: 'Monday 8-10am'
  },
  {
    courseType: 'Business',
    mondaySentiment: 4.3,
    tuesdaySentiment: 4.5,
    wednesdaySentiment: 4.7,
    thursdaySentiment: 4.6,
    fridaySentiment: 4.9,
    peakEngagementTime: 'Tuesday 3-5pm',
    lowEngagementTime: 'Friday 8-10am'
  },
];

// Helper functions
export function getOverloadedStudents(threshold: number = 20): StudentOverloadAlert[] {
  return mockStudentOverloadAlerts.filter((student) => student.assignmentCount >= threshold);
}

export function getTopGrowthClasses(limit: number = 10): SentimentGrowthClass[] {
  return mockSentimentGrowthClasses
    .sort((a, b) => b.growthPercentage - a.growthPercentage)
    .slice(0, limit);
}

export function getClassSizeCorrelation(): {
  optimalRange: string;
  correlation: number;
  recommendation: string;
} {
  // Calculate correlation between class size and sentiment
  const smallClasses = mockClassSizeSentimentData.filter((c) => c.classSize < 30);
  const mediumClasses = mockClassSizeSentimentData.filter((c) => c.classSize >= 30 && c.classSize < 60);
  const largeClasses = mockClassSizeSentimentData.filter((c) => c.classSize >= 60);

  const avgSmall = smallClasses.reduce((sum, c) => sum + c.averageSentiment, 0) / smallClasses.length;
  const avgMedium = mediumClasses.reduce((sum, c) => sum + c.averageSentiment, 0) / mediumClasses.length;
  const avgLarge = largeClasses.reduce((sum, c) => sum + c.averageSentiment, 0) / largeClasses.length;

  return {
    optimalRange: '20-45 students',
    correlation: -0.68, // Negative correlation: larger classes = lower sentiment
    recommendation: `Classes with 20-45 students show optimal balance (avg sentiment: ${avgMedium.toFixed(1)}).
    Small classes (<30): ${avgSmall.toFixed(1)} sentiment.
    Large classes (60+): ${avgLarge.toFixed(1)} sentiment.
    Consider capping class sizes at 50 students for better outcomes.`
  };
}
