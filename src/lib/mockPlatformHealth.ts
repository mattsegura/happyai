/**
 * Mock Platform Health Data
 *
 * Provides realistic mock data for platform health and technical metrics when Canvas/AI APIs are not available.
 *
 * Usage: Set VITE_USE_PLATFORM_HEALTH_MOCK=true in .env to use this data
 *
 * Phase 5 Features Supported:
 * - Feature 42: LTI Launch Success Rate
 * - Feature 43: Connected Courses Count
 * - Feature 44: Assignment Import Success Rate
 * - Feature 9: Emotional Recovery Rate
 * - Feature 24: Sentiment After Events
 * - Feature 39: Discussion Participation
 * - Feature 20: AI Wellbeing Alerts Count
 * - Feature 30: Alert Response Rate
 * - Feature 31: High Engagement Teachers %
 * - Feature 33: Most/Least Engaged Classes
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface LTILaunchMetrics {
  totalAttempts: number;
  successfulLaunches: number;
  failedLaunches: number;
  successRate: number;
  byUserType: {
    userType: 'student' | 'teacher';
    attempts: number;
    successRate: number;
  }[];
  byBrowser: {
    browser: string;
    attempts: number;
    successRate: number;
  }[];
  byDevice: {
    device: 'desktop' | 'mobile' | 'tablet';
    attempts: number;
    successRate: number;
  }[];
  failureReasons: {
    errorCode: string;
    description: string;
    count: number;
  }[];
  trend: {
    date: string;
    successRate: number;
    attempts: number;
  }[];
}

export interface ConnectedCoursesMetrics {
  totalCanvasCourses: number;
  connectedCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  coverageRate: number;
  byDepartment: {
    department: string;
    totalCourses: number;
    connectedCourses: number;
    coverageRate: number;
  }[];
  growthTrend: {
    week: string;
    newCourses: number;
    cumulativeCourses: number;
  }[];
  uncoveredDepartments: {
    department: string;
    coursesNotConnected: number;
  }[];
}

export interface AssignmentImportMetrics {
  totalImportAttempts: number;
  successfulImports: number;
  failedImports: number;
  successRate: number;
  failureTypes: {
    type: string;
    description: string;
    count: number;
  }[];
  coursesWithIssues: {
    courseName: string;
    failureCount: number;
    lastError: string;
  }[];
  dataCompleteness: {
    field: string;
    completeCount: number;
    missingCount: number;
    completenessRate: number;
  }[];
  trend: {
    date: string;
    successRate: number;
    attempts: number;
  }[];
}

export interface EmotionalRecoveryMetrics {
  totalRecoveringStudents: number;
  recoveryRate: number;
  byDepartment: {
    department: string;
    recoveringCount: number;
    recoveryRate: number;
  }[];
  byGradeLevel: {
    gradeLevel: number;
    recoveringCount: number;
    recoveryRate: number;
  }[];
  correlationAnalysis: {
    emotionalImprovement: number;
    academicImprovement: number;
    bothImproved: number;
    overlapPercentage: number;
  };
  recoveryTrajectory: {
    timeframe: string;
    avgDaysToRecover: number;
    studentCount: number;
  }[];
  successStories: {
    studentName: string;
    previousGrade: string;
    currentGrade: string;
    sentimentChange: string;
    interventionType: string;
  }[];
}

export interface SentimentAfterEventsMetrics {
  events: {
    eventName: string;
    eventDate: string;
    eventType: 'wellness' | 'academic' | 'social' | 'other';
    beforeSentiment: number;
    afterSentiment: number;
    improvementPercentage: number;
    studentsImpacted: number;
    benefitDuration: number; // days
    costEffectiveness: number; // score 0-100
    topBenefitGroup: string;
  }[];
  mostEffectiveInitiatives: {
    initiative: string;
    avgImprovement: number;
    timesImplemented: number;
  }[];
  recommendations: string[];
}

export interface DiscussionParticipationMetrics {
  totalDiscussions: number;
  totalPosts: number;
  avgPostsPerStudent: number;
  participationRate: number;
  avgPostLength: number;
  replyRate: number;
  byCourse: {
    courseName: string;
    department: string;
    avgPosts: number;
    participationRate: number;
  }[];
  byDepartment: {
    department: string;
    avgPosts: number;
    participationRate: number;
  }[];
  byGradeLevel: {
    gradeLevel: number;
    avgPosts: number;
    participationRate: number;
  }[];
  qualityMetrics: {
    avgUpvotes: number;
    teacherEndorsedPosts: number;
    qualityPostPercentage: number;
  };
  trend: {
    week: string;
    avgPosts: number;
    participationRate: number;
  }[];
}

export interface AIWellbeingAlertsMetrics {
  totalAlertsAllTime: number;
  alertsThisWeek: number;
  alertsThisMonth: number;
  trendIndicator: 'increasing' | 'decreasing' | 'stable';
  byAlertType: {
    type: string;
    count: number;
    percentage: number;
  }[];
  alertStatus: {
    reviewed: number;
    intervened: number;
    resolved: number;
    open: number;
  };
  responseTimeMetrics: {
    avgTimeToReview: number; // hours
    avgTimeToIntervention: number; // hours
  };
  timeline: {
    week: string;
    alertCount: number;
    resolvedCount: number;
  }[];
  departmentHeatmap: {
    department: string;
    alertCount: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

export interface AlertResponseRateMetrics {
  totalAlertsSent: number;
  alertsAcknowledged: number;
  alertsActedUpon: number;
  alertsIgnored: number;
  overallResponseRate: number;
  avgTimeToAcknowledge: number; // hours
  avgTimeToAction: number; // hours
  byTeacher: {
    teacherName: string;
    alertsReceived: number;
    responseRate: number;
    avgResponseTime: number;
  }[];
  byDepartment: {
    department: string;
    responseRate: number;
    avgResponseTime: number;
  }[];
  byAlertType: {
    alertType: 'emotional' | 'academic' | 'behavioral';
    responseRate: number;
  }[];
  teachersBelowTarget: {
    teacherName: string;
    department: string;
    responseRate: number;
  }[];
}

export interface HighEngagementTeachersMetrics {
  totalTeachers: number;
  highEngagementCount: number;
  highEngagementPercentage: number;
  criteria: {
    pulsesTarget: number;
    completionTarget: number;
    checkInTarget: number;
  };
  topPerformers: {
    teacherName: string;
    department: string;
    pulseParticipation: number;
    assignmentCompletion: number;
    checkInRate: number;
    overallScore: number;
  }[];
  departmentRankings: {
    department: string;
    highEngagementPercentage: number;
    avgEngagementScore: number;
  }[];
  bestPractices: {
    teacherName: string;
    strategy: string;
    impact: string;
  }[];
  trendData: {
    month: string;
    percentage: number;
  }[];
}

export interface TeacherClassEngagementMetrics {
  teacher: string;
  department: string;
  classes: {
    classId: string;
    className: string;
    period: string;
    studentCount: number;
    engagementScore: number;
    pulseParticipation: number;
    assignmentCompletion: number;
    avgSentiment: number;
    discussionParticipation: number;
    ranking: 'highest' | 'high' | 'medium' | 'low' | 'lowest';
  }[];
  mostEngagedClass: {
    className: string;
    engagementScore: number;
  };
  leastEngagedClass: {
    className: string;
    engagementScore: number;
  };
  insights: string[];
  recommendations: {
    forClass: string;
    recommendation: string;
  }[];
}

// =====================================================
// MOCK DATA GENERATION
// =====================================================

/**
 * Feature 42: LTI Launch Success Rate
 */
export const getMockLTILaunchMetrics = (): LTILaunchMetrics => {
  const totalAttempts = 4523;
  const successfulLaunches = 4478;
  const failedLaunches = totalAttempts - successfulLaunches;
  const successRate = (successfulLaunches / totalAttempts) * 100;

  return {
    totalAttempts,
    successfulLaunches,
    failedLaunches,
    successRate: parseFloat(successRate.toFixed(2)),
    byUserType: [
      { userType: 'student', attempts: 3845, successRate: 99.1 },
      { userType: 'teacher', attempts: 678, successRate: 98.2 },
    ],
    byBrowser: [
      { browser: 'Chrome', attempts: 3012, successRate: 99.3 },
      { browser: 'Safari', attempts: 892, successRate: 98.7 },
      { browser: 'Firefox', attempts: 456, successRate: 98.9 },
      { browser: 'Edge', attempts: 163, successRate: 97.5 },
    ],
    byDevice: [
      { device: 'desktop', attempts: 3456, successRate: 99.2 },
      { device: 'mobile', attempts: 891, successRate: 97.8 },
      { device: 'tablet', attempts: 176, successRate: 98.3 },
    ],
    failureReasons: [
      { errorCode: 'LTI_TIMEOUT', description: 'Request timeout during LTI handshake', count: 18 },
      { errorCode: 'INVALID_SIGNATURE', description: 'OAuth signature validation failed', count: 12 },
      { errorCode: 'SESSION_EXPIRED', description: 'User session expired during launch', count: 10 },
      { errorCode: 'NETWORK_ERROR', description: 'Network connectivity issues', count: 5 },
    ],
    trend: [
      { date: '2025-11-01', successRate: 98.8, attempts: 645 },
      { date: '2025-11-02', successRate: 99.0, attempts: 672 },
      { date: '2025-11-03', successRate: 99.2, attempts: 701 },
      { date: '2025-11-04', successRate: 98.9, attempts: 688 },
      { date: '2025-11-05', successRate: 99.1, attempts: 723 },
      { date: '2025-11-06', successRate: 99.3, attempts: 556 },
      { date: '2025-11-07', successRate: 99.0, attempts: 538 },
    ],
  };
};

/**
 * Feature 43: Connected Courses Count
 */
export const getMockConnectedCoursesMetrics = (): ConnectedCoursesMetrics => {
  return {
    totalCanvasCourses: 127,
    connectedCourses: 98,
    totalEnrollments: 3456,
    activeEnrollments: 3201,
    coverageRate: 77.2,
    byDepartment: [
      { department: 'Mathematics', totalCourses: 18, connectedCourses: 16, coverageRate: 88.9 },
      { department: 'English', totalCourses: 16, connectedCourses: 14, coverageRate: 87.5 },
      { department: 'Science', totalCourses: 22, connectedCourses: 19, coverageRate: 86.4 },
      { department: 'History', totalCourses: 14, connectedCourses: 11, coverageRate: 78.6 },
      { department: 'Arts', totalCourses: 12, connectedCourses: 8, coverageRate: 66.7 },
      { department: 'Physical Education', totalCourses: 10, connectedCourses: 6, coverageRate: 60.0 },
      { department: 'Computer Science', totalCourses: 15, connectedCourses: 13, coverageRate: 86.7 },
      { department: 'Languages', totalCourses: 20, connectedCourses: 11, coverageRate: 55.0 },
    ],
    growthTrend: [
      { week: 'Week 1', newCourses: 12, cumulativeCourses: 12 },
      { week: 'Week 2', newCourses: 18, cumulativeCourses: 30 },
      { week: 'Week 3', newCourses: 15, cumulativeCourses: 45 },
      { week: 'Week 4', newCourses: 11, cumulativeCourses: 56 },
      { week: 'Week 5', newCourses: 14, cumulativeCourses: 70 },
      { week: 'Week 6', newCourses: 10, cumulativeCourses: 80 },
      { week: 'Week 7', newCourses: 8, cumulativeCourses: 88 },
      { week: 'Week 8', newCourses: 10, cumulativeCourses: 98 },
    ],
    uncoveredDepartments: [
      { department: 'Languages', coursesNotConnected: 9 },
      { department: 'Physical Education', coursesNotConnected: 4 },
      { department: 'Arts', coursesNotConnected: 4 },
      { department: 'History', coursesNotConnected: 3 },
    ],
  };
};

/**
 * Feature 44: Assignment Import Success Rate
 */
export const getMockAssignmentImportMetrics = (): AssignmentImportMetrics => {
  const totalImportAttempts = 2847;
  const successfulImports = 2701;
  const failedImports = totalImportAttempts - successfulImports;
  const successRate = (successfulImports / totalImportAttempts) * 100;

  return {
    totalImportAttempts,
    successfulImports,
    failedImports,
    successRate: parseFloat(successRate.toFixed(2)),
    failureTypes: [
      { type: 'API_TIMEOUT', description: 'Canvas API request timeout', count: 78 },
      { type: 'MALFORMED_DATA', description: 'Invalid assignment data format', count: 34 },
      { type: 'PERMISSION_ERROR', description: 'Insufficient API permissions', count: 21 },
      { type: 'RATE_LIMIT', description: 'Canvas API rate limit exceeded', count: 13 },
    ],
    coursesWithIssues: [
      { courseName: 'Advanced Calculus', failureCount: 8, lastError: 'API_TIMEOUT' },
      { courseName: 'World History AP', failureCount: 6, lastError: 'MALFORMED_DATA' },
      { courseName: 'Chemistry 101', failureCount: 5, lastError: 'PERMISSION_ERROR' },
      { courseName: 'English Literature', failureCount: 4, lastError: 'API_TIMEOUT' },
    ],
    dataCompleteness: [
      { field: 'Due Date', completeCount: 2701, missingCount: 0, completenessRate: 100 },
      { field: 'Point Value', completeCount: 2698, missingCount: 3, completenessRate: 99.9 },
      { field: 'Description', completeCount: 2645, missingCount: 56, completenessRate: 97.9 },
      { field: 'Submission Type', completeCount: 2701, missingCount: 0, completenessRate: 100 },
      { field: 'Grading Type', completeCount: 2689, missingCount: 12, completenessRate: 99.6 },
    ],
    trend: [
      { date: '2025-11-01', successRate: 94.2, attempts: 412 },
      { date: '2025-11-02', successRate: 94.8, attempts: 438 },
      { date: '2025-11-03', successRate: 95.1, attempts: 401 },
      { date: '2025-11-04', successRate: 94.6, attempts: 389 },
      { date: '2025-11-05', successRate: 95.3, attempts: 456 },
      { date: '2025-11-06', successRate: 95.7, attempts: 378 },
      { date: '2025-11-07', successRate: 95.5, attempts: 373 },
    ],
  };
};

/**
 * Feature 9: Emotional Recovery Rate
 */
export const getMockEmotionalRecoveryMetrics = (): EmotionalRecoveryMetrics => {
  return {
    totalRecoveringStudents: 87,
    recoveryRate: 12.3,
    byDepartment: [
      { department: 'Mathematics', recoveringCount: 16, recoveryRate: 14.2 },
      { department: 'Science', recoveringCount: 14, recoveryRate: 13.1 },
      { department: 'English', recoveringCount: 12, recoveryRate: 11.8 },
      { department: 'History', recoveringCount: 11, recoveryRate: 12.5 },
      { department: 'Computer Science', recoveringCount: 9, recoveryRate: 10.9 },
      { department: 'Arts', recoveringCount: 8, recoveryRate: 11.2 },
      { department: 'Languages', recoveringCount: 10, recoveryRate: 13.7 },
      { department: 'Physical Education', recoveringCount: 7, recoveryRate: 9.8 },
    ],
    byGradeLevel: [
      { gradeLevel: 9, recoveringCount: 28, recoveryRate: 15.3 },
      { gradeLevel: 10, recoveringCount: 24, recoveryRate: 13.1 },
      { gradeLevel: 11, recoveringCount: 19, recoveryRate: 10.8 },
      { gradeLevel: 12, recoveringCount: 16, recoveryRate: 9.7 },
    ],
    correlationAnalysis: {
      emotionalImprovement: 142,
      academicImprovement: 87,
      bothImproved: 74,
      overlapPercentage: 85.1,
    },
    recoveryTrajectory: [
      { timeframe: '1-2 weeks', avgDaysToRecover: 10, studentCount: 23 },
      { timeframe: '3-4 weeks', avgDaysToRecover: 24, studentCount: 34 },
      { timeframe: '5-6 weeks', avgDaysToRecover: 38, studentCount: 21 },
      { timeframe: '7+ weeks', avgDaysToRecover: 52, studentCount: 9 },
    ],
    successStories: [
      {
        studentName: 'Alex M.',
        previousGrade: 'D',
        currentGrade: 'B-',
        sentimentChange: 'Tier 2 → Tier 5',
        interventionType: 'Teacher Outreach + Counseling',
      },
      {
        studentName: 'Jordan P.',
        previousGrade: 'C-',
        currentGrade: 'B+',
        sentimentChange: 'Tier 1 → Tier 6',
        interventionType: 'Peer Tutoring',
      },
      {
        studentName: 'Sam K.',
        previousGrade: 'F',
        currentGrade: 'C',
        sentimentChange: 'Tier 1 → Tier 4',
        interventionType: 'Academic Support Plan',
      },
    ],
  };
};

/**
 * Feature 24: Sentiment After Events
 */
export const getMockSentimentAfterEventsMetrics = (): SentimentAfterEventsMetrics => {
  return {
    events: [
      {
        eventName: 'Mental Health Awareness Week',
        eventDate: '2025-10-15',
        eventType: 'wellness',
        beforeSentiment: 3.2,
        afterSentiment: 4.1,
        improvementPercentage: 28.1,
        studentsImpacted: 456,
        benefitDuration: 14,
        costEffectiveness: 92,
        topBenefitGroup: '11th Grade Students',
      },
      {
        eventName: 'Wellness Assembly',
        eventDate: '2025-10-22',
        eventType: 'wellness',
        beforeSentiment: 3.5,
        afterSentiment: 4.3,
        improvementPercentage: 22.9,
        studentsImpacted: 612,
        benefitDuration: 10,
        costEffectiveness: 88,
        topBenefitGroup: '9th Grade Students',
      },
      {
        eventName: 'Counseling Drive',
        eventDate: '2025-10-01',
        eventType: 'wellness',
        beforeSentiment: 3.1,
        afterSentiment: 3.9,
        improvementPercentage: 25.8,
        studentsImpacted: 234,
        benefitDuration: 21,
        costEffectiveness: 85,
        topBenefitGroup: '12th Grade Students',
      },
      {
        eventName: 'Midterm Break',
        eventDate: '2025-10-28',
        eventType: 'academic',
        beforeSentiment: 2.8,
        afterSentiment: 4.5,
        improvementPercentage: 60.7,
        studentsImpacted: 708,
        benefitDuration: 7,
        costEffectiveness: 95,
        topBenefitGroup: 'All Students',
      },
      {
        eventName: 'College Fair',
        eventDate: '2025-09-20',
        eventType: 'academic',
        beforeSentiment: 3.6,
        afterSentiment: 4.2,
        improvementPercentage: 16.7,
        studentsImpacted: 189,
        benefitDuration: 5,
        costEffectiveness: 72,
        topBenefitGroup: '11th & 12th Grade',
      },
      {
        eventName: 'Fall Sports Celebration',
        eventDate: '2025-11-05',
        eventType: 'social',
        beforeSentiment: 3.8,
        afterSentiment: 4.6,
        improvementPercentage: 21.1,
        studentsImpacted: 401,
        benefitDuration: 8,
        costEffectiveness: 90,
        topBenefitGroup: 'Student Athletes',
      },
    ],
    mostEffectiveInitiatives: [
      { initiative: 'Midterm Break', avgImprovement: 60.7, timesImplemented: 2 },
      { initiative: 'Mental Health Week', avgImprovement: 28.1, timesImplemented: 3 },
      { initiative: 'Counseling Drive', avgImprovement: 25.8, timesImplemented: 4 },
      { initiative: 'Wellness Assembly', avgImprovement: 22.9, timesImplemented: 5 },
      { initiative: 'Sports Celebration', avgImprovement: 21.1, timesImplemented: 2 },
    ],
    recommendations: [
      'Schedule wellness activities during Week 7-8 (historically lowest sentiment)',
      'Increase frequency of Mental Health Awareness events to quarterly',
      'Target 11th graders with additional support programs',
      'Consider mid-semester "recharge days" to prevent burnout',
    ],
  };
};

/**
 * Feature 39: Discussion Participation
 */
export const getMockDiscussionParticipationMetrics = (): DiscussionParticipationMetrics => {
  return {
    totalDiscussions: 156,
    totalPosts: 3842,
    avgPostsPerStudent: 2.8,
    participationRate: 73.4,
    avgPostLength: 187,
    replyRate: 64.2,
    byCourse: [
      { courseName: 'AP English Literature', department: 'English', avgPosts: 4.2, participationRate: 89.3 },
      { courseName: 'World History', department: 'History', avgPosts: 3.8, participationRate: 82.1 },
      { courseName: 'Biology 101', department: 'Science', avgPosts: 3.1, participationRate: 76.5 },
      { courseName: 'Algebra II', department: 'Mathematics', avgPosts: 2.4, participationRate: 68.9 },
      { courseName: 'Spanish III', department: 'Languages', avgPosts: 3.5, participationRate: 79.2 },
      { courseName: 'Computer Science Principles', department: 'Computer Science', avgPosts: 2.9, participationRate: 71.3 },
    ],
    byDepartment: [
      { department: 'English', avgPosts: 3.9, participationRate: 85.7 },
      { department: 'History', avgPosts: 3.6, participationRate: 80.4 },
      { department: 'Languages', avgPosts: 3.3, participationRate: 77.8 },
      { department: 'Science', avgPosts: 2.9, participationRate: 74.2 },
      { department: 'Computer Science', avgPosts: 2.7, participationRate: 69.5 },
      { department: 'Mathematics', avgPosts: 2.2, participationRate: 65.1 },
      { department: 'Arts', avgPosts: 3.1, participationRate: 72.8 },
    ],
    byGradeLevel: [
      { gradeLevel: 12, avgPosts: 3.4, participationRate: 81.2 },
      { gradeLevel: 11, avgPosts: 3.1, participationRate: 76.8 },
      { gradeLevel: 10, avgPosts: 2.7, participationRate: 71.3 },
      { gradeLevel: 9, avgPosts: 2.3, participationRate: 64.5 },
    ],
    qualityMetrics: {
      avgUpvotes: 3.7,
      teacherEndorsedPosts: 284,
      qualityPostPercentage: 18.9,
    },
    trend: [
      { week: 'Week 1', avgPosts: 2.1, participationRate: 68.2 },
      { week: 'Week 2', avgPosts: 2.4, participationRate: 70.5 },
      { week: 'Week 3', avgPosts: 2.7, participationRate: 72.1 },
      { week: 'Week 4', avgPosts: 2.9, participationRate: 73.8 },
      { week: 'Week 5', avgPosts: 3.1, participationRate: 75.4 },
      { week: 'Week 6', avgPosts: 2.8, participationRate: 73.9 },
      { week: 'Week 7', avgPosts: 2.6, participationRate: 72.1 },
      { week: 'Week 8', avgPosts: 2.8, participationRate: 73.4 },
    ],
  };
};

/**
 * Feature 20: AI Wellbeing Alerts Count
 */
export const getMockAIWellbeingAlertsMetrics = (): AIWellbeingAlertsMetrics => {
  return {
    totalAlertsAllTime: 1247,
    alertsThisWeek: 34,
    alertsThisMonth: 156,
    trendIndicator: 'decreasing',
    byAlertType: [
      { type: 'Persistent Low Mood', count: 487, percentage: 39.1 },
      { type: 'Sudden Mood Drop', count: 312, percentage: 25.0 },
      { type: 'High Mood Variability', count: 278, percentage: 22.3 },
      { type: 'Emotional + Academic Cross-Risk', count: 170, percentage: 13.6 },
    ],
    alertStatus: {
      reviewed: 1089,
      intervened: 892,
      resolved: 743,
      open: 158,
    },
    responseTimeMetrics: {
      avgTimeToReview: 4.2,
      avgTimeToIntervention: 18.7,
    },
    timeline: [
      { week: 'Week 1', alertCount: 42, resolvedCount: 35 },
      { week: 'Week 2', alertCount: 38, resolvedCount: 31 },
      { week: 'Week 3', alertCount: 45, resolvedCount: 38 },
      { week: 'Week 4', alertCount: 41, resolvedCount: 34 },
      { week: 'Week 5', alertCount: 37, resolvedCount: 32 },
      { week: 'Week 6', alertCount: 39, resolvedCount: 35 },
      { week: 'Week 7', alertCount: 36, resolvedCount: 31 },
      { week: 'Week 8', alertCount: 34, resolvedCount: 29 },
    ],
    departmentHeatmap: [
      { department: 'Mathematics', alertCount: 198, severity: 'high' },
      { department: 'Science', alertCount: 167, severity: 'medium' },
      { department: 'English', alertCount: 145, severity: 'medium' },
      { department: 'History', alertCount: 132, severity: 'medium' },
      { department: 'Computer Science', alertCount: 98, severity: 'low' },
      { department: 'Languages', alertCount: 112, severity: 'low' },
      { department: 'Arts', alertCount: 78, severity: 'low' },
      { department: 'Physical Education', alertCount: 56, severity: 'low' },
    ],
  };
};

/**
 * Feature 30: Alert Response Rate
 */
export const getMockAlertResponseRateMetrics = (): AlertResponseRateMetrics => {
  return {
    totalAlertsSent: 1247,
    alertsAcknowledged: 1089,
    alertsActedUpon: 892,
    alertsIgnored: 158,
    overallResponseRate: 71.5,
    avgTimeToAcknowledge: 4.2,
    avgTimeToAction: 18.7,
    byTeacher: [
      { teacherName: 'Dr. Sarah Johnson', alertsReceived: 45, responseRate: 93.3, avgResponseTime: 2.1 },
      { teacherName: 'Mr. David Chen', alertsReceived: 38, responseRate: 89.5, avgResponseTime: 3.4 },
      { teacherName: 'Ms. Emily Rodriguez', alertsReceived: 41, responseRate: 87.8, avgResponseTime: 3.8 },
      { teacherName: 'Prof. Michael Brown', alertsReceived: 52, responseRate: 84.6, avgResponseTime: 4.5 },
      { teacherName: 'Dr. Lisa Anderson', alertsReceived: 36, responseRate: 80.6, avgResponseTime: 5.2 },
      { teacherName: 'Mr. James Wilson', alertsReceived: 44, responseRate: 77.3, avgResponseTime: 6.1 },
      { teacherName: 'Ms. Jennifer Taylor', alertsReceived: 39, responseRate: 74.4, avgResponseTime: 7.3 },
      { teacherName: 'Dr. Robert Martinez', alertsReceived: 47, responseRate: 68.1, avgResponseTime: 8.9 },
      { teacherName: 'Prof. Amanda Lee', alertsReceived: 42, responseRate: 64.3, avgResponseTime: 10.2 },
      { teacherName: 'Mr. Christopher White', alertsReceived: 51, responseRate: 58.8, avgResponseTime: 12.4 },
    ],
    byDepartment: [
      { department: 'English', responseRate: 84.7, avgResponseTime: 3.2 },
      { department: 'Science', responseRate: 79.3, avgResponseTime: 4.1 },
      { department: 'Mathematics', responseRate: 76.8, avgResponseTime: 4.8 },
      { department: 'History', responseRate: 74.2, avgResponseTime: 5.3 },
      { department: 'Computer Science', responseRate: 81.5, avgResponseTime: 3.7 },
      { department: 'Languages', responseRate: 72.1, avgResponseTime: 5.9 },
      { department: 'Arts', responseRate: 68.9, avgResponseTime: 6.7 },
      { department: 'Physical Education', responseRate: 63.4, avgResponseTime: 8.1 },
    ],
    byAlertType: [
      { alertType: 'emotional', responseRate: 78.9 },
      { alertType: 'academic', responseRate: 72.3 },
      { alertType: 'behavioral', responseRate: 65.7 },
    ],
    teachersBelowTarget: [
      { teacherName: 'Prof. Amanda Lee', department: 'Arts', responseRate: 64.3 },
      { teacherName: 'Mr. Christopher White', department: 'Physical Education', responseRate: 58.8 },
      { teacherName: 'Ms. Karen Davis', department: 'Languages', responseRate: 54.2 },
      { teacherName: 'Dr. Thomas Garcia', department: 'History', responseRate: 47.6 },
    ],
  };
};

/**
 * Feature 31: High Engagement Teachers %
 */
export const getMockHighEngagementTeachersMetrics = (): HighEngagementTeachersMetrics => {
  return {
    totalTeachers: 48,
    highEngagementCount: 32,
    highEngagementPercentage: 66.7,
    criteria: {
      pulsesTarget: 80,
      completionTarget: 85,
      checkInTarget: 70,
    },
    topPerformers: [
      {
        teacherName: 'Dr. Sarah Johnson',
        department: 'English',
        pulseParticipation: 94.2,
        assignmentCompletion: 91.8,
        checkInRate: 87.3,
        overallScore: 91.1,
      },
      {
        teacherName: 'Mr. David Chen',
        department: 'Mathematics',
        pulseParticipation: 92.7,
        assignmentCompletion: 89.5,
        checkInRate: 85.1,
        overallScore: 89.1,
      },
      {
        teacherName: 'Ms. Emily Rodriguez',
        department: 'Science',
        pulseParticipation: 91.3,
        assignmentCompletion: 88.9,
        checkInRate: 84.6,
        overallScore: 88.3,
      },
      {
        teacherName: 'Prof. Michael Brown',
        department: 'History',
        pulseParticipation: 89.8,
        assignmentCompletion: 87.2,
        checkInRate: 82.7,
        overallScore: 86.6,
      },
      {
        teacherName: 'Dr. Lisa Anderson',
        department: 'Computer Science',
        pulseParticipation: 88.4,
        assignmentCompletion: 86.1,
        checkInRate: 81.3,
        overallScore: 85.3,
      },
    ],
    departmentRankings: [
      { department: 'English', highEngagementPercentage: 85.7, avgEngagementScore: 87.4 },
      { department: 'Computer Science', highEngagementPercentage: 80.0, avgEngagementScore: 84.2 },
      { department: 'Science', highEngagementPercentage: 75.0, avgEngagementScore: 82.1 },
      { department: 'Mathematics', highEngagementPercentage: 71.4, avgEngagementScore: 79.8 },
      { department: 'History', highEngagementPercentage: 66.7, avgEngagementScore: 77.3 },
      { department: 'Languages', highEngagementPercentage: 60.0, avgEngagementScore: 74.5 },
      { department: 'Arts', highEngagementPercentage: 50.0, avgEngagementScore: 68.9 },
      { department: 'Physical Education', highEngagementPercentage: 40.0, avgEngagementScore: 62.3 },
    ],
    bestPractices: [
      {
        teacherName: 'Dr. Sarah Johnson',
        strategy: 'Weekly pulse questions with personalized follow-ups',
        impact: 'Increased student engagement by 23% in one semester',
      },
      {
        teacherName: 'Mr. David Chen',
        strategy: 'Daily check-ins at start of class period',
        impact: 'Improved assignment completion rates to 91.8%',
      },
      {
        teacherName: 'Ms. Emily Rodriguez',
        strategy: 'Integration of pulse responses with lesson planning',
        impact: 'Better alignment of content with student needs',
      },
    ],
    trendData: [
      { month: 'September', percentage: 58.3 },
      { month: 'October', percentage: 62.5 },
      { month: 'November', percentage: 66.7 },
    ],
  };
};

/**
 * Feature 33: Most/Least Engaged Classes Per Teacher
 */
export const getMockTeacherClassEngagementMetrics = (teacherId?: string): TeacherClassEngagementMetrics[] => {
  // Return data for all teachers or specific teacher
  const allTeachers = [
    {
      teacher: 'Dr. Sarah Johnson',
      department: 'English',
      classes: [
        {
          classId: 'eng-101',
          className: 'AP English Literature',
          period: 'Period 2',
          studentCount: 28,
          engagementScore: 91.4,
          pulseParticipation: 94.2,
          assignmentCompletion: 92.1,
          avgSentiment: 4.3,
          discussionParticipation: 89.3,
          ranking: 'highest' as const,
        },
        {
          classId: 'eng-102',
          className: 'English 11',
          period: 'Period 4',
          studentCount: 32,
          engagementScore: 85.7,
          pulseParticipation: 88.3,
          assignmentCompletion: 86.2,
          avgSentiment: 4.1,
          discussionParticipation: 82.7,
          ranking: 'high' as const,
        },
        {
          classId: 'eng-103',
          className: 'English 10',
          period: 'Period 5',
          studentCount: 30,
          engagementScore: 78.2,
          pulseParticipation: 81.4,
          assignmentCompletion: 79.8,
          avgSentiment: 3.9,
          discussionParticipation: 73.5,
          ranking: 'medium' as const,
        },
        {
          classId: 'eng-104',
          className: 'English 9',
          period: 'Period 7',
          studentCount: 29,
          engagementScore: 71.3,
          pulseParticipation: 74.6,
          assignmentCompletion: 72.1,
          avgSentiment: 3.6,
          discussionParticipation: 67.2,
          ranking: 'lowest' as const,
        },
      ],
      mostEngagedClass: { className: 'AP English Literature', engagementScore: 91.4 },
      leastEngagedClass: { className: 'English 9', engagementScore: 71.3 },
      insights: [
        'Period 2 (AP Lit) shows 28% higher engagement than Period 7 (English 9)',
        'Senior students demonstrate significantly higher discussion participation',
        'Morning classes (Periods 2-4) outperform afternoon classes by 12%',
      ],
      recommendations: [
        {
          forClass: 'English 9 (Period 7)',
          recommendation:
            'Consider implementing interactive activities used in AP Lit class. Schedule more engaging content for afternoon period.',
        },
        {
          forClass: 'English 10 (Period 5)',
          recommendation:
            'Increase pulse frequency and personalized feedback to boost participation rates.',
        },
      ],
    },
    {
      teacher: 'Mr. David Chen',
      department: 'Mathematics',
      classes: [
        {
          classId: 'math-201',
          className: 'AP Calculus BC',
          period: 'Period 1',
          studentCount: 24,
          engagementScore: 89.2,
          pulseParticipation: 92.7,
          assignmentCompletion: 89.5,
          avgSentiment: 4.0,
          discussionParticipation: 85.3,
          ranking: 'highest' as const,
        },
        {
          classId: 'math-202',
          className: 'Algebra II',
          period: 'Period 3',
          studentCount: 31,
          engagementScore: 82.1,
          pulseParticipation: 84.9,
          assignmentCompletion: 81.7,
          avgSentiment: 3.8,
          discussionParticipation: 79.8,
          ranking: 'high' as const,
        },
        {
          classId: 'math-203',
          className: 'Geometry',
          period: 'Period 6',
          studentCount: 33,
          engagementScore: 74.6,
          pulseParticipation: 77.2,
          assignmentCompletion: 73.9,
          avgSentiment: 3.5,
          discussionParticipation: 72.8,
          ranking: 'lowest' as const,
        },
      ],
      mostEngagedClass: { className: 'AP Calculus BC', engagementScore: 89.2 },
      leastEngagedClass: { className: 'Geometry', engagementScore: 74.6 },
      insights: [
        'AP Calculus BC shows 19.6% higher engagement than Geometry',
        'Advanced classes demonstrate stronger participation patterns',
        'Period 1 morning class has best overall metrics',
      ],
      recommendations: [
        {
          forClass: 'Geometry (Period 6)',
          recommendation:
            'Adapt successful strategies from AP Calculus: daily check-ins and collaborative problem-solving.',
        },
      ],
    },
  ];

  return teacherId ? allTeachers.filter((t) => t.teacher === teacherId) : allTeachers;
};

/**
 * Main function to get all Platform Health metrics
 */
export const getAllPlatformHealthMetrics = () => {
  return {
    ltiLaunch: getMockLTILaunchMetrics(),
    connectedCourses: getMockConnectedCoursesMetrics(),
    assignmentImport: getMockAssignmentImportMetrics(),
    emotionalRecovery: getMockEmotionalRecoveryMetrics(),
    sentimentAfterEvents: getMockSentimentAfterEventsMetrics(),
    discussionParticipation: getMockDiscussionParticipationMetrics(),
    aiWellbeingAlerts: getMockAIWellbeingAlertsMetrics(),
    alertResponseRate: getMockAlertResponseRateMetrics(),
    highEngagementTeachers: getMockHighEngagementTeachersMetrics(),
    teacherClassEngagement: getMockTeacherClassEngagementMetrics(),
  };
};
