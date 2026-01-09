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
    variableDefaults: [],
    icon: 'chatbubble-ellipses',
  },
  {
    id: 'deep-research',
    name: 'Deep Research',
    description: 'In-depth research and analysis on any topic',
    promptId: 'f76a6b8f-b720-4730-87de-606e0bfa0e0c',
    variableDefaults: [
      {
        name: 'topic',
        defaultValue: '',
        required: true,
        helpText: 'Enter any news topic or recent news clip or data',
        customComponent: { type: 'textarea' },
      },
    ],
    icon: 'search',
  },
  {
    id: 'code-helper',
    name: 'Code Helper',
    description: 'Specialized in programming and software development',
    promptId: '35461e07-bbd1-46cc-81a7-910850815703',
    variableDefaults: [],
    icon: 'code-slash',
  },
  {
    id: 'get-ideas',
    name: 'Get Ideas',
    description: 'Generate creative ideas and brainstorm on any topic',
    promptId: 'fc8fd18c-9324-48ca-85d4-faf1b1954945',
    variableDefaults: [
      {
        name: 'topic',
        defaultValue: 'Building a powerful ai app for attorneys',
        required: true,
        helpText: 'What topic or concept do you want ideas for?',
        customComponent: { type: 'textarea' },
      },
      {
        name: 'creativity_level',
        defaultValue: 'Balanced - Mix of practical and innovative',
        customComponent: {
          type: 'radio',
          options: [
            'Grounded - Practical and immediately actionable',
            'Balanced - Mix of practical and innovative',
            'Experimental - Push boundaries and explore wild ideas',
            'Visionary - Think big, ignore current constraints',
          ],
          allowOther: false,
        },
      },
      {
        name: 'idea_count',
        defaultValue: '10-15 (Standard set)',
        customComponent: {
          type: 'select',
          options: [
            '3-5 (Quick burst)',
            '10-15 (Standard set)',
            '20-30 (Deep exploration)',
          ],
          allowOther: true,
        },
      },
    ],
    icon: 'bulb',
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

