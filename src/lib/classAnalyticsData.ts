import { StaticClassSentimentDataPoint } from './staticAnalyticsData';

const CLASS_SPECIFIC_WEEK_DATA: Record<string, StaticClassSentimentDataPoint[]> = {
  'class-1': [
    { date: '2025-10-13', avgSentiment: 4.2, studentCount: 22 },
    { date: '2025-10-14', avgSentiment: 4.5, studentCount: 24 },
    { date: '2025-10-15', avgSentiment: 4.3, studentCount: 23 },
    { date: '2025-10-16', avgSentiment: 4.0, studentCount: 21 },
    { date: '2025-10-17', avgSentiment: 4.4, studentCount: 23 },
    { date: '2025-10-18', avgSentiment: 4.6, studentCount: 24 },
    { date: '2025-10-19', avgSentiment: 4.5, studentCount: 24 },
  ],
  'class-2': [
    { date: '2025-10-13', avgSentiment: 4.0, studentCount: 19 },
    { date: '2025-10-14', avgSentiment: 4.2, studentCount: 21 },
    { date: '2025-10-15', avgSentiment: 4.1, studentCount: 20 },
    { date: '2025-10-16', avgSentiment: 3.9, studentCount: 19 },
    { date: '2025-10-17', avgSentiment: 4.3, studentCount: 21 },
    { date: '2025-10-18', avgSentiment: 4.5, studentCount: 22 },
    { date: '2025-10-19', avgSentiment: 4.4, studentCount: 22 },
  ],
  'class-3': [
    { date: '2025-10-13', avgSentiment: 4.3, studentCount: 18 },
    { date: '2025-10-14', avgSentiment: 4.4, studentCount: 20 },
    { date: '2025-10-15', avgSentiment: 4.5, studentCount: 19 },
    { date: '2025-10-16', avgSentiment: 4.2, studentCount: 18 },
    { date: '2025-10-17', avgSentiment: 4.6, studentCount: 20 },
    { date: '2025-10-18', avgSentiment: 4.7, studentCount: 20 },
    { date: '2025-10-19', avgSentiment: 4.6, studentCount: 20 },
  ],
};

const CLASS_SPECIFIC_2WEEK_DATA: Record<string, StaticClassSentimentDataPoint[]> = {
  'class-1': [
    { date: '2025-10-06', avgSentiment: 3.9, studentCount: 22 },
    { date: '2025-10-07', avgSentiment: 4.0, studentCount: 23 },
    { date: '2025-10-08', avgSentiment: 4.2, studentCount: 24 },
    { date: '2025-10-09', avgSentiment: 4.5, studentCount: 24 },
    { date: '2025-10-10', avgSentiment: 4.6, studentCount: 23 },
    { date: '2025-10-11', avgSentiment: 4.4, studentCount: 22 },
    { date: '2025-10-12', avgSentiment: 4.3, studentCount: 23 },
    { date: '2025-10-13', avgSentiment: 4.2, studentCount: 22 },
    { date: '2025-10-14', avgSentiment: 4.5, studentCount: 24 },
    { date: '2025-10-15', avgSentiment: 4.3, studentCount: 23 },
    { date: '2025-10-16', avgSentiment: 4.0, studentCount: 21 },
    { date: '2025-10-17', avgSentiment: 4.4, studentCount: 23 },
    { date: '2025-10-18', avgSentiment: 4.6, studentCount: 24 },
    { date: '2025-10-19', avgSentiment: 4.5, studentCount: 24 },
  ],
  'class-2': [
    { date: '2025-10-06', avgSentiment: 3.8, studentCount: 19 },
    { date: '2025-10-07', avgSentiment: 3.9, studentCount: 20 },
    { date: '2025-10-08', avgSentiment: 4.1, studentCount: 21 },
    { date: '2025-10-09', avgSentiment: 4.4, studentCount: 22 },
    { date: '2025-10-10', avgSentiment: 4.5, studentCount: 22 },
    { date: '2025-10-11', avgSentiment: 4.3, studentCount: 21 },
    { date: '2025-10-12', avgSentiment: 4.2, studentCount: 20 },
    { date: '2025-10-13', avgSentiment: 4.0, studentCount: 19 },
    { date: '2025-10-14', avgSentiment: 4.2, studentCount: 21 },
    { date: '2025-10-15', avgSentiment: 4.1, studentCount: 20 },
    { date: '2025-10-16', avgSentiment: 3.9, studentCount: 19 },
    { date: '2025-10-17', avgSentiment: 4.3, studentCount: 21 },
    { date: '2025-10-18', avgSentiment: 4.5, studentCount: 22 },
    { date: '2025-10-19', avgSentiment: 4.4, studentCount: 22 },
  ],
  'class-3': [
    { date: '2025-10-06', avgSentiment: 4.0, studentCount: 18 },
    { date: '2025-10-07', avgSentiment: 4.1, studentCount: 19 },
    { date: '2025-10-08', avgSentiment: 4.3, studentCount: 20 },
    { date: '2025-10-09', avgSentiment: 4.6, studentCount: 20 },
    { date: '2025-10-10', avgSentiment: 4.7, studentCount: 20 },
    { date: '2025-10-11', avgSentiment: 4.5, studentCount: 19 },
    { date: '2025-10-12', avgSentiment: 4.4, studentCount: 19 },
    { date: '2025-10-13', avgSentiment: 4.3, studentCount: 18 },
    { date: '2025-10-14', avgSentiment: 4.4, studentCount: 20 },
    { date: '2025-10-15', avgSentiment: 4.5, studentCount: 19 },
    { date: '2025-10-16', avgSentiment: 4.2, studentCount: 18 },
    { date: '2025-10-17', avgSentiment: 4.6, studentCount: 20 },
    { date: '2025-10-18', avgSentiment: 4.7, studentCount: 20 },
    { date: '2025-10-19', avgSentiment: 4.6, studentCount: 20 },
  ],
};

const CLASS_SPECIFIC_MONTH_DATA: Record<string, StaticClassSentimentDataPoint[]> = {
  'class-1': [
    { date: '2025-09-19', avgSentiment: 3.5, studentCount: 20 },
    { date: '2025-09-20', avgSentiment: 3.3, studentCount: 21 },
    { date: '2025-09-21', avgSentiment: 3.8, studentCount: 22 },
    { date: '2025-09-22', avgSentiment: 3.6, studentCount: 21 },
    { date: '2025-09-23', avgSentiment: 4.0, studentCount: 23 },
    { date: '2025-09-24', avgSentiment: 4.2, studentCount: 24 },
    { date: '2025-09-25', avgSentiment: 4.1, studentCount: 23 },
    { date: '2025-09-26', avgSentiment: 4.0, studentCount: 22 },
    { date: '2025-09-27', avgSentiment: 3.9, studentCount: 21 },
    { date: '2025-09-28', avgSentiment: 3.7, studentCount: 20 },
    { date: '2025-09-29', avgSentiment: 3.5, studentCount: 19 },
    { date: '2025-09-30', avgSentiment: 3.8, studentCount: 22 },
    { date: '2025-10-01', avgSentiment: 4.0, studentCount: 23 },
    { date: '2025-10-02', avgSentiment: 4.3, studentCount: 24 },
    { date: '2025-10-03', avgSentiment: 4.4, studentCount: 24 },
    { date: '2025-10-04', avgSentiment: 4.2, studentCount: 23 },
    { date: '2025-10-05', avgSentiment: 4.1, studentCount: 22 },
    { date: '2025-10-06', avgSentiment: 3.9, studentCount: 22 },
    { date: '2025-10-07', avgSentiment: 4.0, studentCount: 23 },
    { date: '2025-10-08', avgSentiment: 4.2, studentCount: 24 },
    { date: '2025-10-09', avgSentiment: 4.5, studentCount: 24 },
    { date: '2025-10-10', avgSentiment: 4.6, studentCount: 23 },
    { date: '2025-10-11', avgSentiment: 4.4, studentCount: 22 },
    { date: '2025-10-12', avgSentiment: 4.3, studentCount: 23 },
    { date: '2025-10-13', avgSentiment: 4.2, studentCount: 22 },
    { date: '2025-10-14', avgSentiment: 4.5, studentCount: 24 },
    { date: '2025-10-15', avgSentiment: 4.3, studentCount: 23 },
    { date: '2025-10-16', avgSentiment: 4.0, studentCount: 21 },
    { date: '2025-10-17', avgSentiment: 4.4, studentCount: 23 },
    { date: '2025-10-18', avgSentiment: 4.6, studentCount: 24 },
  ],
  'class-2': [
    { date: '2025-09-19', avgSentiment: 3.3, studentCount: 17 },
    { date: '2025-09-20', avgSentiment: 3.2, studentCount: 18 },
    { date: '2025-09-21', avgSentiment: 3.7, studentCount: 19 },
    { date: '2025-09-22', avgSentiment: 3.5, studentCount: 18 },
    { date: '2025-09-23', avgSentiment: 3.9, studentCount: 20 },
    { date: '2025-09-24', avgSentiment: 4.1, studentCount: 21 },
    { date: '2025-09-25', avgSentiment: 4.0, studentCount: 20 },
    { date: '2025-09-26', avgSentiment: 3.9, studentCount: 19 },
    { date: '2025-09-27', avgSentiment: 3.8, studentCount: 18 },
    { date: '2025-09-28', avgSentiment: 3.6, studentCount: 17 },
    { date: '2025-09-29', avgSentiment: 3.4, studentCount: 16 },
    { date: '2025-09-30', avgSentiment: 3.7, studentCount: 19 },
    { date: '2025-10-01', avgSentiment: 3.9, studentCount: 20 },
    { date: '2025-10-02', avgSentiment: 4.2, studentCount: 21 },
    { date: '2025-10-03', avgSentiment: 4.3, studentCount: 22 },
    { date: '2025-10-04', avgSentiment: 4.1, studentCount: 21 },
    { date: '2025-10-05', avgSentiment: 4.0, studentCount: 20 },
    { date: '2025-10-06', avgSentiment: 3.8, studentCount: 19 },
    { date: '2025-10-07', avgSentiment: 3.9, studentCount: 20 },
    { date: '2025-10-08', avgSentiment: 4.1, studentCount: 21 },
    { date: '2025-10-09', avgSentiment: 4.4, studentCount: 22 },
    { date: '2025-10-10', avgSentiment: 4.5, studentCount: 22 },
    { date: '2025-10-11', avgSentiment: 4.3, studentCount: 21 },
    { date: '2025-10-12', avgSentiment: 4.2, studentCount: 20 },
    { date: '2025-10-13', avgSentiment: 4.0, studentCount: 19 },
    { date: '2025-10-14', avgSentiment: 4.2, studentCount: 21 },
    { date: '2025-10-15', avgSentiment: 4.1, studentCount: 20 },
    { date: '2025-10-16', avgSentiment: 3.9, studentCount: 19 },
    { date: '2025-10-17', avgSentiment: 4.3, studentCount: 21 },
    { date: '2025-10-18', avgSentiment: 4.5, studentCount: 22 },
  ],
  'class-3': [
    { date: '2025-09-19', avgSentiment: 3.6, studentCount: 16 },
    { date: '2025-09-20', avgSentiment: 3.5, studentCount: 17 },
    { date: '2025-09-21', avgSentiment: 3.9, studentCount: 18 },
    { date: '2025-09-22', avgSentiment: 3.8, studentCount: 17 },
    { date: '2025-09-23', avgSentiment: 4.1, studentCount: 19 },
    { date: '2025-09-24', avgSentiment: 4.3, studentCount: 20 },
    { date: '2025-09-25', avgSentiment: 4.2, studentCount: 19 },
    { date: '2025-09-26', avgSentiment: 4.1, studentCount: 18 },
    { date: '2025-09-27', avgSentiment: 4.0, studentCount: 17 },
    { date: '2025-09-28', avgSentiment: 3.8, studentCount: 16 },
    { date: '2025-09-29', avgSentiment: 3.6, studentCount: 15 },
    { date: '2025-09-30', avgSentiment: 3.9, studentCount: 18 },
    { date: '2025-10-01', avgSentiment: 4.1, studentCount: 19 },
    { date: '2025-10-02', avgSentiment: 4.4, studentCount: 20 },
    { date: '2025-10-03', avgSentiment: 4.5, studentCount: 20 },
    { date: '2025-10-04', avgSentiment: 4.3, studentCount: 19 },
    { date: '2025-10-05', avgSentiment: 4.2, studentCount: 18 },
    { date: '2025-10-06', avgSentiment: 4.0, studentCount: 18 },
    { date: '2025-10-07', avgSentiment: 4.1, studentCount: 19 },
    { date: '2025-10-08', avgSentiment: 4.3, studentCount: 20 },
    { date: '2025-10-09', avgSentiment: 4.6, studentCount: 20 },
    { date: '2025-10-10', avgSentiment: 4.7, studentCount: 20 },
    { date: '2025-10-11', avgSentiment: 4.5, studentCount: 19 },
    { date: '2025-10-12', avgSentiment: 4.4, studentCount: 19 },
    { date: '2025-10-13', avgSentiment: 4.3, studentCount: 18 },
    { date: '2025-10-14', avgSentiment: 4.4, studentCount: 20 },
    { date: '2025-10-15', avgSentiment: 4.5, studentCount: 19 },
    { date: '2025-10-16', avgSentiment: 4.2, studentCount: 18 },
    { date: '2025-10-17', avgSentiment: 4.6, studentCount: 20 },
    { date: '2025-10-18', avgSentiment: 4.7, studentCount: 20 },
  ],
};

export function getClassSpecificWeekData(classId: string): StaticClassSentimentDataPoint[] {
  return CLASS_SPECIFIC_WEEK_DATA[classId] || CLASS_SPECIFIC_WEEK_DATA['class-1'];
}

export function getClassSpecific2WeekData(classId: string): StaticClassSentimentDataPoint[] {
  return CLASS_SPECIFIC_2WEEK_DATA[classId] || CLASS_SPECIFIC_2WEEK_DATA['class-1'];
}

export function getClassSpecificMonthData(classId: string): StaticClassSentimentDataPoint[] {
  return CLASS_SPECIFIC_MONTH_DATA[classId] || CLASS_SPECIFIC_MONTH_DATA['class-1'];
}

export function getClassSpecificCustomData(classId: string): StaticClassSentimentDataPoint[] {
  const monthData = CLASS_SPECIFIC_MONTH_DATA[classId] || CLASS_SPECIFIC_MONTH_DATA['class-1'];
  return monthData.slice(-14);
}

export interface ClassAnalyticsData {
  classId: string;
  className: string;
  currentSentiment: number;
  sentimentTrend: 'up' | 'down';
  totalStudents: number;
  activeStudents: number;
  participationRate: number;
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>;
  recentActivity: string[];
}

export function getClassAnalyticsData(classId: string, className: string): ClassAnalyticsData {
  const twoWeekData = getClassSpecific2WeekData(classId);
  const currentData = twoWeekData[twoWeekData.length - 1];
  const previousData = twoWeekData[0];

  const currentSentiment = currentData.avgSentiment;
  const sentimentTrend: 'up' | 'down' = currentSentiment > previousData.avgSentiment ? 'up' : 'down';
  const activeStudents = currentData.studentCount;
  const totalStudents = classId === 'class-1' ? 24 : classId === 'class-2' ? 22 : 20;
  const participationRate = Math.round((activeStudents / totalStudents) * 100);

  const emotionData = [
    { emotion: 'happy', count: Math.floor(activeStudents * 0.35), percentage: 35 },
    { emotion: 'calm', count: Math.floor(activeStudents * 0.25), percentage: 25 },
    { emotion: 'grateful', count: Math.floor(activeStudents * 0.20), percentage: 20 },
    { emotion: 'hopeful', count: Math.floor(activeStudents * 0.12), percentage: 12 },
    { emotion: 'tired', count: Math.floor(activeStudents * 0.08), percentage: 8 },
  ];

  const recentActivity = [
    `${activeStudents} students completed today's pulse check`,
    `Class sentiment improved by ${Math.abs(currentSentiment - previousData.avgSentiment).toFixed(1)} points`,
    `${Math.floor(activeStudents * 0.6)} students participated in recent class discussions`,
    `${Math.floor(activeStudents * 0.4)} Hapi Moments sent this week`,
  ];

  return {
    classId,
    className,
    currentSentiment,
    sentimentTrend,
    totalStudents,
    activeStudents,
    participationRate,
    topEmotions: emotionData,
    recentActivity,
  };
}

export function generateClassInsight(classId: string, className: string): string {
  const data = getClassAnalyticsData(classId, className);
  const { currentSentiment, sentimentTrend, participationRate, topEmotions } = data;

  if (sentimentTrend === 'up' && currentSentiment >= 4.5) {
    return `${className} is thriving with exceptional wellness! The class averages ${currentSentiment.toFixed(1)}/6.0 with ${participationRate}% participation. Students are predominantly feeling ${topEmotions[0].emotion} (${topEmotions[0].percentage}%) and ${topEmotions[1].emotion} (${topEmotions[1].percentage}%), showing a remarkably positive classroom environment.`;
  }

  if (sentimentTrend === 'up' && currentSentiment >= 4.0) {
    return `${className} shows strong positive momentum! The ${currentSentiment.toFixed(1)}/6.0 average reflects an upward trend with ${participationRate}% of students engaged. Top emotions include ${topEmotions[0].emotion} and ${topEmotions[1].emotion}, indicating healthy classroom dynamics.`;
  }

  if (sentimentTrend === 'down' && currentSentiment < 4.0) {
    return `${className} may benefit from additional support. The current ${currentSentiment.toFixed(1)}/6.0 average and ${participationRate}% participation suggest students are experiencing ${topEmotions[0].emotion} and ${topEmotions[1].emotion}. This could be an opportunity to check in with the class and provide targeted wellness resources.`;
  }

  if (participationRate >= 90) {
    return `${className} demonstrates outstanding engagement! With ${participationRate}% participation and a ${currentSentiment.toFixed(1)}/6.0 sentiment average, students are actively involved and feeling ${topEmotions[0].emotion}. This high engagement creates a supportive learning environment.`;
  }

  return `${className} maintains steady wellness patterns with a ${currentSentiment.toFixed(1)}/6.0 average and ${participationRate}% participation. Students primarily report feeling ${topEmotions[0].emotion} (${topEmotions[0].percentage}%) and ${topEmotions[1].emotion} (${topEmotions[1].percentage}%), reflecting consistent classroom sentiment.`;
}
