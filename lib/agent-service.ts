/**
 * AI Matrx Mobile - Agent Service
 * Handles API calls to the agent backend with streaming support
 */

import {
  AgentExecuteRequest,
  AgentStreamEvent,
  AgentWarmRequest,
  AgentWarmResponse,
} from '@/types/agent';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { getAccessToken } from './supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

// Development debugging for API connection
if (__DEV__) {
  console.log('[Agent Service] API_BASE_URL:', API_BASE_URL);
  if (Platform.OS === 'ios' && API_BASE_URL?.includes('localhost')) {
    console.warn(
      '⚠️ iOS Simulator detected with localhost URL.\n' +
      'iOS Simulator cannot connect to localhost.\n' +
      'Use your machine\'s IP address instead (e.g., http://192.168.1.x:8000)'
    );
  }
}

/**
 * Get authorization headers for authenticated requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (!token) {
    if (__DEV__) {
      console.error('[Agent Service] No authentication token available. User may not be signed in.');
    }
    throw new Error('No authentication token available');
  }
  if (__DEV__) {
    console.log('[Agent Service] Auth token available ✓');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Pre-warm an agent prompt for faster first response
 * No authentication required.
 */
export async function warmAgent(request: AgentWarmRequest): Promise<AgentWarmResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agent/warm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        status: 'error',
        prompt_id: request.prompt_id,
        message: error.detail || `HTTP ${response.status}`,
      };
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    if (__DEV__) {
      console.error('[Agent Service] warmAgent error:', errorMessage);
      if (Platform.OS === 'ios' && API_BASE_URL?.includes('localhost')) {
        console.warn('💡 Tip: Change EXPO_PUBLIC_API_BASE_URL from localhost to your machine\'s IP address');
      }
    }
    return {
      status: 'error',
      prompt_id: request.prompt_id,
      message: errorMessage,
    };
  }
}

/**
 * Execute an agent with streaming response
 * Returns an async generator that yields stream events
 */
export async function* executeAgent(
  request: AgentExecuteRequest,
  signal?: AbortSignal
): AsyncGenerator<AgentStreamEvent> {
  let headers: Record<string, string>;
  let response: Response;

  try {
    headers = await getAuthHeaders();
  } catch (error) {
    yield {
      event: 'error',
      data: {
        type: 'auth_error',
        message: error instanceof Error ? error.message : 'Authentication failed',
        user_visible_message: 'Authentication failed. Please sign in again.',
      },
    };
    return;
  }

  if (__DEV__) {
    console.log('[Agent Service] Executing agent request to:', `${API_BASE_URL}/api/agent/execute`);
    console.log('[Agent Service] Request payload:', JSON.stringify({...request, stream: true}, null, 2));
  }

  try {
    response = await fetch(`${API_BASE_URL}/api/agent/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
      signal,
    });
    
    if (__DEV__) {
      console.log('[Agent Service] Response status:', response.status, response.statusText);
    }
  } catch (error) {
    // Network error (e.g., can't reach server)
    if (__DEV__) {
      console.error('[Agent Service] Network error:', error);
    }
    yield {
      event: 'error',
      data: {
        type: 'network_error',
        message: error instanceof Error ? error.message : 'Network error',
        user_visible_message: 
          'Failed to connect to the server. Please check your network connection.\n' +
          (Platform.OS === 'ios' && API_BASE_URL?.includes('localhost')
            ? 'Note: iOS Simulator cannot connect to localhost. Use your machine\'s IP address.'
            : ''),
      },
    };
    return;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    if (__DEV__) {
      console.error('[Agent Service] HTTP error response:', error);
      console.error('[Agent Service] Status:', response.status, response.statusText);
    }
    yield {
      event: 'error',
      data: {
        type: 'http_error',
        message: error.detail || `HTTP ${response.status}`,
        user_visible_message: 'Failed to connect to the AI service. Please try again.',
        code: String(response.status),
      },
    };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield {
      event: 'error',
      data: {
        type: 'stream_error',
        message: 'No response body',
        user_visible_message: 'Failed to receive response. Please try again.',
      },
    };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          try {
            const event = JSON.parse(trimmed) as AgentStreamEvent;
            yield event;
          } catch {
            // Skip malformed JSON lines
            console.warn('Failed to parse stream line:', trimmed);
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      try {
        const event = JSON.parse(buffer.trim()) as AgentStreamEvent;
        yield event;
      } catch {
        console.warn('Failed to parse final buffer:', buffer);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      yield {
        event: 'end',
        data: true,
      };
      return;
    }

    yield {
      event: 'error',
      data: {
        type: 'stream_error',
        message: error instanceof Error ? error.message : 'Stream error',
        user_visible_message: 'Connection interrupted. Please try again.',
      },
    };
  } finally {
    reader.releaseLock();
  }
}

/**
 * Helper to generate a new conversation ID
 */
export function generateConversationId(): string {
  return uuidv4();
}

/**
 * Build multimodal content array from text and optional resources
 */
export function buildContentArray(
  text: string,
  resources?: { type: 'image' | 'audio' | 'file'; url: string }[]
): AgentExecuteRequest['user_input'] {
  if (!resources || resources.length === 0) {
    return text;
  }

  const content: AgentExecuteRequest['user_input'] = [
    { type: 'input_text', text },
  ];

  for (const resource of resources) {
    switch (resource.type) {
      case 'image':
        (content as Array<{ type: string; image_url?: string }>).push({
          type: 'input_image',
          image_url: resource.url,
        });
        break;
      case 'audio':
        (content as Array<{ type: string; audio_url?: string }>).push({
          type: 'input_audio',
          audio_url: resource.url,
        });
        break;
      case 'file':
        (content as Array<{ type: string; file_url?: string }>).push({
          type: 'input_file',
          file_url: resource.url,
        });
        break;
    }
  }

  return content;
}

