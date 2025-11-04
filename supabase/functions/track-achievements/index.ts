// =====================================================
// TRACK ACHIEVEMENTS EDGE FUNCTION
// =====================================================
// Purpose: Check for new achievements earned by users
// Actions: Award badges, send congratulations, update streaks
// Schedule: Daily at midnight via GitHub Actions
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

    console.log('🏆 Starting achievement tracking job...')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let achievementsAwarded = 0
    let notificationsSent = 0

    // Get all active users
    const { data: users } = await supabase
      .from('profiles')
      .select('id, full_name, total_points')
      .eq('role', 'student')

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found')
      return new Response(
        JSON.stringify({ success: true, message: 'No users to check' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📊 Checking achievements for ${users.length} users`)

    // Get all available achievements
    const { data: achievements } = await supabase
      .from('academic_achievements')
      .select('*')
      .eq('is_active', true)

    if (!achievements) {
      console.log('ℹ️  No achievements configured')
      return new Response(
        JSON.stringify({ success: true, message: 'No achievements configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check each user for new achievements
    for (const user of users) {
      try {
        console.log(`🔍 Checking achievements for user ${user.id}`)

        // Get user's existing achievements
        const { data: userAchievements } = await supabase
          .from('user_academic_achievements')
          .select('achievement_id')
          .eq('user_id', user.id)

        const earnedAchievementIds = new Set(
          userAchievements?.map(a => a.achievement_id) || []
        )

        // Check each achievement
        for (const achievement of achievements) {
          // Skip if already earned
          if (earnedAchievementIds.has(achievement.id)) {
            continue
          }

          let earned = false

          // =====================================================
          // ACHIEVEMENT LOGIC
          // =====================================================

          switch (achievement.achievement_type) {
            case 'streak':
              // Check study streak
              const { data: streak } = await supabase
                .from('study_streaks')
                .select('current_streak')
                .eq('user_id', user.id)
                .single()

              if (streak && streak.current_streak >= achievement.criteria_value) {
                earned = true
              }
              break

            case 'points':
              // Check total points
              if (user.total_points >= achievement.criteria_value) {
                earned = true
              }
              break

            case 'assignments':
              // Check completed assignments
              const { data: assignments, count } = await supabase
                .from('canvas_submissions')
                .select('id', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('workflow_state', 'submitted')

              if (count && count >= achievement.criteria_value) {
                earned = true
              }
              break

            case 'grade':
              // Check grade average
              const { data: courses } = await supabase
                .from('canvas_courses')
                .select('computed_current_score')
                .eq('user_id', user.id)

              if (courses && courses.length > 0) {
                const avgGrade = courses.reduce((sum, c) => sum + (c.computed_current_score || 0), 0) / courses.length
                if (avgGrade >= achievement.criteria_value) {
                  earned = true
                }
              }
              break

            case 'pulse':
              // Check pulse check-ins
              const { data: pulses, count: pulseCount } = await supabase
                .from('pulse_checks')
                .select('id', { count: 'exact' })
                .eq('user_id', user.id)

              if (pulseCount && pulseCount >= achievement.criteria_value) {
                earned = true
              }
              break

            case 'hapi_moment':
              // Check hapi moments sent
              const { data: moments, count: momentCount } = await supabase
                .from('hapi_moments')
                .select('id', { count: 'exact' })
                .eq('sender_id', user.id)

              if (momentCount && momentCount >= achievement.criteria_value) {
                earned = true
              }
              break
          }

          // =====================================================
          // AWARD ACHIEVEMENT
          // =====================================================

          if (earned) {
            console.log(`  🎉 User ${user.id} earned: ${achievement.name}`)

            // Award achievement
            await supabase
              .from('user_academic_achievements')
              .insert({
                user_id: user.id,
                achievement_id: achievement.id,
                earned_at: new Date().toISOString()
              })

            // Award points
            if (achievement.points_reward > 0) {
              await supabase.rpc('increment_user_points', {
                p_user_id: user.id,
                p_points: achievement.points_reward,
                p_reason: `Achievement unlocked: ${achievement.name}`
              })
            }

            // Send congratulations notification
            await supabase
              .from('notification_queue')
              .insert({
                user_id: user.id,
                notification_type: 'achievement_unlocked',
                title: '🏆 Achievement Unlocked!',
                message: `Congratulations! You've earned the "${achievement.name}" badge! ${achievement.points_reward > 0 ? `+${achievement.points_reward} points` : ''}`,
                action_url: '/profile/achievements',
                priority: 'medium',
                scheduled_for: new Date().toISOString()
              })

            achievementsAwarded++
            notificationsSent++
          }
        }

        // =====================================================
        // UPDATE STUDY STREAKS
        // =====================================================

        // Check if user did pulse check today
        const today = new Date().toISOString().split('T')[0]
        const { data: todayPulse } = await supabase
          .from('pulse_checks')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00Z`)
          .single()

        if (todayPulse) {
          // Increment streak
          const { data: streak } = await supabase
            .from('study_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (streak) {
            await supabase
              .from('study_streaks')
              .update({
                current_streak: streak.current_streak + 1,
                longest_streak: Math.max(streak.longest_streak, streak.current_streak + 1),
                last_activity_date: today
              })
              .eq('user_id', user.id)
          } else {
            // Create new streak
            await supabase
              .from('study_streaks')
              .insert({
                user_id: user.id,
                current_streak: 1,
                longest_streak: 1,
                last_activity_date: today
              })
          }
        } else {
          // Check if streak should be reset (missed a day)
          const { data: streak } = await supabase
            .from('study_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single()

          if (streak && streak.last_activity_date) {
            const lastActivity = new Date(streak.last_activity_date)
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)

            if (lastActivity < yesterday) {
              // Reset streak
              await supabase
                .from('study_streaks')
                .update({ current_streak: 0 })
                .eq('user_id', user.id)
            }
          }
        }

      } catch (error) {
        console.error(`❌ Error checking achievements for user ${user.id}:`, error)
      }
    }

    console.log(`✅ Achievement tracking completed`)
    console.log(`   🏆 Achievements awarded: ${achievementsAwarded}`)
    console.log(`   📨 Notifications sent: ${notificationsSent}`)

    return new Response(
      JSON.stringify({
        success: true,
        users_checked: users.length,
        achievements_awarded: achievementsAwarded,
        notifications_sent: notificationsSent,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Achievement tracking error:', error)
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
supabase functions deploy track-achievements

TESTING:
--------
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/track-achievements \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY"

SCHEDULING:
-----------
Run daily at midnight via GitHub Actions
See .github/workflows/track-achievements.yml
*/
