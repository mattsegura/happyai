/**
 * Mock Sentiment Data for Admin Sentiment Monitoring
 *
 * Used when VITE_USE_SENTIMENT_MOCK=true (or no real pulse_checks data exists)
 */

export interface MockSentimentStats {
  totalCheckIns: number;
  averageSentiment: number;
  positiveTrend: boolean;
  alertCount: number;
}

export interface MockEmotionDistribution {
  emotion: string;
  count: number;
  percentage: number;
  sentimentValue: number;
}

export interface MockStudentAlert {
  id: string;
  name: string;
  email: string;
  lastEmotion: string;
  sentiment: number;
  checkInDate: string;
  consecutiveLow: number;
}

// Check if sentiment mock is enabled
export const isSentimentMockEnabled = () => {
  return import.meta.env.VITE_USE_SENTIMENT_MOCK !== 'false';
};

// Overall sentiment stats
export const mockSentimentStats: MockSentimentStats = {
  totalCheckIns: 4523,
  averageSentiment: 4.2,
  positiveTrend: true,
  alertCount: 42,
};

// Emotion distribution (last 30 days)
export const mockEmotionDistribution: MockEmotionDistribution[] = [
  {
    emotion: 'Happy',
    count: 1256,
    percentage: 27.8,
    sentimentValue: 6,
  },
  {
    emotion: 'Content',
    count: 982,
    percentage: 21.7,
    sentimentValue: 4,
  },
  {
    emotion: 'Hopeful',
    count: 734,
    percentage: 16.2,
    sentimentValue: 5,
  },
  {
    emotion: 'Tired',
    count: 589,
    percentage: 13.0,
    sentimentValue: 3,
  },
  {
    emotion: 'Peaceful',
    count: 456,
    percentage: 10.1,
    sentimentValue: 4,
  },
  {
    emotion: 'Worried',
    count: 312,
    percentage: 6.9,
    sentimentValue: 2,
  },
  {
    emotion: 'Frustrated',
    count: 194,
    percentage: 4.3,
    sentimentValue: 2,
  },
];

// Students needing attention (low sentiment)
export const mockStudentAlerts: MockStudentAlert[] = [
  {
    id: '1',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@school.edu',
    lastEmotion: 'Sad',
    sentiment: 1,
    checkInDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    consecutiveLow: 5,
  },
  {
    id: '2',
    name: 'Marcus Chen',
    email: 'marcus.chen@school.edu',
    lastEmotion: 'Worried',
    sentiment: 2,
    checkInDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    consecutiveLow: 3,
  },
  {
    id: '3',
    name: 'Sophia Patel',
    email: 'sophia.patel@school.edu',
    lastEmotion: 'Frustrated',
    sentiment: 2,
    checkInDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    consecutiveLow: 4,
  },
  {
    id: '4',
    name: 'James Anderson',
    email: 'james.anderson@school.edu',
    lastEmotion: 'Lonely',
    sentiment: 1,
    checkInDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    consecutiveLow: 7,
  },
  {
    id: '5',
    name: 'Olivia Martinez',
    email: 'olivia.martinez@school.edu',
    lastEmotion: 'Nervous',
    sentiment: 2,
    checkInDate: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    consecutiveLow: 2,
  },
  {
    id: '6',
    name: 'Liam Thompson',
    email: 'liam.thompson@school.edu',
    lastEmotion: 'Worried',
    sentiment: 2,
    checkInDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    consecutiveLow: 3,
  },
  {
    id: '7',
    name: 'Ava Wilson',
    email: 'ava.wilson@school.edu',
    lastEmotion: 'Sad',
    sentiment: 1,
    checkInDate: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
    consecutiveLow: 6,
  },
  {
    id: '8',
    name: 'Noah Garcia',
    email: 'noah.garcia@school.edu',
    lastEmotion: 'Frustrated',
    sentiment: 2,
    checkInDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    consecutiveLow: 4,
  },
  {
    id: '9',
    name: 'Isabella Brown',
    email: 'isabella.brown@school.edu',
    lastEmotion: 'Worried',
    sentiment: 2,
    checkInDate: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago
    consecutiveLow: 2,
  },
  {
    id: '10',
    name: 'Ethan Davis',
    email: 'ethan.davis@school.edu',
    lastEmotion: 'Lonely',
    sentiment: 1,
    checkInDate: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22 hours ago
    consecutiveLow: 5,
  },
];

// Department-specific sentiment (for filtering)
export const mockDepartmentSentiment = {
  mathematics: { avgSentiment: 3.8, totalCheckIns: 856, alertCount: 12 },
  science: { avgSentiment: 4.1, totalCheckIns: 734, alertCount: 8 },
  english: { avgSentiment: 4.4, totalCheckIns: 923, alertCount: 5 },
  history: { avgSentiment: 4.2, totalCheckIns: 612, alertCount: 6 },
  arts: { avgSentiment: 4.7, totalCheckIns: 489, alertCount: 3 },
  physical_education: { avgSentiment: 4.8, totalCheckIns: 356, alertCount: 2 },
  technology: { avgSentiment: 4.0, totalCheckIns: 312, alertCount: 4 },
  languages: { avgSentiment: 4.3, totalCheckIns: 241, alertCount: 2 },
};

// Grade level sentiment (for filtering)
export const mockGradeLevelSentiment = {
  9: { avgSentiment: 4.3, totalCheckIns: 1145, alertCount: 8 },
  10: { avgSentiment: 4.1, totalCheckIns: 1089, alertCount: 10 },
  11: { avgSentiment: 3.7, totalCheckIns: 1234, alertCount: 15 },
  12: { avgSentiment: 4.5, totalCheckIns: 1055, alertCount: 9 },
};

// Historical trend data (for trend indicator)
export const mockHistoricalSentiment = {
  currentPeriod: 4.2,
  previousPeriod: 4.0,
  twoPeriodsAgo: 3.9,
  trend: 'improving' as 'improving' | 'stable' | 'declining',
};

// Filter mock data by department
export function getMockSentimentByDepartment(department?: string) {
  if (!department || department === 'all') {
    return mockSentimentStats;
  }

  const deptData = mockDepartmentSentiment[department as keyof typeof mockDepartmentSentiment];
  if (!deptData) return mockSentimentStats;

  return {
    totalCheckIns: deptData.totalCheckIns,
    averageSentiment: deptData.avgSentiment,
    positiveTrend: deptData.avgSentiment >= 4.0,
    alertCount: deptData.alertCount,
  };
}

// Filter mock data by grade level
export function getMockSentimentByGradeLevel(gradeLevel?: string) {
  if (!gradeLevel || gradeLevel === 'all') {
    return mockSentimentStats;
  }

  const gradeLevelNum = parseInt(gradeLevel) as 9 | 10 | 11 | 12;
  const gradeLevelData = mockGradeLevelSentiment[gradeLevelNum];
  if (!gradeLevelData) return mockSentimentStats;

  return {
    totalCheckIns: gradeLevelData.totalCheckIns,
    averageSentiment: gradeLevelData.avgSentiment,
    positiveTrend: gradeLevelData.avgSentiment >= 4.0,
    alertCount: gradeLevelData.alertCount,
  };
}

// Get emotion distribution (can be filtered later if needed)
export function getMockEmotionDistribution() {
  return mockEmotionDistribution;
}

// Get student alerts (can be filtered by count)
export function getMockStudentAlerts(limit: number = 10) {
  return mockStudentAlerts.slice(0, limit);
}
