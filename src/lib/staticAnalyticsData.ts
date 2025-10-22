export interface StaticSentimentDataPoint {
  date: string;
  emotion: string;
  value: number;
}

export interface StaticClassMate {
  name: string;
  emotion: string;
  value: number;
}

export interface StaticClassSentimentDataPoint {
  date: string;
  avgSentiment: number;
  studentCount: number;
}

export interface StaticAnalyticsData {
  personalAverage: number;
  personalTrend: 'up' | 'down';
  classAverage: number;
  recentEmotions: string[];
  timeRange: 'week' | 'month' | 'custom';
  topClassEmotions: Array<{ emotion: string; count: number }>;
}

export interface StaticTimelineDataPoint {
  date: string;
  values: Record<string, number>;
}

const STATIC_WEEK_PERSONAL_DATA: StaticSentimentDataPoint[] = [
  { date: '2025-10-13', emotion: 'calm', value: 4.0 },
  { date: '2025-10-14', emotion: 'happy', value: 5.0 },
  { date: '2025-10-15', emotion: 'grateful', value: 4.5 },
  { date: '2025-10-16', emotion: 'energized', value: 4.0 },
  { date: '2025-10-17', emotion: 'hopeful', value: 4.5 },
  { date: '2025-10-18', emotion: 'excited', value: 5.0 },
  { date: '2025-10-19', emotion: 'happy', value: 5.0 },
];

const STATIC_MONTH_PERSONAL_DATA: StaticSentimentDataPoint[] = [
  { date: '2025-09-19', emotion: 'neutral', value: 3.0 },
  { date: '2025-09-20', emotion: 'tired', value: 2.5 },
  { date: '2025-09-21', emotion: 'calm', value: 4.0 },
  { date: '2025-09-22', emotion: 'neutral', value: 3.0 },
  { date: '2025-09-23', emotion: 'hopeful', value: 4.5 },
  { date: '2025-09-24', emotion: 'happy', value: 5.0 },
  { date: '2025-09-25', emotion: 'grateful', value: 4.5 },
  { date: '2025-09-26', emotion: 'energized', value: 4.0 },
  { date: '2025-09-27', emotion: 'calm', value: 4.0 },
  { date: '2025-09-28', emotion: 'neutral', value: 3.0 },
  { date: '2025-09-29', emotion: 'tired', value: 2.5 },
  { date: '2025-09-30', emotion: 'calm', value: 4.0 },
  { date: '2025-10-01', emotion: 'hopeful', value: 4.5 },
  { date: '2025-10-02', emotion: 'excited', value: 5.0 },
  { date: '2025-10-03', emotion: 'happy', value: 5.0 },
  { date: '2025-10-04', emotion: 'grateful', value: 4.5 },
  { date: '2025-10-05', emotion: 'energized', value: 4.0 },
  { date: '2025-10-06', emotion: 'neutral', value: 3.0 },
  { date: '2025-10-07', emotion: 'calm', value: 4.0 },
  { date: '2025-10-08', emotion: 'hopeful', value: 4.5 },
  { date: '2025-10-09', emotion: 'excited', value: 5.0 },
  { date: '2025-10-10', emotion: 'happy', value: 5.0 },
  { date: '2025-10-11', emotion: 'grateful', value: 4.5 },
  { date: '2025-10-12', emotion: 'calm', value: 4.0 },
  { date: '2025-10-13', emotion: 'calm', value: 4.0 },
  { date: '2025-10-14', emotion: 'happy', value: 5.0 },
  { date: '2025-10-15', emotion: 'grateful', value: 4.5 },
  { date: '2025-10-16', emotion: 'energized', value: 4.0 },
  { date: '2025-10-17', emotion: 'hopeful', value: 4.5 },
  { date: '2025-10-18', emotion: 'excited', value: 5.0 },
];

const STATIC_CLASSMATES: StaticClassMate[] = [
  { name: 'Emma S.', emotion: 'happy', value: 5.0 },
  { name: 'Liam B.', emotion: 'grateful', value: 4.5 },
  { name: 'Olivia M.', emotion: 'calm', value: 4.0 },
  { name: 'Noah W.', emotion: 'excited', value: 5.0 },
  { name: 'Ava R.', emotion: 'hopeful', value: 4.5 },
  { name: 'Ethan D.', emotion: 'energized', value: 4.0 },
  { name: 'Sophia K.', emotion: 'happy', value: 5.0 },
  { name: 'Mason P.', emotion: 'calm', value: 4.0 },
  { name: 'Isabella C.', emotion: 'grateful', value: 4.5 },
  { name: 'Lucas T.', emotion: 'neutral', value: 3.0 },
  { name: 'Mia H.', emotion: 'happy', value: 5.0 },
  { name: 'Oliver G.', emotion: 'hopeful', value: 4.5 },
  { name: 'Charlotte F.', emotion: 'energized', value: 4.0 },
  { name: 'Elijah N.', emotion: 'calm', value: 4.0 },
  { name: 'Amelia L.', emotion: 'excited', value: 5.0 },
  { name: 'James V.', emotion: 'grateful', value: 4.5 },
  { name: 'Harper Z.', emotion: 'happy', value: 5.0 },
  { name: 'Benjamin Y.', emotion: 'tired', value: 2.5 },
  { name: 'Evelyn Q.', emotion: 'calm', value: 4.0 },
  { name: 'Michael X.', emotion: 'neutral', value: 3.0 },
];

const STATIC_CLASS_WEEK_DATA: StaticClassSentimentDataPoint[] = [
  { date: '2025-10-13', avgSentiment: 4.2, studentCount: 18 },
  { date: '2025-10-14', avgSentiment: 4.5, studentCount: 20 },
  { date: '2025-10-15', avgSentiment: 4.3, studentCount: 19 },
  { date: '2025-10-16', avgSentiment: 4.0, studentCount: 17 },
  { date: '2025-10-17', avgSentiment: 4.4, studentCount: 19 },
  { date: '2025-10-18', avgSentiment: 4.6, studentCount: 20 },
  { date: '2025-10-19', avgSentiment: 4.5, studentCount: 20 },
];

const STATIC_CLASS_MONTH_DATA: StaticClassSentimentDataPoint[] = [
  { date: '2025-09-19', avgSentiment: 3.5, studentCount: 15 },
  { date: '2025-09-20', avgSentiment: 3.3, studentCount: 16 },
  { date: '2025-09-21', avgSentiment: 3.8, studentCount: 18 },
  { date: '2025-09-22', avgSentiment: 3.6, studentCount: 17 },
  { date: '2025-09-23', avgSentiment: 4.0, studentCount: 19 },
  { date: '2025-09-24', avgSentiment: 4.2, studentCount: 20 },
  { date: '2025-09-25', avgSentiment: 4.1, studentCount: 19 },
  { date: '2025-09-26', avgSentiment: 4.0, studentCount: 18 },
  { date: '2025-09-27', avgSentiment: 3.9, studentCount: 17 },
  { date: '2025-09-28', avgSentiment: 3.7, studentCount: 16 },
  { date: '2025-09-29', avgSentiment: 3.5, studentCount: 15 },
  { date: '2025-09-30', avgSentiment: 3.8, studentCount: 18 },
  { date: '2025-10-01', avgSentiment: 4.0, studentCount: 19 },
  { date: '2025-10-02', avgSentiment: 4.3, studentCount: 20 },
  { date: '2025-10-03', avgSentiment: 4.4, studentCount: 20 },
  { date: '2025-10-04', avgSentiment: 4.2, studentCount: 19 },
  { date: '2025-10-05', avgSentiment: 4.1, studentCount: 18 },
  { date: '2025-10-06', avgSentiment: 3.9, studentCount: 17 },
  { date: '2025-10-07', avgSentiment: 4.0, studentCount: 18 },
  { date: '2025-10-08', avgSentiment: 4.2, studentCount: 19 },
  { date: '2025-10-09', avgSentiment: 4.5, studentCount: 20 },
  { date: '2025-10-10', avgSentiment: 4.6, studentCount: 20 },
  { date: '2025-10-11', avgSentiment: 4.4, studentCount: 19 },
  { date: '2025-10-12', avgSentiment: 4.3, studentCount: 19 },
  { date: '2025-10-13', avgSentiment: 4.2, studentCount: 18 },
  { date: '2025-10-14', avgSentiment: 4.5, studentCount: 20 },
  { date: '2025-10-15', avgSentiment: 4.3, studentCount: 19 },
  { date: '2025-10-16', avgSentiment: 4.0, studentCount: 17 },
  { date: '2025-10-17', avgSentiment: 4.4, studentCount: 19 },
  { date: '2025-10-18', avgSentiment: 4.6, studentCount: 20 },
];

export function getStaticPersonalWeekData(): StaticSentimentDataPoint[] {
  return STATIC_WEEK_PERSONAL_DATA;
}

export function getStaticPersonalMonthData(): StaticSentimentDataPoint[] {
  return STATIC_MONTH_PERSONAL_DATA;
}

export function getStaticPersonalCustomData(): StaticSentimentDataPoint[] {
  return STATIC_MONTH_PERSONAL_DATA.slice(-14);
}

export function getStaticClassmates(): StaticClassMate[] {
  return STATIC_CLASSMATES;
}

export function getStaticClassWeekData(): StaticClassSentimentDataPoint[] {
  return STATIC_CLASS_WEEK_DATA;
}

export function getStaticClassMonthData(): StaticClassSentimentDataPoint[] {
  return STATIC_CLASS_MONTH_DATA;
}

export function getStaticClassCustomData(): StaticClassSentimentDataPoint[] {
  return STATIC_CLASS_MONTH_DATA.slice(-14);
}

const STATIC_TIMELINE_WEEK_DATA: StaticTimelineDataPoint[] = [
  { date: '2025-10-13', values: { 'class-1': 4.2, 'class-2': 4.0, 'class-3': 4.3 } },
  { date: '2025-10-14', values: { 'class-1': 4.5, 'class-2': 4.2, 'class-3': 4.4 } },
  { date: '2025-10-15', values: { 'class-1': 4.3, 'class-2': 4.1, 'class-3': 4.5 } },
  { date: '2025-10-16', values: { 'class-1': 4.0, 'class-2': 3.9, 'class-3': 4.2 } },
  { date: '2025-10-17', values: { 'class-1': 4.4, 'class-2': 4.3, 'class-3': 4.6 } },
  { date: '2025-10-18', values: { 'class-1': 4.6, 'class-2': 4.5, 'class-3': 4.7 } },
  { date: '2025-10-19', values: { 'class-1': 4.5, 'class-2': 4.4, 'class-3': 4.6 } },
];

const STATIC_TIMELINE_MONTH_DATA: StaticTimelineDataPoint[] = [
  { date: '2025-09-19', values: { 'class-1': 3.5, 'class-2': 3.3, 'class-3': 3.6 } },
  { date: '2025-09-20', values: { 'class-1': 3.3, 'class-2': 3.2, 'class-3': 3.5 } },
  { date: '2025-09-21', values: { 'class-1': 3.8, 'class-2': 3.7, 'class-3': 3.9 } },
  { date: '2025-09-22', values: { 'class-1': 3.6, 'class-2': 3.5, 'class-3': 3.8 } },
  { date: '2025-09-23', values: { 'class-1': 4.0, 'class-2': 3.9, 'class-3': 4.1 } },
  { date: '2025-09-24', values: { 'class-1': 4.2, 'class-2': 4.1, 'class-3': 4.3 } },
  { date: '2025-09-25', values: { 'class-1': 4.1, 'class-2': 4.0, 'class-3': 4.2 } },
  { date: '2025-09-26', values: { 'class-1': 4.0, 'class-2': 3.9, 'class-3': 4.1 } },
  { date: '2025-09-27', values: { 'class-1': 3.9, 'class-2': 3.8, 'class-3': 4.0 } },
  { date: '2025-09-28', values: { 'class-1': 3.7, 'class-2': 3.6, 'class-3': 3.8 } },
  { date: '2025-09-29', values: { 'class-1': 3.5, 'class-2': 3.4, 'class-3': 3.6 } },
  { date: '2025-09-30', values: { 'class-1': 3.8, 'class-2': 3.7, 'class-3': 3.9 } },
  { date: '2025-10-01', values: { 'class-1': 4.0, 'class-2': 3.9, 'class-3': 4.1 } },
  { date: '2025-10-02', values: { 'class-1': 4.3, 'class-2': 4.2, 'class-3': 4.4 } },
  { date: '2025-10-03', values: { 'class-1': 4.4, 'class-2': 4.3, 'class-3': 4.5 } },
  { date: '2025-10-04', values: { 'class-1': 4.2, 'class-2': 4.1, 'class-3': 4.3 } },
  { date: '2025-10-05', values: { 'class-1': 4.1, 'class-2': 4.0, 'class-3': 4.2 } },
  { date: '2025-10-06', values: { 'class-1': 3.9, 'class-2': 3.8, 'class-3': 4.0 } },
  { date: '2025-10-07', values: { 'class-1': 4.0, 'class-2': 3.9, 'class-3': 4.1 } },
  { date: '2025-10-08', values: { 'class-1': 4.2, 'class-2': 4.1, 'class-3': 4.3 } },
  { date: '2025-10-09', values: { 'class-1': 4.5, 'class-2': 4.4, 'class-3': 4.6 } },
  { date: '2025-10-10', values: { 'class-1': 4.6, 'class-2': 4.5, 'class-3': 4.7 } },
  { date: '2025-10-11', values: { 'class-1': 4.4, 'class-2': 4.3, 'class-3': 4.5 } },
  { date: '2025-10-12', values: { 'class-1': 4.3, 'class-2': 4.2, 'class-3': 4.4 } },
  { date: '2025-10-13', values: { 'class-1': 4.2, 'class-2': 4.0, 'class-3': 4.3 } },
  { date: '2025-10-14', values: { 'class-1': 4.5, 'class-2': 4.2, 'class-3': 4.4 } },
  { date: '2025-10-15', values: { 'class-1': 4.3, 'class-2': 4.1, 'class-3': 4.5 } },
  { date: '2025-10-16', values: { 'class-1': 4.0, 'class-2': 3.9, 'class-3': 4.2 } },
  { date: '2025-10-17', values: { 'class-1': 4.4, 'class-2': 4.3, 'class-3': 4.6 } },
  { date: '2025-10-18', values: { 'class-1': 4.6, 'class-2': 4.5, 'class-3': 4.7 } },
];

const STATIC_TIMELINE_3MONTHS_DATA: StaticTimelineDataPoint[] = STATIC_TIMELINE_MONTH_DATA;

export function getStaticTimelineWeekData(): StaticTimelineDataPoint[] {
  return STATIC_TIMELINE_WEEK_DATA;
}

export function getStaticTimelineMonthData(): StaticTimelineDataPoint[] {
  return STATIC_TIMELINE_MONTH_DATA;
}

export function getStaticTimeline3MonthsData(): StaticTimelineDataPoint[] {
  return STATIC_TIMELINE_3MONTHS_DATA;
}

export function getStaticAnalyticsData(): StaticAnalyticsData {
  const weekData = getStaticPersonalWeekData();
  const classmates = getStaticClassmates();

  const personalAverage = weekData.reduce((sum, d) => sum + d.value, 0) / weekData.length;
  const personalTrend: 'up' | 'down' = weekData[weekData.length - 1].value > weekData[0].value ? 'up' : 'down';

  const classAverage = classmates.reduce((sum, c) => sum + c.value, 0) / classmates.length;

  const emotionCounts: Record<string, number> = {};
  classmates.forEach(c => {
    emotionCounts[c.emotion] = (emotionCounts[c.emotion] || 0) + 1;
  });

  const topClassEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([emotion, count]) => ({ emotion, count }));

  const recentEmotions = weekData.map(d => d.emotion).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);

  return {
    personalAverage,
    personalTrend,
    classAverage,
    recentEmotions,
    timeRange: 'week',
    topClassEmotions,
  };
}
