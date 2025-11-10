/**
 * Google Gemini AI Provider
 *
 * Implements the AI provider interface for Google's Gemini models.
 * Supports text completion, streaming, and function calling.
 */

import type {
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
  FunctionCallRequest,
  FunctionCallResult,
} from '../aiTypes';
import { AI_CONFIG, DEFAULT_COMPLETION_OPTIONS } from '../aiConfig';
import { calculateCost } from '../aiTypes';
import { AIServiceError } from '../aiTypes';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Get Gemini API key
 */
function getGeminiAPIKey(): string {
  const apiKey = AI_CONFIG.geminiApiKey;
  if (!apiKey) {
    throw new AIServiceError(
      'Gemini API key not configured',
      'MISSING_API_KEY',
      'gemini'
    );
  }
  return apiKey;
}

/**
 * Complete a text generation request with Gemini
 */
export async function complete(request: CompletionRequest): Promise<CompletionResponse> {
  const startTime = Date.now();
  const apiKey = getGeminiAPIKey();
  
  const model = request.options?.model || 'gemini-2.5-flash';
  const defaultOptions = DEFAULT_COMPLETION_OPTIONS[request.featureType];
  
  const temperature = request.options?.temperature ?? defaultOptions.temperature;
  const maxTokens = request.options?.maxTokens ?? defaultOptions.maxTokens;

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: request.prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: request.options?.topP,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AIServiceError(
        errorData.error?.message || `Gemini API error: ${response.status}`,
        'API_ERROR',
        'gemini',
        model,
        response.status
      );
    }

    const data = await response.json();

    // Check for finish reason issues
    if (data.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
      console.warn('[Gemini] Response hit MAX_TOKENS limit');
    }

    // Handle case where content.parts might be missing or empty
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts;
    
    if (!candidate || !parts || parts.length === 0 || !parts[0]?.text) {
      console.error('[Gemini] Invalid response structure:', JSON.stringify(data, null, 2));
      
      // If we hit max tokens but have no content, it's likely the response was cut off
      if (candidate?.finishReason === 'MAX_TOKENS') {
        throw new AIServiceError(
          'Response exceeded maximum token limit. Try reducing maxTokens or simplifying the prompt.',
          'MAX_TOKENS_EXCEEDED',
          'gemini',
          model
        );
      }
      
      throw new AIServiceError(
        `Invalid response from Gemini API: ${JSON.stringify(data).substring(0, 200)}`,
        'INVALID_RESPONSE',
        'gemini',
        model
      );
    }

    const content = parts[0].text;
    const usageMetadata = data.usageMetadata || {};
    
    const tokensUsed = {
      input: usageMetadata.promptTokenCount || 0,
      output: usageMetadata.candidatesTokenCount || 0,
      total: usageMetadata.totalTokenCount || 0,
    };

    const costCents = calculateCost(
      model,
      tokensUsed.input,
      tokensUsed.output
    );

    return {
      content,
      tokensUsed,
      costCents,
      model,
      provider: 'gemini',
      cacheHit: false,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError(
      `Gemini completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'COMPLETION_ERROR',
      'gemini',
      model
    );
  }
}

/**
 * Stream a text generation request with Gemini
 */
export async function* streamComplete(
  request: CompletionRequest
): AsyncIterableIterator<StreamChunk> {
  const apiKey = getGeminiAPIKey();
  
  const model = request.options?.model || 'gemini-2.5-flash';
  const defaultOptions = DEFAULT_COMPLETION_OPTIONS[request.featureType];
  
  const temperature = request.options?.temperature ?? defaultOptions.temperature;
  const maxTokens = request.options?.maxTokens ?? defaultOptions.maxTokens;

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: request.prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: request.options?.topP,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AIServiceError(
        errorData.error?.message || `Gemini API error: ${response.status}`,
        'API_ERROR',
        'gemini',
        model,
        response.status
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new AIServiceError(
        'Failed to get response stream',
        'STREAM_ERROR',
        'gemini',
        model
      );
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let totalTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        yield {
          content: '',
          done: true,
          tokensUsed: totalTokens,
        };
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr);
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const usageMetadata = data.usageMetadata;
            
            if (usageMetadata?.totalTokenCount) {
              totalTokens = usageMetadata.totalTokenCount;
            }

            if (content) {
              yield {
                content,
                done: false,
                tokensUsed: totalTokens,
              };
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError(
      `Gemini streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STREAM_ERROR',
      'gemini',
      model
    );
  }
}

/**
 * Execute a function call with Gemini
 */
export async function functionCall(
  request: FunctionCallRequest
): Promise<FunctionCallResult> {
  const apiKey = getGeminiAPIKey();
  
  const model = request.options?.model || 'gemini-2.5-flash';
  const defaultOptions = DEFAULT_COMPLETION_OPTIONS[request.featureType];
  
  const temperature = request.options?.temperature ?? defaultOptions.temperature;
  const maxTokens = request.options?.maxTokens ?? defaultOptions.maxTokens;

  // Convert our function format to Gemini's format
  const tools = [
    {
      functionDeclarations: request.functions.map((fn) => ({
        name: fn.name,
        description: fn.description,
        parameters: fn.parameters,
      })),
    },
  ];

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: request.prompt,
                },
              ],
            },
          ],
          tools,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AIServiceError(
        errorData.error?.message || `Gemini API error: ${response.status}`,
        'API_ERROR',
        'gemini',
        model,
        response.status
      );
    }

    const data = await response.json();

    const functionCall = data.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.functionCall
    )?.functionCall;

    if (!functionCall) {
      throw new AIServiceError(
        'No function call in Gemini response',
        'INVALID_RESPONSE',
        'gemini',
        model
      );
    }

    const usageMetadata = data.usageMetadata || {};
    const tokensUsed = {
      input: usageMetadata.promptTokenCount || 0,
      output: usageMetadata.candidatesTokenCount || 0,
      total: usageMetadata.totalTokenCount || 0,
    };

    const costCents = calculateCost(
      model,
      tokensUsed.input,
      tokensUsed.output
    );

    return {
      functionName: functionCall.name,
      arguments: functionCall.args || {},
      content: data.candidates?.[0]?.content?.parts?.[0]?.text,
      tokensUsed,
      costCents,
    };
  } catch (error) {
    if (error instanceof AIServiceError) {
      throw error;
    }
    throw new AIServiceError(
      `Gemini function call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'FUNCTION_CALL_ERROR',
      'gemini',
      model
    );
  }
}

export default {
  complete,
  streamComplete,
  functionCall,
};
