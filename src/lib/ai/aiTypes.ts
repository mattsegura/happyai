/**
 * AI Service Types
 *
 * Type definitions for the AI integration layer supporting multiple providers
 * (OpenAI, Anthropic Claude) with caching, cost tracking, and quota management.
 */

// =====================================================
// AI PROVIDERS
// =====================================================

export type AIProvider = 'openai' | 'anthropic' | 'local';

export type AIModel =
  // OpenAI Models
  | 'gpt-4'
  | 'gpt-4-turbo-preview'
  | 'gpt-4-32k'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-16k'
  // Anthropic Models
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307'
  // Local Models
  | 'ollama-llama2'
  | 'ollama-mistral';

// =====================================================
// FEATURE TYPES
// =====================================================

export type AIFeatureType =
  | 'study_coach'
  | 'scheduling_assistant'
  | 'course_tutor'
  | 'grade_projection'
  | 'feedback_analyzer'
  | 'chat'
  | 'quiz_generator'
  | 'summarizer';

// =====================================================
// COMPLETION OPTIONS
// =====================================================

export interface CompletionOptions {
  model?: AIModel;
  temperature?: number; // 0.0 - 2.0 (lower = more focused, higher = more creative)
  maxTokens?: number;
  topP?: number; // 0.0 - 1.0 (nucleus sampling)
  frequencyPenalty?: number; // -2.0 - 2.0
  presencePenalty?: number; // -2.0 - 2.0
  stop?: string[]; // Stop sequences
  stream?: boolean; // Enable streaming
  responseFormat?: 'text' | 'json' | 'markdown';
  cacheEnabled?: boolean; // Use caching
  cacheTTL?: number; // Cache TTL in seconds
}

// =====================================================
// COMPLETION REQUESTS & RESPONSES
// =====================================================

export interface CompletionRequest {
  prompt: string;
  featureType: AIFeatureType;
  contextData?: Record<string, unknown>;
  options?: CompletionOptions;
  promptVersion?: string;
}

export interface CompletionResponse {
  content: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  costCents: number;
  model: AIModel;
  provider: AIProvider;
  cacheHit: boolean;
  executionTimeMs: number;
  interactionId?: string; // Database record ID
}

export interface StreamChunk {
  content: string;
  done: boolean;
  tokensUsed?: number;
}

// =====================================================
// FUNCTION CALLING (for structured output)
// =====================================================

export interface AIFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
      format?: string;
    }>;
    required?: string[];
  };
}

export interface FunctionCallRequest {
  prompt: string;
  functions: AIFunction[];
  featureType: AIFeatureType;
  options?: CompletionOptions;
}

export interface FunctionCallResult {
  functionName: string;
  arguments: Record<string, unknown>;
  content?: string; // Optional explanation from AI
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  costCents: number;
}

// =====================================================
// EMBEDDINGS (for semantic search)
// =====================================================

export interface EmbeddingRequest {
  text: string | string[];
  model?: 'text-embedding-ada-002' | 'text-embedding-3-small' | 'text-embedding-3-large';
}

export interface EmbeddingResponse {
  embeddings: number[][];
  tokensUsed: number;
  costCents: number;
}

// =====================================================
// COST TRACKING
// =====================================================

export interface CostConfig {
  provider: AIProvider;
  model: AIModel;
  inputCostPer1kTokens: number; // USD
  outputCostPer1kTokens: number; // USD
}

export const AI_COST_CONFIG: Record<string, CostConfig> = {
  // OpenAI Pricing (as of 2024)
  'gpt-4': {
    provider: 'openai',
    model: 'gpt-4',
    inputCostPer1kTokens: 0.03,
    outputCostPer1kTokens: 0.06,
  },
  'gpt-4-turbo-preview': {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    inputCostPer1kTokens: 0.01,
    outputCostPer1kTokens: 0.03,
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    inputCostPer1kTokens: 0.0015,
    outputCostPer1kTokens: 0.002,
  },
  // Anthropic Pricing (as of 2024)
  'claude-3-opus-20240229': {
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    inputCostPer1kTokens: 0.015,
    outputCostPer1kTokens: 0.075,
  },
  'claude-3-sonnet-20240229': {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    inputCostPer1kTokens: 0.003,
    outputCostPer1kTokens: 0.015,
  },
  'claude-3-haiku-20240307': {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    inputCostPer1kTokens: 0.00025,
    outputCostPer1kTokens: 0.00125,
  },
};

export function calculateCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  const config = AI_COST_CONFIG[model];
  if (!config) {
    console.warn(`Unknown model: ${model}, using default cost`);
    return 0;
  }

  const inputCost = (inputTokens / 1000) * config.inputCostPer1kTokens;
  const outputCost = (outputTokens / 1000) * config.outputCostPer1kTokens;
  const totalCostUSD = inputCost + outputCost;

  // Return cost in cents
  return Math.ceil(totalCostUSD * 100);
}

// =====================================================
// QUOTA MANAGEMENT
// =====================================================

export interface UserQuota {
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  totalRequests: number;
  totalTokens: number;
  totalCostCents: number;
  maxRequestsPerPeriod: number | null;
  maxTokensPerPeriod: number | null;
  maxCostCentsPerPeriod: number | null;
  quotaExceeded: boolean;
  exceededAt?: Date;
  featureUsage: {
    studyCoach: number;
    schedulingAssistant: number;
    courseTutor: number;
    gradeProjection: number;
    feedbackAnalyzer: number;
  };
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  remainingRequests?: number;
  remainingTokens?: number;
  remainingCostCents?: number;
}

// =====================================================
// CACHING
// =====================================================

export interface CacheEntry {
  cacheKey: string;
  response: string;
  responseFormat: string;
  hitCount: number;
  tokensSaved: number;
  costSavedCents: number;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface CacheOptions {
  enabled: boolean;
  ttl: number; // seconds
  featureType: AIFeatureType;
}

// Default cache TTLs by feature (in seconds)
export const DEFAULT_CACHE_TTLS: Record<AIFeatureType, number> = {
  study_coach: 24 * 60 * 60, // 1 day
  scheduling_assistant: 0, // No caching (always fresh)
  course_tutor: 7 * 24 * 60 * 60, // 7 days (common questions)
  grade_projection: 60 * 60, // 1 hour
  feedback_analyzer: 30 * 24 * 60 * 60, // 30 days
  chat: 0, // No caching
  quiz_generator: 7 * 24 * 60 * 60, // 7 days
  summarizer: 7 * 24 * 60 * 60, // 7 days
};

// =====================================================
// CONVERSATION MANAGEMENT
// =====================================================

export interface ConversationThread {
  id: string;
  userId: string;
  featureType: AIFeatureType;
  title: string;
  courseId?: string;
  messageCount: number;
  totalTokensUsed: number;
  status: 'active' | 'archived' | 'deleted';
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentFormat: 'text' | 'markdown' | 'json';
  tokensUsed: number;
  aiInteractionId?: string;
  createdAt: Date;
}

// =====================================================
// AI SERVICE ERRORS
// =====================================================

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: AIProvider,
    public model?: AIModel,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class QuotaExceededError extends AIServiceError {
  constructor(message: string) {
    super(message, 'QUOTA_EXCEEDED');
    this.name = 'QuotaExceededError';
  }
}

export class RateLimitError extends AIServiceError {
  constructor(message: string, provider: AIProvider) {
    super(message, 'RATE_LIMIT', provider);
    this.name = 'RateLimitError';
  }
}

export class InvalidAPIKeyError extends AIServiceError {
  constructor(provider: AIProvider) {
    super(`Invalid API key for provider: ${provider}`, 'INVALID_API_KEY', provider);
    this.name = 'InvalidAPIKeyError';
  }
}

// =====================================================
// AI USAGE STATISTICS
// =====================================================

export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCostCents: number;
  requestsByFeature: Record<AIFeatureType, number>;
  tokensByProvider: Record<AIProvider, number>;
  averageTokensPerRequest: number;
  cacheHitRate: number; // Percentage
}

// =====================================================
// PROMPT TEMPLATES
// =====================================================

export interface PromptTemplate {
  version: string;
  template: string;
  variables: string[];
  featureType: AIFeatureType;
  model: AIModel;
  systemPrompt?: string;
}

export interface PromptVariables {
  [key: string]: string | number | boolean | object | undefined;
}
