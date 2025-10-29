/**
 * Canvas Rate Limiter
 *
 * Implements token bucket algorithm for Canvas API rate limiting.
 * Canvas allows 600 requests per hour per access token.
 *
 * Features:
 * - Token bucket algorithm with automatic refill
 * - Request queue with priority
 * - Exponential backoff retry logic
 * - Rate limit header parsing
 * - Circuit breaker for repeated failures
 */

import { CANVAS_CONFIG } from './canvasConfig';
import { CanvasRateLimitError } from './canvasErrors';

/**
 * Request priority levels
 */
export enum RequestPriority {
  LOW = 0,      // Background syncs
  NORMAL = 1,   // Regular user requests
  HIGH = 2,     // User-initiated actions
  CRITICAL = 3, // Authentication/refresh tokens
}

/**
 * Queued request
 */
type QueuedRequest<T> = {
  id: string;
  execute: () => Promise<T>;
  priority: RequestPriority;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  addedAt: number;
  retryCount: number;
};

/**
 * Rate limit status from Canvas response headers
 */
export type RateLimitStatus = {
  limit: number;         // Total requests allowed per hour
  remaining: number;     // Requests remaining in current window
  resetAt: Date;         // When the rate limit window resets
};

/**
 * Token Bucket Rate Limiter
 */
class CanvasRateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // Tokens per millisecond
  private lastRefill: number;
  private queue: QueuedRequest<any>[] = [];
  private processing = false;

  // Circuit breaker
  private failures = 0;
  private readonly maxFailures = 5;
  private circuitOpen = false;
  private circuitResetTime = 0;
  private readonly circuitResetDelay = 60000; // 1 minute

  // Rate limit tracking from Canvas headers
  private rateLimitStatus: RateLimitStatus | null = null;

  constructor() {
    // Initialize with full bucket
    this.maxTokens = CANVAS_CONFIG.RATE_LIMIT_PER_HOUR;
    this.tokens = this.maxTokens;

    // Calculate refill rate (tokens per millisecond)
    // Refill entire bucket over 1 hour
    this.refillRate = this.maxTokens / (60 * 60 * 1000);
    this.lastRefill = Date.now();

    console.log('[Canvas Rate Limiter] Initialized:', {
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
      tokensPerMinute: CANVAS_CONFIG.RATE_LIMIT_PER_MINUTE,
    });
  }

  /**
   * Refill tokens based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Check if we have tokens available
   */
  private hasTokens(): boolean {
    this.refillTokens();
    return this.tokens >= 1;
  }

  /**
   * Consume a token
   */
  private consumeToken(): void {
    this.tokens = Math.max(0, this.tokens - 1);
  }

  /**
   * Get time until next token is available (milliseconds)
   */
  private getTimeUntilNextToken(): number {
    if (this.hasTokens()) {
      return 0;
    }
    return Math.ceil((1 - this.tokens) / this.refillRate);
  }

  /**
   * Parse rate limit headers from Canvas response
   */
  parseRateLimitHeaders(headers: Headers): void {
    const limit = headers.get('X-Rate-Limit-Limit');
    const remaining = headers.get('X-Rate-Limit-Remaining');
    const reset = headers.get('X-Request-Cost'); // Canvas doesn't use standard headers

    if (limit && remaining) {
      this.rateLimitStatus = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        resetAt: reset ? new Date(parseInt(reset, 10) * 1000) : new Date(Date.now() + 3600000),
      };

      console.log('[Canvas Rate Limiter] Status updated:', this.rateLimitStatus);

      // Adjust our bucket if Canvas says we have fewer requests remaining
      if (this.rateLimitStatus.remaining < this.tokens) {
        this.tokens = this.rateLimitStatus.remaining;
      }
    }
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    tokens: number;
    maxTokens: number;
    queueLength: number;
    circuitOpen: boolean;
    rateLimitStatus: RateLimitStatus | null;
  } {
    this.refillTokens();
    return {
      tokens: Math.floor(this.tokens),
      maxTokens: this.maxTokens,
      queueLength: this.queue.length,
      circuitOpen: this.circuitOpen,
      rateLimitStatus: this.rateLimitStatus,
    };
  }

  /**
   * Check circuit breaker state
   */
  private checkCircuitBreaker(): void {
    if (this.circuitOpen && Date.now() > this.circuitResetTime) {
      console.log('[Canvas Rate Limiter] Circuit breaker reset');
      this.circuitOpen = false;
      this.failures = 0;
    }

    if (this.circuitOpen) {
      throw new Error('Circuit breaker is open. Too many failures. Please try again later.');
    }
  }

  /**
   * Record a successful request
   */
  private recordSuccess(): void {
    if (this.failures > 0) {
      this.failures = Math.max(0, this.failures - 1);
    }
  }

  /**
   * Record a failed request
   */
  private recordFailure(): void {
    this.failures++;
    if (this.failures >= this.maxFailures) {
      console.error('[Canvas Rate Limiter] Circuit breaker opened');
      this.circuitOpen = true;
      this.circuitResetTime = Date.now() + this.circuitResetDelay;
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private getBackoffDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const baseDelay = 1000;
    const maxDelay = 16000;
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);

    // Add jitter (±20%)
    const jitter = delay * 0.2 * (Math.random() - 0.5);
    return Math.floor(delay + jitter);
  }

  /**
   * Enqueue a request with priority
   */
  async enqueue<T>(
    execute: () => Promise<T>,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: Math.random().toString(36).substr(2, 9),
        execute,
        priority,
        resolve,
        reject,
        addedAt: Date.now(),
        retryCount: 0,
      };

      // Insert into queue based on priority (higher priority first)
      const insertIndex = this.queue.findIndex(r => r.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(insertIndex, 0, request);
      }

      console.log('[Canvas Rate Limiter] Request queued:', {
        id: request.id,
        priority: RequestPriority[priority],
        queuePosition: insertIndex === -1 ? this.queue.length : insertIndex,
        queueLength: this.queue.length,
      });

      // Start processing queue if not already processing
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      try {
        this.checkCircuitBreaker();
      } catch (error) {
        // Circuit breaker is open - reject all queued requests
        console.error('[Canvas Rate Limiter] Circuit breaker open, clearing queue');
        while (this.queue.length > 0) {
          const request = this.queue.shift()!;
          request.reject(error as Error);
        }
        this.processing = false;
        return;
      }

      // Wait for tokens if needed
      while (!this.hasTokens()) {
        const waitTime = this.getTimeUntilNextToken();
        console.log(`[Canvas Rate Limiter] Waiting ${waitTime}ms for tokens`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Get next request
      const request = this.queue.shift()!;
      this.consumeToken();

      const waitTime = Date.now() - request.addedAt;
      console.log('[Canvas Rate Limiter] Processing request:', {
        id: request.id,
        priority: RequestPriority[request.priority],
        waitTime: `${waitTime}ms`,
        tokensRemaining: Math.floor(this.tokens),
      });

      // Execute request
      try {
        const result = await request.execute();
        request.resolve(result);
        this.recordSuccess();
      } catch (error) {
        // Check if error is rate limit error
        if (error instanceof CanvasRateLimitError) {
          console.warn('[Canvas Rate Limiter] Rate limit hit:', {
            retryAfter: error.retryAfter,
            retryCount: request.retryCount,
          });

          // Retry with backoff if under retry limit
          const maxRetries = 3;
          if (request.retryCount < maxRetries) {
            const backoffDelay = error.retryAfter
              ? error.retryAfter * 1000
              : this.getBackoffDelay(request.retryCount);

            console.log(`[Canvas Rate Limiter] Retrying in ${backoffDelay}ms`);

            request.retryCount++;
            await new Promise(resolve => setTimeout(resolve, backoffDelay));

            // Re-queue with same priority
            this.queue.unshift(request);
            continue;
          }
        }

        // Record failure and reject
        this.recordFailure();
        request.reject(error as Error);
      }
    }

    this.processing = false;
    console.log('[Canvas Rate Limiter] Queue empty');
  }

  /**
   * Clear the queue (useful for testing or emergency stops)
   */
  clearQueue(): void {
    const clearedCount = this.queue.length;
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      request.reject(new Error('Queue cleared'));
    }
    console.log(`[Canvas Rate Limiter] Cleared ${clearedCount} queued requests`);
  }

  /**
   * Reset the rate limiter (useful for testing)
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.clearQueue();
    this.failures = 0;
    this.circuitOpen = false;
    this.rateLimitStatus = null;
    console.log('[Canvas Rate Limiter] Reset');
  }
}

// Export singleton instance
export const canvasRateLimiter = new CanvasRateLimiter();
