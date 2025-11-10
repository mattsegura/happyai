import { supabase } from '../supabase';
import { getEmotionSentimentValue, EmotionName } from '../emotionConfig';

/**
 * Advanced Sentiment Analytics Service
 * Provides statistical analysis for teacher sentiment monitoring
 */

// ============================================
// Types
// ============================================

export interface VolatilityResult {
  standardDeviation: number;
  level: 'low' | 'medium' | 'high' | 'extreme';
  interpretation: string;
}

export interface AlertInfo {
  id: string;
  studentId: string;
  studentName: string;
  alertType: 'persistent_low' | 'sudden_drop' | 'high_volatility' | 'prolonged_negative';
  alertDate: Date;
  sentimentValue: number;
  daysAtRisk: number;
  severity: 'medium' | 'high' | 'critical';
}

export interface LowMoodAlertsResult {
  totalAlerts: number;
  newThisWeek: number;
  breakdown: {
    persistentLow: number;
    suddenDrop: number;
    highVolatility: number;
    prolongedNegative: number;
  };
  alerts: AlertInfo[];
}

export interface AlertTimelinePoint {
  date: string;
  alertCount: number;
  alertTypes: {
    persistentLow: number;
    suddenDrop: number;
    highVolatility: number;
    prolongedNegative: number;
  };
}

export interface RecoveryRateResult {
  recoveryRate: number; // percentage
  averageDaysToRecovery: number;
  totalInterventions: number;
  successfulRecoveries: number;
  byInterventionType: {
    type: string;
    rate: number;
    avgDays: number;
  }[];
}

export interface InterventionEffectivenessResult {
  overallEffectiveness: number; // percentage
  byType: {
    type: string;
    effectiveness: number;
    count: number;
    avgRecoveryDays: number;
  }[];
}

export interface PositiveSentimentRatioResult {
  ratio: number; // e.g., 3.2 means 3.2:1
  ratioString: string; // e.g., "3.2:1"
  positiveCount: number;
  negativeCount: number;
  positivePercentage: number;
  negativePercentage: number;
  level: 'concerning' | 'moderate' | 'healthy' | 'excellent';
}

export interface PopularEmotionResult {
  emotion: EmotionName;
  count: number;
  percentage: number;
  sentimentTier: number;
  secondMostPopular?: {
    emotion: EmotionName;
    percentage: number;
  };
}

// ============================================
// Statistical Functions
// ============================================

/**
 * Calculate standard deviation of an array of numbers
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Get date range for a period
 */
function getDateRange(period: 'week' | 'month' | '3months' | 'semester'): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '3months':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case 'semester':
      startDate.setDate(endDate.getDate() - 120); // ~4 months
      break;
  }

  return { startDate, endDate };
}

// ============================================
// Mock Data Mode Check
// ============================================

const USE_MOCK_DATA = import.meta.env.VITE_USE_ANALYTICS_MOCK === 'true';

/**
 * Generate mock volatility data
 */
function getMockVolatility(): VolatilityResult {
  const sd = 0.8;
  return {
    standardDeviation: sd,
    level: 'medium',
    interpretation: 'Students show moderate emotional fluctuation. Some variability is normal.'
  };
}

/**
 * Generate mock low mood alerts
 */
function getMockLowMoodAlerts(): LowMoodAlertsResult {
  return {
    totalAlerts: 8,
    newThisWeek: 3,
    breakdown: {
      persistentLow: 3,
      suddenDrop: 2,
      highVolatility: 2,
      prolongedNegative: 1
    },
    alerts: [
      {
        id: '1',
        studentId: 'student1',
        studentName: 'Alex Chen',
        alertType: 'sudden_drop',
        alertDate: new Date(),
        sentimentValue: 1.5,
        daysAtRisk: 2,
        severity: 'critical'
      },
      {
        id: '2',
        studentId: 'student2',
        studentName: 'Sarah Johnson',
        alertType: 'persistent_low',
        alertDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        sentimentValue: 2.0,
        daysAtRisk: 5,
        severity: 'high'
      }
    ]
  };
}

/**
 * Generate mock alert timeline
 */
function getMockAlertTimeline(): AlertTimelinePoint[] {
  const timeline: AlertTimelinePoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    timeline.push({
      date: date.toISOString().split('T')[0],
      alertCount: Math.floor(Math.random() * 4) + 1,
      alertTypes: {
        persistentLow: Math.floor(Math.random() * 2),
        suddenDrop: Math.floor(Math.random() * 2),
        highVolatility: Math.floor(Math.random() * 2),
        prolongedNegative: Math.floor(Math.random() * 2)
      }
    });
  }
  return timeline;
}

/**
 * Generate mock recovery rate
 */
function getMockRecoveryRate(): RecoveryRateResult {
  return {
    recoveryRate: 78,
    averageDaysToRecovery: 5.2,
    totalInterventions: 23,
    successfulRecoveries: 18,
    byInterventionType: [
      { type: 'Hapi Moment', rate: 82, avgDays: 4.5 },
      { type: '1-on-1 Meeting', rate: 85, avgDays: 6.0 },
      { type: 'Grade Adjustment', rate: 70, avgDays: 5.5 },
      { type: 'Counselor Referral', rate: 65, avgDays: 8.0 }
    ]
  };
}

/**
 * Generate mock positive sentiment ratio
 */
function getMockPositiveRatio(): PositiveSentimentRatioResult {
  const positiveCount = 245;
  const negativeCount = 76;
  const ratio = positiveCount / negativeCount;

  return {
    ratio,
    ratioString: `${ratio.toFixed(1)}:1`,
    positiveCount,
    negativeCount,
    positivePercentage: 76.3,
    negativePercentage: 23.7,
    level: 'healthy'
  };
}

/**
 * Generate mock popular emotion
 */
function getMockPopularEmotion(): PopularEmotionResult {
  return {
    emotion: 'Hopeful',
    count: 45,
    percentage: 28,
    sentimentTier: 5,
    secondMostPopular: {
      emotion: 'Content',
      percentage: 22
    }
  };
}

// ============================================
// Public API Functions
// ============================================

/**
 * Calculate emotional volatility for a class
 * Returns standard deviation and volatility level
 */
export async function calculateEmotionalVolatility(
  classId: string,
  period: 'week' | 'month' | '3months' = 'month'
): Promise<VolatilityResult> {
  if (USE_MOCK_DATA) {
    return getMockVolatility();
  }

  const { startDate, endDate } = getDateRange(period);

  const { data: pulseChecks, error } = await supabase
    .from('pulse_checks')
    .select('emotion, created_at, user_id')
    .eq('class_id', classId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error || !pulseChecks || pulseChecks.length === 0) {
    return {
      standardDeviation: 0,
      level: 'low',
      interpretation: 'Insufficient data to calculate volatility'
    };
  }

  // Convert emotions to sentiment values
  const sentimentValues = pulseChecks.map(check =>
    getEmotionSentimentValue(check.emotion)
  );

  const sd = calculateStandardDeviation(sentimentValues);

  // Determine volatility level
  let level: VolatilityResult['level'];
  let interpretation: string;

  if (sd <= 0.5) {
    level = 'low';
    interpretation = 'Class shows very stable emotions. Students are consistently feeling similar.';
  } else if (sd <= 1.0) {
    level = 'medium';
    interpretation = 'Students show moderate emotional fluctuation. Some variability is normal.';
  } else if (sd <= 1.5) {
    level = 'high';
    interpretation = 'Class shows significant mood swings. Consider checking in with students.';
  } else {
    level = 'extreme';
    interpretation = 'Major emotional volatility detected. Immediate attention recommended.';
  }

  return {
    standardDeviation: sd,
    level,
    interpretation
  };
}

/**
 * Get low-mood alerts for this week across all teacher's classes
 */
export async function getLowMoodAlertsThisWeek(
  _teacherId: string
): Promise<LowMoodAlertsResult> {
  if (USE_MOCK_DATA) {
    return getMockLowMoodAlerts();
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: alerts, error } = await supabase
    .from('mood_alert_logs')
    .select(`
      *,
      profiles:user_id (
        full_name,
        display_name
      )
    `)
    .gte('alert_date', weekAgo.toISOString())
    .order('alert_date', { ascending: false });

  if (error || !alerts) {
    return {
      totalAlerts: 0,
      newThisWeek: 0,
      breakdown: {
        persistentLow: 0,
        suddenDrop: 0,
        highVolatility: 0,
        prolongedNegative: 0
      },
      alerts: []
    };
  }

  // Calculate breakdown
  const breakdown = {
    persistentLow: alerts.filter(a => a.alert_type === 'persistent_low').length,
    suddenDrop: alerts.filter(a => a.alert_type === 'sudden_drop').length,
    highVolatility: alerts.filter(a => a.alert_type === 'high_volatility').length,
    prolongedNegative: alerts.filter(a => a.alert_type === 'prolonged_negative').length
  };

  // Map to AlertInfo format
  const alertInfos: AlertInfo[] = alerts.map(alert => ({
    id: alert.id,
    studentId: alert.user_id,
    studentName: alert.profiles?.display_name || alert.profiles?.full_name || 'Unknown Student',
    alertType: alert.alert_type,
    alertDate: new Date(alert.alert_date),
    sentimentValue: alert.sentiment_value || 0,
    daysAtRisk: calculateDaysAtRisk(alert.alert_date),
    severity: determineSeverity(alert.alert_type, alert.sentiment_value)
  }));

  return {
    totalAlerts: alerts.length,
    newThisWeek: alerts.length,
    breakdown,
    alerts: alertInfos
  };
}

/**
 * Get alert timeline showing daily alert counts
 */
export async function getAlertTimeline(
  classId: string,
  period: 'week' | 'month' = 'week'
): Promise<AlertTimelinePoint[]> {
  if (USE_MOCK_DATA) {
    return getMockAlertTimeline();
  }

  const { startDate, endDate } = getDateRange(period);

  const { data: alerts, error } = await supabase
    .from('mood_alert_logs')
    .select('*')
    .eq('class_id', classId)
    .gte('alert_date', startDate.toISOString())
    .lte('alert_date', endDate.toISOString());

  if (error || !alerts) {
    return [];
  }

  // Group alerts by date
  const timeline: Map<string, AlertTimelinePoint> = new Map();

  alerts.forEach(alert => {
    const date = alert.alert_date.split('T')[0];

    if (!timeline.has(date)) {
      timeline.set(date, {
        date,
        alertCount: 0,
        alertTypes: {
          persistentLow: 0,
          suddenDrop: 0,
          highVolatility: 0,
          prolongedNegative: 0
        }
      });
    }

    const point = timeline.get(date)!;
    point.alertCount++;

    if (alert.alert_type === 'persistent_low') point.alertTypes.persistentLow++;
    else if (alert.alert_type === 'sudden_drop') point.alertTypes.suddenDrop++;
    else if (alert.alert_type === 'high_volatility') point.alertTypes.highVolatility++;
    else if (alert.alert_type === 'prolonged_negative') point.alertTypes.prolongedNegative++;
  });

  return Array.from(timeline.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate recovery rate for students who received interventions
 */
export async function calculateRecoveryRate(
  teacherId: string,
  period: 'month' | '3months' | 'semester' = 'month'
): Promise<RecoveryRateResult> {
  if (USE_MOCK_DATA) {
    return getMockRecoveryRate();
  }

  const { startDate, endDate } = getDateRange(period);

  const { data: interventions, error } = await supabase
    .from('intervention_logs')
    .select('*')
    .eq('teacher_id', teacherId)
    .gte('intervention_date', startDate.toISOString())
    .lte('intervention_date', endDate.toISOString());

  if (error || !interventions || interventions.length === 0) {
    return {
      recoveryRate: 0,
      averageDaysToRecovery: 0,
      totalInterventions: 0,
      successfulRecoveries: 0,
      byInterventionType: []
    };
  }

  // Calculate recoveries
  const successfulRecoveries = interventions.filter(i =>
    i.outcome === 'improved' && i.outcome_date
  );

  const recoveryRate = (successfulRecoveries.length / interventions.length) * 100;

  // Calculate average days to recovery
  const recoveryDays = successfulRecoveries.map(i => {
    const interventionDate = new Date(i.intervention_date);
    const outcomeDate = new Date(i.outcome_date);
    return Math.floor((outcomeDate.getTime() - interventionDate.getTime()) / (1000 * 60 * 60 * 24));
  });

  const avgDays = recoveryDays.length > 0
    ? recoveryDays.reduce((sum, days) => sum + days, 0) / recoveryDays.length
    : 0;

  // Group by intervention type
  const byType: Map<string, { successes: number; total: number; totalDays: number }> = new Map();

  interventions.forEach(intervention => {
    const type = intervention.intervention_type;
    if (!byType.has(type)) {
      byType.set(type, { successes: 0, total: 0, totalDays: 0 });
    }

    const typeData = byType.get(type)!;
    typeData.total++;

    if (intervention.outcome === 'improved' && intervention.outcome_date) {
      typeData.successes++;
      const days = Math.floor(
        (new Date(intervention.outcome_date).getTime() - new Date(intervention.intervention_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      typeData.totalDays += days;
    }
  });

  const byInterventionType = Array.from(byType.entries()).map(([type, data]) => ({
    type,
    rate: (data.successes / data.total) * 100,
    avgDays: data.successes > 0 ? data.totalDays / data.successes : 0
  }));

  return {
    recoveryRate,
    averageDaysToRecovery: avgDays,
    totalInterventions: interventions.length,
    successfulRecoveries: successfulRecoveries.length,
    byInterventionType
  };
}

/**
 * Analyze intervention effectiveness by type
 */
export async function analyzeInterventionEffectiveness(
  teacherId: string
): Promise<InterventionEffectivenessResult> {
  if (USE_MOCK_DATA) {
    const mockData = getMockRecoveryRate();
    return {
      overallEffectiveness: mockData.recoveryRate,
      byType: mockData.byInterventionType.map(item => ({
        type: item.type,
        effectiveness: item.rate,
        count: Math.floor(Math.random() * 10) + 5,
        avgRecoveryDays: item.avgDays
      }))
    };
  }

  const recoveryData = await calculateRecoveryRate(teacherId, '3months');

  return {
    overallEffectiveness: recoveryData.recoveryRate,
    byType: recoveryData.byInterventionType.map(item => ({
      type: item.type,
      effectiveness: item.rate,
      count: 0, // Would need additional query to get count
      avgRecoveryDays: item.avgDays
    }))
  };
}

/**
 * Calculate positive-to-negative sentiment ratio
 * Positive: Tier 4-6, Negative: Tier 1-3
 */
export async function calculatePositiveSentimentRatio(
  classId: string,
  period: 'week' | 'month' | '3months' = 'month'
): Promise<PositiveSentimentRatioResult> {
  if (USE_MOCK_DATA) {
    return getMockPositiveRatio();
  }

  const { startDate, endDate } = getDateRange(period);

  const { data: pulseChecks, error } = await supabase
    .from('pulse_checks')
    .select('emotion')
    .eq('class_id', classId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error || !pulseChecks || pulseChecks.length === 0) {
    return {
      ratio: 0,
      ratioString: '0:0',
      positiveCount: 0,
      negativeCount: 0,
      positivePercentage: 0,
      negativePercentage: 0,
      level: 'concerning'
    };
  }

  let positiveCount = 0;
  let negativeCount = 0;

  pulseChecks.forEach(check => {
    const sentiment = getEmotionSentimentValue(check.emotion);
    if (sentiment >= 4) {
      positiveCount++;
    } else {
      negativeCount++;
    }
  });

  const total = positiveCount + negativeCount;
  const ratio = negativeCount > 0 ? positiveCount / negativeCount : positiveCount;
  const positivePercentage = (positiveCount / total) * 100;
  const negativePercentage = (negativeCount / total) * 100;

  // Determine level
  let level: PositiveSentimentRatioResult['level'];
  if (ratio >= 4) level = 'excellent';
  else if (ratio >= 3) level = 'healthy';
  else if (ratio >= 1.5) level = 'moderate';
  else level = 'concerning';

  return {
    ratio,
    ratioString: `${ratio.toFixed(1)}:1`,
    positiveCount,
    negativeCount,
    positivePercentage,
    negativePercentage,
    level
  };
}

/**
 * Get most popular emotion for a specific date or date range
 */
export async function getMostPopularEmotion(
  classId: string,
  date?: Date
): Promise<PopularEmotionResult | null> {
  if (USE_MOCK_DATA) {
    return getMockPopularEmotion();
  }

  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: pulseChecks, error } = await supabase
    .from('pulse_checks')
    .select('emotion')
    .eq('class_id', classId)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString());

  if (error || !pulseChecks || pulseChecks.length === 0) {
    return null;
  }

  // Count emotions
  const emotionCounts: Map<string, number> = new Map();
  pulseChecks.forEach(check => {
    const count = emotionCounts.get(check.emotion) || 0;
    emotionCounts.set(check.emotion, count + 1);
  });

  // Sort by count
  const sorted = Array.from(emotionCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return null;

  const [topEmotion, topCount] = sorted[0];
  const percentage = (topCount / pulseChecks.length) * 100;
  const sentimentTier = getEmotionSentimentValue(topEmotion);

  let secondMostPopular;
  if (sorted.length > 1) {
    const [secondEmotion, secondCount] = sorted[1];
    secondMostPopular = {
      emotion: secondEmotion as EmotionName,
      percentage: (secondCount / pulseChecks.length) * 100
    };
  }

  return {
    emotion: topEmotion as EmotionName,
    count: topCount,
    percentage,
    sentimentTier,
    secondMostPopular
  };
}

// ============================================
// Helper Functions
// ============================================

function calculateDaysAtRisk(alertDate: string): number {
  const alert = new Date(alertDate);
  const now = new Date();
  return Math.floor((now.getTime() - alert.getTime()) / (1000 * 60 * 60 * 24));
}

function determineSeverity(
  alertType: string,
  sentimentValue: number
): 'medium' | 'high' | 'critical' {
  if (alertType === 'sudden_drop' || sentimentValue <= 1.5) {
    return 'critical';
  } else if (alertType === 'persistent_low' || sentimentValue <= 2.5) {
    return 'high';
  } else {
    return 'medium';
  }
}
