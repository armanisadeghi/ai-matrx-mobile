/**
 * AI Matrx Mobile - API Client
 * FastAPI client with streaming support for chat
 */

import { getAccessToken } from './supabase';
import { ApiResponse, ApiError, ApiRequestConfig, FastAPIErrorResponse } from '@/types/api';
import { ChatStreamEvent } from '@/types/chat';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Parse FastAPI error response
 */
function parseError(error: unknown, status: number): ApiError {
  if (typeof error === 'object' && error !== null) {
    const fastApiError = error as FastAPIErrorResponse;
    if (typeof fastApiError.detail === 'string') {
      return { message: fastApiError.detail, code: String(status) };
    }
    if (Array.isArray(fastApiError.detail)) {
      const messages = fastApiError.detail.map((e) => e.msg).join(', ');
      return { message: messages, code: 'VALIDATION_ERROR' };
    }
  }
  return { message: 'An unexpected error occurred', code: String(status) };
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT,
    signal,
  } = config;

  try {
    const token = await getAccessToken();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: signal || controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null,
        error: parseError(errorData, response.status),
        status: response.status,
      };
    }

    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          data: null,
          error: { message: 'Request timeout', code: 'TIMEOUT' },
          status: 408,
        };
      }
      return {
        data: null,
        error: { message: error.message, code: 'NETWORK_ERROR' },
        status: 0,
      };
    }
    return {
      data: null,
      error: { message: 'An unexpected error occurred', code: 'UNKNOWN' },
      status: 0,
    };
  }
}

/**
 * Stream chat response from API
 * Handles Server-Sent Events (SSE) for real-time streaming
 */
export async function streamChatResponse(
  endpoint: string,
  body: unknown,
  onEvent: (event: ChatStreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const token = await getAccessToken();

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = parseError(errorData, response.status);
      onEvent({ type: 'error', error: error.message });
      return;
    }

    if (!response.body) {
      onEvent({ type: 'error', error: 'No response body' });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    onEvent({ type: 'start' });

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onEvent({ type: 'end' });
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onEvent({ type: 'end' });
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              onEvent({ type: 'token', content: parsed.content });
            }
            if (parsed.message_id) {
              onEvent({ type: 'token', messageId: parsed.message_id });
            }
            if (parsed.conversation_id) {
              onEvent({ type: 'token', conversationId: parsed.conversation_id });
            }
          } catch {
            // If not JSON, treat as plain text token
            onEvent({ type: 'token', content: data });
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      onEvent({ type: 'end' });
      return;
    }
    onEvent({
      type: 'error',
      error: error instanceof Error ? error.message : 'Stream error',
    });
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...config, method: 'GET' }),
    
  post: <T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...config, method: 'POST', body }),
    
  put: <T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...config, method: 'PUT', body }),
    
  patch: <T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...config, method: 'PATCH', body }),
    
  delete: <T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...config, method: 'DELETE' }),
    
  stream: streamChatResponse,
};
