/**
 * Canvas API Response Cache
 *
 * Caches Canvas API responses in memory and optionally in Supabase.
 * Reduces API calls and improves performance.
 *
 * Features:
 * - In-memory LRU cache with TTL
 * - Supabase persistent cache (optional)
 * - Automatic cache invalidation
 * - Cache key generation
 */

import { supabase } from '../supabase';
import { CANVAS_CONFIG } from './canvasConfig';

/**
 * Cache entry
 */
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

/**
 * Cache configuration per resource type
 */
const CACHE_TTL = {
  courses: 30 * 60 * 1000,        // 30 minutes
  course: 30 * 60 * 1000,         // 30 minutes
  assignments: 15 * 60 * 1000,    // 15 minutes
  assignment: 15 * 60 * 1000,     // 15 minutes
  submissions: 10 * 60 * 1000,    // 10 minutes
  calendar: 60 * 60 * 1000,       // 1 hour
  modules: 30 * 60 * 1000,        // 30 minutes
  moduleItems: 30 * 60 * 1000,    // 30 minutes
  analytics: 60 * 60 * 1000,      // 1 hour
  user: 24 * 60 * 60 * 1000,      // 24 hours
};

/**
 * Canvas Response Cache
 */
class CanvasCache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly maxMemoryCacheSize = 100; // Max entries in memory
  private useSupabaseCache = false; // Set to true to enable persistent caching

  /**
   * Generate cache key from endpoint and params
   */
  generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params
      ? Object.keys(params)
          .sort()
          .map(k => `${k}=${params[k]}`)
          .join('&')
      : '';
    return `${endpoint}${paramString ? `?${paramString}` : ''}`;
  }

  /**
   * Get TTL for a resource type
   */
  private getTTL(key: string): number {
    // Determine resource type from key
    if (key.includes('/courses') && !key.includes('/assignments')) {
      return key.match(/\/courses\/[^/]+$/)
        ? CACHE_TTL.course
        : CACHE_TTL.courses;
    }
    if (key.includes('/assignments')) {
      return key.match(/\/assignments\/[^/]+$/)
        ? CACHE_TTL.assignment
        : CACHE_TTL.assignments;
    }
    if (key.includes('/submissions')) {
      return CACHE_TTL.submissions;
    }
    if (key.includes('/calendar_events')) {
      return CACHE_TTL.calendar;
    }
    if (key.includes('/modules') && key.includes('/items')) {
      return CACHE_TTL.moduleItems;
    }
    if (key.includes('/modules')) {
      return CACHE_TTL.modules;
    }
    if (key.includes('/analytics')) {
      return CACHE_TTL.analytics;
    }
    if (key.includes('/users')) {
      return CACHE_TTL.user;
    }

    // Default TTL from config
    return CANVAS_CONFIG.CACHE_TTL_MS;
  }

  /**
   * Get cached data from memory
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      const now = Date.now();
      if (now - memoryEntry.timestamp < memoryEntry.ttl) {
        console.log('[Canvas Cache] Memory cache hit:', key);
        return memoryEntry.data as T;
      } else {
        // Expired - remove from memory
        this.memoryCache.delete(key);
      }
    }

    // Check Supabase cache if enabled
    if (this.useSupabaseCache) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
          .from('canvas_cache')
          .select('data, created_at, ttl_seconds')
          .eq('cache_key', key)
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          const age = Date.now() - new Date(data.created_at).getTime();
          const ttl = data.ttl_seconds * 1000;

          if (age < ttl) {
            console.log('[Canvas Cache] Supabase cache hit:', key);
            // Store in memory for faster subsequent access
            this.memoryCache.set(key, {
              data: data.data,
              timestamp: new Date(data.created_at).getTime(),
              ttl,
            });
            return data.data as T;
          } else {
            // Expired - delete from Supabase
            await supabase
              .from('canvas_cache')
              .delete()
              .eq('cache_key', key)
              .eq('user_id', user.id);
          }
        }
      } catch (error) {
        console.error('[Canvas Cache] Supabase cache error:', error);
      }
    }

    console.log('[Canvas Cache] Cache miss:', key);
    return null;
  }

  /**
   * Set cached data
   */
  async set<T>(key: string, data: T, customTTL?: number): Promise<void> {
    const ttl = customTTL || this.getTTL(key);
    const timestamp = Date.now();

    // Store in memory cache
    this.memoryCache.set(key, { data, timestamp, ttl });

    // Enforce max cache size (LRU eviction)
    if (this.memoryCache.size > this.maxMemoryCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value as string;
      this.memoryCache.delete(oldestKey);
    }

    console.log('[Canvas Cache] Cached:', {
      key,
      ttl: `${ttl / 1000}s`,
      size: this.memoryCache.size,
    });

    // Store in Supabase cache if enabled
    if (this.useSupabaseCache) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from('canvas_cache')
          .upsert({
            user_id: user.id,
            cache_key: key,
            data,
            ttl_seconds: Math.floor(ttl / 1000),
          }, {
            onConflict: 'user_id,cache_key',
          });
      } catch (error) {
        console.error('[Canvas Cache] Supabase cache set error:', error);
      }
    }
  }

  /**
   * Invalidate cache by key or pattern
   */
  async invalidate(keyOrPattern: string): Promise<void> {
    // Check if pattern (contains wildcard)
    const isPattern = keyOrPattern.includes('*');

    if (isPattern) {
      // Invalidate all matching keys
      const pattern = keyOrPattern.replace(/\*/g, '');
      const keysToDelete: string[] = [];

      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.memoryCache.delete(key));

      console.log('[Canvas Cache] Invalidated pattern:', {
        pattern: keyOrPattern,
        count: keysToDelete.length,
      });

      // Invalidate in Supabase
      if (this.useSupabaseCache) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          await supabase
            .from('canvas_cache')
            .delete()
            .eq('user_id', user.id)
            .like('cache_key', `%${pattern}%`);
        } catch (error) {
          console.error('[Canvas Cache] Supabase invalidate error:', error);
        }
      }
    } else {
      // Invalidate single key
      this.memoryCache.delete(keyOrPattern);
      console.log('[Canvas Cache] Invalidated:', keyOrPattern);

      // Invalidate in Supabase
      if (this.useSupabaseCache) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          await supabase
            .from('canvas_cache')
            .delete()
            .eq('user_id', user.id)
            .eq('cache_key', keyOrPattern);
        } catch (error) {
          console.error('[Canvas Cache] Supabase invalidate error:', error);
        }
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    console.log('[Canvas Cache] Memory cache cleared');

    if (this.useSupabaseCache) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from('canvas_cache')
          .delete()
          .eq('user_id', user.id);

        console.log('[Canvas Cache] Supabase cache cleared');
      } catch (error) {
        console.error('[Canvas Cache] Supabase clear error:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memorySize: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      memorySize: this.memoryCache.size,
      maxSize: this.maxMemoryCacheSize,
    };
  }

  /**
   * Enable or disable Supabase persistent caching
   */
  setSupabaseCache(enabled: boolean): void {
    this.useSupabaseCache = enabled;
    console.log('[Canvas Cache] Supabase cache:', enabled ? 'enabled' : 'disabled');
  }
}

// Export singleton instance
export const canvasCache = new CanvasCache();
