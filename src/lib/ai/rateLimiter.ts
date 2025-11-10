/**
 * AI Rate Limiter
 *
 * Manages AI feature usage quotas to control costs:
 * - Weekly summaries: 1 auto + 2 manual per week
 * - Student briefs: 10 per week
 * - Teacher assistant: 100 queries per week
 * - Proactive suggestions: Unlimited (cached)
 *
 * Tracks usage in Supabase and provides UI feedback.
 */

import { supabase } from '../supabase';

// =====================================================
// TYPES
// =====================================================

export interface AIQuotaLimits {
  weeklySummary: {
    auto: number; // Auto-generated summaries
    manual: number; // Manual generations
    total: number;
  };
  studentBrief: {
    perWeek: number;
  };
  teacherAssistant: {
    queriesPerWeek: number;
  };
  proactiveSuggestion: {
    perWeek: number; // Unlimited in practice (cached)
  };
}

export interface AIUsageStats {
  featureType: string;
  usedThisWeek: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  lastUsedAt: Date | null;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  remaining?: number;
  limit?: number;
}

// =====================================================
// QUOTA CONFIGURATION
// =====================================================

export const AI_QUOTA_LIMITS: AIQuotaLimits = {
  weeklySummary: {
    auto: 1, // 1 auto-generated summary per week (Monday 6 AM)
    manual: 2, // 2 manual generations per week
    total: 3, // Total limit
  },
  studentBrief: {
    perWeek: 10, // 10 briefs per week
  },
  teacherAssistant: {
    queriesPerWeek: 100, // 100 queries per week
  },
  proactiveSuggestion: {
    perWeek: 1000, // Effectively unlimited (cached)
  },
};

// Map feature types to quota limits
const FEATURE_LIMITS: Record<string, number> = {
  weekly_summary: AI_QUOTA_LIMITS.weeklySummary.total,
  student_brief: AI_QUOTA_LIMITS.studentBrief.perWeek,
  teacher_assistant: AI_QUOTA_LIMITS.teacherAssistant.queriesPerWeek,
  proactive_suggestion: AI_QUOTA_LIMITS.proactiveSuggestion.perWeek,
};

// =====================================================
// QUOTA CHECKING
// =====================================================

/**
 * Check if user can use an AI feature
 */
export async function checkAIQuota(
  userId: string,
  featureType: string
): Promise<QuotaCheckResult> {
  const useMockAI = import.meta.env.VITE_USE_MOCK_AI === 'true';

  // Always allow in mock mode
  if (useMockAI) {
    return {
      allowed: true,
      remaining: 999,
      limit: 1000,
    };
  }

  const limit = FEATURE_LIMITS[featureType];

  if (!limit) {
    return {
      allowed: false,
      reason: `Unknown feature type: ${featureType}`,
    };
  }

  try {
    // Call Supabase function to check quota
    const { data, error } = await supabase.rpc('check_ai_quota', {
      p_user_id: userId,
      p_feature_type: featureType,
      p_max_weekly_usage: limit,
    });

    if (error) {
      console.error('[Rate Limiter] Quota check error:', error);
      // Fail open - allow on error
      return { allowed: true };
    }

    if (!data) {
      return {
        allowed: false,
        reason: 'You have reached your weekly limit for this feature',
        limit,
        remaining: 0,
      };
    }

    // Get remaining count
    const { data: remainingData, error: remainingError } = await supabase.rpc(
      'get_remaining_ai_quota',
      {
        p_user_id: userId,
        p_feature_type: featureType,
        p_max_weekly_usage: limit,
      }
    );

    const remaining = remainingError ? null : (remainingData as number);

    return {
      allowed: true,
      remaining: remaining ?? undefined,
      limit,
    };
  } catch (error) {
    console.error('[Rate Limiter] Error checking quota:', error);
    // Fail open
    return { allowed: true };
  }
}

/**
 * Increment usage count after using a feature
 */
export async function incrementAIUsage(
  userId: string,
  featureType: string,
  tokensUsed: number = 0,
  costCents: number = 0
): Promise<void> {
  const useMockAI = import.meta.env.VITE_USE_MOCK_AI === 'true';

  // Skip in mock mode
  if (useMockAI) {
    return;
  }

  try {
    const { error } = await supabase.rpc('increment_ai_usage', {
      p_user_id: userId,
      p_feature_type: featureType,
      p_tokens_used: tokensUsed,
      p_cost_cents: costCents,
    });

    if (error) {
      console.error('[Rate Limiter] Error incrementing usage:', error);
    }
  } catch (error) {
    console.error('[Rate Limiter] Error incrementing usage:', error);
  }
}

/**
 * Get usage statistics for all AI features
 */
export async function getAIUsageStats(userId: string): Promise<AIUsageStats[]> {
  const useMockAI = import.meta.env.VITE_USE_MOCK_AI === 'true';

  // Return mock stats in mock mode
  if (useMockAI) {
    return [
      {
        featureType: 'weekly_summary',
        usedThisWeek: 1,
        limit: 3,
        remaining: 2,
        percentUsed: 33,
        lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        featureType: 'student_brief',
        usedThisWeek: 5,
        limit: 10,
        remaining: 5,
        percentUsed: 50,
        lastUsedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        featureType: 'teacher_assistant',
        usedThisWeek: 23,
        limit: 100,
        remaining: 77,
        percentUsed: 23,
        lastUsedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        featureType: 'proactive_suggestion',
        usedThisWeek: 42,
        limit: 1000,
        remaining: 958,
        percentUsed: 4,
        lastUsedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      },
    ];
  }

  try {
    // Get current week
    const weekStart = getWeekStart();

    // Query usage for current week
    const { data, error } = await supabase
      .from('ai_usage_quotas')
      .select('*')
      .eq('user_id', userId)
      .eq('period_start', weekStart.toISOString());

    if (error) {
      console.error('[Rate Limiter] Error fetching usage stats:', error);
      return [];
    }

    // Transform to AIUsageStats
    return Object.entries(FEATURE_LIMITS).map(([featureType, limit]) => {
      const usage = data?.find((u) => u.feature_type === featureType);
      const usedThisWeek = usage?.usage_count || 0;
      const remaining = Math.max(0, limit - usedThisWeek);
      const percentUsed = Math.round((usedThisWeek / limit) * 100);

      return {
        featureType,
        usedThisWeek,
        limit,
        remaining,
        percentUsed,
        lastUsedAt: usage?.last_used_at ? new Date(usage.last_used_at) : null,
      };
    });
  } catch (error) {
    console.error('[Rate Limiter] Error fetching usage stats:', error);
    return [];
  }
}

/**
 * Get remaining quota for a specific feature
 */
export async function getRemainingQuota(
  userId: string,
  featureType: string
): Promise<number> {
  const limit = FEATURE_LIMITS[featureType];

  if (!limit) {
    return 0;
  }

  try {
    const { data, error } = await supabase.rpc('get_remaining_ai_quota', {
      p_user_id: userId,
      p_feature_type: featureType,
      p_max_weekly_usage: limit,
    });

    if (error) {
      console.error('[Rate Limiter] Error getting remaining quota:', error);
      return 0;
    }

    return (data as number) || 0;
  } catch (error) {
    console.error('[Rate Limiter] Error getting remaining quota:', error);
    return 0;
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday as start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format usage as percentage bar
 */
export function formatUsageBar(usedThisWeek: number, limit: number): string {
  const percentUsed = Math.round((usedThisWeek / limit) * 100);
  const barLength = 20;
  const filledLength = Math.round((percentUsed / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  return `${bar} ${percentUsed}% (${usedThisWeek}/${limit})`;
}

/**
 * Get user-friendly feature name
 */
export function getFeatureName(featureType: string): string {
  const names: Record<string, string> = {
    weekly_summary: 'Weekly Summary',
    student_brief: 'Student Briefs',
    teacher_assistant: 'AI Assistant',
    proactive_suggestion: 'Proactive Suggestions',
  };
  return names[featureType] || featureType;
}

/**
 * Check if usage is approaching limit (>80%)
 */
export function isApproachingLimit(usedThisWeek: number, limit: number): boolean {
  return usedThisWeek / limit > 0.8;
}

/**
 * Check if limit is exceeded
 */
export function isLimitExceeded(usedThisWeek: number, limit: number): boolean {
  return usedThisWeek >= limit;
}
