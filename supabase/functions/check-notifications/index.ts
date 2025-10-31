// Supabase Edge Function: Check Notifications
// This function checks notification triggers for all users and creates notifications

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

interface NotificationPreferences {
  user_id: string;
  deadline_notifications: boolean;
  mood_notifications: boolean;
  performance_notifications: boolean;
  ai_suggestions: boolean;
  achievement_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  max_notifications_per_day: number;
  min_hours_between_notifications: number;
}

Deno.serve(async (req) => {
  try {
    // Verify authorization (optional - you can add a secret header)
    const authHeader = req.headers.get('Authorization');

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('[NotificationCheck] Starting notification check...');

    // Get all users with at least one notification type enabled
    const { data: preferences, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('user_id, deadline_notifications, mood_notifications, performance_notifications, ai_suggestions, achievement_notifications, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, max_notifications_per_day, min_hours_between_notifications')
      .or('deadline_notifications.eq.true,mood_notifications.eq.true,performance_notifications.eq.true,ai_suggestions.eq.true,achievement_notifications.eq.true');

    if (prefsError) {
      throw prefsError;
    }

    console.log(`[NotificationCheck] Found ${preferences?.length || 0} users with notifications enabled`);

    let notificationsCreated = 0;
    let usersProcessed = 0;

    // Process each user
    for (const pref of preferences || []) {
      try {
        // Check rate limits
        const canSend = await checkRateLimits(supabase, pref);
        if (!canSend) {
          console.log(`[NotificationCheck] User ${pref.user_id} - Rate limited, skipping`);
          continue;
        }

        // Check deadline notifications
        if (pref.deadline_notifications) {
          const created = await checkDeadlineNotifications(supabase, pref.user_id);
          notificationsCreated += created;
        }

        // Check mood notifications
        if (pref.mood_notifications) {
          const created = await checkMoodNotifications(supabase, pref.user_id);
          notificationsCreated += created;
        }

        // Check performance notifications
        if (pref.performance_notifications) {
          const created = await checkPerformanceNotifications(supabase, pref.user_id);
          notificationsCreated += created;
        }

        usersProcessed++;
      } catch (error) {
        console.error(`[NotificationCheck] Error processing user ${pref.user_id}:`, error);
      }
    }

    const response = {
      success: true,
      users_processed: usersProcessed,
      notifications_created: notificationsCreated,
      timestamp: new Date().toISOString()
    };

    console.log('[NotificationCheck] Complete:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('[NotificationCheck] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Helper: Check rate limits
async function checkRateLimits(supabase: any, pref: NotificationPreferences): Promise<boolean> {
  // Check daily limit
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('notification_queue')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', pref.user_id)
    .eq('status', 'sent')
    .gte('sent_at', `${today}T00:00:00Z`);

  if (count && count >= pref.max_notifications_per_day) {
    return false;
  }

  // Check minimum time between notifications
  const { data: lastNotification } = await supabase
    .from('notification_queue')
    .select('sent_at')
    .eq('user_id', pref.user_id)
    .eq('status', 'sent')
    .order('sent_at', { ascending: false })
    .limit(1)
    .single();

  if (lastNotification && lastNotification.sent_at) {
    const hoursSince = (Date.now() - new Date(lastNotification.sent_at).getTime()) / 3600000;
    if (hoursSince < pref.min_hours_between_notifications) {
      return false;
    }
  }

  return true;
}

// Helper: Check deadline notifications
async function checkDeadlineNotifications(supabase: any, userId: string): Promise<number> {
  let created = 0;

  // Get upcoming assignments
  const { data: assignments } = await supabase
    .from('canvas_assignments')
    .select('id, name, due_at, course_id, canvas_courses!inner(user_id)')
    .eq('canvas_courses.user_id', userId)
    .not('due_at', 'is', null)
    .gte('due_at', new Date().toISOString())
    .lte('due_at', new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()) // Next 48 hours
    .order('due_at', { ascending: true });

  for (const assignment of assignments || []) {
    const dueDate = new Date(assignment.due_at);
    const hoursUntil = (dueDate.getTime() - Date.now()) / 3600000;
    const daysUntil = Math.floor(hoursUntil / 24);

    let templateKey = '';
    let variables = {};

    // Assignment due tomorrow (20-28 hours away)
    if (hoursUntil >= 20 && hoursUntil <= 28 && daysUntil === 1) {
      templateKey = 'assignment_due_tomorrow';
      variables = {
        assignment_name: assignment.name,
        due_time: dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
    }
    // Assignment due today (less than 12 hours)
    else if (hoursUntil > 0 && hoursUntil <= 12) {
      templateKey = 'assignment_due_today';
      variables = {
        assignment_name: assignment.name,
        due_time: dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        hours_left: Math.floor(hoursUntil)
      };
    }

    if (templateKey) {
      // Check if notification already exists
      const { count } = await supabase
        .from('notification_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('template_key', templateKey)
        .eq('metadata->>assignment_id', assignment.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!count || count === 0) {
        // Get template
        const { data: template } = await supabase
          .from('notification_templates')
          .select('*')
          .eq('template_key', templateKey)
          .single();

        if (template) {
          // Render template
          let title = template.title_template;
          let body = template.body_template;
          for (const [key, value] of Object.entries(variables)) {
            title = title.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
            body = body.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
          }

          // Get user's university
          const { data: profile } = await supabase
            .from('profiles')
            .select('university_id')
            .eq('id', userId)
            .single();

          // Create notification
          await supabase
            .from('notification_queue')
            .insert({
              user_id: userId,
              university_id: profile?.university_id,
              template_key: templateKey,
              notification_type: 'deadline',
              trigger_type: 'deadline',
              title,
              body,
              action_url: template.action_url_template,
              action_label: template.action_label,
              priority: template.priority,
              scheduled_for: new Date().toISOString(),
              status: 'sent',
              channels: ['in_app'],
              metadata: { assignment_id: assignment.id, course_id: assignment.course_id }
            });

          created++;
          console.log(`[NotificationCheck] Created deadline notification for user ${userId}: ${templateKey}`);
        }
      }
    }
  }

  return created;
}

// Helper: Check mood notifications
async function checkMoodNotifications(supabase: any, userId: string): Promise<number> {
  let created = 0;

  // Get recent mood data
  const { data: moods } = await supabase
    .from('pulse_checks')
    .select('emotion, check_date')
    .eq('user_id', userId)
    .order('check_date', { ascending: false })
    .limit(7);

  if (!moods || moods.length < 3) {
    return 0;
  }

  // Calculate average sentiment
  const sentimentMap: Record<string, number> = {
    'Scared': 1, 'Sad': 1, 'Lonely': 1,
    'Frustrated': 2, 'Worried': 2, 'Nervous': 2,
    'Tired': 3, 'Bored': 3, 'Careless': 3,
    'Peaceful': 4, 'Relieved': 4, 'Content': 4,
    'Hopeful': 5, 'Proud': 5,
    'Happy': 6, 'Excited': 6, 'Inspired': 6
  };

  const sentiments = moods.map(m => sentimentMap[m.emotion] || 3);
  const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;

  // Get upcoming assignments count
  const { count: assignmentCount } = await supabase
    .from('canvas_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('canvas_courses.user_id', userId)
    .not('due_at', 'is', null)
    .gte('due_at', new Date().toISOString())
    .lte('due_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

  // Heavy load + low mood
  if (avgSentiment < 3 && (assignmentCount || 0) >= 3) {
    const { count } = await supabase
      .from('notification_queue')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('template_key', 'heavy_load_low_mood')
      .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

    if (!count || count === 0) {
      const { data: template } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('template_key', 'heavy_load_low_mood')
        .single();

      if (template) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('university_id')
          .eq('id', userId)
          .single();

        const body = template.body_template.replace('{{assignment_count}}', String(assignmentCount || 0));

        await supabase
          .from('notification_queue')
          .insert({
            user_id: userId,
            university_id: profile?.university_id,
            template_key: 'heavy_load_low_mood',
            notification_type: 'mood',
            trigger_type: 'mood',
            title: template.title_template,
            body,
            action_url: template.action_url_template,
            action_label: template.action_label,
            priority: template.priority,
            scheduled_for: new Date().toISOString(),
            status: 'sent',
            channels: ['in_app']
          });

        created++;
        console.log(`[NotificationCheck] Created mood notification for user ${userId}: heavy_load_low_mood`);
      }
    }
  }

  return created;
}

// Helper: Check performance notifications
async function checkPerformanceNotifications(supabase: any, userId: string): Promise<number> {
  let created = 0;

  // Check for missing assignments
  const { count: missingCount } = await supabase
    .from('canvas_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('missing', true)
    .eq('excused', false);

  if ((missingCount || 0) >= 2) {
    const { count } = await supabase
      .from('notification_queue')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('template_key', 'missing_assignments')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (!count || count === 0) {
      const { data: template } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('template_key', 'missing_assignments')
        .single();

      if (template) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('university_id')
          .eq('id', userId)
          .single();

        const body = template.body_template.replace('{{count}}', String(missingCount || 0));

        await supabase
          .from('notification_queue')
          .insert({
            user_id: userId,
            university_id: profile?.university_id,
            template_key: 'missing_assignments',
            notification_type: 'performance',
            trigger_type: 'performance',
            title: template.title_template,
            body,
            action_url: template.action_url_template,
            action_label: template.action_label,
            priority: template.priority,
            scheduled_for: new Date().toISOString(),
            status: 'sent',
            channels: ['in_app']
          });

        created++;
        console.log(`[NotificationCheck] Created performance notification for user ${userId}: missing_assignments`);
      }
    }
  }

  return created;
}
