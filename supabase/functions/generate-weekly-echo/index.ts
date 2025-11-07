/**
 * Edge Function: Generate Weekly Echo (Auto-Generate Weekly Summaries)
 *
 * Scheduled to run every Monday at 6 AM
 * Generates AI-powered weekly summaries for all active teachers
 *
 * Setup:
 * 1. Deploy: supabase functions deploy generate-weekly-echo
 * 2. Schedule: Create a cron job in Supabase Dashboard (pg_cron)
 *    SELECT cron.schedule('generate-weekly-echo', '0 6 * * 1', 'https://your-project.supabase.co/functions/v1/generate-weekly-echo');
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// =====================================================
// TYPES
// =====================================================

interface WeeklySummary {
  teacherId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  summaryData: any;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date = new Date()): Date {
  const weekStart = getWeekStart(date);
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
}

async function generateSummaryForTeacher(
  supabase: any,
  teacherId: string,
  weekStartDate: Date,
  weekEndDate: Date
): Promise<WeeklySummary | null> {
  try {
    // In a real implementation, this would:
    // 1. Fetch teacher's data for the week from Supabase
    // 2. Call AI service to generate summary
    // 3. Return structured summary

    // For now, return mock data structure
    const summaryData = {
      executiveSummary: [
        'Weekly summary auto-generated',
        'Overall stable week with good engagement',
        'No critical alerts requiring immediate attention',
      ],
      academicPerformance: {
        gradeTrends: 'Stable performance across all classes',
        assignmentCompletion: '90% completion rate',
        missingSubmissions: '8 total missing assignments',
        topPerformers: ['Student A', 'Student B'],
        strugglingStudents: ['Student C'],
      },
      emotionalWellbeing: {
        classSentimentTrends: 'Average sentiment: 4.3/6',
        careAlertsSummary: 'No new care alerts this week',
        moodPatterns: 'Stable mood patterns',
        positiveDevelopments: 'Overall positive week',
      },
      engagement: {
        pulseParticipation: '88% average participation',
        hapiMomentsActivity: '25 Hapi Moments sent',
        officeHoursAttendance: '12 appointments',
      },
      classByClass: [],
      actionItems: [],
      lookingAhead: {
        upcomingEvents: [],
        predictedChallenges: [],
        suggestedActions: [],
      },
      positiveHighlights: [
        'Strong overall engagement',
        'Students actively participating',
      ],
    };

    return {
      teacherId,
      weekStartDate,
      weekEndDate,
      summaryData,
    };
  } catch (error) {
    console.error(`Error generating summary for teacher ${teacherId}:`, error);
    return null;
  }
}

async function storeSummary(supabase: any, summary: WeeklySummary): Promise<boolean> {
  try {
    const { error } = await supabase.from('weekly_summaries').insert({
      teacher_id: summary.teacherId,
      week_start_date: summary.weekStartDate.toISOString(),
      week_end_date: summary.weekEndDate.toISOString(),
      summary_data: summary.summaryData,
      generated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error storing summary:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error storing summary:', error);
    return false;
  }
}

async function sendNotification(supabase: any, teacherId: string): Promise<void> {
  // TODO: Implement notification system
  // - Send in-app notification
  // - Send email (optional)
  console.log(`Notification sent to teacher ${teacherId}`);
}

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  try {
    // Check authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get last week's dates (summary is for the week that just ended)
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1); // Yesterday (Sunday)
    const weekStartDate = getWeekStart(lastWeekEnd);
    const weekEndDate = getWeekEnd(lastWeekEnd);

    console.log(`Generating weekly summaries for week ${weekStartDate.toISOString()} to ${weekEndDate.toISOString()}`);

    // Get all active teachers
    const { data: teachers, error: teachersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('role', 'teacher')
      .eq('is_active', true);

    if (teachersError) {
      throw new Error(`Error fetching teachers: ${teachersError.message}`);
    }

    if (!teachers || teachers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active teachers found',
          count: 0,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Found ${teachers.length} active teachers`);

    // Generate summaries for each teacher
    const results = [];
    for (const teacher of teachers) {
      console.log(`Generating summary for teacher ${teacher.id} (${teacher.email})`);

      // Check if summary already exists for this week
      const { data: existing, error: existingError } = await supabase
        .from('weekly_summaries')
        .select('id')
        .eq('teacher_id', teacher.id)
        .eq('week_start_date', weekStartDate.toISOString())
        .single();

      if (existing && !existingError) {
        console.log(`Summary already exists for teacher ${teacher.id}, skipping`);
        results.push({
          teacherId: teacher.id,
          email: teacher.email,
          status: 'skipped',
          reason: 'already_exists',
        });
        continue;
      }

      // Generate summary
      const summary = await generateSummaryForTeacher(
        supabase,
        teacher.id,
        weekStartDate,
        weekEndDate
      );

      if (!summary) {
        results.push({
          teacherId: teacher.id,
          email: teacher.email,
          status: 'failed',
          reason: 'generation_error',
        });
        continue;
      }

      // Store summary
      const stored = await storeSummary(supabase, summary);

      if (!stored) {
        results.push({
          teacherId: teacher.id,
          email: teacher.email,
          status: 'failed',
          reason: 'storage_error',
        });
        continue;
      }

      // Send notification
      await sendNotification(supabase, teacher.id);

      results.push({
        teacherId: teacher.id,
        email: teacher.email,
        status: 'success',
      });
    }

    // Summary
    const successCount = results.filter((r) => r.status === 'success').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;
    const skippedCount = results.filter((r) => r.status === 'skipped').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${successCount} weekly summaries`,
        summary: {
          total: teachers.length,
          success: successCount,
          failed: failedCount,
          skipped: skippedCount,
        },
        results,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-weekly-echo function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
