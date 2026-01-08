/**
 * AI Matrx Mobile - Agent API Types
 * Based on the backend API at /api/agent/*
 */

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

/**
 * Variable definition for agent prompts
 */
export interface AgentVariable {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  default?: unknown;
}

/**
 * Agent option for selection UI
 */
export interface AgentOption {
  id: string;
  name: string;
  description?: string;
  promptId: string;
  variables: AgentVariable[];
  icon?: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Request to pre-cache a prompt (optional, for performance)
 * No authentication required.
 */
export interface AgentWarmRequest {
  prompt_id: string;
  is_builtin?: boolean;
}

/**
 * Content part for multimodal user input
 */
export interface UserInputContentPart {
  type: 'input_text' | 'input_image' | 'input_audio' | 'input_file';
  text?: string;
  image_url?: string;
  audio_url?: string;
  file_url?: string;
}

/**
 * Request to execute an agent
 * Requires Authorization header with JWT token.
 */
export interface AgentExecuteRequest {
  /** UUID of the prompt to execute */
  prompt_id: string;
  /** Client-generated UUID for the conversation */
  conversation_id: string;
  /** User message - string or multimodal content array */
  user_input?: string | UserInputContentPart[];
  /** Template variables to inject into the prompt */
  variables?: Record<string, unknown>;
  /** Override agent config settings */
  config_overrides?: AgentConfigOverrides;
  /** Set to true if using a system builtin */
  is_builtin?: boolean;
  /** Enable streaming response (default: true) */
  stream?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Agent configuration overrides
 */
export interface AgentConfigOverrides {
  ai_model_id?: string;
  web_search_enabled?: boolean;
  thinking_enabled?: boolean;
  temperature?: number;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Response from /agent/warm
 */
export interface AgentWarmResponse {
  status: 'cached' | 'error';
  prompt_id: string;
  message?: string;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

// ============================================================================
// STREAMING EVENT TYPES (NDJSON)
// ============================================================================

export type AgentStreamEvent =
  | AgentStatusUpdateEvent
  | AgentChunkEvent
  | AgentToolUpdateEvent
  | AgentDataEvent
  | AgentErrorEvent
  | AgentEndEvent;

export interface AgentStatusUpdateEvent {
  event: 'status_update';
  data: {
    status: 'connected' | 'processing' | 'warning';
    system_message?: string;
    user_visible_message?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface AgentChunkEvent {
  event: 'chunk';
  data: string;
}

export interface AgentToolUpdateEvent {
  event: 'tool_update';
  data: {
    id?: string;
    type?: 'mcp_input' | 'mcp_output' | 'mcp_error' | 'step_data' | 'user_visible_message';
    tool_name?: string;
    mcp_input?: Record<string, unknown>;
    mcp_output?: Record<string, unknown>;
    mcp_error?: string;
    step_data?: Record<string, unknown>;
    user_visible_message?: string;
  };
}

export interface AgentDataEvent {
  event: 'data';
  data: {
    status: 'complete';
    output?: string;
    usage?: TokenUsage;
    metadata?: Record<string, unknown>;
  };
}

export interface AgentErrorEvent {
  event: 'error';
  data: {
    type: string;
    message: string;
    user_visible_message?: string;
    code?: string;
    details?: unknown;
  };
}

export interface AgentEndEvent {
  event: 'end';
  data: true;
}

// ============================================================================
// CHAT STATE TYPES
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  resources?: UserInputContentPart[];
  usage?: TokenUsage;
}

export interface ChatState {
  conversationId: string;
  messages: ChatMessage[];
  currentAgent: AgentOption | null;
  isStreaming: boolean;
  isExecuting: boolean;
  statusMessage: string | null;
  error: string | null;
}

