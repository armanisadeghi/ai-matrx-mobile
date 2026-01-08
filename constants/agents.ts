/**
 * AI Matrx Mobile - Agent Configuration
 * Default agents available in the app
 */

import { AgentOption } from '@/types/agent';

/**
 * Default agents available to all users
 * promptId maps to the backend prompt UUID
 */
export const DEFAULT_AGENTS: AgentOption[] = [
  {
    id: 'general-chat',
    name: 'General Chat',
    description: 'A helpful AI assistant for everyday tasks and questions',
    promptId: '35d8f884-5178-4c3e-858d-c5b7adfa186a',
    variables: [],
    icon: 'chatbubble-ellipses',
  },
  {
    id: 'deep-research',
    name: 'Deep Research',
    description: 'In-depth research and analysis on any topic',
    promptId: 'f76a6b8f-b720-4730-87de-606e0bfa0e0c',
    variables: [
      { name: 'topic', type: 'string', required: false },
    ],
    icon: 'search',
  },
  {
    id: 'code-helper',
    name: 'Code Helper',
    description: 'Specialized in programming and software development',
    promptId: '35461e07-bbd1-46cc-81a7-910850815703',
    variables: [],
    icon: 'code-slash',
  },
];

/**
 * Get agent by ID
 */
export function getAgentById(id: string): AgentOption | undefined {
  return DEFAULT_AGENTS.find((agent) => agent.id === id);
}

/**
 * Get agent by prompt ID
 */
export function getAgentByPromptId(promptId: string): AgentOption | undefined {
  return DEFAULT_AGENTS.find((agent) => agent.promptId === promptId);
}

