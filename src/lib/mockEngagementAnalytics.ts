/**
 * Mock Engagement Analytics Data
 *
 * Provides realistic mock data for student and teacher engagement analytics when Canvas/AI APIs are not available.
 * This follows the same pattern as VITE_USE_ADMIN_ANALYTICS_MOCK.
 *
 * Usage: Set VITE_USE_ENGAGEMENT_MOCK=true in .env to use this data
 *
 * Phase 2 Features Supported:
 * - Feature 34: Daily Pulse Completion Rate
 * - Feature 35: Class Pulse Participation Rate
 * - Features 36-37: Peer Interaction Analytics (Hapi Moments)
 * - Feature 38: Assignment Engagement Rate
 * - Feature 27: Teacher Engagement Score
 * - Feature 28: Active Users Weekly (WAU)
 * - Feature 29: Teacher Feedback Frequency
 * - Feature 7: Teacher Grading Turnaround Time
 * - Feature 32: Office Hours Participation
 * - Feature 40: Login Activity Trends
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface DailyPulseCompletionData {
  date: string;
  completedUsers: number;
  totalStudents: number;
  completionRate: number;
  dayOfWeek: string;
}

export interface ClassPulseParticipation {
  classId: string;
  className: string;
  teacher: string;
  department: string;
  gradeLevel: number;
  totalStudents: number;
  responsesCount: number;
  participationRate: number;
  pulsesCreated: number;
}

export interface PeerInteractionStats {
  totalMomentsSent: number;
  averagePerStudent: number;
  weeklyTrend: { week: string; count: number }[];
  byGradeLevel: { gradeLevel: number; moments: number; avgPerStudent: number }[];
  byClass: { className: string; moments: number; momentsPerCapita: number }[];
  topSenders: { studentName: string; count: number }[];
  topReceivers: { studentName: string; count: number }[];
  isolatedStudents: { studentName: string; sentCount: number; receivedCount: number }[];
}

export interface AssignmentEngagementData {
  totalAssignments: number;
  onTimeSubmissions: number;
  lateSubmissions: number;
  missingSubmissions: number;
  onTimeRate: number;
  lateRate: number;
  missingRate: number;
  byDepartment: {
    department: string;
    onTimeRate: number;
    studentsBelowTarget: number;
  }[];
  byGradeLevel: {
    gradeLevel: number;
    onTimeRate: number;
  }[];
  trend: { week: string; rate: number }[];
}

export interface TeacherEngagementScore {
  teacherId: string;
  teacherName: string;
  department: string;
  overallScore: number;
  scoreLabel: 'Highly Engaged' | 'Engaged' | 'Moderately Engaged' | 'Disengaged';
  pulseFrequencyScore: number; // 0-25
  feedbackFrequencyScore: number; // 0-25
  responseTimeScore: number; // 0-25
  platformActivityScore: number; // 0-25
  pulsesCreatedThisWeek: number;
  feedbackCommentsThisWeek: number;
  avgResponseTimeHours: number;
  dailyLogins: number;
}

export interface WeeklyActiveUsersData {
  weeklyActiveUsers: number;
  weeklyActiveTeachers: number;
  weeklyActiveStudents: number;
  totalTeachers: number;
  totalStudents: number;
  teacherAdoptionRate: number;
  studentAdoptionRate: number;
  weekOverWeekChange: number;
  trend: { week: string; wau: number }[];
}

export interface TeacherFeedbackStats {
  teacherId: string;
  teacherName: string;
  department: string;
  totalCommentsThisWeek: number;
  avgCommentsPerAssignment: number;
  avgCommentsPerStudent: number;
  meetsTarget: boolean; // >= 2 comments per student per week
}

export interface GradingTurnaroundData {
  institutionAverage: number; // hours
  byDepartment: {
    department: string;
    avgTurnaroundHours: number;
    meetsTarget: boolean;
  }[];
  byTeacher: {
    teacherId: string;
    teacherName: string;
    department: string;
    avgTurnaroundHours: number;
    exceeds7Days: boolean;
  }[];
  byAssignmentType: {
    type: 'assignment' | 'quiz' | 'exam';
    avgTurnaroundHours: number;
    target: number;
    meetsTarget: boolean;
  }[];
}

export interface OfficeHoursStats {
  percentTeachersOffering: number;
  avgHoursPerTeacherPerWeek: number;
  attendanceRate: number; // showed up / booked
  totalMeetingsConducted: number;
  byDepartment: {
    department: string;
    percentOffering: number;
    avgHours: number;
  }[];
  byTeacher: {
    teacherId: string;
    teacherName: string;
    department: string;
    hoursOfferedPerWeek: number;
    slotsBooked: number;
    slotsCompleted: number;
    capacityUtilization: number;
  }[];
}

export interface LoginActivityData {
  avgLoginsPerStudentPerWeek: number;
  studentsLoggingIn5Plus: number;
  studentsLoggingInBelow2: number;
  percentActive: number;
  percentDisengaged: number;
  byGradeLevel: {
    gradeLevel: number;
    avgLogins: number;
    percentActive: number;
  }[];
  byDepartment: {
    department: string;
    avgLogins: number;
  }[];
  byDayOfWeek: {
    day: string;
    logins: number;
  }[];
  byHourOfDay: {
    hour: number;
    logins: number;
  }[];
  weeklyTrend: {
    week: string;
    logins: number;
  }[];
  disengagedStudents: {
    studentName: string;
    loginsThisWeek: number;
  }[];
}

// =====================================================
// MOCK DATA: DAILY PULSE COMPLETION (Feature 34)
// =====================================================

export const mockDailyPulseCompletion: DailyPulseCompletionData[] = [
  { date: '2025-01-01', completedUsers: 820, totalStudents: 970, completionRate: 84.5, dayOfWeek: 'Monday' },
  { date: '2025-01-02', completedUsers: 815, totalStudents: 970, completionRate: 84.0, dayOfWeek: 'Tuesday' },
  { date: '2025-01-03', completedUsers: 805, totalStudents: 970, completionRate: 83.0, dayOfWeek: 'Wednesday' },
  { date: '2025-01-04', completedUsers: 795, totalStudents: 970, completionRate: 82.0, dayOfWeek: 'Thursday' },
  { date: '2025-01-05', completedUsers: 750, totalStudents: 970, completionRate: 77.3, dayOfWeek: 'Friday' },
  { date: '2025-01-06', completedUsers: 835, totalStudents: 970, completionRate: 86.1, dayOfWeek: 'Monday' },
  { date: '2025-01-07', completedUsers: 825, totalStudents: 970, completionRate: 85.1, dayOfWeek: 'Tuesday' },
  { date: '2025-01-08', completedUsers: 810, totalStudents: 970, completionRate: 83.5, dayOfWeek: 'Wednesday' },
  { date: '2025-01-09', completedUsers: 800, totalStudents: 970, completionRate: 82.5, dayOfWeek: 'Thursday' },
  { date: '2025-01-10', completedUsers: 760, totalStudents: 970, completionRate: 78.4, dayOfWeek: 'Friday' },
  { date: '2025-01-13', completedUsers: 840, totalStudents: 970, completionRate: 86.6, dayOfWeek: 'Monday' },
  { date: '2025-01-14', completedUsers: 830, totalStudents: 970, completionRate: 85.6, dayOfWeek: 'Tuesday' },
  { date: '2025-01-15', completedUsers: 815, totalStudents: 970, completionRate: 84.0, dayOfWeek: 'Wednesday' },
  { date: '2025-01-16', completedUsers: 805, totalStudents: 970, completionRate: 83.0, dayOfWeek: 'Thursday' },
  { date: '2025-01-17', completedUsers: 770, totalStudents: 970, completionRate: 79.4, dayOfWeek: 'Friday' },
  { date: '2025-01-20', completedUsers: 845, totalStudents: 970, completionRate: 87.1, dayOfWeek: 'Monday' },
  { date: '2025-01-21', completedUsers: 835, totalStudents: 970, completionRate: 86.1, dayOfWeek: 'Tuesday' },
  { date: '2025-01-22', completedUsers: 820, totalStudents: 970, completionRate: 84.5, dayOfWeek: 'Wednesday' },
  { date: '2025-01-23', completedUsers: 810, totalStudents: 970, completionRate: 83.5, dayOfWeek: 'Thursday' },
  { date: '2025-01-24', completedUsers: 775, totalStudents: 970, completionRate: 79.9, dayOfWeek: 'Friday' },
  { date: '2025-01-27', completedUsers: 850, totalStudents: 970, completionRate: 87.6, dayOfWeek: 'Monday' },
  { date: '2025-01-28', completedUsers: 840, totalStudents: 970, completionRate: 86.6, dayOfWeek: 'Tuesday' },
  { date: '2025-01-29', completedUsers: 825, totalStudents: 970, completionRate: 85.1, dayOfWeek: 'Wednesday' },
  { date: '2025-01-30', completedUsers: 815, totalStudents: 970, completionRate: 84.0, dayOfWeek: 'Thursday' },
  { date: '2025-01-31', completedUsers: 780, totalStudents: 970, completionRate: 80.4, dayOfWeek: 'Friday' },
  { date: '2025-02-03', completedUsers: 855, totalStudents: 970, completionRate: 88.1, dayOfWeek: 'Monday' },
  { date: '2025-02-04', completedUsers: 845, totalStudents: 970, completionRate: 87.1, dayOfWeek: 'Tuesday' },
  { date: '2025-02-05', completedUsers: 830, totalStudents: 970, completionRate: 85.6, dayOfWeek: 'Wednesday' },
  { date: '2025-02-06', completedUsers: 820, totalStudents: 970, completionRate: 84.5, dayOfWeek: 'Thursday' },
  { date: '2025-02-07', completedUsers: 785, totalStudents: 970, completionRate: 80.9, dayOfWeek: 'Friday' },
];

export const mockDayOfWeekAnalysis = {
  Monday: 86.5,
  Tuesday: 85.8,
  Wednesday: 84.3,
  Thursday: 83.1,
  Friday: 79.3,
};

export const mockSevenDayAverage = 84.2;

// =====================================================
// MOCK DATA: CLASS PULSE PARTICIPATION (Feature 35)
// =====================================================

export const mockClassPulseParticipation: ClassPulseParticipation[] = [
  {
    classId: '1',
    className: 'Algebra II - Period 1',
    teacher: 'Ms. Johnson',
    department: 'mathematics',
    gradeLevel: 10,
    totalStudents: 28,
    responsesCount: 22,
    participationRate: 78.6,
    pulsesCreated: 5,
  },
  {
    classId: '2',
    className: 'Chemistry - Period 3',
    teacher: 'Mr. Chen',
    department: 'science',
    gradeLevel: 11,
    totalStudents: 26,
    responsesCount: 20,
    participationRate: 76.9,
    pulsesCreated: 4,
  },
  {
    classId: '3',
    className: 'AP English - Period 2',
    teacher: 'Dr. Williams',
    department: 'english',
    gradeLevel: 12,
    totalStudents: 24,
    responsesCount: 21,
    participationRate: 87.5,
    pulsesCreated: 6,
  },
  {
    classId: '4',
    className: 'US History - Period 4',
    teacher: 'Mr. Davis',
    department: 'history',
    gradeLevel: 11,
    totalStudents: 30,
    responsesCount: 18,
    participationRate: 60.0,
    pulsesCreated: 3,
  },
  {
    classId: '5',
    className: 'AP Calculus - Period 5',
    teacher: 'Ms. Rodriguez',
    department: 'mathematics',
    gradeLevel: 12,
    totalStudents: 22,
    responsesCount: 19,
    participationRate: 86.4,
    pulsesCreated: 5,
  },
  {
    classId: '6',
    className: 'Art History - Period 1',
    teacher: 'Ms. Taylor',
    department: 'arts',
    gradeLevel: 10,
    totalStudents: 20,
    responsesCount: 18,
    participationRate: 90.0,
    pulsesCreated: 4,
  },
  {
    classId: '7',
    className: 'Spanish III - Period 3',
    teacher: 'Señora Martinez',
    department: 'languages',
    gradeLevel: 11,
    totalStudents: 25,
    responsesCount: 21,
    participationRate: 84.0,
    pulsesCreated: 5,
  },
  {
    classId: '8',
    className: 'Computer Science - Period 2',
    teacher: 'Mr. Patel',
    department: 'technology',
    gradeLevel: 11,
    totalStudents: 27,
    responsesCount: 24,
    participationRate: 88.9,
    pulsesCreated: 6,
  },
  {
    classId: '9',
    className: 'Physics - Period 4',
    teacher: 'Dr. Kumar',
    department: 'science',
    gradeLevel: 12,
    totalStudents: 23,
    responsesCount: 20,
    participationRate: 87.0,
    pulsesCreated: 5,
  },
  {
    classId: '10',
    className: 'World Literature - Period 5',
    teacher: 'Ms. Anderson',
    department: 'english',
    gradeLevel: 10,
    totalStudents: 29,
    responsesCount: 23,
    participationRate: 79.3,
    pulsesCreated: 4,
  },
];

export const mockSchoolWideParticipationRate = 80.8;
export const mockParticipationTrend = {
  current: 80.8,
  previous: 76.5,
  isIncreasing: true,
};

// =====================================================
// MOCK DATA: PEER INTERACTION ANALYTICS (Features 36-37)
// =====================================================

export const mockPeerInteractionStats: PeerInteractionStats = {
  totalMomentsSent: 1245,
  averagePerStudent: 1.28,
  weeklyTrend: [
    { week: 'Week 1', count: 156 },
    { week: 'Week 2', count: 168 },
    { week: 'Week 3', count: 175 },
    { week: 'Week 4', count: 189 },
    { week: 'Week 5', count: 192 },
    { week: 'Week 6', count: 185 },
    { week: 'Week 7', count: 180 },
    { week: 'Week 8', count: 200 },
  ],
  byGradeLevel: [
    { gradeLevel: 9, moments: 320, avgPerStudent: 1.28 },
    { gradeLevel: 10, moments: 310, avgPerStudent: 1.27 },
    { gradeLevel: 11, moments: 295, avgPerStudent: 1.23 },
    { gradeLevel: 12, moments: 320, avgPerStudent: 1.36 },
  ],
  byClass: [
    { className: 'Art History - Period 1', moments: 95, momentsPerCapita: 4.75 },
    { className: 'Computer Science - Period 2', moments: 82, momentsPerCapita: 3.04 },
    { className: 'AP English - Period 2', moments: 78, momentsPerCapita: 3.25 },
    { className: 'Spanish III - Period 3', moments: 75, momentsPerCapita: 3.00 },
    { className: 'AP Calculus - Period 5', moments: 68, momentsPerCapita: 3.09 },
  ],
  topSenders: [
    { studentName: 'Emma Thompson', count: 28 },
    { studentName: 'Liam Chen', count: 25 },
    { studentName: 'Olivia Martinez', count: 23 },
    { studentName: 'Noah Williams', count: 21 },
    { studentName: 'Ava Davis', count: 19 },
  ],
  topReceivers: [
    { studentName: 'Sophia Rodriguez', count: 31 },
    { studentName: 'Mason Taylor', count: 27 },
    { studentName: 'Isabella Brown', count: 24 },
    { studentName: 'Ethan Anderson', count: 22 },
    { studentName: 'Mia Johnson', count: 20 },
  ],
  isolatedStudents: [
    { studentName: 'Alex Morgan', sentCount: 0, receivedCount: 1 },
    { studentName: 'Jordan Lee', sentCount: 1, receivedCount: 0 },
    { studentName: 'Casey White', sentCount: 1, receivedCount: 1 },
  ],
};

// =====================================================
// MOCK DATA: ASSIGNMENT ENGAGEMENT (Feature 38)
// =====================================================

export const mockAssignmentEngagement: AssignmentEngagementData = {
  totalAssignments: 3850,
  onTimeSubmissions: 2890,
  lateSubmissions: 720,
  missingSubmissions: 240,
  onTimeRate: 75.1,
  lateRate: 18.7,
  missingRate: 6.2,
  byDepartment: [
    { department: 'mathematics', onTimeRate: 72.5, studentsBelowTarget: 8 },
    { department: 'science', onTimeRate: 76.3, studentsBelowTarget: 5 },
    { department: 'english', onTimeRate: 80.1, studentsBelowTarget: 3 },
    { department: 'history', onTimeRate: 74.8, studentsBelowTarget: 6 },
    { department: 'arts', onTimeRate: 85.2, studentsBelowTarget: 1 },
    { department: 'physical_education', onTimeRate: 88.5, studentsBelowTarget: 0 },
    { department: 'technology', onTimeRate: 77.2, studentsBelowTarget: 4 },
    { department: 'languages', onTimeRate: 73.9, studentsBelowTarget: 7 },
  ],
  byGradeLevel: [
    { gradeLevel: 9, onTimeRate: 78.5 },
    { gradeLevel: 10, onTimeRate: 76.2 },
    { gradeLevel: 11, onTimeRate: 72.1 },
    { gradeLevel: 12, onTimeRate: 77.8 },
  ],
  trend: [
    { week: 'Week 1', rate: 79.2 },
    { week: 'Week 2', rate: 78.5 },
    { week: 'Week 3', rate: 77.8 },
    { week: 'Week 4', rate: 76.9 },
    { week: 'Week 5', rate: 76.1 },
    { week: 'Week 6', rate: 75.5 },
    { week: 'Week 7', rate: 74.8 },
    { week: 'Week 8', rate: 75.1 },
  ],
};

// =====================================================
// MOCK DATA: TEACHER ENGAGEMENT SCORES (Feature 27)
// =====================================================

export const mockTeacherEngagementScores: TeacherEngagementScore[] = [
  {
    teacherId: 't1',
    teacherName: 'Dr. Williams',
    department: 'english',
    overallScore: 92,
    scoreLabel: 'Highly Engaged',
    pulseFrequencyScore: 24,
    feedbackFrequencyScore: 23,
    responseTimeScore: 22,
    platformActivityScore: 23,
    pulsesCreatedThisWeek: 6,
    feedbackCommentsThisWeek: 48,
    avgResponseTimeHours: 4.2,
    dailyLogins: 5,
  },
  {
    teacherId: 't2',
    teacherName: 'Mr. Patel',
    department: 'technology',
    overallScore: 88,
    scoreLabel: 'Highly Engaged',
    pulseFrequencyScore: 23,
    feedbackFrequencyScore: 22,
    responseTimeScore: 21,
    platformActivityScore: 22,
    pulsesCreatedThisWeek: 6,
    feedbackCommentsThisWeek: 45,
    avgResponseTimeHours: 5.8,
    dailyLogins: 5,
  },
  {
    teacherId: 't3',
    teacherName: 'Ms. Taylor',
    department: 'arts',
    overallScore: 85,
    scoreLabel: 'Highly Engaged',
    pulseFrequencyScore: 22,
    feedbackFrequencyScore: 21,
    responseTimeScore: 21,
    platformActivityScore: 21,
    pulsesCreatedThisWeek: 4,
    feedbackCommentsThisWeek: 42,
    avgResponseTimeHours: 6.5,
    dailyLogins: 5,
  },
  {
    teacherId: 't4',
    teacherName: 'Señora Martinez',
    department: 'languages',
    overallScore: 78,
    scoreLabel: 'Engaged',
    pulseFrequencyScore: 20,
    feedbackFrequencyScore: 19,
    responseTimeScore: 19,
    platformActivityScore: 20,
    pulsesCreatedThisWeek: 5,
    feedbackCommentsThisWeek: 38,
    avgResponseTimeHours: 8.2,
    dailyLogins: 4,
  },
  {
    teacherId: 't5',
    teacherName: 'Mr. Chen',
    department: 'science',
    overallScore: 75,
    scoreLabel: 'Engaged',
    pulseFrequencyScore: 19,
    feedbackFrequencyScore: 18,
    responseTimeScore: 19,
    platformActivityScore: 19,
    pulsesCreatedThisWeek: 4,
    feedbackCommentsThisWeek: 35,
    avgResponseTimeHours: 9.1,
    dailyLogins: 4,
  },
  {
    teacherId: 't6',
    teacherName: 'Ms. Johnson',
    department: 'mathematics',
    overallScore: 72,
    scoreLabel: 'Engaged',
    pulseFrequencyScore: 18,
    feedbackFrequencyScore: 18,
    responseTimeScore: 18,
    platformActivityScore: 18,
    pulsesCreatedThisWeek: 5,
    feedbackCommentsThisWeek: 32,
    avgResponseTimeHours: 10.5,
    dailyLogins: 4,
  },
  {
    teacherId: 't7',
    teacherName: 'Ms. Rodriguez',
    department: 'mathematics',
    overallScore: 68,
    scoreLabel: 'Moderately Engaged',
    pulseFrequencyScore: 17,
    feedbackFrequencyScore: 17,
    responseTimeScore: 17,
    platformActivityScore: 17,
    pulsesCreatedThisWeek: 5,
    feedbackCommentsThisWeek: 28,
    avgResponseTimeHours: 12.3,
    dailyLogins: 3,
  },
  {
    teacherId: 't8',
    teacherName: 'Dr. Kumar',
    department: 'science',
    overallScore: 65,
    scoreLabel: 'Moderately Engaged',
    pulseFrequencyScore: 16,
    feedbackFrequencyScore: 16,
    responseTimeScore: 16,
    platformActivityScore: 17,
    pulsesCreatedThisWeek: 5,
    feedbackCommentsThisWeek: 25,
    avgResponseTimeHours: 14.2,
    dailyLogins: 3,
  },
  {
    teacherId: 't9',
    teacherName: 'Mr. Davis',
    department: 'history',
    overallScore: 58,
    scoreLabel: 'Moderately Engaged',
    pulseFrequencyScore: 14,
    feedbackFrequencyScore: 15,
    responseTimeScore: 14,
    platformActivityScore: 15,
    pulsesCreatedThisWeek: 3,
    feedbackCommentsThisWeek: 22,
    avgResponseTimeHours: 18.5,
    dailyLogins: 3,
  },
  {
    teacherId: 't10',
    teacherName: 'Ms. Anderson',
    department: 'english',
    overallScore: 45,
    scoreLabel: 'Disengaged',
    pulseFrequencyScore: 11,
    feedbackFrequencyScore: 12,
    responseTimeScore: 10,
    platformActivityScore: 12,
    pulsesCreatedThisWeek: 4,
    feedbackCommentsThisWeek: 15,
    avgResponseTimeHours: 28.3,
    dailyLogins: 2,
  },
];

export const mockEngagementScoreDistribution = {
  'Highly Engaged': 3,
  'Engaged': 3,
  'Moderately Engaged': 3,
  'Disengaged': 1,
};

export const mockSchoolWideAvgEngagementScore = 72.6;

// =====================================================
// MOCK DATA: WEEKLY ACTIVE USERS (Feature 28)
// =====================================================

export const mockWeeklyActiveUsers: WeeklyActiveUsersData = {
  weeklyActiveUsers: 892,
  weeklyActiveTeachers: 38,
  weeklyActiveStudents: 854,
  totalTeachers: 45,
  totalStudents: 970,
  teacherAdoptionRate: 84.4,
  studentAdoptionRate: 88.0,
  weekOverWeekChange: 3.2,
  trend: [
    { week: 'Week 1', wau: 845 },
    { week: 'Week 2', wau: 852 },
    { week: 'Week 3', wau: 860 },
    { week: 'Week 4', wau: 868 },
    { week: 'Week 5', wau: 875 },
    { week: 'Week 6', wau: 882 },
    { week: 'Week 7', wau: 865 },
    { week: 'Week 8', wau: 892 },
  ],
};

// =====================================================
// MOCK DATA: TEACHER FEEDBACK FREQUENCY (Feature 29)
// =====================================================

export const mockTeacherFeedbackStats: TeacherFeedbackStats[] = [
  {
    teacherId: 't1',
    teacherName: 'Dr. Williams',
    department: 'english',
    totalCommentsThisWeek: 48,
    avgCommentsPerAssignment: 4.8,
    avgCommentsPerStudent: 2.0,
    meetsTarget: true,
  },
  {
    teacherId: 't2',
    teacherName: 'Mr. Patel',
    department: 'technology',
    totalCommentsThisWeek: 45,
    avgCommentsPerAssignment: 4.5,
    avgCommentsPerStudent: 1.67,
    meetsTarget: false,
  },
  {
    teacherId: 't3',
    teacherName: 'Ms. Taylor',
    department: 'arts',
    totalCommentsThisWeek: 42,
    avgCommentsPerAssignment: 4.2,
    avgCommentsPerStudent: 2.1,
    meetsTarget: true,
  },
  {
    teacherId: 't4',
    teacherName: 'Señora Martinez',
    department: 'languages',
    totalCommentsThisWeek: 38,
    avgCommentsPerAssignment: 3.8,
    avgCommentsPerStudent: 1.52,
    meetsTarget: false,
  },
  {
    teacherId: 't5',
    teacherName: 'Mr. Chen',
    department: 'science',
    totalCommentsThisWeek: 35,
    avgCommentsPerAssignment: 3.5,
    avgCommentsPerStudent: 1.35,
    meetsTarget: false,
  },
  {
    teacherId: 't6',
    teacherName: 'Ms. Johnson',
    department: 'mathematics',
    totalCommentsThisWeek: 32,
    avgCommentsPerAssignment: 3.2,
    avgCommentsPerStudent: 1.14,
    meetsTarget: false,
  },
  {
    teacherId: 't7',
    teacherName: 'Ms. Rodriguez',
    department: 'mathematics',
    totalCommentsThisWeek: 28,
    avgCommentsPerAssignment: 2.8,
    avgCommentsPerStudent: 1.27,
    meetsTarget: false,
  },
  {
    teacherId: 't8',
    teacherName: 'Dr. Kumar',
    department: 'science',
    totalCommentsThisWeek: 25,
    avgCommentsPerAssignment: 2.5,
    avgCommentsPerStudent: 1.09,
    meetsTarget: false,
  },
  {
    teacherId: 't9',
    teacherName: 'Mr. Davis',
    department: 'history',
    totalCommentsThisWeek: 22,
    avgCommentsPerAssignment: 2.2,
    avgCommentsPerStudent: 0.73,
    meetsTarget: false,
  },
  {
    teacherId: 't10',
    teacherName: 'Ms. Anderson',
    department: 'english',
    totalCommentsThisWeek: 15,
    avgCommentsPerAssignment: 1.5,
    avgCommentsPerStudent: 0.52,
    meetsTarget: false,
  },
];

// =====================================================
// MOCK DATA: GRADING TURNAROUND TIME (Feature 7)
// =====================================================

export const mockGradingTurnaroundData: GradingTurnaroundData = {
  institutionAverage: 48.5,
  byDepartment: [
    { department: 'arts', avgTurnaroundHours: 24.3, meetsTarget: true },
    { department: 'physical_education', avgTurnaroundHours: 28.5, meetsTarget: true },
    { department: 'english', avgTurnaroundHours: 42.1, meetsTarget: true },
    { department: 'technology', avgTurnaroundHours: 45.8, meetsTarget: true },
    { department: 'science', avgTurnaroundHours: 52.3, meetsTarget: true },
    { department: 'mathematics', avgTurnaroundHours: 58.7, meetsTarget: true },
    { department: 'history', avgTurnaroundHours: 65.2, meetsTarget: true },
    { department: 'languages', avgTurnaroundHours: 71.8, meetsTarget: true },
  ],
  byTeacher: [
    { teacherId: 't3', teacherName: 'Ms. Taylor', department: 'arts', avgTurnaroundHours: 24.3, exceeds7Days: false },
    { teacherId: 't11', teacherName: 'Mr. Thompson', department: 'physical_education', avgTurnaroundHours: 28.5, exceeds7Days: false },
    { teacherId: 't1', teacherName: 'Dr. Williams', department: 'english', avgTurnaroundHours: 36.2, exceeds7Days: false },
    { teacherId: 't2', teacherName: 'Mr. Patel', department: 'technology', avgTurnaroundHours: 45.8, exceeds7Days: false },
    { teacherId: 't10', teacherName: 'Ms. Anderson', department: 'english', avgTurnaroundHours: 48.0, exceeds7Days: false },
    { teacherId: 't5', teacherName: 'Mr. Chen', department: 'science', avgTurnaroundHours: 52.3, exceeds7Days: false },
    { teacherId: 't6', teacherName: 'Ms. Johnson', department: 'mathematics', avgTurnaroundHours: 56.2, exceeds7Days: false },
    { teacherId: 't7', teacherName: 'Ms. Rodriguez', department: 'mathematics', avgTurnaroundHours: 61.3, exceeds7Days: false },
    { teacherId: 't9', teacherName: 'Mr. Davis', department: 'history', avgTurnaroundHours: 65.2, exceeds7Days: false },
    { teacherId: 't4', teacherName: 'Señora Martinez', department: 'languages', avgTurnaroundHours: 71.8, exceeds7Days: false },
    { teacherId: 't8', teacherName: 'Dr. Kumar', department: 'science', avgTurnaroundHours: 185.5, exceeds7Days: true },
  ],
  byAssignmentType: [
    { type: 'quiz', avgTurnaroundHours: 18.5, target: 24, meetsTarget: true },
    { type: 'assignment', avgTurnaroundHours: 52.3, target: 72, meetsTarget: true },
    { type: 'exam', avgTurnaroundHours: 68.7, target: 72, meetsTarget: true },
  ],
};

// =====================================================
// MOCK DATA: OFFICE HOURS PARTICIPATION (Feature 32)
// =====================================================

export const mockOfficeHoursStats: OfficeHoursStats = {
  percentTeachersOffering: 88.9,
  avgHoursPerTeacherPerWeek: 2.8,
  attendanceRate: 78.5,
  totalMeetingsConducted: 342,
  byDepartment: [
    { department: 'mathematics', percentOffering: 100, avgHours: 3.2 },
    { department: 'science', percentOffering: 100, avgHours: 3.0 },
    { department: 'english', percentOffering: 100, avgHours: 2.8 },
    { department: 'technology', percentOffering: 100, avgHours: 2.5 },
    { department: 'languages', percentOffering: 85, avgHours: 2.3 },
    { department: 'history', percentOffering: 75, avgHours: 2.0 },
    { department: 'arts', percentOffering: 80, avgHours: 1.8 },
    { department: 'physical_education', percentOffering: 60, avgHours: 1.5 },
  ],
  byTeacher: [
    {
      teacherId: 't7',
      teacherName: 'Ms. Rodriguez',
      department: 'mathematics',
      hoursOfferedPerWeek: 4,
      slotsBooked: 32,
      slotsCompleted: 28,
      capacityUtilization: 87.5,
    },
    {
      teacherId: 't6',
      teacherName: 'Ms. Johnson',
      department: 'mathematics',
      hoursOfferedPerWeek: 3,
      slotsBooked: 24,
      slotsCompleted: 20,
      capacityUtilization: 83.3,
    },
    {
      teacherId: 't5',
      teacherName: 'Mr. Chen',
      department: 'science',
      hoursOfferedPerWeek: 3,
      slotsBooked: 22,
      slotsCompleted: 18,
      capacityUtilization: 81.8,
    },
    {
      teacherId: 't8',
      teacherName: 'Dr. Kumar',
      department: 'science',
      hoursOfferedPerWeek: 3,
      slotsBooked: 20,
      slotsCompleted: 16,
      capacityUtilization: 80.0,
    },
    {
      teacherId: 't1',
      teacherName: 'Dr. Williams',
      department: 'english',
      hoursOfferedPerWeek: 3,
      slotsBooked: 18,
      slotsCompleted: 15,
      capacityUtilization: 83.3,
    },
    {
      teacherId: 't10',
      teacherName: 'Ms. Anderson',
      department: 'english',
      hoursOfferedPerWeek: 2,
      slotsBooked: 12,
      slotsCompleted: 10,
      capacityUtilization: 83.3,
    },
    {
      teacherId: 't2',
      teacherName: 'Mr. Patel',
      department: 'technology',
      hoursOfferedPerWeek: 2.5,
      slotsBooked: 15,
      slotsCompleted: 12,
      capacityUtilization: 80.0,
    },
    {
      teacherId: 't4',
      teacherName: 'Señora Martinez',
      department: 'languages',
      hoursOfferedPerWeek: 2,
      slotsBooked: 10,
      slotsCompleted: 8,
      capacityUtilization: 80.0,
    },
    {
      teacherId: 't9',
      teacherName: 'Mr. Davis',
      department: 'history',
      hoursOfferedPerWeek: 2,
      slotsBooked: 8,
      slotsCompleted: 6,
      capacityUtilization: 75.0,
    },
    {
      teacherId: 't3',
      teacherName: 'Ms. Taylor',
      department: 'arts',
      hoursOfferedPerWeek: 2,
      slotsBooked: 6,
      slotsCompleted: 5,
      capacityUtilization: 83.3,
    },
  ],
};

// =====================================================
// MOCK DATA: LOGIN ACTIVITY TRENDS (Feature 40)
// =====================================================

export const mockLoginActivityData: LoginActivityData = {
  avgLoginsPerStudentPerWeek: 4.2,
  studentsLoggingIn5Plus: 582,
  studentsLoggingInBelow2: 87,
  percentActive: 60.0,
  percentDisengaged: 9.0,
  byGradeLevel: [
    { gradeLevel: 9, avgLogins: 4.5, percentActive: 64.0 },
    { gradeLevel: 10, avgLogins: 4.3, percentActive: 61.2 },
    { gradeLevel: 11, avgLogins: 3.9, percentActive: 56.3 },
    { gradeLevel: 12, avgLogins: 4.1, percentActive: 59.1 },
  ],
  byDepartment: [
    { department: 'technology', avgLogins: 5.2 },
    { department: 'science', avgLogins: 4.8 },
    { department: 'mathematics', avgLogins: 4.5 },
    { department: 'english', avgLogins: 4.3 },
    { department: 'languages', avgLogins: 4.0 },
    { department: 'arts', avgLogins: 3.8 },
    { department: 'history', avgLogins: 3.7 },
    { department: 'physical_education', avgLogins: 3.2 },
  ],
  byDayOfWeek: [
    { day: 'Monday', logins: 892 },
    { day: 'Tuesday', logins: 875 },
    { day: 'Wednesday', logins: 850 },
    { day: 'Thursday', logins: 820 },
    { day: 'Friday', logins: 765 },
    { day: 'Saturday', logins: 285 },
    { day: 'Sunday', logins: 320 },
  ],
  byHourOfDay: [
    { hour: 0, logins: 12 },
    { hour: 1, logins: 8 },
    { hour: 2, logins: 5 },
    { hour: 3, logins: 3 },
    { hour: 4, logins: 2 },
    { hour: 5, logins: 8 },
    { hour: 6, logins: 45 },
    { hour: 7, logins: 125 },
    { hour: 8, logins: 285 },
    { hour: 9, logins: 320 },
    { hour: 10, logins: 295 },
    { hour: 11, logins: 275 },
    { hour: 12, logins: 245 },
    { hour: 13, logins: 265 },
    { hour: 14, logins: 290 },
    { hour: 15, logins: 310 },
    { hour: 16, logins: 285 },
    { hour: 17, logins: 195 },
    { hour: 18, logins: 165 },
    { hour: 19, logins: 145 },
    { hour: 20, logins: 125 },
    { hour: 21, logins: 95 },
    { hour: 22, logins: 65 },
    { hour: 23, logins: 35 },
  ],
  weeklyTrend: [
    { week: 'Week 1', logins: 3856 },
    { week: 'Week 2', logins: 3892 },
    { week: 'Week 3', logins: 3925 },
    { week: 'Week 4', logins: 3968 },
    { week: 'Week 5', logins: 4012 },
    { week: 'Week 6', logins: 4045 },
    { week: 'Week 7', logins: 3995 },
    { week: 'Week 8', logins: 4087 },
  ],
  disengagedStudents: [
    { studentName: 'Alex Morgan', loginsThisWeek: 0 },
    { studentName: 'Jordan Lee', loginsThisWeek: 1 },
    { studentName: 'Casey White', loginsThisWeek: 1 },
    { studentName: 'Taylor Kim', loginsThisWeek: 1 },
    { studentName: 'Riley Patel', loginsThisWeek: 1 },
  ],
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Check if engagement mock mode is enabled
export function isEngagementMockEnabled(): boolean {
  return import.meta.env.VITE_USE_ENGAGEMENT_MOCK === 'true';
}

// Get engagement score label from numeric score
export function getEngagementScoreLabel(score: number): TeacherEngagementScore['scoreLabel'] {
  if (score >= 85) return 'Highly Engaged';
  if (score >= 70) return 'Engaged';
  if (score >= 50) return 'Moderately Engaged';
  return 'Disengaged';
}

// Calculate class pulse participation for a specific department
export function getClassPulseByDepartment(department?: string): ClassPulseParticipation[] {
  if (!department) return mockClassPulseParticipation;
  return mockClassPulseParticipation.filter(c => c.department === department);
}

// Calculate teacher engagement scores by department
export function getTeacherEngagementByDepartment(department?: string): TeacherEngagementScore[] {
  if (!department) return mockTeacherEngagementScores;
  return mockTeacherEngagementScores.filter(t => t.department === department);
}

// Get average teacher engagement score for department
export function getAvgEngagementScoreForDepartment(department: string): number {
  const teachers = getTeacherEngagementByDepartment(department);
  if (teachers.length === 0) return 0;
  const sum = teachers.reduce((acc, t) => acc + t.overallScore, 0);
  return Math.round(sum / teachers.length);
}
