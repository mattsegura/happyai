/**
 * OpenAI Provider
 *
 * Implementation of the AI provider interface for OpenAI's GPT models.
 * Supports GPT-4, GPT-4 Turbo, and GPT-3.5 Turbo.
 */

import OpenAI from 'openai';
import type {
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
  FunctionCallRequest,
  FunctionCallResult,
  AIModel,
} from '../aiTypes';
import { calculateCost } from '../aiTypes';
import { AI_CONFIG } from '../aiConfig';

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!AI_CONFIG.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    openaiClient = new OpenAI({
      apiKey: AI_CONFIG.openaiApiKey,
      dangerouslyAllowBrowser: true, // Enable browser usage
    });
  }
  return openaiClient;
}

// =====================================================
// TEXT COMPLETION
// =====================================================

export async function complete(request: CompletionRequest): Promise<CompletionResponse> {
  const startTime = Date.now();
  const client = getOpenAIClient();

  const model = request.options?.model || 'gpt-3.5-turbo';
  const maxTokens = request.options?.maxTokens || 2000;
  const temperature = request.options?.temperature ?? 0.7;

  try {
    const response = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: request.prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '';
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const totalTokens = response.usage?.total_tokens || inputTokens + outputTokens;

    const costCents = calculateCost(model as AIModel, inputTokens, outputTokens);
    const executionTimeMs = Date.now() - startTime;

    return {
      content,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokens,
      },
      costCents,
      model: model as AIModel,
      provider: 'openai',
      cacheHit: false,
      executionTimeMs,
    };
  } catch (error) {
    console.error('[OpenAI Provider] Completion error:', error);
    throw error;
  }
}

// =====================================================
// STREAMING COMPLETION
// =====================================================

export async function* streamComplete(
  request: CompletionRequest
): AsyncIterableIterator<StreamChunk> {
  const client = getOpenAIClient();

  const model = request.options?.model || 'gpt-3.5-turbo';
  const maxTokens = request.options?.maxTokens || 2000;
  const temperature = request.options?.temperature ?? 0.7;

  try {
    const stream = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: request.prompt,
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      const finishReason = chunk.choices[0]?.finish_reason;

      if (content) {
        yield {
          content,
          done: false,
        };
      }

      if (finishReason) {
        yield {
          content: '',
          done: true,
        };
      }
    }
  } catch (error) {
    console.error('[OpenAI Provider] Streaming error:', error);
    throw error;
  }
}

// =====================================================
// FUNCTION CALLING
// =====================================================

export async function functionCall(
  request: FunctionCallRequest
): Promise<FunctionCallResult> {
  const client = getOpenAIClient();

  const model = request.options?.model || 'gpt-3.5-turbo';
  const maxTokens = request.options?.maxTokens || 2000;
  const temperature = request.options?.temperature ?? 0.3;

  // Convert functions to OpenAI format
  const tools = request.functions.map((fn) => ({
    type: 'function' as const,
    function: {
      name: fn.name,
      description: fn.description,
      parameters: fn.parameters,
    },
  }));

  try {
    const response = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      tools,
      tool_choice: 'auto',
      messages: [
        {
          role: 'user',
          content: request.prompt,
        },
      ],
    });

    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const costCents = calculateCost(model as AIModel, inputTokens, outputTokens);

    const message = response.choices[0]?.message;

    // Check if function was called
    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const functionName = (toolCall as any).function?.name || '';
      const args = JSON.parse((toolCall as any).function?.arguments || '{}');

      return {
        functionName,
        arguments: args,
        content: message.content || '',
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        costCents,
      };
    }

    // No function call, return text response
    return {
      functionName: '',
      arguments: {},
      content: message?.content || '',
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      costCents,
    };
  } catch (error) {
    console.error('[OpenAI Provider] Function calling error:', error);
    throw error;
  }
}

export default {
  complete,
  streamComplete,
  functionCall,
};
