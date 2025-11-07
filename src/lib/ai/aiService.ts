/**
 * AI Service - Main Orchestrator
 *
 * Provider-agnostic AI service that handles:
 * - Multiple AI providers (OpenAI, Anthropic, Chatbase)
 * - Automatic caching
 * - Quota management
 * - Usage tracking
 * - Error handling and fallbacks
 */

import { supabase } from '../supabase';
import type {
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
  FunctionCallRequest,
  FunctionCallResult,
  AIProvider,
  AIFeatureType,
  QuotaCheckResult,
  AIUsageStats,
} from './aiTypes';
import { AI_CONFIG, getModelForFeature, getProviderForModel } from './aiConfig';
import * as aiCache from './aiCache';
import * as anthropicProvider from './providers/anthropicProvider';
import * as openaiProvider from './providers/openaiProvider';
import * as chatbaseProvider from './providers/chatbaseProvider';
import { AIServiceError, QuotaExceededError } from './aiTypes';

// =====================================================
// MAIN AI SERVICE CLASS
// =====================================================

export class AIService {
  private userId: string | null = null;

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  // Set user ID for quota tracking
  setUserId(userId: string) {
    this.userId = userId;
  }

  // =====================================================
  // TEXT COMPLETION
  // =====================================================

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    // Check quota first
    if (this.userId) {
      const quotaCheck = await this.checkQuota(request.featureType);
      if (!quotaCheck.allowed) {
        throw new QuotaExceededError(quotaCheck.reason || 'Quota exceeded');
      }
    }

    // Prepare cache options
    const cacheOptions = aiCache.prepareCacheOptions(
      request.featureType,
      request.options?.cacheEnabled,
      request.options?.cacheTTL
    );

    // Try cache first if enabled
    if (cacheOptions.enabled) {
      const cached = await this.tryGetFromCache(request);
      if (cached) {
        return cached;
      }
    }

    // Select model and provider
    const model = request.options?.model || getModelForFeature(request.featureType);
    const provider = getProviderForModel(model);

    // Execute completion with fallback
    let response: CompletionResponse;
    try {
      response = await this.executeCompletion(request, provider);
    } catch (error) {
      // Try fallback provider if enabled
      if (AI_CONFIG.enableFallback && provider !== AI_CONFIG.fallbackProvider) {
        console.warn(`[AI Service] Primary provider failed, trying fallback`);
        response = await this.executeCompletion(request, AI_CONFIG.fallbackProvider);
      } else {
        throw error;
      }
    }

    // Store in cache if enabled
    if (cacheOptions.enabled && cacheOptions.ttl > 0) {
      await this.storeInCache(request, response, cacheOptions.ttl);
    }

    // Log interaction to database
    if (AI_CONFIG.logInteractions && this.userId) {
      await this.logInteraction(request, response);
    }

    // Update user quota
    if (this.userId) {
      await this.updateQuota(
        request.featureType,
        response.tokensUsed.total,
        response.costCents
      );
    }

    return response;
  }

  // =====================================================
  // STREAMING COMPLETION
  // =====================================================

  async *streamComplete(request: CompletionRequest): AsyncIterableIterator<StreamChunk> {
    // Check quota
    if (this.userId) {
      const quotaCheck = await this.checkQuota(request.featureType);
      if (!quotaCheck.allowed) {
        throw new QuotaExceededError(quotaCheck.reason || 'Quota exceeded');
      }
    }

    // Select model and provider
    const model = request.options?.model || getModelForFeature(request.featureType);
    const provider = getProviderForModel(model);

    // Execute streaming
    let totalTokens = 0;
    let fullContent = '';

    try {
      const stream = this.executeStreamCompletion(request, provider);

      for await (const chunk of stream) {
        fullContent += chunk.content;
        if (chunk.tokensUsed) {
          totalTokens = chunk.tokensUsed;
        }
        yield chunk;
      }
    } catch (error) {
      console.error('[AI Service] Streaming error:', error);
      throw error;
    }

    // Log after streaming completes
    if (AI_CONFIG.logInteractions && this.userId && totalTokens > 0) {
      const response: CompletionResponse = {
        content: fullContent,
        tokensUsed: {
          input: Math.floor(totalTokens * 0.3), // Estimate
          output: Math.floor(totalTokens * 0.7),
          total: totalTokens,
        },
        costCents: 0, // Will be calculated in logInteraction
        model,
        provider,
        cacheHit: false,
        executionTimeMs: 0,
      };
      await this.logInteraction(request, response);
      await this.updateQuota(request.featureType, totalTokens, response.costCents);
    }
  }

  // =====================================================
  // FUNCTION CALLING
  // =====================================================

  async functionCall(request: FunctionCallRequest): Promise<FunctionCallResult> {
    // Check quota
    if (this.userId) {
      const quotaCheck = await this.checkQuota(request.featureType);
      if (!quotaCheck.allowed) {
        throw new QuotaExceededError(quotaCheck.reason || 'Quota exceeded');
      }
    }

    // Select model and provider
    const model = request.options?.model || getModelForFeature(request.featureType);
    const provider = getProviderForModel(model);

    // Execute function call
    let result: FunctionCallResult;
    try {
      result = await this.executeFunctionCall(request, provider);
    } catch (error) {
      // Try fallback
      if (AI_CONFIG.enableFallback && provider !== AI_CONFIG.fallbackProvider) {
        result = await this.executeFunctionCall(request, AI_CONFIG.fallbackProvider);
      } else {
        throw error;
      }
    }

    // Log and update quota
    if (this.userId) {
      const response: CompletionResponse = {
        content: result.content || '',
        tokensUsed: result.tokensUsed,
        costCents: result.costCents,
        model,
        provider,
        cacheHit: false,
        executionTimeMs: 0,
      };
      await this.logInteraction(
        {
          prompt: request.prompt,
          featureType: request.featureType,
          options: request.options,
        },
        response,
        result
      );
      await this.updateQuota(
        request.featureType,
        result.tokensUsed.total,
        result.costCents
      );
    }

    return result;
  }

  // =====================================================
  // PROVIDER EXECUTION
  // =====================================================

  private async executeCompletion(
    request: CompletionRequest,
    provider: AIProvider
  ): Promise<CompletionResponse> {
    switch (provider) {
      case 'anthropic':
        return await anthropicProvider.complete(request);
      case 'openai':
        return await openaiProvider.complete(request);
      case 'local':
        // Use Chatbase for local provider
        return await chatbaseProvider.complete(request);
      default:
        throw new AIServiceError(
          `Unsupported provider: ${provider}`,
          'UNSUPPORTED_PROVIDER',
          provider
        );
    }
  }

  private async *executeStreamCompletion(
    request: CompletionRequest,
    provider: AIProvider
  ): AsyncIterableIterator<StreamChunk> {
    switch (provider) {
      case 'anthropic':
        yield* anthropicProvider.streamComplete(request);
        break;
      case 'openai':
        yield* openaiProvider.streamComplete(request);
        break;
      case 'local':
        yield* chatbaseProvider.streamComplete(request);
        break;
      default:
        throw new AIServiceError(
          `Unsupported provider: ${provider}`,
          'UNSUPPORTED_PROVIDER',
          provider
        );
    }
  }

  private async executeFunctionCall(
    request: FunctionCallRequest,
    provider: AIProvider
  ): Promise<FunctionCallResult> {
    switch (provider) {
      case 'anthropic':
        return await anthropicProvider.functionCall(request);
      case 'openai':
        return await openaiProvider.functionCall(request);
      case 'local':
        throw new AIServiceError(
          'Chatbase does not support function calling',
          'UNSUPPORTED_FEATURE',
          provider
        );
      default:
        throw new AIServiceError(
          `Unsupported provider: ${provider}`,
          'UNSUPPORTED_PROVIDER',
          provider
        );
    }
  }

  // =====================================================
  // CACHING
  // =====================================================

  private async tryGetFromCache(
    request: CompletionRequest
  ): Promise<CompletionResponse | null> {
    try {
      const model = request.options?.model || getModelForFeature(request.featureType);
      const cacheKey = await aiCache.generateCacheKey(
        request.prompt,
        request.featureType,
        model,
        request.contextData
      );

      const cached = await aiCache.getCachedResponse(cacheKey);
      if (cached) {
        const provider = getProviderForModel(model);
        return {
          content: cached.response,
          tokensUsed: {
            input: 0,
            output: 0,
            total: 0,
          },
          costCents: 0,
          model,
          provider,
          cacheHit: true,
          executionTimeMs: 0,
        };
      }
    } catch (error) {
      console.error('[AI Service] Cache retrieval error:', error);
    }
    return null;
  }

  private async storeInCache(
    request: CompletionRequest,
    response: CompletionResponse,
    ttl: number
  ): Promise<void> {
    try {
      const cacheKey = await aiCache.generateCacheKey(
        request.prompt,
        request.featureType,
        response.model,
        request.contextData
      );
      const promptHash = await aiCache.generatePromptHash(request.prompt);

      await aiCache.setCachedResponse(
        cacheKey,
        promptHash,
        response.content,
        request.featureType,
        response.model,
        request.options?.responseFormat || 'text',
        ttl
      );
    } catch (error) {
      console.error('[AI Service] Cache storage error:', error);
    }
  }

  // =====================================================
  // QUOTA MANAGEMENT
  // =====================================================

  private async checkQuota(featureType: AIFeatureType): Promise<QuotaCheckResult> {
    if (!this.userId) {
      return { allowed: true };
    }

    try {
      const { data, error } = await supabase.rpc('check_user_quota', {
        p_user_id: this.userId,
        p_feature_type: featureType,
      });

      if (error) throw error;

      return {
        allowed: data as boolean,
        reason: data ? undefined : 'Quota limit reached',
      };
    } catch (error) {
      console.error('[AI Service] Quota check error:', error);
      // Allow request if quota check fails (fail open)
      return { allowed: true };
    }
  }

  private async updateQuota(
    featureType: AIFeatureType,
    tokensUsed: number,
    costCents: number
  ): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase.rpc('update_user_quota', {
        p_user_id: this.userId,
        p_feature_type: featureType,
        p_tokens_used: tokensUsed,
        p_cost_cents: costCents,
      });

      if (error) throw error;
    } catch (error) {
      console.error('[AI Service] Quota update error:', error);
    }
  }

  // =====================================================
  // INTERACTION LOGGING
  // =====================================================

  private async logInteraction(
    request: CompletionRequest,
    response: CompletionResponse,
    functionCallResult?: FunctionCallResult
  ): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase.from('ai_interactions').insert({
        user_id: this.userId,
        feature_type: request.featureType,
        prompt: request.prompt,
        prompt_version: request.promptVersion,
        context_data: request.contextData || {},
        response: response.content,
        response_format: request.options?.responseFormat || 'text',
        function_calls: functionCallResult ? {
          function_name: functionCallResult.functionName,
          arguments: functionCallResult.arguments,
        } : null,
        provider: response.provider,
        model: response.model,
        tokens_used_input: response.tokensUsed.input,
        tokens_used_output: response.tokensUsed.output,
        cost_cents: response.costCents,
        execution_time_ms: response.executionTimeMs,
        cache_hit: response.cacheHit,
        status: 'success',
      });

      if (error) throw error;
    } catch (error) {
      console.error('[AI Service] Interaction logging error:', error);
    }
  }

  // =====================================================
  // USAGE STATISTICS
  // =====================================================

  async getUsageStats(daysBack = 30): Promise<AIUsageStats | null> {
    if (!this.userId) return null;

    try {
      const { data, error } = await supabase.rpc('get_user_ai_stats', {
        p_user_id: this.userId,
        p_days_back: daysBack,
      });

      if (error) throw error;

      return data?.[0] as AIUsageStats || null;
    } catch (error) {
      console.error('[AI Service] Usage stats error:', error);
      return null;
    }
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}

export default {
  AIService,
  getAIService,
};
