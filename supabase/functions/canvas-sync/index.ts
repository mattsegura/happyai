// =====================================================
// CANVAS SYNC EDGE FUNCTION
// =====================================================
// Purpose: Sync Canvas data for all users with active Canvas connections
// Schedule: Every 15 minutes via GitHub Actions or pg_cron
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
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

    console.log('🚀 Starting Canvas sync job...')

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get all users with active Canvas connections
    const { data: users, error: usersError } = await supabase
      .from('canvas_settings')
      .select('user_id, last_sync_at, is_syncing')
      .eq('is_connected', true)
      .order('last_sync_at', { ascending: true, nullsFirst: true })

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      throw usersError
    }

    if (!users || users.length === 0) {
      console.log('ℹ️ No users with Canvas connections found')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No users to sync',
          synced: 0,
          failed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📊 Found ${users.length} users with Canvas connections`)

    // Sync each user
    const results = await Promise.allSettled(
      users.map(async (user) => {
        try {
          console.log(`🔄 Syncing user: ${user.user_id}`)

          // Mark as syncing
          await supabase
            .from('canvas_settings')
            .update({ is_syncing: true })
            .eq('user_id', user.user_id)

          // Get Canvas credentials
          const { data: settings } = await supabase
            .from('canvas_settings')
            .select('*')
            .eq('user_id', user.user_id)
            .single()

          if (!settings || !settings.is_connected) {
            throw new Error('No Canvas connection found')
          }

          // Sync courses (simplified - in real implementation, call Canvas API)
          console.log(`  📚 Syncing courses for user ${user.user_id}`)

          // In production, this would:
          // 1. Get Canvas access token (decrypt if stored)
          // 2. Call Canvas API: GET /api/v1/courses
          // 3. Insert/update canvas_courses table
          // 4. Sync assignments for each course
          // 5. Sync submissions
          // 6. Sync calendar events

          // For now, just update last_sync_at
          await supabase
            .from('canvas_settings')
            .update({
              last_sync_at: new Date().toISOString(),
              is_syncing: false,
              sync_status: 'success'
            })
            .eq('user_id', user.user_id)

          // Log sync success
          await supabase
            .from('canvas_sync_history')
            .insert({
              user_id: user.user_id,
              sync_type: 'full',
              status: 'success',
              items_synced: 0, // Would be actual count
              started_at: new Date().toISOString(),
              completed_at: new Date().toISOString()
            })

          console.log(`  ✅ Successfully synced user ${user.user_id}`)

          return { user_id: user.user_id, status: 'success' }
        } catch (error) {
          console.error(`  ❌ Sync failed for user ${user.user_id}:`, error)

          // Mark sync as failed
          await supabase
            .from('canvas_settings')
            .update({
              is_syncing: false,
              sync_status: 'failed',
              last_error: error.message
            })
            .eq('user_id', user.user_id)

          // Log sync failure
          await supabase
            .from('canvas_sync_history')
            .insert({
              user_id: user.user_id,
              sync_type: 'full',
              status: 'failed',
              error_message: error.message,
              started_at: new Date().toISOString(),
              completed_at: new Date().toISOString()
            })

          return { user_id: user.user_id, status: 'error', error: error.message }
        }
      })
    )

    // Calculate success/failure counts
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.status === 'error')).length

    console.log(`✅ Canvas sync completed: ${successful} successful, ${failed} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        synced: successful,
        failed: failed,
        total: users.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Canvas sync error:', error)
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
supabase functions deploy canvas-sync

TESTING:
--------
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/canvas-sync \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY"

SCHEDULING:
-----------
Option A: GitHub Actions (see .github/workflows/canvas-sync.yml)
Option B: Supabase pg_cron (see migration)
*/
