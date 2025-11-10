/**
 * AI Configuration
 *
 * Centralized configuration for AI services including provider selection,
 * model defaults, and feature-specific settings.
 */

import type { AIModel, AIProvider, AIFeatureType } from './aiTypes';

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

export const AI_CONFIG = {
  // Provider selection
  primaryProvider: (import.meta.env.VITE_AI_PRIMARY_PROVIDER as AIProvider) || 'anthropic',
  fallbackProvider: (import.meta.env.VITE_AI_FALLBACK_PROVIDER as AIProvider) || 'openai',

  // API Keys
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',

  // Feature flags
  enableCaching: import.meta.env.VITE_AI_ENABLE_CACHING !== 'false', // Default true
  enableQuotaLimits: import.meta.env.VITE_AI_ENABLE_QUOTA !== 'false', // Default true
  enableFallback: import.meta.env.VITE_AI_ENABLE_FALLBACK !== 'false', // Default true

  // Timeouts (milliseconds)
  requestTimeout: parseInt(import.meta.env.VITE_AI_REQUEST_TIMEOUT || '60000'), // 60s
  streamingTimeout: parseInt(import.meta.env.VITE_AI_STREAMING_TIMEOUT || '120000'), // 120s

  // Retry configuration
  maxRetries: parseInt(import.meta.env.VITE_AI_MAX_RETRIES || '3'),
  retryDelay: parseInt(import.meta.env.VITE_AI_RETRY_DELAY || '1000'), // 1s

  // Logging
  debugMode: import.meta.env.VITE_AI_DEBUG === 'true',
  logInteractions: import.meta.env.VITE_AI_LOG_INTERACTIONS !== 'false', // Default true
} as const;

// =====================================================
// MODEL SELECTION BY FEATURE
// =====================================================

/**
 * Default model selection for each feature type.
 * Uses a balance of cost, performance, and capability.
 */
export const DEFAULT_MODELS: Record<AIFeatureType, AIModel> = {
  // Study Coach: Complex planning requires strong reasoning
  study_coach: 'claude-3-sonnet-20240229',

  // Scheduling Assistant: Natural language understanding
  scheduling_assistant: 'claude-3-sonnet-20240229',

  // Course Tutor: Knowledge-intensive, benefits from longer context
  course_tutor: 'claude-3-sonnet-20240229',

  // Grade Projection: Simple calculations, can use cheaper model
  grade_projection: 'claude-3-haiku-20240307',

  // Feedback Analyzer: Sentiment analysis, good for Haiku
  feedback_analyzer: 'claude-3-haiku-20240307',

  // General Chat: Balance of cost and quality
  chat: 'claude-3-sonnet-20240229',

  // Quiz Generator: Creative but structured
  quiz_generator: 'claude-3-sonnet-20240229',

  // Summarizer: Simple task, use cheapest model
  summarizer: 'claude-3-haiku-20240307',

  // Teacher-specific features (Phase 6)
  // Weekly Summary: Complex analysis and synthesis, use Sonnet
  weekly_summary: 'claude-3-sonnet-20240229',

  // Student Brief: Detailed analysis requires strong reasoning
  student_brief: 'claude-3-sonnet-20240229',

  // Teacher Assistant: Conversational + complex queries, use Sonnet
  teacher_assistant: 'claude-3-sonnet-20240229',

  // Proactive Suggestions: Simple recommendations, use Haiku
  proactive_suggestion: 'claude-3-haiku-20240307',
};

// =====================================================
// MODEL CAPABILITIES
// =====================================================

export interface ModelCapabilities {
  maxTokens: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  contextWindow: number;
  costTier: 'low' | 'medium' | 'high';
}

export const MODEL_CAPABILITIES: Record<AIModel, ModelCapabilities> = {
  // OpenAI Models
  'gpt-4': {
    maxTokens: 8192,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    contextWindow: 8192,
    costTier: 'high',
  },
  'gpt-4-turbo-preview': {
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    contextWindow: 128000,
    costTier: 'high',
  },
  'gpt-4-32k': {
    maxTokens: 32768,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    contextWindow: 32768,
    costTier: 'high',
  },
  'gpt-3.5-turbo': {
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    contextWindow: 16385,
    costTier: 'low',
  },
  'gpt-3.5-turbo-16k': {
    maxTokens: 16384,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    contextWindow: 16385,
    costTier: 'medium',
  },

  // Anthropic Models
  'claude-3-opus-20240229': {
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    contextWindow: 200000,
    costTier: 'high',
  },
  'claude-3-sonnet-20240229': {
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    contextWindow: 200000,
    costTier: 'medium',
  },
  'claude-3-haiku-20240307': {
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    contextWindow: 200000,
    costTier: 'low',
  },

  // Local Models
  'ollama-llama2': {
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    contextWindow: 4096,
    costTier: 'low',
  },
  'ollama-mistral': {
    maxTokens: 4096,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    contextWindow: 8192,
    costTier: 'low',
  },
};

// =====================================================
// DEFAULT COMPLETION OPTIONS BY FEATURE
// =====================================================

export const DEFAULT_COMPLETION_OPTIONS: Record<
  AIFeatureType,
  {
    temperature: number;
    maxTokens: number;
    topP?: number;
  }
> = {
  study_coach: {
    temperature: 0.7, // Balanced creativity for planning
    maxTokens: 2000,
    topP: 0.9,
  },
  scheduling_assistant: {
    temperature: 0.3, // Low temperature for precise parsing
    maxTokens: 1000,
  },
  course_tutor: {
    temperature: 0.5, // Moderate temperature for educational content
    maxTokens: 2000,
  },
  grade_projection: {
    temperature: 0.1, // Very low for calculations
    maxTokens: 1000,
  },
  feedback_analyzer: {
    temperature: 0.3, // Low for objective analysis
    maxTokens: 1500,
  },
  chat: {
    temperature: 0.7, // Natural conversation
    maxTokens: 1500,
  },
  quiz_generator: {
    temperature: 0.8, // Higher for variety in questions
    maxTokens: 2000,
  },
  summarizer: {
    temperature: 0.3, // Low for accurate summaries
    maxTokens: 1000,
  },
  // Teacher-specific features (Phase 6)
  weekly_summary: {
    temperature: 0.4, // Moderate for balanced insights
    maxTokens: 3000, // Longer summaries (500-800 words)
  },
  student_brief: {
    temperature: 0.4, // Moderate for accurate analysis
    maxTokens: 2000, // Medium length (300-500 words)
  },
  teacher_assistant: {
    temperature: 0.6, // Conversational but focused
    maxTokens: 2000,
    topP: 0.9,
  },
  proactive_suggestion: {
    temperature: 0.5, // Balanced for helpful suggestions
    maxTokens: 800, // Shorter, concise suggestions
  },
};

// =====================================================
// QUOTA LIMITS (FREE TIER)
// =====================================================

export const FREE_TIER_QUOTAS = {
  maxRequestsPerMonth: 100,
  maxTokensPerMonth: 100000,
  maxCostCentsPerMonth: 100, // $1.00/month

  // Per-feature daily limits
  studyCoachPerDay: 5,
  schedulingAssistantPerDay: 10,
  courseTutorPerDay: 20,
  gradeProjectionPerDay: 10,
  feedbackAnalyzerPerDay: 5,
} as const;

// =====================================================
// PREMIUM TIER QUOTAS
// =====================================================

export const PREMIUM_TIER_QUOTAS = {
  maxRequestsPerMonth: null, // Unlimited
  maxTokensPerMonth: null, // Unlimited
  maxCostCentsPerMonth: 2000, // $20.00/month

  // Per-feature daily limits
  studyCoachPerDay: null, // Unlimited
  schedulingAssistantPerDay: null,
  courseTutorPerDay: null,
  gradeProjectionPerDay: null,
  feedbackAnalyzerPerDay: null,
} as const;

// =====================================================
// RATE LIMITING
// =====================================================

export const RATE_LIMITS = {
  // Requests per minute per user
  requestsPerMinute: 10,

  // Requests per hour per user
  requestsPerHour: 100,

  // Cooldown period after rate limit (seconds)
  cooldownPeriod: 60,
} as const;

// =====================================================
// CACHING CONFIGURATION
// =====================================================

export const CACHE_CONFIG = {
  // Enable caching for specific features
  enabledFeatures: [
    'course_tutor',
    'feedback_analyzer',
    'quiz_generator',
    'summarizer',
  ] as AIFeatureType[],

  // Default TTL if not specified in feature config (seconds)
  defaultTTL: 3600, // 1 hour

  // Maximum cache size (number of entries)
  maxCacheEntries: 10000,

  // Clean up expired cache entries every X minutes
  cleanupIntervalMinutes: 60,
} as const;

/**
 * Default cache TTLs per feature type (in seconds)
 */
export const DEFAULT_CACHE_TTLS: Record<AIFeatureType, number> = {
  study_coach: 1800, // 30 minutes (study plans change frequently)
  scheduling_assistant: 300, // 5 minutes (scheduling is time-sensitive)
  course_tutor: 7200, // 2 hours (course content is relatively stable)
  grade_projection: 3600, // 1 hour (grades update periodically)
  feedback_analyzer: 3600, // 1 hour (feedback doesn't change often)
  chat: 0, // No caching for chat (always fresh)
  quiz_generator: 7200, // 2 hours (quizzes can be reused)
  summarizer: 3600, // 1 hour (summaries are relatively stable)
  // Teacher-specific features (Phase 6)
  weekly_summary: 7 * 24 * 60 * 60, // 7 days (summaries are stable)
  student_brief: 24 * 60 * 60, // 1 day (briefs may change daily)
  teacher_assistant: 0, // No caching (always fresh conversation)
  proactive_suggestion: 60 * 60, // 1 hour (suggestions change throughout day)
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get the appropriate model for a feature type
 */
export function getModelForFeature(featureType: AIFeatureType): AIModel {
  return DEFAULT_MODELS[featureType];
}

/**
 * Get the provider for a given model
 */
export function getProviderForModel(model: AIModel): AIProvider {
  if (model.startsWith('gpt-')) return 'openai';
  if (model.startsWith('claude-')) return 'anthropic';
  if (model.startsWith('ollama-')) return 'local';
  return AI_CONFIG.primaryProvider;
}

/**
 * Check if a model supports a specific capability
 */
export function modelSupportsCapability(
  model: AIModel,
  capability: keyof ModelCapabilities
): boolean {
  const caps = MODEL_CAPABILITIES[model];
  if (!caps) return false;

  const value = caps[capability];
  return typeof value === 'boolean' ? value : !!value;
}

/**
 * Get the API key for a provider
 */
export function getAPIKey(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return AI_CONFIG.openaiApiKey;
    case 'anthropic':
      return AI_CONFIG.anthropicApiKey;
    case 'local':
      return ''; // No API key needed for local models
    default:
      return '';
  }
}

/**
 * Check if provider is configured
 */
export function isProviderConfigured(provider: AIProvider): boolean {
  const apiKey = getAPIKey(provider);
  return provider === 'local' || apiKey.length > 0;
}

/**
 * Validate AI configuration on startup
 */
export function validateAIConfig(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if at least one provider is configured
  const primaryConfigured = isProviderConfigured(AI_CONFIG.primaryProvider);
  const fallbackConfigured = isProviderConfigured(AI_CONFIG.fallbackProvider);

  if (!primaryConfigured && !fallbackConfigured) {
    errors.push('No AI provider is configured. Please set API keys in environment variables.');
  }

  if (!primaryConfigured) {
    warnings.push(
      `Primary provider (${AI_CONFIG.primaryProvider}) is not configured. ` +
        `${fallbackConfigured ? 'Using fallback provider.' : 'AI features will not work.'}`
    );
  }

  if (AI_CONFIG.enableFallback && !fallbackConfigured) {
    warnings.push(
      `Fallback provider (${AI_CONFIG.fallbackProvider}) is not configured. ` +
        `Fallback will not be available.`
    );
  }

  // Check timeout values
  if (AI_CONFIG.requestTimeout < 1000) {
    warnings.push('Request timeout is very low (< 1s). This may cause premature timeouts.');
  }

  if (AI_CONFIG.maxRetries > 5) {
    warnings.push('Max retries is very high (> 5). This may cause long delays on failures.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate config on module load (development only)
if (AI_CONFIG.debugMode) {
  const validation = validateAIConfig();
  if (!validation.valid) {
    console.error('[AI Config] Validation errors:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('[AI Config] Warnings:', validation.warnings);
  }
}
