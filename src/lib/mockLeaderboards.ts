/**
 * Mock Leaderboards Data
 *
 * Provides realistic mock data for leaderboards and recognition features.
 * This supports Phase 4 - Week 4: Leaderboards & Recognition
 *
 * Usage: Set VITE_USE_LEADERBOARDS_MOCK=true in .env to use this data
 *
 * Features Supported:
 * - Feature 50: Most Engaged Teacher
 * - Feature 51: Most Engaged Student Cohorts
 * - Feature 26: Department Wellbeing Leaderboard
 */

export interface EngagedTeacherRanking {
  teacherId: string;
  teacherName: string;
  department: string;
  rank: number;
  engagementScore: number; // 0-100 scale
  metrics: {
    classPulsesCreated: number;
    hapiMomentsSent: number;
    averageResponseTime: number; // hours
    officeHoursOffered: number;
    studentSentimentImprovement: number; // percentage
  };
  strengths: string[];
  bestPractices: string[];
  monthlyTrend: 'improving' | 'stable' | 'declining';
  badgeEarned?: 'Teacher of the Month' | 'Rising Star' | 'Consistent Champion';
}

export interface StudentCohortRanking {
  cohortId: string;
  cohortName: string;
  cohortType: 'grade' | 'department' | 'class';
  rank: number;
  engagementScore: number; // 0-100 scale
  studentCount: number;
  metrics: {
    pulseCompletionRate: number;
    classPulseParticipation: number;
    hapiMomentsExchanged: number;
    assignmentCompletionRate: number;
    averageSentiment: number;
  };
  bestPractices: string[];
  monthlyTrend: 'improving' | 'stable' | 'declining';
  recognitionBadge?: string;
}

export interface DepartmentWellbeingRanking {
  department: string;
  rank: number;
  wellbeingScore: number; // 0-100 scale
  metrics: {
    averageSentiment: number;
    sentimentStability: number; // low variance = high stability
    atRiskPercentage: number;
    engagementRate: number;
    supportResourceUsage: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  trendPercentage: number;
  strengths: string[];
  areasForImprovement: string[];
  recognitionLevel: 'top5' | 'bottom5' | 'middle';
}

// Feature 50: Most Engaged Teachers (Top 10)
export const mockEngagedTeacherRankings: EngagedTeacherRanking[] = [
  {
    teacherId: 't001',
    teacherName: 'Prof. Sarah Anderson',
    department: 'Computer Science',
    rank: 1,
    engagementScore: 96,
    metrics: {
      classPulsesCreated: 42,
      hapiMomentsSent: 87,
      averageResponseTime: 2.3,
      officeHoursOffered: 12,
      studentSentimentImprovement: 26.8
    },
    strengths: [
      'Exceptional pulse question quality',
      'Rapid student communication',
      'High peer recognition activity',
      'Extended office hours availability'
    ],
    bestPractices: [
      'Weekly themed class pulses (e.g., "Mindful Mondays", "Feedback Fridays")',
      'Uses Hapi Moments to celebrate student achievements publicly',
      'Offers virtual and in-person office hours for flexibility',
      'Responds to student questions within 2-3 hours on average',
      'Implements peer programming sessions that boost collaboration'
    ],
    monthlyTrend: 'improving',
    badgeEarned: 'Teacher of the Month'
  },
  {
    teacherId: 't002',
    teacherName: 'Dr. Michael Roberts',
    department: 'Biology',
    rank: 2,
    engagementScore: 94,
    metrics: {
      classPulsesCreated: 38,
      hapiMomentsSent: 76,
      averageResponseTime: 3.1,
      officeHoursOffered: 10,
      studentSentimentImprovement: 25.6
    },
    strengths: [
      'Creative pulse questions',
      'Strong student mentorship',
      'Active Hapi Moments participation',
      'Consistent communication'
    ],
    bestPractices: [
      'Integrates real-world biology applications into class discussions',
      'Creates study group matching based on student learning styles',
      'Uses virtual lab simulations to enhance understanding',
      'Sends encouraging Hapi Moments before major exams',
      'Maintains open-door policy with structured drop-in times'
    ],
    monthlyTrend: 'stable',
    badgeEarned: 'Rising Star'
  },
  {
    teacherId: 't003',
    teacherName: 'Prof. Jennifer Lee',
    department: 'Business',
    rank: 3,
    engagementScore: 92,
    metrics: {
      classPulsesCreated: 35,
      hapiMomentsSent: 68,
      averageResponseTime: 3.8,
      officeHoursOffered: 9,
      studentSentimentImprovement: 21.4
    },
    strengths: [
      'Industry-relevant content',
      'High student engagement',
      'Effective group facilitation',
      'Real-world case studies'
    ],
    bestPractices: [
      'Brings in guest speakers from industry for authentic learning',
      'Facilitates collaborative group projects with real business scenarios',
      'Uses class pulses to gauge understanding and adjust teaching pace',
      'Recognizes student effort through targeted Hapi Moments',
      'Provides detailed feedback on assignments within 48 hours'
    ],
    monthlyTrend: 'improving',
    badgeEarned: 'Consistent Champion'
  },
  {
    teacherId: 't004',
    teacherName: 'Dr. David Martinez',
    department: 'Psychology',
    rank: 4,
    engagementScore: 90,
    metrics: {
      classPulsesCreated: 40,
      hapiMomentsSent: 82,
      averageResponseTime: 4.2,
      officeHoursOffered: 8,
      studentSentimentImprovement: 19.0
    },
    strengths: [
      'Frequent check-ins',
      'High Hapi Moments activity',
      'Thoughtful pulse design',
      'Student wellbeing focus'
    ],
    bestPractices: [
      'Uses pulse checks to identify students needing extra support',
      'Incorporates mindfulness activities into class routine',
      'Creates psychologically safe classroom environment',
      'Offers research participation opportunities for hands-on learning',
      'Sends personalized Hapi Moments acknowledging individual growth'
    ],
    monthlyTrend: 'stable'
  },
  {
    teacherId: 't005',
    teacherName: 'Prof. Elizabeth Thompson',
    department: 'English Literature',
    rank: 5,
    engagementScore: 89,
    metrics: {
      classPulsesCreated: 33,
      hapiMomentsSent: 71,
      averageResponseTime: 4.5,
      officeHoursOffered: 8,
      studentSentimentImprovement: 17.1
    },
    strengths: [
      'Creative assignments',
      'Strong peer collaboration',
      'Excellent feedback quality',
      'Cultural enrichment activities'
    ],
    bestPractices: [
      'Organizes theater trips to enhance literary understanding',
      'Implements peer review workshops for collaborative learning',
      'Uses class pulses for reflective writing prompts',
      'Celebrates student writing through public readings',
      'Provides detailed narrative feedback on essays'
    ],
    monthlyTrend: 'stable'
  },
  {
    teacherId: 't006',
    teacherName: 'Dr. James Wilson',
    department: 'Computer Science',
    rank: 6,
    engagementScore: 87,
    metrics: {
      classPulsesCreated: 31,
      hapiMomentsSent: 58,
      averageResponseTime: 5.1,
      officeHoursOffered: 10,
      studentSentimentImprovement: 17.5
    },
    strengths: [
      'Technical depth',
      'Extended office hours',
      'Practical coding projects',
      'Algorithm visualization'
    ],
    bestPractices: [
      'Uses algorithm visualization tools for complex concepts',
      'Hosts coding challenge workshops for skill-building',
      'Offers extended lab hours during project weeks',
      'Creates peer mentoring pairs (advanced + beginner students)',
      'Uses real coding problems from industry in assignments'
    ],
    monthlyTrend: 'improving'
  },
  {
    teacherId: 't007',
    teacherName: 'Prof. Linda Chen',
    department: 'Mathematics',
    rank: 7,
    engagementScore: 85,
    metrics: {
      classPulsesCreated: 29,
      hapiMomentsSent: 54,
      averageResponseTime: 5.8,
      officeHoursOffered: 9,
      studentSentimentImprovement: 15.4
    },
    strengths: [
      'Supplemental instruction',
      'Problem-solving focus',
      'Video resource library',
      'Step-by-step explanations'
    ],
    bestPractices: [
      'Creates video lecture library for asynchronous learning',
      'Conducts problem-solving workshops before exams',
      'Uses class pulses to identify difficult concepts',
      'Offers supplemental instruction sessions (SI)',
      'Provides worked examples with detailed explanations'
    ],
    monthlyTrend: 'stable'
  },
  {
    teacherId: 't008',
    teacherName: 'Dr. Robert Davis',
    department: 'History',
    rank: 8,
    engagementScore: 83,
    metrics: {
      classPulsesCreated: 27,
      hapiMomentsSent: 49,
      averageResponseTime: 6.2,
      officeHoursOffered: 7,
      studentSentimentImprovement: 15.0
    },
    strengths: [
      'Primary source analysis',
      'Engaging discussions',
      'Field trip organization',
      'Historical context building'
    ],
    bestPractices: [
      'Leads primary source analysis workshops',
      'Organizes museum field trips for authentic learning',
      'Facilitates Socratic seminars and debates',
      'Uses historical documentaries to supplement lectures',
      'Encourages student-led research presentations'
    ],
    monthlyTrend: 'stable'
  },
  {
    teacherId: 't009',
    teacherName: 'Prof. Maria Garcia',
    department: 'Chemistry',
    rank: 9,
    engagementScore: 81,
    metrics: {
      classPulsesCreated: 26,
      hapiMomentsSent: 45,
      averageResponseTime: 6.8,
      officeHoursOffered: 8,
      studentSentimentImprovement: 12.8
    },
    strengths: [
      'Hands-on lab experiences',
      'Tutoring center support',
      'Molecular modeling',
      'Safety-first approach'
    ],
    bestPractices: [
      'Provides additional lab sessions for practice',
      'Uses molecular modeling software for visualization',
      'Connects with chemistry tutoring center for student support',
      'Implements safety protocols with student engagement',
      'Creates lab report templates to guide student work'
    ],
    monthlyTrend: 'improving'
  },
  {
    teacherId: 't010',
    teacherName: 'Dr. Thomas Brown',
    department: 'Business',
    rank: 10,
    engagementScore: 80,
    metrics: {
      classPulsesCreated: 25,
      hapiMomentsSent: 43,
      averageResponseTime: 7.1,
      officeHoursOffered: 7,
      studentSentimentImprovement: 11.4
    },
    strengths: [
      'Industry partnerships',
      'Data analytics focus',
      'Career networking',
      'Practical applications'
    ],
    bestPractices: [
      'Partners with local businesses for real-world projects',
      'Hosts career networking events and panels',
      'Teaches data analytics with current industry tools',
      'Uses case competitions to motivate students',
      'Invites alumni to share career journeys'
    ],
    monthlyTrend: 'stable'
  },
];

// Feature 51: Most Engaged Student Cohorts (Top 10)
export const mockStudentCohortRankings: StudentCohortRanking[] = [
  {
    cohortId: 'cs101-001',
    cohortName: 'CS 101 - Intro to Programming (Prof. Anderson)',
    cohortType: 'class',
    rank: 1,
    engagementScore: 94,
    studentCount: 45,
    metrics: {
      pulseCompletionRate: 0.96,
      classPulseParticipation: 0.94,
      hapiMomentsExchanged: 287,
      assignmentCompletionRate: 0.95,
      averageSentiment: 5.2
    },
    bestPractices: [
      'Formed self-organized study groups that meet 3x/week',
      'Active peer programming partnerships',
      'Created class Discord server for 24/7 support',
      'Weekly coding challenges with leaderboard gamification',
      'Celebrates each other\'s successes through Hapi Moments'
    ],
    monthlyTrend: 'improving',
    recognitionBadge: 'Most Engaged Class'
  },
  {
    cohortId: 'grade-junior',
    cohortName: 'Junior Class (Year 3)',
    cohortType: 'grade',
    rank: 2,
    engagementScore: 91,
    studentCount: 156,
    metrics: {
      pulseCompletionRate: 0.93,
      classPulseParticipation: 0.90,
      hapiMomentsExchanged: 1243,
      assignmentCompletionRate: 0.92,
      averageSentiment: 4.8
    },
    bestPractices: [
      'Cross-departmental study groups and peer tutoring networks',
      'Leadership in student government and campus organizations',
      'High participation in Hapi Moments culture-building',
      'Strong class identity and social cohesion',
      'Mentors freshmen and sophomores through transition programs'
    ],
    monthlyTrend: 'stable',
    recognitionBadge: 'Most Spirited Grade'
  },
  {
    cohortId: 'dept-bio',
    cohortName: 'Biology Department',
    cohortType: 'department',
    rank: 3,
    engagementScore: 89,
    studentCount: 94,
    metrics: {
      pulseCompletionRate: 0.91,
      classPulseParticipation: 0.88,
      hapiMomentsExchanged: 876,
      assignmentCompletionRate: 0.90,
      averageSentiment: 4.7
    },
    bestPractices: [
      'Department-wide study sessions before major exams',
      'Collaborative lab group culture',
      'Active participation in research opportunities',
      'Strong peer support for challenging courses (Organic Chem, etc.)',
      'Biology club organizes academic and social events'
    ],
    monthlyTrend: 'improving',
    recognitionBadge: 'Most Collaborative Department'
  },
  {
    cohortId: 'bus301-001',
    cohortName: 'BUS 301 - Marketing Strategies (Prof. Lee)',
    cohortType: 'class',
    rank: 4,
    engagementScore: 88,
    studentCount: 52,
    metrics: {
      pulseCompletionRate: 0.92,
      classPulseParticipation: 0.89,
      hapiMomentsExchanged: 318,
      assignmentCompletionRate: 0.91,
      averageSentiment: 5.1
    },
    bestPractices: [
      'Group projects with rotating leadership roles',
      'Peer feedback culture on presentations',
      'Networking events organized by students',
      'Case study discussion groups outside class',
      'LinkedIn learning group for professional development'
    ],
    monthlyTrend: 'stable',
    recognitionBadge: 'Most Innovative Class'
  },
  {
    cohortId: 'grade-senior',
    cohortName: 'Senior Class (Year 4)',
    cohortType: 'grade',
    rank: 5,
    engagementScore: 86,
    studentCount: 142,
    metrics: {
      pulseCompletionRate: 0.89,
      classPulseParticipation: 0.86,
      hapiMomentsExchanged: 1087,
      assignmentCompletionRate: 0.88,
      averageSentiment: 4.6
    },
    bestPractices: [
      'Senior mentorship program for younger students',
      'Capstone project collaboration and support',
      'Graduate school preparation study groups',
      'Career fair organization and participation',
      'Legacy-building initiatives and traditions'
    ],
    monthlyTrend: 'stable',
    recognitionBadge: 'Outstanding Leadership'
  },
  {
    cohortId: 'psy201-001',
    cohortName: 'PSY 201 - Developmental Psychology (Dr. Martinez)',
    cohortType: 'class',
    rank: 6,
    engagementScore: 85,
    studentCount: 41,
    metrics: {
      pulseCompletionRate: 0.90,
      classPulseParticipation: 0.87,
      hapiMomentsExchanged: 276,
      assignmentCompletionRate: 0.89,
      averageSentiment: 5.0
    },
    bestPractices: [
      'Reflective discussion circles after lectures',
      'Research participation buddy system',
      'Class book club for supplemental reading',
      'Mindfulness practice before exams',
      'Peer support for research paper writing'
    ],
    monthlyTrend: 'improving',
    recognitionBadge: 'Most Supportive Class'
  },
  {
    cohortId: 'dept-cs',
    cohortName: 'Computer Science Department',
    cohortType: 'department',
    rank: 7,
    engagementScore: 84,
    studentCount: 108,
    metrics: {
      pulseCompletionRate: 0.88,
      classPulseParticipation: 0.85,
      hapiMomentsExchanged: 943,
      assignmentCompletionRate: 0.87,
      averageSentiment: 4.5
    },
    bestPractices: [
      'Hackathon culture and coding competitions',
      'Open-source project collaboration',
      'CS club weekly workshops and guest speakers',
      'Peer code review partnerships',
      'Study rooms reserved for collaborative coding'
    ],
    monthlyTrend: 'stable',
    recognitionBadge: 'Tech Innovators'
  },
  {
    cohortId: 'dept-business',
    cohortName: 'Business Department',
    cohortType: 'department',
    rank: 8,
    engagementScore: 83,
    studentCount: 117,
    metrics: {
      pulseCompletionRate: 0.87,
      classPulseParticipation: 0.84,
      hapiMomentsExchanged: 821,
      assignmentCompletionRate: 0.86,
      averageSentiment: 4.6
    },
    bestPractices: [
      'Business case competition teams',
      'Professional networking events',
      'Entrepreneurship club with pitch competitions',
      'Alumni mentorship program',
      'Industry guest speaker series'
    ],
    monthlyTrend: 'improving',
    recognitionBadge: 'Future Business Leaders'
  },
  {
    cohortId: 'grade-sophomore',
    cohortName: 'Sophomore Class (Year 2)',
    cohortType: 'grade',
    rank: 9,
    engagementScore: 82,
    studentCount: 168,
    metrics: {
      pulseCompletionRate: 0.86,
      classPulseParticipation: 0.83,
      hapiMomentsExchanged: 1134,
      assignmentCompletionRate: 0.85,
      averageSentiment: 4.5
    },
    bestPractices: [
      'Sophomore success workshops on study skills',
      'Major declaration support groups',
      'Class bonding events and traditions',
      'Peer tutoring for foundational courses',
      'Active participation in campus activities'
    ],
    monthlyTrend: 'stable',
    recognitionBadge: 'Rising Stars'
  },
  {
    cohortId: 'eng201-003',
    cohortName: 'ENG 201 - Shakespeare Studies (Prof. Thompson)',
    cohortType: 'class',
    rank: 10,
    engagementScore: 81,
    studentCount: 35,
    metrics: {
      pulseCompletionRate: 0.86,
      classPulseParticipation: 0.84,
      hapiMomentsExchanged: 198,
      assignmentCompletionRate: 0.85,
      averageSentiment: 4.8
    },
    bestPractices: [
      'Reading group discussions outside class',
      'Theater performance attendance as a group',
      'Peer review workshops for essays',
      'Creative performance projects',
      'Literary analysis study sessions'
    ],
    monthlyTrend: 'stable',
    recognitionBadge: 'Literary Excellence'
  },
];

// Feature 26: Department Wellbeing Leaderboard
export const mockDepartmentWellbeingRankings: DepartmentWellbeingRanking[] = [
  {
    department: 'English Literature',
    rank: 1,
    wellbeingScore: 92,
    metrics: {
      averageSentiment: 4.8,
      sentimentStability: 0.91,
      atRiskPercentage: 3.2,
      engagementRate: 0.91,
      supportResourceUsage: 0.68
    },
    trend: 'stable',
    trendPercentage: 0.5,
    strengths: [
      'Consistently high student satisfaction',
      'Low sentiment variance (stable positive mood)',
      'Minimal at-risk students',
      'Strong peer support culture'
    ],
    areasForImprovement: [],
    recognitionLevel: 'top5'
  },
  {
    department: 'Arts',
    rank: 2,
    wellbeingScore: 90,
    metrics: {
      averageSentiment: 5.0,
      sentimentStability: 0.89,
      atRiskPercentage: 2.8,
      engagementRate: 0.93,
      supportResourceUsage: 0.72
    },
    trend: 'improving',
    trendPercentage: 1.2,
    strengths: [
      'Highest average sentiment across all departments',
      'Extremely high engagement',
      'Lowest at-risk percentage',
      'Creative and supportive environment'
    ],
    areasForImprovement: [],
    recognitionLevel: 'top5'
  },
  {
    department: 'Psychology',
    rank: 3,
    wellbeingScore: 88,
    metrics: {
      averageSentiment: 4.7,
      sentimentStability: 0.88,
      atRiskPercentage: 4.1,
      engagementRate: 0.89,
      supportResourceUsage: 0.75
    },
    trend: 'stable',
    trendPercentage: 0.3,
    strengths: [
      'High sentiment and stability',
      'Excellent support resource utilization',
      'Strong mental health awareness',
      'Proactive wellbeing culture'
    ],
    areasForImprovement: [],
    recognitionLevel: 'top5'
  },
  {
    department: 'Computer Science',
    rank: 4,
    wellbeingScore: 85,
    metrics: {
      averageSentiment: 4.5,
      sentimentStability: 0.84,
      atRiskPercentage: 6.8,
      engagementRate: 0.87,
      supportResourceUsage: 0.71
    },
    trend: 'improving',
    trendPercentage: 2.9,
    strengths: [
      'Rapid improvement trajectory',
      'High engagement and collaboration',
      'Strong peer support networks',
      'Innovative teaching approaches'
    ],
    areasForImprovement: [
      'Continue monitoring at-risk students (6.8% slightly elevated)',
      'Maintain current improvement momentum'
    ],
    recognitionLevel: 'top5'
  },
  {
    department: 'Business',
    rank: 5,
    wellbeingScore: 84,
    metrics: {
      averageSentiment: 4.6,
      sentimentStability: 0.86,
      atRiskPercentage: 5.2,
      engagementRate: 0.86,
      supportResourceUsage: 0.65
    },
    trend: 'improving',
    trendPercentage: 2.8,
    strengths: [
      'Strong improvement in engagement',
      'Good sentiment stability',
      'Innovative programs (case studies, guest speakers)',
      'Professional development focus'
    ],
    areasForImprovement: [
      'Increase support resource awareness and usage'
    ],
    recognitionLevel: 'top5'
  },
  {
    department: 'Biology',
    rank: 6,
    wellbeingScore: 82,
    metrics: {
      averageSentiment: 4.4,
      sentimentStability: 0.82,
      atRiskPercentage: 7.5,
      engagementRate: 0.85,
      supportResourceUsage: 0.69
    },
    trend: 'improving',
    trendPercentage: 3.2,
    strengths: [
      'Highest improvement rate (3.2%)',
      'Lab simulations boosting understanding',
      'Strong study group culture',
      'Good support resource usage'
    ],
    areasForImprovement: [
      'Continue reducing at-risk percentage',
      'Maintain improvement momentum'
    ],
    recognitionLevel: 'middle'
  },
  {
    department: 'History',
    rank: 7,
    wellbeingScore: 78,
    metrics: {
      averageSentiment: 4.2,
      sentimentStability: 0.80,
      atRiskPercentage: 8.9,
      engagementRate: 0.80,
      supportResourceUsage: 0.58
    },
    trend: 'declining',
    trendPercentage: -1.5,
    strengths: [
      'Engaging teaching methods (discussions, field trips)',
      'Strong faculty commitment',
      'Rich academic content'
    ],
    areasForImprovement: [
      'Address declining trend in upper-level courses',
      'Increase support resource utilization',
      'Reduce at-risk student percentage',
      'Boost engagement in advanced seminars'
    ],
    recognitionLevel: 'middle'
  },
  {
    department: 'Mathematics',
    rank: 8,
    wellbeingScore: 75,
    metrics: {
      averageSentiment: 4.0,
      sentimentStability: 0.76,
      atRiskPercentage: 11.2,
      engagementRate: 0.74,
      supportResourceUsage: 0.62
    },
    trend: 'declining',
    trendPercentage: -1.6,
    strengths: [
      'Dedicated teaching staff',
      'Supplemental instruction programs',
      'Problem-solving workshops'
    ],
    areasForImprovement: [
      'Critical: Address declining trend and elevated at-risk %',
      'Increase office hours attendance (down 15% in upper-level)',
      'Enhance support for advanced mathematics courses',
      'Implement peer tutoring expansion',
      'Improve sentiment stability'
    ],
    recognitionLevel: 'bottom5'
  },
  {
    department: 'Chemistry',
    rank: 9,
    wellbeingScore: 73,
    metrics: {
      averageSentiment: 3.9,
      sentimentStability: 0.74,
      atRiskPercentage: 12.5,
      engagementRate: 0.76,
      supportResourceUsage: 0.64
    },
    trend: 'declining',
    trendPercentage: -1.0,
    strengths: [
      'Strong lab experiences',
      'Safety-conscious environment',
      'Tutoring center support available'
    ],
    areasForImprovement: [
      'Critical: Highest at-risk percentage (12.5%)',
      'Address Organic Chemistry II challenges (lab report completion down 12%)',
      'Increase TA support for labs',
      'Enhance engagement strategies',
      'Improve sentiment and stability scores'
    ],
    recognitionLevel: 'bottom5'
  },
];

// Helper functions
export function getTopTeachers(limit: number = 10): EngagedTeacherRanking[] {
  return mockEngagedTeacherRankings.slice(0, limit);
}

export function getTeacherOfTheMonth(): EngagedTeacherRanking | null {
  return mockEngagedTeacherRankings.find((t) => t.badgeEarned === 'Teacher of the Month') || null;
}

export function getTopCohorts(limit: number = 10): StudentCohortRanking[] {
  return mockStudentCohortRankings.slice(0, limit);
}

export function getCohortsByType(type: 'grade' | 'department' | 'class'): StudentCohortRanking[] {
  return mockStudentCohortRankings.filter((c) => c.cohortType === type);
}

export function getTopDepartments(limit: number = 5): DepartmentWellbeingRanking[] {
  return mockDepartmentWellbeingRankings
    .filter((d) => d.recognitionLevel === 'top5')
    .slice(0, limit);
}

export function getBottomDepartments(limit: number = 5): DepartmentWellbeingRanking[] {
  return mockDepartmentWellbeingRankings
    .filter((d) => d.recognitionLevel === 'bottom5')
    .slice(0, limit);
}

export function getDepartmentsByTrend(trend: 'improving' | 'stable' | 'declining'): DepartmentWellbeingRanking[] {
  return mockDepartmentWellbeingRankings.filter((d) => d.trend === trend);
}
