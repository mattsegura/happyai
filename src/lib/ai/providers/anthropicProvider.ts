/**
 * Anthropic Claude Provider
 *
 * Implementation of the AI provider interface for Anthropic's Claude models.
 * Supports Claude 3 Opus, Sonnet, and Haiku.
 */

import Anthropic from '@anthropic-ai/sdk';
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

// Initialize Anthropic client
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!AI_CONFIG.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }
    anthropicClient = new Anthropic({
      apiKey: AI_CONFIG.anthropicApiKey,
      dangerouslyAllowBrowser: true, // Enable browser usage
    });
  }
  return anthropicClient;
}

// =====================================================
// TEXT COMPLETION
// =====================================================

export async function complete(request: CompletionRequest): Promise<CompletionResponse> {
  const startTime = Date.now();
  const client = getAnthropicClient();

  const model = request.options?.model || 'claude-3-sonnet-20240229';
  const maxTokens = request.options?.maxTokens || 2000;
  const temperature = request.options?.temperature ?? 0.7;

  try {
    const response = await client.messages.create({
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

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const totalTokens = inputTokens + outputTokens;

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
      provider: 'anthropic',
      cacheHit: false,
      executionTimeMs,
    };
  } catch (error) {
    console.error('[Anthropic Provider] Completion error:', error);
    throw error;
  }
}

// =====================================================
// STREAMING COMPLETION
// =====================================================

export async function* streamComplete(
  request: CompletionRequest
): AsyncIterableIterator<StreamChunk> {
  const client = getAnthropicClient();

  const model = request.options?.model || 'claude-3-sonnet-20240229';
  const maxTokens = request.options?.maxTokens || 2000;
  const temperature = request.options?.temperature ?? 0.7;

  try {
    const stream = await client.messages.stream({
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

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield {
          content: chunk.delta.text,
          done: false,
        };
      }
    }

    // Final chunk with token usage
    const finalMessage = await stream.finalMessage();
    yield {
      content: '',
      done: true,
      tokensUsed: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
    };
  } catch (error) {
    console.error('[Anthropic Provider] Streaming error:', error);
    throw error;
  }
}

// =====================================================
// FUNCTION CALLING
// =====================================================

export async function functionCall(
  request: FunctionCallRequest
): Promise<FunctionCallResult> {
  const client = getAnthropicClient();

  const model = request.options?.model || 'claude-3-sonnet-20240229';
  const maxTokens = request.options?.maxTokens || 2000;
  const temperature = request.options?.temperature ?? 0.3;

  // Convert functions to Claude tool format
  const tools = request.functions.map((fn) => ({
    name: fn.name,
    description: fn.description,
    input_schema: {
      type: 'object' as const,
      properties: fn.parameters.properties,
      required: fn.parameters.required || [],
    },
  }));

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      tools,
      messages: [
        {
          role: 'user',
          content: request.prompt,
        },
      ],
    });

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const costCents = calculateCost(model as AIModel, inputTokens, outputTokens);

    // Extract tool use from response
    const toolUse = response.content.find((block) => block.type === 'tool_use');

    if (!toolUse || toolUse.type !== 'tool_use') {
      // No function call, return text response
      const textBlock = response.content.find((block) => block.type === 'text');
      return {
        functionName: '',
        arguments: {},
        content: textBlock && textBlock.type === 'text' ? textBlock.text : '',
        tokensUsed: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        costCents,
      };
    }

    return {
      functionName: toolUse.name,
      arguments: toolUse.input as Record<string, unknown>,
      content: '', // Claude doesn't provide explanation with tool use
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      costCents,
    };
  } catch (error) {
    console.error('[Anthropic Provider] Function calling error:', error);
    throw error;
  }
}

export default {
  complete,
  streamComplete,
  functionCall,
};
