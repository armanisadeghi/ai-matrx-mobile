/**
 * AI Matrx Mobile - Scraper Service
 * Handles API calls to the scraper backend with streaming support
 */

import { Platform } from 'react-native';
import { getAccessToken } from '../supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

// Development debugging for API connection
if (__DEV__) {
  console.log('[Scraper Service] API_BASE_URL:', API_BASE_URL);
  if (Platform.OS === 'ios' && API_BASE_URL?.includes('localhost')) {
    console.warn(
      '⚠️ iOS Simulator detected with localhost URL.\n' +
      'iOS Simulator cannot connect to localhost.\n' +
      'Use your machine\'s IP address instead (e.g., http://192.168.1.x:8000)'
    );
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface ScrapeOptions {
  get_organized_data?: boolean;
  get_structured_data?: boolean;
  get_overview?: boolean;
  get_text_data?: boolean;
  get_main_image?: boolean;
  get_links?: boolean;
  get_content_filter_removal_details?: boolean;
  include_highlighting_markers?: boolean;
  include_media?: boolean;
  include_media_links?: boolean;
  include_media_description?: boolean;
  include_anchors?: boolean;
  anchor_size?: number;
}

export interface QuickScrapeRequest extends ScrapeOptions {
  urls: string[];
  use_cache?: boolean;
  stream?: boolean;
}

export interface SearchKeywordsRequest {
  keywords: string[];
  country_code?: string;
  total_results_per_keyword?: number;
  search_type?: 'web' | 'news' | 'all';
}

export interface SearchAndScrapeRequest extends ScrapeOptions {
  keywords: string[];
  country_code?: string;
  total_results_per_keyword?: number;
  search_type?: 'web' | 'news' | 'all';
}

export interface SearchAndScrapeLimitedRequest extends ScrapeOptions {
  keyword: string;
  country_code?: string;
  max_page_read?: number;
  search_type?: 'web' | 'news' | 'all';
}

export type ScraperStreamEvent =
  | ScraperStatusUpdateEvent
  | ScraperDataEvent
  | ScraperErrorEvent
  | ScraperEndEvent;

export interface ScraperStatusUpdateEvent {
  event: 'status_update';
  data: {
    status: 'connected' | 'processing' | 'warning';
    system_message?: string;
    user_visible_message?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface ScraperDataEvent {
  event: 'data';
  data: Record<string, unknown>;
}

export interface ScraperErrorEvent {
  event: 'error';
  data: {
    type: string;
    message: string;
    user_visible_message?: string;
    code?: string;
    details?: unknown;
  };
}

export interface ScraperEndEvent {
  event: 'end';
  data: true;
}

// ============================================================================
// AUTH HELPERS
// ============================================================================

/**
 * Get authorization headers for authenticated requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (!token) {
    if (__DEV__) {
      console.error('[Scraper Service] No authentication token available. User may not be signed in.');
    }
    throw new Error('No authentication token available');
  }
  if (__DEV__) {
    console.log('[Scraper Service] Auth token available ✓');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// ============================================================================
// STREAMING HELPER
// ============================================================================

/**
 * Parse NDJSON stream using XMLHttpRequest for React Native compatibility
 */
async function* parseScraperStream(
  url: string,
  body: unknown,
  signal?: AbortSignal
): AsyncGenerator<ScraperStreamEvent> {
  let headers: Record<string, string>;

  try {
    headers = await getAuthHeaders();
  } catch (error) {
    yield {
      event: 'error',
      data: {
        type: 'auth_error',
        message: error instanceof Error ? error.message : 'Authentication failed',
        user_visible_message: 'Authentication required. Please sign in.',
      },
    };
    return;
  }

  if (__DEV__) {
    console.log('[Scraper Service] Request to:', url);
    console.log('[Scraper Service] Request payload:', JSON.stringify(body, null, 2));
  }

  const xhr = new XMLHttpRequest();
  let lastPosition = 0;
  let isComplete = false;

  // Create a promise-based queue for events
  const eventQueue: ScraperStreamEvent[] = [];
  let resolveNext: (() => void) | null = null;

  const pushEvent = (event: ScraperStreamEvent) => {
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

  xhr.onprogress = () => {
    const newData = xhr.responseText.substring(lastPosition);
    lastPosition = xhr.responseText.length;

    if (!newData) return;

    if (__DEV__) {
      console.log('[Scraper Service] Received chunk, length:', newData.length);
    }

    const lines = newData.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        try {
          const event = JSON.parse(trimmed) as ScraperStreamEvent;
          if (__DEV__) {
            console.log('[Scraper Service] Parsed event:', event.event);
          }
          pushEvent(event);
        } catch (parseError) {
          console.warn('[Scraper Service] Failed to parse stream line:', trimmed.substring(0, 100));
          if (__DEV__) {
            console.warn('[Scraper Service] Parse error:', parseError);
          }
        }
      }
    }
  };

  xhr.onload = () => {
    if (__DEV__) {
      console.log('[Scraper Service] Stream completed, status:', xhr.status);
    }

    if (xhr.status !== 200) {
      try {
        const error = JSON.parse(xhr.responseText);
        pushEvent({
          event: 'error',
          data: {
            type: 'http_error',
            message: error.detail || `HTTP ${xhr.status}`,
            user_visible_message: 'Failed to connect to the scraper service. Please try again.',
            code: String(xhr.status),
          },
        });
      } catch {
        pushEvent({
          event: 'error',
          data: {
            type: 'http_error',
            message: `HTTP ${xhr.status}`,
            user_visible_message: 'Failed to connect to the scraper service. Please try again.',
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
      console.error('[Scraper Service] XHR network error');
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

  xhr.open('POST', url);

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
  xhr.send(JSON.stringify(body));

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

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Quick scrape - scrape multiple URLs
 */
export async function* quickScrape(
  request: QuickScrapeRequest,
  signal?: AbortSignal
): AsyncGenerator<ScraperStreamEvent> {
  yield* parseScraperStream(
    `${API_BASE_URL}/api/scraper/quick-scrape`,
    request,
    signal
  );
}

/**
 * Search keywords - search without scraping
 */
export async function* searchKeywords(
  request: SearchKeywordsRequest,
  signal?: AbortSignal
): AsyncGenerator<ScraperStreamEvent> {
  yield* parseScraperStream(
    `${API_BASE_URL}/api/scraper/search`,
    request,
    signal
  );
}

/**
 * Search and scrape - search keywords and scrape results
 */
export async function* searchAndScrape(
  request: SearchAndScrapeRequest,
  signal?: AbortSignal
): AsyncGenerator<ScraperStreamEvent> {
  yield* parseScraperStream(
    `${API_BASE_URL}/api/scraper/search-and-scrape`,
    request,
    signal
  );
}

/**
 * Search and scrape limited - search single keyword with limited results
 */
export async function* searchAndScrapeLimited(
  request: SearchAndScrapeLimitedRequest,
  signal?: AbortSignal
): AsyncGenerator<ScraperStreamEvent> {
  yield* parseScraperStream(
    `${API_BASE_URL}/api/scraper/search-and-scrape-limited`,
    request,
    signal
  );
}

/**
 * Mic check - test endpoint
 */
export async function* micCheck(
  signal?: AbortSignal
): AsyncGenerator<ScraperStreamEvent> {
  yield* parseScraperStream(
    `${API_BASE_URL}/api/scraper/mic-check`,
    {},
    signal
  );
}
