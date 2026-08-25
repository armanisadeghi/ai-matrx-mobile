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
import {
  createMatrxNdjsonFramer,
  type MatrxStreamEnvelope,
} from '@ai-matrx/agents/stream/ndjson';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { getAccessToken } from '../supabase';

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
 * Execute an agent with streaming response using XMLHttpRequest
 * Returns an async generator that yields stream events
 * Uses XMLHttpRequest instead of fetch for React Native streaming compatibility
 */
export async function* executeAgent(
  request: AgentExecuteRequest,
  signal?: AbortSignal
): AsyncGenerator<AgentStreamEvent> {
  let headers: Record<string, string>;

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

  const xhr = new XMLHttpRequest();
  let lastPosition = 0;
  let isComplete = false;

  // Create a promise-based queue for events
  const eventQueue: AgentStreamEvent[] = [];
  let resolveNext: (() => void) | null = null;

  const pushEvent = (event: AgentStreamEvent) => {
    eventQueue.push(event);
    if (resolveNext) {
      resolveNext();
      resolveNext = null;
    }
  };

  const waitForEvent = () => new Promise<void>(resolve => {
    if (eventQueue.length > 0) {
      resolve();
    } else {
      resolveNext = resolve;
    }
  });

  const toAgentStreamEvent = (envelope: MatrxStreamEnvelope): AgentStreamEvent => {
    if (envelope.event === 'chunk') {
      const text =
        typeof envelope.data === 'string'
          ? envelope.data
          : envelope.data !== null &&
              typeof envelope.data === 'object' &&
              !Array.isArray(envelope.data) &&
              typeof (envelope.data as Record<string, unknown>).text === 'string'
            ? ((envelope.data as Record<string, unknown>).text as string)
            : '';
      return { event: 'chunk', data: text };
    }
    return envelope as unknown as AgentStreamEvent;
  };

  const pushEnvelopes = (envelopes: MatrxStreamEnvelope[]) => {
    for (const envelope of envelopes) {
      if (__DEV__) {
        console.log('[Agent Service] Parsed event:', envelope.event);
      }
      pushEvent(toAgentStreamEvent(envelope));
    }
  };

  // XHR progress callbacks can split a JSON token or a UTF-8 code point at
  // any position. The package framer owns that carry-over buffer and only
  // emits complete normalized envelopes; no partial transcript is discarded.
  const framer = createMatrxNdjsonFramer({
    onMalformedLine: ({ line, error, lineNumber }) => {
      console.warn(
        `[Agent Service] Failed to parse stream line #${lineNumber}:`,
        line.substring(0, 100),
      );
      if (__DEV__) console.warn('[Agent Service] Parse error:', error);
    },
    onUnknownEnvelope: (value) => {
      console.warn('[Agent Service] Unknown stream envelope:', value);
    },
  });

  xhr.onprogress = () => {
    const newData = xhr.responseText.substring(lastPosition);
    lastPosition = xhr.responseText.length;

    if (!newData) return;

    if (__DEV__) {
      console.log('[Agent Service] Received chunk, length:', newData.length);
    }

    pushEnvelopes(framer.pushText(newData));
  };

  xhr.onload = () => {
    if (__DEV__) {
      console.log('[Agent Service] Stream completed, status:', xhr.status);
    }

    if (xhr.status === 200) {
      // Flush a final valid envelope even when the server omits its newline.
      pushEnvelopes(framer.finish());
    } else {
      try {
        const error = JSON.parse(xhr.responseText);
        pushEvent({
          event: 'error',
          data: {
            type: 'http_error',
            message: error.detail || `HTTP ${xhr.status}`,
            user_visible_message: 'Failed to connect to the AI service. Please try again.',
            code: String(xhr.status),
          },
        });
      } catch {
        pushEvent({
          event: 'error',
          data: {
            type: 'http_error',
            message: `HTTP ${xhr.status}`,
            user_visible_message: 'Failed to connect to the AI service. Please try again.',
            code: String(xhr.status),
          },
        });
      }
    }

    pushEvent({
      event: 'end',
      data: true,
    });
    isComplete = true;
  };

  xhr.onerror = () => {
    if (__DEV__) {
      console.error('[Agent Service] XHR network error');
    }
    pushEvent({
      event: 'error',
      data: {
        type: 'network_error',
        message: 'Network error',
        user_visible_message: 'Failed to connect to the server. Please check your network connection.',
      },
    });
    pushEvent({
      event: 'end',
      data: true,
    });
    isComplete = true;
  };

  xhr.onabort = () => {
    pushEvent({
      event: 'end',
      data: true,
    });
    isComplete = true;
  };

  xhr.open('POST', `${API_BASE_URL}/api/agent/execute`);

  // Set headers
  for (const [key, value] of Object.entries(headers)) {
    xhr.setRequestHeader(key, value);
  }

  // Handle abort signal
  if (signal) {
    signal.addEventListener('abort', () => {
      xhr.abort();
    });
  }

  // Send the request
  xhr.send(JSON.stringify({
    ...request,
    stream: true,
  }));

  // Yield events as they arrive
  try {
    while (!isComplete) {
      await waitForEvent();
      
      while (eventQueue.length > 0) {
        const event = eventQueue.shift()!;
        yield event;
        
        if (event.event === 'end' || event.event === 'error') {
          isComplete = true;
        }
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
