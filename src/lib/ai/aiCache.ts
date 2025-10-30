/**
 * AI Response Cache Service
 *
 * Implements caching layer for AI responses to reduce API costs and improve performance.
 * Uses Supabase for persistent caching across sessions.
 */

import { supabase } from '../supabase';
import type { CacheEntry, CacheOptions, AIFeatureType } from './aiTypes';
import { DEFAULT_CACHE_TTLS, CACHE_CONFIG } from './aiConfig';

// =====================================================
// CACHE KEY GENERATION
// =====================================================

/**
 * Generate SHA-256 hash (browser-compatible)
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a unique cache key from prompt and context
 */
export async function generateCacheKey(
  prompt: string,
  featureType: AIFeatureType,
  model: string,
  contextData?: Record<string, unknown>
): Promise<string> {
  const data = {
    prompt,
    featureType,
    model,
    context: contextData || {},
  };

  const hashInput = JSON.stringify(data);
  return await sha256(hashInput);
}

/**
 * Generate prompt hash for quick lookups
 */
export async function generatePromptHash(prompt: string): Promise<string> {
  return await sha256(prompt);
}

// =====================================================
// CACHE OPERATIONS
// =====================================================

/**
 * Get response from cache
 */
export async function getCachedResponse(
  cacheKey: string
): Promise<CacheEntry | null> {
  try {
    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned (cache miss)
        return null;
      }
      throw error;
    }

    if (!data) return null;

    // Update last_accessed_at and hit_count
    await supabase
      .from('ai_response_cache')
      .update({
        last_accessed_at: new Date().toISOString(),
        hit_count: data.hit_count + 1,
      })
      .eq('id', data.id);

    return {
      cacheKey: data.cache_key,
      response: data.response,
      responseFormat: data.response_format,
      hitCount: data.hit_count + 1,
      tokensSaved: data.tokens_saved,
      costSavedCents: data.cost_saved_cents,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
      lastAccessedAt: new Date(),
    };
  } catch (error) {
    console.error('[AI Cache] Error getting cached response:', error);
    return null;
  }
}

/**
 * Store response in cache
 */
export async function setCachedResponse(
  cacheKey: string,
  promptHash: string,
  response: string,
  featureType: AIFeatureType,
  model: string,
  responseFormat: string,
  ttl: number
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttl * 1000);

    const { error } = await supabase.from('ai_response_cache').upsert(
      {
        cache_key: cacheKey,
        prompt_hash: promptHash,
        response,
        feature_type: featureType,
        model,
        response_format: responseFormat,
        expires_at: expiresAt.toISOString(),
        hit_count: 0,
        tokens_saved: 0,
        cost_saved_cents: 0,
      },
      {
        onConflict: 'cache_key',
      }
    );

    if (error) {
      console.error('[AI Cache] Error setting cached response:', error);
    }
  } catch (error) {
    console.error('[AI Cache] Error setting cached response:', error);
  }
}

/**
 * Update cache statistics after cache hit
 */
export async function updateCacheStats(
  cacheKey: string,
  tokensSaved: number,
  costSavedCents: number
): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_cache_stats', {
      p_cache_key: cacheKey,
      p_tokens_saved: tokensSaved,
      p_cost_saved_cents: costSavedCents,
    });

    if (error && error.code !== '42883') {
      // Ignore "function does not exist" error (will be created if needed)
      console.error('[AI Cache] Error updating cache stats:', error);
    }
  } catch (error) {
    console.error('[AI Cache] Error updating cache stats:', error);
  }
}

/**
 * Check if caching is enabled for a feature
 */
export function isCachingEnabled(featureType: AIFeatureType): boolean {
  if (!CACHE_CONFIG.enabledFeatures.includes(featureType)) {
    return false;
  }
  return true;
}

/**
 * Get cache TTL for a feature
 */
export function getCacheTTL(featureType: AIFeatureType): number {
  return DEFAULT_CACHE_TTLS[featureType] || CACHE_CONFIG.defaultTTL;
}

/**
 * Prepare cache options for a request
 */
export function prepareCacheOptions(
  featureType: AIFeatureType,
  cacheEnabled?: boolean,
  cacheTTL?: number
): CacheOptions {
  const enabled = cacheEnabled ?? isCachingEnabled(featureType);
  const ttl = cacheTTL ?? getCacheTTL(featureType);

  return {
    enabled,
    ttl,
    featureType,
  };
}

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<{
  deletedCount: number;
  tokensFreed: number;
}> {
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_ai_cache');

    if (error) {
      console.error('[AI Cache] Error cleaning up expired cache:', error);
      return { deletedCount: 0, tokensFreed: 0 };
    }

    return {
      deletedCount: data?.[0]?.deleted_count || 0,
      tokensFreed: data?.[0]?.tokens_freed || 0,
    };
  } catch (error) {
    console.error('[AI Cache] Error cleaning up expired cache:', error);
    return { deletedCount: 0, tokensFreed: 0 };
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalHits: number;
  totalTokensSaved: number;
  totalCostSavedCents: number;
  hitRate: number;
}> {
  try {
    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('hit_count, tokens_saved, cost_saved_cents');

    if (error) throw error;

    const totalEntries = data?.length || 0;
    const totalHits = data?.reduce((sum, entry) => sum + entry.hit_count, 0) || 0;
    const totalTokensSaved =
      data?.reduce((sum, entry) => sum + entry.tokens_saved, 0) || 0;
    const totalCostSavedCents =
      data?.reduce((sum, entry) => sum + entry.cost_saved_cents, 0) || 0;

    // Hit rate = (total hits) / (total entries + total hits)
    // This represents: cached responses / total requests
    const hitRate = totalEntries + totalHits > 0
      ? (totalHits / (totalEntries + totalHits)) * 100
      : 0;

    return {
      totalEntries,
      totalHits,
      totalTokensSaved,
      totalCostSavedCents,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  } catch (error) {
    console.error('[AI Cache] Error getting cache stats:', error);
    return {
      totalEntries: 0,
      totalHits: 0,
      totalTokensSaved: 0,
      totalCostSavedCents: 0,
      hitRate: 0,
    };
  }
}

/**
 * Clear all cache entries for a specific feature
 */
export async function clearFeatureCache(featureType: AIFeatureType): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ai_response_cache')
      .delete()
      .eq('feature_type', featureType)
      .select();

    if (error) throw error;

    return data?.length || 0;
  } catch (error) {
    console.error('[AI Cache] Error clearing feature cache:', error);
    return 0;
  }
}

/**
 * Clear all cache entries for the current user's university
 */
export async function clearAllCache(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ai_response_cache')
      .delete()
      .select();

    if (error) throw error;

    return data?.length || 0;
  } catch (error) {
    console.error('[AI Cache] Error clearing all cache:', error);
    return 0;
  }
}

// =====================================================
// DATABASE FUNCTION FOR CACHE STATS UPDATE
// =====================================================
// This SQL function should be added to a migration:
/*
CREATE OR REPLACE FUNCTION increment_cache_stats(
  p_cache_key TEXT,
  p_tokens_saved INTEGER,
  p_cost_saved_cents INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_response_cache
  SET
    tokens_saved = tokens_saved + p_tokens_saved,
    cost_saved_cents = cost_saved_cents + p_cost_saved_cents,
    last_accessed_at = now()
  WHERE cache_key = p_cache_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

export default {
  generateCacheKey,
  generatePromptHash,
  getCachedResponse,
  setCachedResponse,
  updateCacheStats,
  isCachingEnabled,
  getCacheTTL,
  prepareCacheOptions,
  cleanupExpiredCache,
  getCacheStats,
  clearFeatureCache,
  clearAllCache,
};
