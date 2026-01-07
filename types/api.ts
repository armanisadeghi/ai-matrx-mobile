/**
 * AI Matrx Mobile - API Types
 */

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  signal?: AbortSignal;
}

// FastAPI specific types
export interface FastAPIValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface FastAPIErrorResponse {
  detail: string | FastAPIValidationError[];
}
