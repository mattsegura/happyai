/**
 * Enhanced At-Risk Detection Engine
 *
 * Comprehensive student risk assessment combining:
 * - Emotional risk flags (from mood_alert_logs and pulse_checks)
 * - Academic risk flags (from Canvas API or mock data)
 * - Cross-risk detection (both emotional AND academic = CRITICAL)
 *
 * Phase 5: Care Alerts System
 */

import { supabase } from '../supabase';
import {
  getMockAcademicData,
  detectAcademicRiskFlags,
  shouldUseMockAcademicData,
  type AcademicRiskFlags,
} from './mockAcademicData';

export type RiskSeverity = 'medium' | 'high' | 'critical';

export type RiskType = 'emotional' | 'academic' | 'cross-risk';

export interface EmotionalRiskDetails {
  hasEmotionalRisk: boolean;
  persistentLow: boolean; // Tier 1 for 3+ consecutive days
  prolongedNegative: boolean; // Tier 1-2 for >5 out of 7 days
  suddenDrop: boolean; // Tier 5-6 to 1-2 in <3 days
  highVolatility: boolean; // SD > 1.5
  currentSentiment: number;
  sentimentTrend: 'improving' | 'declining' | 'stable';
  daysAtRisk: number;
}

export interface AcademicRiskDetails {
  hasAcademicRisk: boolean;
  flags: AcademicRiskFlags;
  currentGrade: number;
  previousGrade?: number;
  missingAssignments: number;
  participationRate: number;
}

export interface AtRiskStudent {
  userId: string;
  studentName: string;
  classId: string;
  className: string;

  // Risk assessment
  riskType: RiskType;
  severity: RiskSeverity;
  daysAtRisk: number;

  // Detailed risk info
  emotionalRisk?: EmotionalRiskDetails;
  academicRisk?: AcademicRiskDetails;

  // Alert metadata
  alertIds: string[]; // IDs of mood_alert_logs
  lastAlertDate: Date;

  // Recent interactions
  lastPulseCheck?: Date;
  lastIntervention?: Date;
  interventionCount: number;
}

/**
 * Detect emotional risk patterns from pulse check history
 */
export async function detectEmotionalRisk(
  userId: string,
  _classId: string
): Promise<EmotionalRiskDetails> {
  const details: EmotionalRiskDetails = {
    hasEmotionalRisk: false,
    persistentLow: false,
    prolongedNegative: false,
    suddenDrop: false,
    highVolatility: false,
    currentSentiment: 3.5,
    sentimentTrend: 'stable',
    daysAtRisk: 0,
  };

  try {
    // Get last 7 days of pulse checks
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: pulseChecks, error } = await supabase
      .from('pulse_checks')
      .select('sentiment_value, emotion, created_at')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!pulseChecks || pulseChecks.length === 0) {
      return details;
    }

    // Calculate current sentiment (average of last 3 days)
    const recent = pulseChecks.slice(0, Math.min(3, pulseChecks.length));
    details.currentSentiment =
      recent.reduce((sum, p) => sum + (p.sentiment_value || 3), 0) /
      recent.length;

    // Check for persistent low (Tier 1 for 3+ consecutive days)
    let consecutiveLow = 0;
    for (const check of pulseChecks) {
      if (check.sentiment_value === 1) {
        consecutiveLow++;
        if (consecutiveLow >= 3) {
          details.persistentLow = true;
          details.hasEmotionalRisk = true;
          details.daysAtRisk = Math.max(details.daysAtRisk, consecutiveLow);
          break;
        }
      } else {
        consecutiveLow = 0;
      }
    }

    // Check for prolonged negative (Tier 1-2 for >5 out of 7 days)
    const lowTierDays = pulseChecks.filter(
      (p) => p.sentiment_value && p.sentiment_value <= 2
    ).length;
    if (lowTierDays > 5) {
      details.prolongedNegative = true;
      details.hasEmotionalRisk = true;
      details.daysAtRisk = Math.max(details.daysAtRisk, lowTierDays);
    }

    // Check for sudden drop (Tier 5-6 to 1-2 in <3 days)
    if (pulseChecks.length >= 3) {
      const recentThree = pulseChecks.slice(0, 3);
      const hasRecentLow = recentThree.some(
        (p) => p.sentiment_value && p.sentiment_value <= 2
      );

      // Get sentiment from 3+ days ago
      const olderChecks = pulseChecks.slice(3);
      const hadRecentHigh = olderChecks
        .slice(0, 3)
        .some((p) => p.sentiment_value && p.sentiment_value >= 5);

      if (hasRecentLow && hadRecentHigh) {
        details.suddenDrop = true;
        details.hasEmotionalRisk = true;
        details.daysAtRisk = Math.max(details.daysAtRisk, 3);
      }
    }

    // Check for high volatility (SD > 1.5)
    if (pulseChecks.length >= 5) {
      const sentiments = pulseChecks
        .slice(0, 7)
        .map((p) => p.sentiment_value || 3);
      const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
      const squareDiffs = sentiments.map((s) => Math.pow(s - mean, 2));
      const variance =
        squareDiffs.reduce((a, b) => a + b, 0) / sentiments.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 1.5) {
        details.highVolatility = true;
        details.hasEmotionalRisk = true;
        details.daysAtRisk = Math.max(details.daysAtRisk, 7);
      }
    }

    // Determine sentiment trend
    if (pulseChecks.length >= 5) {
      const recentAvg =
        pulseChecks
          .slice(0, 3)
          .reduce((sum, p) => sum + (p.sentiment_value || 3), 0) / 3;
      const olderAvg =
        pulseChecks
          .slice(3, 6)
          .reduce((sum, p) => sum + (p.sentiment_value || 3), 0) / 3;

      if (recentAvg > olderAvg + 0.5) {
        details.sentimentTrend = 'improving';
      } else if (recentAvg < olderAvg - 0.5) {
        details.sentimentTrend = 'declining';
      }
    }
  } catch (error) {
    console.error('Error detecting emotional risk:', error);
  }

  return details;
}

/**
 * Detect academic risk patterns
 */
export async function detectAcademicRisk(
  userId: string,
  classId: string
): Promise<AcademicRiskDetails> {
  const details: AcademicRiskDetails = {
    hasAcademicRisk: false,
    flags: {
      lowGrade: false,
      missingWork: false,
      gradeDecline: false,
      lowParticipation: false,
    },
    currentGrade: 85,
    missingAssignments: 0,
    participationRate: 80,
  };

  try {
    // Check if using mock data
    if (shouldUseMockAcademicData()) {
      const mockData = getMockAcademicData(userId, classId);
      if (mockData) {
        details.currentGrade = mockData.currentGrade;
        details.previousGrade = mockData.previousGrade;
        details.missingAssignments = mockData.missingAssignments;
        details.participationRate = mockData.participationRate;
        details.flags = detectAcademicRiskFlags(mockData);
        details.hasAcademicRisk = Object.values(details.flags).some(
          (flag) => flag
        );
      }
    } else {
      // TODO: Fetch real Canvas data when Canvas API is integrated
      // This will involve:
      // 1. Get current grade from Canvas Grades API
      // 2. Get missing assignments from Canvas Assignments API
      // 3. Get participation rate from class_pulse_responses
      // 4. Calculate grade decline by comparing with historical grades

      // For now, fall back to mock data
      const mockData = getMockAcademicData(userId, classId);
      if (mockData) {
        details.currentGrade = mockData.currentGrade;
        details.previousGrade = mockData.previousGrade;
        details.missingAssignments = mockData.missingAssignments;
        details.participationRate = mockData.participationRate;
        details.flags = detectAcademicRiskFlags(mockData);
        details.hasAcademicRisk = Object.values(details.flags).some(
          (flag) => flag
        );
      }
    }
  } catch (error) {
    console.error('Error detecting academic risk:', error);
  }

  return details;
}

/**
 * Calculate overall risk severity
 */
function calculateRiskSeverity(
  emotionalRisk?: EmotionalRiskDetails,
  academicRisk?: AcademicRiskDetails
): RiskSeverity {
  // Cross-risk (both emotional AND academic) = CRITICAL
  if (
    emotionalRisk?.hasEmotionalRisk &&
    academicRisk?.hasAcademicRisk
  ) {
    return 'critical';
  }

  // High emotional risk patterns
  if (emotionalRisk?.hasEmotionalRisk) {
    if (
      emotionalRisk.persistentLow ||
      emotionalRisk.suddenDrop ||
      emotionalRisk.currentSentiment <= 1.5
    ) {
      return 'high';
    }
    return 'medium';
  }

  // High academic risk patterns
  if (academicRisk?.hasAcademicRisk) {
    if (
      academicRisk.currentGrade < 60 ||
      academicRisk.missingAssignments >= 5 ||
      (academicRisk.flags.lowGrade && academicRisk.flags.gradeDecline)
    ) {
      return 'high';
    }
    return 'medium';
  }

  return 'medium';
}

/**
 * Determine risk type
 */
function determineRiskType(
  emotionalRisk?: EmotionalRiskDetails,
  academicRisk?: AcademicRiskDetails
): RiskType {
  if (
    emotionalRisk?.hasEmotionalRisk &&
    academicRisk?.hasAcademicRisk
  ) {
    return 'cross-risk';
  }
  if (academicRisk?.hasAcademicRisk) {
    return 'academic';
  }
  return 'emotional';
}

/**
 * Get existing mood alert logs for a student
 */
async function getMoodAlertLogs(userId: string, classId: string) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('mood_alert_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .eq('is_acknowledged', false)
      .gte('alert_date', sevenDaysAgo.toISOString())
      .order('alert_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching mood alert logs:', error);
    return [];
  }
}

/**
 * Get last intervention for a student
 */
async function getLastIntervention(userId: string, classId: string) {
  try {
    const { data, error } = await supabase
      .from('intervention_logs')
      .select('intervention_date')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .order('intervention_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.intervention_date ? new Date(data.intervention_date) : null;
  } catch (error) {
    console.error('Error fetching last intervention:', error);
    return null;
  }
}

/**
 * Get intervention count for a student
 */
async function getInterventionCount(userId: string, classId: string) {
  try {
    const { count, error } = await supabase
      .from('intervention_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('class_id', classId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching intervention count:', error);
    return 0;
  }
}

/**
 * Detect at-risk students for a teacher
 *
 * @param teacherId - The teacher's user ID
 * @param classId - Optional: Filter by specific class
 * @returns Array of at-risk students sorted by severity
 */
export async function detectAtRiskStudents(
  teacherId: string,
  classId?: string
): Promise<AtRiskStudent[]> {
  try {
    // Get teacher's classes
    const classQuery = supabase
      .from('classes')
      .select('id, name')
      .eq('teacher_id', teacherId);

    if (classId) {
      classQuery.eq('id', classId);
    }

    const { data: classes, error: classError } = await classQuery;
    if (classError) throw classError;

    if (!classes || classes.length === 0) {
      console.log('[AtRiskDetection] No classes in database, using mock at-risk students');

      // Return mock at-risk students for demo
      return [
        {
          userId: 'student-3',
          studentName: 'Michael Chen',
          classId: 'class-1',
          className: 'Introduction to Psychology',
          riskType: 'cross-risk',
          severity: 'high',
          daysAtRisk: 4,
          emotionalRisk: {
            hasEmotionalRisk: true,
            persistentLow: false,
            prolongedNegative: true,
            suddenDrop: false,
            highVolatility: true,
            currentSentiment: 1.5,
            sentimentTrend: 'declining',
            daysAtRisk: 4,
          },
          academicRisk: {
            hasAcademicRisk: true,
            flags: {
              lowGrade: true,
              missingWork: true,
              gradeDecline: true,
              lowParticipation: true,
            },
            currentGrade: 75,
            previousGrade: 85,
            missingAssignments: 3,
            participationRate: 45,
          },
          alertIds: ['alert-1', 'alert-2'],
          lastAlertDate: new Date(),
          lastPulseCheck: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
          interventionCount: 0,
        },
        {
          userId: 'student-8',
          studentName: 'Sophia Lee',
          classId: 'class-3',
          className: 'World History',
          riskType: 'emotional',
          severity: 'critical',
          daysAtRisk: 5,
          emotionalRisk: {
            hasEmotionalRisk: true,
            persistentLow: true,
            prolongedNegative: true,
            suddenDrop: false,
            highVolatility: false,
            currentSentiment: 1.0,
            sentimentTrend: 'declining',
            daysAtRisk: 5,
          },
          alertIds: ['alert-3'],
          lastAlertDate: new Date(),
          lastPulseCheck: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
          interventionCount: 0,
        },
        {
          userId: 'student-6',
          studentName: 'Jessica Thompson',
          classId: 'class-2',
          className: 'English Literature',
          riskType: 'emotional',
          severity: 'medium',
          daysAtRisk: 2,
          emotionalRisk: {
            hasEmotionalRisk: true,
            persistentLow: false,
            prolongedNegative: false,
            suddenDrop: false,
            highVolatility: true,
            currentSentiment: 2.5,
            sentimentTrend: 'stable',
            daysAtRisk: 2,
          },
          alertIds: ['alert-4'],
          lastAlertDate: new Date(),
          lastPulseCheck: new Date(Date.now() - 1000 * 60 * 60 * 24),
          interventionCount: 0,
        },
      ];
    }

    const atRiskStudents: AtRiskStudent[] = [];

    // For each class, get enrolled students
    for (const cls of classes) {
      const { data: enrollments, error: enrollError } = await supabase
        .from('class_enrollments')
        .select('user_id, profiles(id, full_name, display_name)')
        .eq('class_id', cls.id)
        .eq('status', 'active');

      if (enrollError) {
        console.error('Error fetching enrollments:', enrollError);
        continue;
      }

      if (!enrollments || enrollments.length === 0) continue;

      // For each student, assess risk
      for (const enrollment of enrollments) {
        const userId = enrollment.user_id;
        const studentName =
          (enrollment.profiles as any)?.display_name ||
          (enrollment.profiles as any)?.full_name ||
          'Unknown Student';

        // Detect emotional risk
        const emotionalRisk = await detectEmotionalRisk(userId, cls.id);

        // Detect academic risk
        const academicRisk = await detectAcademicRisk(userId, cls.id);

        // Only include if student has any risk
        if (
          !emotionalRisk.hasEmotionalRisk &&
          !academicRisk.hasAcademicRisk
        ) {
          continue;
        }

        // Get mood alert logs
        const alertLogs = await getMoodAlertLogs(userId, cls.id);

        // Get intervention data
        const lastIntervention = await getLastIntervention(userId, cls.id);
        const interventionCount = await getInterventionCount(userId, cls.id);

        // Get last pulse check
        const { data: lastPulse } = await supabase
          .from('pulse_checks')
          .select('created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const student: AtRiskStudent = {
          userId,
          studentName,
          classId: cls.id,
          className: cls.name,
          riskType: determineRiskType(emotionalRisk, academicRisk),
          severity: calculateRiskSeverity(emotionalRisk, academicRisk),
          daysAtRisk: Math.max(
            emotionalRisk.daysAtRisk,
            academicRisk.hasAcademicRisk ? 7 : 0
          ),
          emotionalRisk: emotionalRisk.hasEmotionalRisk
            ? emotionalRisk
            : undefined,
          academicRisk: academicRisk.hasAcademicRisk
            ? academicRisk
            : undefined,
          alertIds: alertLogs.map((log) => log.id),
          lastAlertDate:
            alertLogs.length > 0
              ? new Date(alertLogs[0].alert_date)
              : new Date(),
          lastPulseCheck: lastPulse?.created_at
            ? new Date(lastPulse.created_at)
            : undefined,
          lastIntervention: lastIntervention || undefined,
          interventionCount,
        };

        atRiskStudents.push(student);
      }
    }

    // Sort by severity (critical > high > medium) then by days at risk
    const severityOrder: Record<RiskSeverity, number> = {
      critical: 3,
      high: 2,
      medium: 1,
    };

    atRiskStudents.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.daysAtRisk - a.daysAtRisk;
    });

    return atRiskStudents;
  } catch (error) {
    console.error('Error detecting at-risk students:', error);
    return [];
  }
}

/**
 * Get at-risk student count by severity
 */
export async function getAtRiskCounts(teacherId: string, classId?: string) {
  const students = await detectAtRiskStudents(teacherId, classId);

  return {
    total: students.length,
    critical: students.filter((s) => s.severity === 'critical').length,
    high: students.filter((s) => s.severity === 'high').length,
    medium: students.filter((s) => s.severity === 'medium').length,
    emotional: students.filter((s) => s.riskType === 'emotional' || s.riskType === 'cross-risk').length,
    academic: students.filter((s) => s.riskType === 'academic' || s.riskType === 'cross-risk').length,
    crossRisk: students.filter((s) => s.riskType === 'cross-risk').length,
  };
}
