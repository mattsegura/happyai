// Supabase Edge Function: Generate Daily Mood Alerts
// Runs daily at 6 AM to analyze student sentiment patterns
// and create mood alerts for teachers

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================
// Environment Variables
// ============================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============================================
// Helper Functions
// ============================================

const EMOTION_SENTIMENT_MAP: Record<string, number> = {
  'Scared': 1,
  'Sad': 1,
  'Lonely': 1,
  'Frustrated': 2,
  'Worried': 2,
  'Nervous': 2,
  'Tired': 3,
  'Bored': 3,
  'Careless': 3,
  'Peaceful': 4,
  'Relieved': 4,
  'Content': 4,
  'Hopeful': 5,
  'Proud': 5,
  'Happy': 6,
  'Excited': 6,
  'Inspired': 6,
};

function getEmotionSentimentValue(emotion: string): number {
  return EMOTION_SENTIMENT_MAP[emotion] || 3;
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
}

// ============================================
// Alert Criteria Checks
// ============================================

async function checkPersistentLowMood(
  supabase: any,
  userId: string,
  classId: string
): Promise<any | null> {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: pulseChecks } = await supabase
    .from('pulse_checks')
    .select('emotion, created_at')
    .eq('user_id', userId)
    .eq('class_id', classId)
    .gte('created_at', threeDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (!pulseChecks || pulseChecks.length < 3) return null;

  const recentChecks = pulseChecks.slice(-3);
  const allTier1 = recentChecks.every((check: any) => getEmotionSentimentValue(check.emotion) === 1);

  if (allTier1) {
    const avgSentiment = recentChecks.reduce((sum: number, check: any) =>
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

async function checkSuddenMoodDrop(
  supabase: any,
  userId: string,
  classId: string
): Promise<any | null> {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: pulseChecks } = await supabase
    .from('pulse_checks')
    .select('emotion, created_at')
    .eq('user_id', userId)
    .eq('class_id', classId)
    .gte('created_at', threeDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (!pulseChecks || pulseChecks.length < 2) return null;

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

async function checkHighVolatility(
  supabase: any,
  userId: string,
  classId: string
): Promise<any | null> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: pulseChecks } = await supabase
    .from('pulse_checks')
    .select('emotion')
    .eq('user_id', userId)
    .eq('class_id', classId)
    .gte('created_at', sevenDaysAgo.toISOString());

  if (!pulseChecks || pulseChecks.length < 5) return null;

  const sentiments = pulseChecks.map((check: any) => getEmotionSentimentValue(check.emotion));
  const stdDev = calculateStandardDeviation(sentiments);

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

async function checkProlongedNegative(
  supabase: any,
  userId: string,
  classId: string
): Promise<any | null> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: pulseChecks } = await supabase
    .from('pulse_checks')
    .select('emotion')
    .eq('user_id', userId)
    .eq('class_id', classId)
    .gte('created_at', sevenDaysAgo.toISOString());

  if (!pulseChecks || pulseChecks.length < 7) return null;

  const negativeDays = pulseChecks.filter((check: any) => {
    const sentiment = getEmotionSentimentValue(check.emotion);
    return sentiment <= 2;
  }).length;

  if (negativeDays > 5) {
    const avgSentiment = pulseChecks.reduce((sum: number, check: any) =>
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
// Main Handler
// ============================================

serve(async (req) => {
  try {
    // Verify request is authorized (cron job or manual trigger with secret)
    const authHeader = req.headers.get('authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');

    if (!authHeader || !authHeader.includes(cronSecret || '')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Starting daily alert generation...');

    // Get active students from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activeStudents } = await supabase
      .from('pulse_checks')
      .select('user_id, class_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('user_id');

    if (!activeStudents) {
      return new Response(
        JSON.stringify({ error: 'No active students found' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get unique student-class pairs
    const uniquePairs = Array.from(
      new Set(activeStudents.map((s: any) => `${s.user_id}:${s.class_id}`))
    ).map(pair => {
      const [userId, classId] = pair.split(':');
      return { userId, classId };
    });

    console.log(`Checking ${uniquePairs.length} student-class pairs...`);

    let alertsCreated = 0;
    const results = [];

    // Process each student
    for (const { userId, classId } of uniquePairs) {
      try {
        // Check all criteria
        const alerts = await Promise.all([
          checkPersistentLowMood(supabase, userId, classId),
          checkSuddenMoodDrop(supabase, userId, classId),
          checkHighVolatility(supabase, userId, classId),
          checkProlongedNegative(supabase, userId, classId)
        ]);

        const validAlerts = alerts.filter(alert => alert !== null);

        // Create alerts (avoid duplicates)
        for (const alert of validAlerts) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Check if alert already exists today
          const { data: existing } = await supabase
            .from('mood_alert_logs')
            .select('id')
            .eq('user_id', alert.userId)
            .eq('class_id', alert.classId)
            .eq('alert_type', alert.alertType)
            .gte('alert_date', today.toISOString())
            .single();

          if (!existing) {
            const { error } = await supabase
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

            if (!error) {
              alertsCreated++;
              results.push(alert);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing student ${userId}:`, error);
      }
    }

    console.log(`Alert generation complete. Created ${alertsCreated} new alerts.`);

    return new Response(
      JSON.stringify({
        success: true,
        alertsCreated,
        studentsChecked: uniquePairs.length,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in alert generation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
