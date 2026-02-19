/**
 * AI Matrx Mobile - useAgentChat Hook
 * Manages agent chat state and streaming
 */

import {
  buildContentArray,
  executeAgent,
  generateConversationId,
  warmAgent,
} from '@/lib/api/agent';
import {
  AgentConfigOverrides,
  AgentOption,
  ChatMessage,
  ChatState
} from '@/types/agent';
import { useCallback, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface UseAgentChatOptions {
  initialAgent?: AgentOption;
}

interface SendMessageOptions {
  variables?: Record<string, unknown>;
  configOverrides?: AgentConfigOverrides;
  resources?: { type: 'image' | 'audio' | 'file'; url: string }[];
}

export function useAgentChat(options: UseAgentChatOptions = {}) {
  const [state, setState] = useState<ChatState>({
    conversationId: generateConversationId(),
    messages: [],
    currentAgent: options.initialAgent || null,
    isStreaming: false,
    isExecuting: false,
    statusMessage: null,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Set the current agent
   */
  const setAgent = useCallback((agent: AgentOption) => {
    setState((prev) => ({
      ...prev,
      currentAgent: agent,
      error: null,
    }));

    // Pre-warm the agent for faster first response
    warmAgent({ prompt_id: agent.promptId }).catch(console.warn);
  }, []);

  /**
   * Start a new conversation
   */
  const newConversation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      conversationId: generateConversationId(),
      messages: [],
      isStreaming: false,
      isExecuting: false,
      statusMessage: null,
      error: null,
    }));
  }, []);

  /**
   * Cancel the current streaming request
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isStreaming: false,
      isExecuting: false,
      statusMessage: null,
    }));
  }, []);

  /**
   * Send a message and stream the response
   */
  const sendMessage = useCallback(
    async (text: string, options: SendMessageOptions = {}) => {
      if (!state.currentAgent) {
        setState((prev) => ({
          ...prev,
          error: 'No agent selected',
        }));
        return;
      }

      if (state.isExecuting) {
        return;
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: text,
        timestamp: new Date(),
        status: 'complete',
        resources: options.resources?.map((r) => ({
          type: `input_${r.type}` as const,
          [`${r.type}_url`]: r.url,
        })),
      };

      // Create placeholder assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'streaming',
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, assistantMessage],
        isStreaming: true,
        isExecuting: true,
        statusMessage: 'Connecting...',
        error: null,
      }));

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const userInput = buildContentArray(text, options.resources);

        const stream = executeAgent(
          {
            prompt_id: state.currentAgent.promptId,
            conversation_id: state.conversationId,
            user_input: userInput,
            variables: options.variables,
            config_overrides: options.configOverrides,
            stream: true,
          },
          abortControllerRef.current.signal
        );

        let accumulatedContent = '';

        for await (const event of stream) {
          if (__DEV__) {
            console.log('[useAgentChat] Received event:', event.event, event.data);
          }

          try {
            switch (event.event) {
              case 'chunk':
                accumulatedContent += event.data;
                setState((prev) => ({
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ),
                }));
                break;

              case 'status_update':
                setState((prev) => ({
                  ...prev,
                  statusMessage: event.data.user_visible_message || event.data.status || null,
                }));
                break;

              case 'tool_update':
                if (event.data.user_visible_message) {
                  setState((prev) => ({
                    ...prev,
                    statusMessage: event.data.user_visible_message || null,
                  }));
                }
                break;

              case 'data':
                // Final data event with complete status
                setState((prev) => ({
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content: event.data.output || accumulatedContent,
                          status: 'complete' as const,
                          usage: event.data.usage,
                        }
                      : msg
                  ),
                }));
                break;

              case 'error':
                console.error('[useAgentChat] Received error event:', event.data);
                setState((prev) => ({
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content: event.data.user_visible_message || event.data.message,
                          status: 'error' as const,
                        }
                      : msg
                  ),
                  error: event.data.user_visible_message || event.data.message,
                }));
                break;

              case 'end':
                // Stream complete - mark message as complete if not already
                setState((prev) => ({
                  ...prev,
                  messages: prev.messages.map((msg) =>
                    msg.id === assistantMessage.id && msg.status === 'streaming'
                      ? { ...msg, status: 'complete' as const }
                      : msg
                  ),
                }));
                break;
            }
          } catch (stateError) {
            console.error('[useAgentChat] Error updating state for event:', event.event, stateError);
            throw stateError; // Re-throw to be caught by outer catch
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[useAgentChat] Error during message send:', errorMessage);
        console.error('[useAgentChat] Error details:', error);
        console.error('[useAgentChat] Error stack:', error instanceof Error ? error.stack : 'No stack');
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: 'Failed to receive response. Please try again.',
                  status: 'error' as const,
                }
              : msg
          ),
          error: errorMessage,
        }));
      } finally {
        abortControllerRef.current = null;
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          isExecuting: false,
          statusMessage: null,
        }));
      }
    },
    [state.currentAgent, state.conversationId, state.isExecuting]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    // State
    messages: state.messages,
    currentAgent: state.currentAgent,
    conversationId: state.conversationId,
    isStreaming: state.isStreaming,
    isExecuting: state.isExecuting,
    statusMessage: state.statusMessage,
    error: state.error,

    // Actions
    setAgent,
    sendMessage,
    cancelStream,
    newConversation,
    clearError,
  };
}

