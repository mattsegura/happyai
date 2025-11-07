import { supabase } from '../supabase';
import { getEmotionSentimentValue } from '../emotionConfig';

/**
 * Alert Generator Service
 * Analyzes student sentiment patterns and generates mood alerts
 * Runs daily via Edge Function at 6 AM
 */

// ============================================
// Types
// ============================================

export interface AlertCriteria {
  userId: string;
  classId: string;
  alertType: 'persistent_low' | 'sudden_drop' | 'high_volatility' | 'prolonged_negative';
  sentimentValue: number;
  severity: 'medium' | 'high' | 'critical';
}

export interface GeneratedAlert {
  userId: string;
  classId: string;
  alertType: string;
  sentimentValue: number;
  severity: string;
  created: boolean;
  error?: string;
}

// ============================================
// Alert Criteria Functions
// ============================================

/**
 * Check if student has persistent low mood (Tier 1 for 3+ consecutive days)
 */
async function checkPersistentLowMood(userId: string, classId: string): Promise<AlertCriteria | null> {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: pulseChecks, error } = await supabase
    .from('pulse_checks')
    .select('emotion, created_at')
    .eq('user_id', userId)
    .eq('class_id', classId)
    .gte('created_at', threeDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (error || !pulseChecks || pulseChecks.length < 3) {
    return null;
  }

  // Check if last 3 consecutive days all have Tier 1 sentiment
  const recentChecks = pulseChecks.slice(-3);
  const allTier1 = recentChecks.every(check => getEmotionSentimentValue(check.emotion) === 1);

  if (allTier1) {
    const avgSentiment = recentChecks.reduce((sum, check) =>
      sum + getEmotionSentimentValue(check.emotion), 0
    ) / recentChecks.length;

    return {
      userId,
      classId,
      alertType: 'persistent_low',
      sentimentValue: avgSentiment,
      severity: 'critical'
    };
  }

  return null;
}

/**
 * Check if student has sudden mood drop (Tier 5-6 to 1-2 in <3 days)
 */
async function checkSuddenMoodDrop(userId: string, classId: string): Promise<AlertCriteria | null> {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: pulseChecks, error } = await supabase
    .from('pulse_checks')
    .select('emotion, created_at')
    .eq('user_id', userId)
    .eq('class_id', classId)
    .gte('created_at', threeDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (error || !pulseChecks || pulseChecks.length < 2) {
    return null;
  }

  // Check if went from high (5-6) to low (1-2) in last 3 days
  const firstCheck = pulseChecks[0];
  const lastCheck = pulseChecks[pulseChecks.length - 1];

  const firstSentiment = getEmotionSentimentValue(firstCheck.emotion);
  const lastSentiment = getEmotionSentimentValue(lastCheck.emotion);

  if (firstSentiment >= 5 && lastSentiment <= 2) {
    return {
      userId,
      classId,
      alertType: 'sudden_drop',
      sentimentValue: lastSentiment,
      severity: 'critical'
    };
  }

  return null;
}

/**
 * Check if student has high volatility (SD > 1.5)
 */
async function checkHighVolatility(userId: string, classId: string): Promise<AlertCriteria | null> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: pulseChecks, error } = await supabase
    .from('pulse_checks')
    .select('emotion')
    .eq('user_id', userId)
    .eq('class_id', classId)
    .gte('created_at', sevenDaysAgo.toISOString());

  if (error || !pulseChecks || pulseChecks.length < 5) {
    return null;
  }

  // Calculate standard deviation
  const sentiments = pulseChecks.map(check => getEmotionSentimentValue(check.emotion));
  const mean = sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length;
  const squaredDiffs = sentiments.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / sentiments.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev > 1.5) {
    const currentSentiment = sentiments[sentiments.length - 1];
    return {
      userId,
      classId,
      alertType: 'high_volatility',
      sentimentValue: currentSentiment,
      severity: 'high'
    };
  }

  return null;
}

/**
 * Check if student has prolonged negative mood (Tier 1-2 for >5 out of 7 days)
 */
async function checkProlongedNegative(userId: string, classId: string): Promise<AlertCriteria | null> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: pulseChecks, error } = await supabase
    .from('pulse_checks')
    .select('emotion')
    .eq('user_id', userId)
    .eq('class_id', classId)
    .gte('created_at', sevenDaysAgo.toISOString());

  if (error || !pulseChecks || pulseChecks.length < 7) {
    return null;
  }

  // Count days with Tier 1-2 sentiment
  const negativeDays = pulseChecks.filter(check => {
    const sentiment = getEmotionSentimentValue(check.emotion);
    return sentiment <= 2;
  }).length;

  if (negativeDays > 5) {
    const avgSentiment = pulseChecks.reduce((sum, check) =>
      sum + getEmotionSentimentValue(check.emotion), 0
    ) / pulseChecks.length;

    return {
      userId,
      classId,
      alertType: 'prolonged_negative',
      sentimentValue: avgSentiment,
      severity: 'high'
    };
  }

  return null;
}

// ============================================
// Main Alert Generation Function
// ============================================

/**
 * Generate alerts for all students
 * Runs daily via Edge Function
 */
export async function generateDailyAlerts(): Promise<GeneratedAlert[]> {
  const results: GeneratedAlert[] = [];

  try {
    // Get all active students (who have submitted pulse checks recently)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activeStudents, error: studentsError } = await supabase
      .from('pulse_checks')
      .select('user_id, class_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('user_id');

    if (studentsError || !activeStudents) {
      console.error('Error fetching active students:', studentsError);
      return results;
    }

    // Get unique student-class pairs
    const uniquePairs = Array.from(
      new Set(activeStudents.map(s => `${s.user_id}:${s.class_id}`))
    ).map(pair => {
      const [userId, classId] = pair.split(':');
      return { userId, classId };
    });

    // Check each student for alert criteria
    for (const { userId, classId } of uniquePairs) {
      try {
        // Check all criteria
        const alerts = await Promise.all([
          checkPersistentLowMood(userId, classId),
          checkSuddenMoodDrop(userId, classId),
          checkHighVolatility(userId, classId),
          checkProlongedNegative(userId, classId)
        ]);

        // Filter out null results
        const validAlerts = alerts.filter((alert): alert is AlertCriteria => alert !== null);

        // Create alerts in database (avoid duplicates)
        for (const alert of validAlerts) {
          // Check if alert already exists for today
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const { data: existing } = await supabase
            .from('mood_alert_logs')
            .select('id')
            .eq('user_id', alert.userId)
            .eq('class_id', alert.classId)
            .eq('alert_type', alert.alertType)
            .gte('alert_date', today.toISOString())
            .single();

          if (!existing) {
            // Create new alert
            const { error: insertError } = await supabase
              .from('mood_alert_logs')
              .insert({
                user_id: alert.userId,
                class_id: alert.classId,
                alert_type: alert.alertType,
                alert_date: new Date().toISOString(),
                sentiment_value: alert.sentimentValue,
                severity: alert.severity,
                is_acknowledged: false
              });

            results.push({
              userId: alert.userId,
              classId: alert.classId,
              alertType: alert.alertType,
              sentimentValue: alert.sentimentValue,
              severity: alert.severity,
              created: !insertError,
              error: insertError?.message
            });
          }
        }
      } catch (error) {
        console.error(`Error processing alerts for student ${userId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error generating daily alerts:', error);
  }

  return results;
}

/**
 * Generate alerts for a specific student
 * Useful for manual trigger or testing
 */
export async function generateAlertsForStudent(
  userId: string,
  classId: string
): Promise<GeneratedAlert[]> {
  const results: GeneratedAlert[] = [];

  try {
    const alerts = await Promise.all([
      checkPersistentLowMood(userId, classId),
      checkSuddenMoodDrop(userId, classId),
      checkHighVolatility(userId, classId),
      checkProlongedNegative(userId, classId)
    ]);

    const validAlerts = alerts.filter((alert): alert is AlertCriteria => alert !== null);

    for (const alert of validAlerts) {
      const { error: insertError } = await supabase
        .from('mood_alert_logs')
        .insert({
          user_id: alert.userId,
          class_id: alert.classId,
          alert_type: alert.alertType,
          alert_date: new Date().toISOString(),
          sentiment_value: alert.sentimentValue,
          severity: alert.severity,
          is_acknowledged: false
        });

      results.push({
        userId: alert.userId,
        classId: alert.classId,
        alertType: alert.alertType,
        sentimentValue: alert.sentimentValue,
        severity: alert.severity,
        created: !insertError,
        error: insertError?.message
      });
    }
  } catch (error) {
    console.error(`Error generating alerts for student ${userId}:`, error);
  }

  return results;
}
