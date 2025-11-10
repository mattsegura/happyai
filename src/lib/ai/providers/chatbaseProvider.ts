/**
 * Chatbase Provider
 *
 * Implementation for Chatbase API - used specifically for Course Tutor feature.
 * Chatbase specializes in conversational AI and is perfect for Q&A chatbots.
 *
 * Set VITE_USE_MOCK_AI=true in .env to use mock responses (no API key needed)
 */

import type {
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
  AIModel,
} from '../aiTypes';
import * as mockProvider from './chatbaseMockProvider';

// Chatbase API configuration
const CHATBASE_API_URL = 'https://www.chatbase.co/api/v1/chat';
const CHATBASE_API_KEY = import.meta.env.VITE_CHATBASE_API_KEY || '';
const CHATBASE_CHATBOT_ID = import.meta.env.VITE_CHATBASE_CHATBOT_ID || '';
const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI === 'true';

// =====================================================
// CHATBASE REQUEST/RESPONSE TYPES
// =====================================================

interface ChatbaseRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  chatbotId: string;
  stream?: boolean;
  temperature?: number;
  model?: string;
}

interface ChatbaseResponse {
  text: string;
  sourceDocuments?: Array<{
    pageContent: string;
    metadata: Record<string, unknown>;
  }>;
}

// =====================================================
// TEXT COMPLETION
// =====================================================

export async function complete(request: CompletionRequest): Promise<CompletionResponse> {
  // Use mock provider if enabled
  if (USE_MOCK_AI) {
    console.log('[Chatbase Provider] Using MOCK AI responses (VITE_USE_MOCK_AI=true)');
    return mockProvider.complete(request);
  }

  const startTime = Date.now();

  if (!CHATBASE_API_KEY) {
    throw new Error('Chatbase API key not configured. Set VITE_CHATBASE_API_KEY in .env or use VITE_USE_MOCK_AI=true for testing.');
  }

  if (!CHATBASE_CHATBOT_ID) {
    throw new Error('Chatbase Chatbot ID not configured. Set VITE_CHATBASE_CHATBOT_ID in .env or use VITE_USE_MOCK_AI=true for testing.');
  }

  const temperature = request.options?.temperature ?? 0.7;

  try {
    const chatbaseRequest: ChatbaseRequest = {
      messages: [
        {
          role: 'user',
          content: request.prompt,
        },
      ],
      chatbotId: CHATBASE_CHATBOT_ID,
      temperature,
      stream: false,
    };

    const response = await fetch(CHATBASE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHATBASE_API_KEY}`,
      },
      body: JSON.stringify(chatbaseRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chatbase API error: ${response.status} - ${errorText}`);
    }

    const data: ChatbaseResponse = await response.json();
    const content = data.text || '';
    const executionTimeMs = Date.now() - startTime;

    // Estimate token usage (Chatbase doesn't provide token counts)
    // Rough estimate: ~4 characters per token
    const estimatedInputTokens = Math.ceil(request.prompt.length / 4);
    const estimatedOutputTokens = Math.ceil(content.length / 4);
    const totalTokens = estimatedInputTokens + estimatedOutputTokens;

    // Chatbase pricing is typically subscription-based, not per-token
    // Set cost to 0 since it's included in subscription
    const costCents = 0;

    return {
      content,
      tokensUsed: {
        input: estimatedInputTokens,
        output: estimatedOutputTokens,
        total: totalTokens,
      },
      costCents,
      model: 'chatbase' as AIModel,
      provider: 'local', // Using 'local' as a generic third-party provider
      cacheHit: false,
      executionTimeMs,
    };
  } catch (error) {
    console.error('[Chatbase Provider] Completion error:', error);
    throw error;
  }
}

// =====================================================
// STREAMING COMPLETION
// =====================================================

export async function* streamComplete(
  request: CompletionRequest
): AsyncIterableIterator<StreamChunk> {
  // Use mock provider if enabled
  if (USE_MOCK_AI) {
    yield* mockProvider.streamComplete(request);
    return;
  }

  if (!CHATBASE_API_KEY || !CHATBASE_CHATBOT_ID) {
    throw new Error('Chatbase not configured. Set API keys in .env or use VITE_USE_MOCK_AI=true for testing.');
  }

  const temperature = request.options?.temperature ?? 0.7;

  try {
    const chatbaseRequest: ChatbaseRequest = {
      messages: [
        {
          role: 'user',
          content: request.prompt,
        },
      ],
      chatbotId: CHATBASE_CHATBOT_ID,
      temperature,
      stream: true,
    };

    const response = await fetch(CHATBASE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHATBASE_API_KEY}`,
      },
      body: JSON.stringify(chatbaseRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chatbase API error: ${response.status} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          yield {
            content: '',
            done: true,
          };
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          // Chatbase streaming format: "data: {json}"
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            try {
              const data = JSON.parse(jsonStr);
              if (data.text) {
                yield {
                  content: data.text,
                  done: false,
                };
              }
            } catch (_e) {
              // Skip invalid JSON
              console.warn('[Chatbase] Invalid JSON in stream:', jsonStr);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('[Chatbase Provider] Streaming error:', error);
    throw error;
  }
}

// =====================================================
// CHATBASE WITH CONVERSATION CONTEXT
// =====================================================

/**
 * Chat with conversation history (Chatbase-specific feature)
 */
export async function chatWithContext(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  temperature = 0.7
): Promise<CompletionResponse> {
  // Use mock provider if enabled
  if (USE_MOCK_AI) {
    return mockProvider.chatWithContext(messages, temperature);
  }

  const startTime = Date.now();

  if (!CHATBASE_API_KEY || !CHATBASE_CHATBOT_ID) {
    throw new Error('Chatbase not configured. Set API keys in .env or use VITE_USE_MOCK_AI=true for testing.');
  }

  try {
    const chatbaseRequest: ChatbaseRequest = {
      messages,
      chatbotId: CHATBASE_CHATBOT_ID,
      temperature,
      stream: false,
    };

    const response = await fetch(CHATBASE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHATBASE_API_KEY}`,
      },
      body: JSON.stringify(chatbaseRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chatbase API error: ${response.status} - ${errorText}`);
    }

    const data: ChatbaseResponse = await response.json();
    const content = data.text || '';
    const executionTimeMs = Date.now() - startTime;

    // Estimate tokens
    const allMessages = messages.map(m => m.content).join(' ');
    const estimatedInputTokens = Math.ceil(allMessages.length / 4);
    const estimatedOutputTokens = Math.ceil(content.length / 4);

    return {
      content,
      tokensUsed: {
        input: estimatedInputTokens,
        output: estimatedOutputTokens,
        total: estimatedInputTokens + estimatedOutputTokens,
      },
      costCents: 0,
      model: 'chatbase' as AIModel,
      provider: 'local',
      cacheHit: false,
      executionTimeMs,
    };
  } catch (error) {
    console.error('[Chatbase Provider] Chat with context error:', error);
    throw error;
  }
}

// =====================================================
// CONFIGURATION CHECK
// =====================================================

export function isChatbaseConfigured(): boolean {
  // If using mock AI, always return true
  if (USE_MOCK_AI) {
    return true;
  }
  return CHATBASE_API_KEY.length > 0 && CHATBASE_CHATBOT_ID.length > 0;
}

export default {
  complete,
  streamComplete,
  chatWithContext,
  isChatbaseConfigured,
};
