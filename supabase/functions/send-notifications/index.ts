// =====================================================
// SEND NOTIFICATIONS EDGE FUNCTION
// =====================================================
// Purpose: Send scheduled notifications to users
// Types: Morning reminders, deadline alerts, weekly summaries
// Schedule: Multiple times daily via GitHub Actions
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get notification type from request
    const { type } = await req.json()
    const notificationType = type || 'check_all'

    console.log(`🔔 Starting notification job: ${notificationType}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let sentCount = 0
    let failedCount = 0

    // =====================================================
    // MORNING REMINDERS (8am daily)
    // =====================================================
    if (notificationType === 'morning_reminders' || notificationType === 'check_all') {
      console.log('📅 Checking morning reminders...')

      // Get users who haven't done morning pulse today
      const today = new Date().toISOString().split('T')[0]

      const { data: users } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .not('id', 'in', `(
          SELECT user_id FROM pulse_checks
          WHERE DATE(created_at) = '${today}'
        )`)

      if (users && users.length > 0) {
        console.log(`  📨 Sending morning reminders to ${users.length} users`)

        for (const user of users) {
          try {
            await supabase
              .from('notification_queue')
              .insert({
                user_id: user.id,
                template_id: null, // Would use template in production
                notification_type: 'morning_pulse_reminder',
                title: 'Good morning! How are you feeling today?',
                message: 'Take a moment to check in with your morning pulse.',
                action_url: '/dashboard',
                priority: 'medium',
                scheduled_for: new Date().toISOString()
              })

            sentCount++
          } catch (error) {
            console.error(`  ❌ Failed to queue notification for user ${user.id}:`, error)
            failedCount++
          }
        }
      }
    }

    // =====================================================
    // DEADLINE REMINDERS (24 hours before)
    // =====================================================
    if (notificationType === 'deadline_reminders' || notificationType === 'check_all') {
      console.log('⏰ Checking deadline reminders...')

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString()

      const { data: assignments } = await supabase
        .from('canvas_assignments')
        .select('id, user_id, title, due_at, course_id')
        .gte('due_at', new Date().toISOString())
        .lte('due_at', tomorrowStr)
        .not('id', 'in', `(
          SELECT assignment_id FROM canvas_submissions
          WHERE workflow_state = 'submitted'
        )`)

      if (assignments && assignments.length > 0) {
        console.log(`  📨 Sending deadline reminders for ${assignments.length} assignments`)

        for (const assignment of assignments) {
          try {
            await supabase
              .from('notification_queue')
              .insert({
                user_id: assignment.user_id,
                notification_type: 'assignment_deadline',
                title: 'Assignment due tomorrow!',
                message: `"${assignment.title}" is due tomorrow. Don't forget to submit!`,
                action_url: `/academics/assignments/${assignment.id}`,
                priority: 'high',
                scheduled_for: new Date().toISOString()
              })

            sentCount++
          } catch (error) {
            console.error(`  ❌ Failed to queue deadline reminder:`, error)
            failedCount++
          }
        }
      }
    }

    // =====================================================
    // WEEKLY SUMMARIES (Monday 9am)
    // =====================================================
    if (notificationType === 'weekly_summaries' || notificationType === 'check_all') {
      console.log('📊 Checking weekly summaries...')

      const dayOfWeek = new Date().getDay()

      if (dayOfWeek === 1) { // Monday
        // Get all active users
        const { data: users } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('role', 'student')

        if (users && users.length > 0) {
          console.log(`  📨 Sending weekly summaries to ${users.length} users`)

          for (const user of users) {
            try {
              // Get user stats for past week
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)

              const { data: pulseCount } = await supabase
                .from('pulse_checks')
                .select('id', { count: 'exact' })
                .eq('user_id', user.id)
                .gte('created_at', weekAgo.toISOString())

              const { data: assignmentsCompleted } = await supabase
                .from('canvas_submissions')
                .select('id', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('workflow_state', 'submitted')
                .gte('submitted_at', weekAgo.toISOString())

              await supabase
                .from('notification_queue')
                .insert({
                  user_id: user.id,
                  notification_type: 'weekly_summary',
                  title: 'Your week in review',
                  message: `You completed ${pulseCount?.count || 0} pulses and ${assignmentsCompleted?.count || 0} assignments this week. Keep it up!`,
                  action_url: '/dashboard',
                  priority: 'low',
                  scheduled_for: new Date().toISOString()
                })

              sentCount++
            } catch (error) {
              console.error(`  ❌ Failed to queue weekly summary:`, error)
              failedCount++
            }
          }
        }
      } else {
        console.log('  ℹ️  Skipping weekly summaries (not Monday)')
      }
    }

    // =====================================================
    // GRADE DROP ALERTS (Check every 6 hours)
    // =====================================================
    if (notificationType === 'grade_alerts' || notificationType === 'check_all') {
      console.log('📉 Checking grade drop alerts...')

      // This would check for grade drops and alert students
      // Implementation depends on grade tracking logic
    }

    console.log(`✅ Notification job completed: ${sentCount} sent, ${failedCount} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        type: notificationType,
        sent: sentCount,
        failed: failedCount,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Notification error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

/*
DEPLOYMENT:
-----------
supabase functions deploy send-notifications

TESTING:
--------
# Morning reminders
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/send-notifications \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "morning_reminders"}'

# Deadline reminders
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/send-notifications \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "deadline_reminders"}'

# Weekly summaries
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/send-notifications \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "weekly_summaries"}'

SCHEDULING:
-----------
See .github/workflows/send-notifications.yml
*/
