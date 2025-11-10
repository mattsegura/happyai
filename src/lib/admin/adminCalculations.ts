/**
 * Admin Analytics Calculations
 *
 * Business logic for calculating metrics, distributions, and derived statistics.
 * All functions use real calculations (no hardcoded values).
 */

import type {
  Grade,
  SentimentRecord,
  Assignment,
  Student,
  Teacher,
  Distribution,
  GradeDistributionBin,
  SentimentDistribution,
  TeacherMetrics,
  Forecast,
  TrendData,
} from './types';

import { calculateMean, calculateStandardDeviation } from '../statistics/descriptive';

// ============================================================================
// BASIC CALCULATIONS
// ============================================================================

/**
 * Calculate average of an array of numbers
 */
export function calculateAverage(numbers: number[]): number {
  return calculateMean(numbers);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Calculate sum of an array
 */
export function calculateSum(numbers: number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0);
}

/**
 * Normalize score to 0-100 scale
 */
export function normalizeScore(value: number, min: number, max: number): number {
  if (max === min) return 50; // If no range, return middle value
  return ((value - min) / (max - min)) * 100;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================================
// GRADE CALCULATIONS
// ============================================================================

/**
 * Calculate grade distribution
 *
 * Groups grades into bins (A, B, C, D, F) and calculates counts and percentages.
 */
export function calculateGradeDistribution(grades: Grade[]): GradeDistributionBin[] {
  const scores = grades.map((g) => {
    if (g.maxScore && g.maxScore !== 100) {
      // Normalize to 100-point scale
      return (g.score / g.maxScore) * 100;
    }
    return g.score;
  });

  const bins: GradeDistributionBin[] = [
    { grade: 'A (90-100)', min: 90, max: 100, count: 0, percentage: 0 },
    { grade: 'B (80-89)', min: 80, max: 89, count: 0, percentage: 0 },
    { grade: 'C (70-79)', min: 70, max: 79, count: 0, percentage: 0 },
    { grade: 'D (60-69)', min: 60, max: 69, count: 0, percentage: 0 },
    { grade: 'F (<60)', min: 0, max: 59, count: 0, percentage: 0 },
  ];

  scores.forEach((score) => {
    const bin = bins.find((b) => score >= b.min && score <= b.max);
    if (bin) bin.count++;
  });

  const total = scores.length || 1;
  bins.forEach((bin) => {
    bin.percentage = (bin.count / total) * 100;
  });

  return bins;
}

/**
 * Calculate average grade from grade records
 */
export function calculateAverageGrade(grades: Grade[]): number {
  if (grades.length === 0) return 0;

  const normalizedScores = grades.map((g) => {
    if (g.maxScore && g.maxScore !== 100) {
      return (g.score / g.maxScore) * 100;
    }
    return g.score;
  });

  return calculateAverage(normalizedScores);
}

/**
 * Calculate submission rate for assignments
 */
export function calculateSubmissionRate(assignments: Assignment[]): number {
  if (assignments.length === 0) return 0;

  const totalPossible = assignments.reduce(
    (sum, a) => sum + a.totalSubmissions + a.missingSubmissions,
    0
  );
  const totalSubmitted = assignments.reduce((sum, a) => sum + a.totalSubmissions, 0);

  return calculatePercentage(totalSubmitted, totalPossible);
}

/**
 * Calculate late submission percentage
 */
export function calculateLatePercentage(assignments: Assignment[]): number {
  if (assignments.length === 0) return 0;

  const totalSubmissions = assignments.reduce((sum, a) => sum + a.totalSubmissions, 0);
  const lateSubmissions = assignments.reduce((sum, a) => sum + a.lateSubmissions, 0);

  return calculatePercentage(lateSubmissions, totalSubmissions);
}

/**
 * Calculate missing assignment percentage
 */
export function calculateMissingPercentage(assignments: Assignment[]): number {
  if (assignments.length === 0) return 0;

  const totalPossible = assignments.reduce(
    (sum, a) => sum + a.totalSubmissions + a.missingSubmissions,
    0
  );
  const missingSubmissions = assignments.reduce((sum, a) => sum + a.missingSubmissions, 0);

  return calculatePercentage(missingSubmissions, totalPossible);
}

/**
 * Calculate average grading turnaround time (in hours)
 */
export function calculateGradingTurnaround(grades: Grade[]): number {
  const turnarounds = grades
    .filter((g) => g.submittedAt && g.gradedAt)
    .map((g) => {
      const submitted = new Date(g.submittedAt!);
      const graded = new Date(g.gradedAt);
      return (graded.getTime() - submitted.getTime()) / (1000 * 60 * 60); // hours
    });

  return calculateAverage(turnarounds);
}

// ============================================================================
// SENTIMENT CALCULATIONS
// ============================================================================

/**
 * Calculate sentiment distribution
 *
 * Groups sentiment records into 6 levels with emotion breakdown.
 */
export function calculateSentimentDistribution(
  sentimentRecords: SentimentRecord[]
): SentimentDistribution[] {
  const labels: Record<number, string> = {
    1: 'Highly Negative',
    2: 'Negative',
    3: 'Neutral',
    4: 'Positive',
    5: 'Highly Positive',
    6: 'Extremely Positive',
  };

  const distribution: SentimentDistribution[] = [1, 2, 3, 4, 5, 6].map((level) => ({
    sentimentLevel: level,
    label: labels[level],
    emotions: [],
    count: 0,
    percentage: 0,
  }));

  // Count sentiment levels and collect emotions
  const emotionsByLevel: Record<number, Set<string>> = {
    1: new Set(),
    2: new Set(),
    3: new Set(),
    4: new Set(),
    5: new Set(),
    6: new Set(),
  };

  sentimentRecords.forEach((record) => {
    const level = record.sentimentValue;
    const dist = distribution.find((d) => d.sentimentLevel === level);
    if (dist) {
      dist.count++;
      emotionsByLevel[level].add(record.emotion);
    }
  });

  // Convert sets to arrays and calculate percentages
  const total = sentimentRecords.length || 1;
  distribution.forEach((dist) => {
    dist.emotions = Array.from(emotionsByLevel[dist.sentimentLevel]);
    dist.percentage = (dist.count / total) * 100;
  });

  return distribution;
}

/**
 * Calculate average sentiment from records
 */
export function calculateAverageSentiment(sentimentRecords: SentimentRecord[]): number {
  if (sentimentRecords.length === 0) return 0;

  const values = sentimentRecords.map((r) => r.sentimentValue);
  return calculateAverage(values);
}

/**
 * Calculate positive to negative ratio
 */
export function calculatePositiveNegativeRatio(sentimentRecords: SentimentRecord[]): number {
  if (sentimentRecords.length === 0) return 0;

  const positive = sentimentRecords.filter((r) => r.sentimentValue >= 4).length;
  const negative = sentimentRecords.filter((r) => r.sentimentValue <= 3).length;

  if (negative === 0) return positive > 0 ? 99 : 0; // Avoid division by zero
  return positive / negative;
}

/**
 * Calculate emotional stability (inverse of mood variability)
 *
 * Lower standard deviation = more stable emotions.
 */
export function calculateEmotionalStability(sentimentRecords: SentimentRecord[]): number {
  if (sentimentRecords.length < 2) return 100;

  const values = sentimentRecords.map((r) => r.sentimentValue);
  const stdDev = calculateStandardDeviation(values);

  // Convert to 0-100 scale (lower SD = higher stability)
  // Max SD for 1-6 scale is ~2.5, so we normalize
  const stability = normalizeScore(2.5 - stdDev, 0, 2.5);
  return clamp(stability, 0, 100);
}

/**
 * Count students with consecutive low sentiment days
 */
export function countConsistentLowMood(students: Student[], threshold = 3): number {
  return students.filter((s) => s.consecutiveLowDays >= threshold).length;
}

// ============================================================================
// ENGAGEMENT CALCULATIONS
// ============================================================================

/**
 * Calculate teacher engagement score
 *
 * Composite score based on multiple factors (0-100).
 */
export function calculateTeacherEngagementScore(metrics: TeacherMetrics): number {
  // Pulses created (0-25 points, normalized to 0-10 pulses)
  const pulseScore = normalizeScore(Math.min(metrics.pulsesCreated, 10), 0, 10) * 0.25;

  // Comments/feedback count (0-25 points, normalized to 0-50 comments)
  const feedbackScore = normalizeScore(Math.min(metrics.commentsCount, 50), 0, 50) * 0.25;

  // Response time (0-25 points, faster = better, normalized to 0-48 hours)
  const responseScore = normalizeScore(48 - Math.min(metrics.avgResponseTime, 48), 0, 48) * 0.25;

  // Login activity (0-25 points, normalized to 0-20 days)
  const activityScore = normalizeScore(Math.min(metrics.loginDays, 20), 0, 20) * 0.25;

  return pulseScore + feedbackScore + responseScore + activityScore;
}

/**
 * Calculate participation rate
 */
export function calculateParticipationRate(active: number, total: number): number {
  return calculatePercentage(active, total);
}

/**
 * Calculate daily pulse completion rate
 */
export function calculateDailyPulseRate(
  sentimentRecords: SentimentRecord[],
  totalStudents: number,
  days: number
): number {
  if (totalStudents === 0 || days === 0) return 0;

  const expectedCheckIns = totalStudents * days;
  const actualCheckIns = sentimentRecords.length;

  return calculatePercentage(actualCheckIns, expectedCheckIns);
}

// ============================================================================
// RISK CALCULATIONS
// ============================================================================

/**
 * Calculate student at-risk score (0-100, higher = more at risk)
 */
export function calculateAtRiskScore(student: Student): number {
  let riskScore = 0;

  // Low grades (0-30 points)
  if (student.avgGrade < 60) {
    riskScore += 30;
  } else if (student.avgGrade < 70) {
    riskScore += 20;
  } else if (student.avgGrade < 80) {
    riskScore += 10;
  }

  // Low sentiment (0-30 points)
  if (student.avgSentiment <= 2) {
    riskScore += 30;
  } else if (student.avgSentiment <= 3) {
    riskScore += 20;
  } else if (student.avgSentiment <= 4) {
    riskScore += 10;
  }

  // Consecutive low days (0-25 points)
  if (student.consecutiveLowDays >= 7) {
    riskScore += 25;
  } else if (student.consecutiveLowDays >= 5) {
    riskScore += 15;
  } else if (student.consecutiveLowDays >= 3) {
    riskScore += 10;
  }

  // High mood variability (0-15 points)
  if (student.moodVariability > 2) {
    riskScore += 15;
  } else if (student.moodVariability > 1.5) {
    riskScore += 10;
  }

  return Math.min(riskScore, 100);
}

/**
 * Calculate cross-risk index (students at risk in both grades AND sentiment)
 */
export function calculateCrossRiskIndex(students: Student[]): number {
  const atRisk = students.filter(
    (s) => s.avgGrade < 70 && s.avgSentiment <= 3 && s.consecutiveLowDays >= 3
  );

  return calculatePercentage(atRisk.length, students.length);
}

/**
 * Calculate early warning index (composite risk metric)
 */
export function calculateEarlyWarningIndex(students: Student[]): number {
  if (students.length === 0) return 0;

  const riskScores = students.map(calculateAtRiskScore);
  const avgRiskScore = calculateAverage(riskScores);

  // Convert to 0-100 scale where higher = more concern
  return avgRiskScore;
}

// ============================================================================
// TREND CALCULATIONS
// ============================================================================

/**
 * Calculate trend direction and percentage change
 */
export function calculateTrend(current: number, previous: number): {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
} {
  if (previous === 0) {
    return { direction: 'stable', percentage: 0 };
  }

  const percentageChange = ((current - previous) / previous) * 100;

  if (Math.abs(percentageChange) < 2) {
    return { direction: 'stable', percentage: 0 };
  }

  return {
    direction: percentageChange > 0 ? 'up' : 'down',
    percentage: Math.abs(percentageChange),
  };
}

/**
 * Calculate moving average for time series data
 */
export function calculateMovingAverage(values: number[], windowSize: number): number[] {
  if (values.length < windowSize) return values;

  const result: number[] = [];

  for (let i = 0; i < values.length; i++) {
    if (i < windowSize - 1) {
      result.push(values[i]);
    } else {
      const window = values.slice(i - windowSize + 1, i + 1);
      result.push(calculateAverage(window));
    }
  }

  return result;
}

/**
 * Simple forecast using moving average
 */
export function forecastNextPeriods(
  historical: TrendData[],
  periods: number,
  windowSize = 7
): Forecast[] {
  const values = historical.map((h) => h.value);
  const forecasts: Forecast[] = [];

  let extendedValues = [...values];

  for (let i = 0; i < periods; i++) {
    // Calculate moving average for prediction
    const window = extendedValues.slice(-windowSize);
    const predicted = calculateAverage(window);

    // Calculate confidence interval (simple approach using SD)
    const stdDev = calculateStandardDeviation(window);
    const confidenceInterval = 1.96 * stdDev; // 95% confidence

    // Calculate date for forecast
    const lastDate = new Date(historical[historical.length - 1].date);
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i + 1);

    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      predicted,
      confidenceLow: Math.max(0, predicted - confidenceInterval),
      confidenceHigh: Math.min(100, predicted + confidenceInterval),
    });

    // Add predicted value to historical for next iteration
    extendedValues.push(predicted);
  }

  return forecasts;
}

// ============================================================================
// COMPOSITE METRICS
// ============================================================================

/**
 * Calculate student success index (composite metric)
 *
 * Combines grades, sentiment, participation, and streak.
 */
export function calculateStudentSuccessIndex(student: Student): number {
  // Normalize all components to 0-100 scale
  const gradeScore = normalizeScore(student.avgGrade, 0, 100);
  const sentimentScore = normalizeScore(student.avgSentiment, 1, 6) * 100;
  const streakScore = normalizeScore(Math.min(student.currentStreak || 0, 30), 0, 30);

  // Risk penalty (invert at-risk score)
  const riskPenalty = calculateAtRiskScore(student);

  // Weighted average
  const successIndex = gradeScore * 0.4 + sentimentScore * 0.3 + streakScore * 0.3 - riskPenalty * 0.2;

  return clamp(successIndex, 0, 100);
}

/**
 * Calculate teacher support index (how well teacher supports students)
 *
 * Based on student outcomes and teacher engagement.
 */
export function calculateTeacherSupportIndex(teacher: Teacher, studentMetrics: {
  avgGrade: number;
  avgSentiment: number;
  participationRate: number;
}): number {
  // Student outcomes (0-50 points)
  const gradeScore = normalizeScore(studentMetrics.avgGrade, 0, 100) * 0.25;
  const sentimentScore = normalizeScore(studentMetrics.avgSentiment, 1, 6) * 25;

  // Teacher engagement (0-50 points)
  const engagementScore = calculateTeacherEngagementScore({
    teacherId: teacher.id,
    teacherName: teacher.name,
    department: teacher.department,
    pulsesCreated: teacher.pulsesCreated,
    commentsCount: teacher.commentsCount,
    avgResponseTime: teacher.avgResponseTime,
    loginDays: teacher.loginDays,
    totalStudents: teacher.totalStudents || 0,
    studentEngagementRate: studentMetrics.participationRate,
    sentimentImprovement: 0,
    gradeImprovement: 0,
    universityId: teacher.universityId,
  }) * 0.5;

  return gradeScore + sentimentScore + engagementScore;
}

// ============================================================================
// DISTRIBUTION HELPERS
// ============================================================================

/**
 * Create generic distribution from counts
 */
export function createDistribution(
  data: Record<string, number>,
  sortByCount = true
): Distribution[] {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0) || 1;

  const distribution: Distribution[] = Object.entries(data).map(([label, count]) => ({
    label,
    count,
    percentage: (count / total) * 100,
  }));

  if (sortByCount) {
    distribution.sort((a, b) => b.count - a.count);
  }

  return distribution;
}

/**
 * Group time series data by period (day, week, month)
 */
export function groupByTimePeriod(
  records: { date: string; value: number }[],
  period: 'day' | 'week' | 'month'
): TrendData[] {
  const grouped: Record<string, number[]> = {};

  records.forEach((record) => {
    const date = new Date(record.date);
    let key: string;

    if (period === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'week') {
      const year = date.getFullYear();
      const week = getWeekNumber(date);
      key = `${year}-W${week.toString().padStart(2, '0')}`;
    } else {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      key = `${year}-${month}`;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(record.value);
  });

  return Object.entries(grouped)
    .map(([date, values]) => ({
      date,
      value: calculateAverage(values),
      label: date,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get ISO week number for a date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
