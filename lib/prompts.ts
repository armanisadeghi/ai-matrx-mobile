/**
 * AI Matrx Mobile - Prompts Service
 * Handles fetching and managing user prompts/agents from Supabase
 */

import { AgentOption, AgentVariable } from '@/types/agent';
import { supabase } from './supabase';

/**
 * Database prompt row type
 */
interface PromptRow {
  id: string;
  name: string | null;
  description: string | null;
  updated_at: string | null;
  variable_defaults: any | null;
}

/**
 * Transform variable_defaults from database to AgentVariable format
 */
function transformVariableDefaults(variableDefaults: any): AgentVariable[] {
  if (!variableDefaults || !Array.isArray(variableDefaults)) {
    return [];
  }

  return variableDefaults.map((v: any) => ({
    name: v.name || '',
    type: v.type || 'string',
    required: v.required || false,
    default: v.defaultValue,
  }));
}

/**
 * Transform database prompt to AgentOption
 */
function transformPromptToAgent(prompt: PromptRow): AgentOption {
  return {
    id: prompt.id,
    name: prompt.name || 'Unnamed Agent',
    description: prompt.description || 'No description',
    promptId: prompt.id,
    variables: transformVariableDefaults(prompt.variable_defaults),
    icon: 'person', // Default icon for custom agents
  };
}

/**
 * Fetch user's custom prompts from Supabase
 */
export async function fetchUserPrompts(): Promise<AgentOption[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user?.id) {
      console.log('No authenticated user, returning empty prompts');
      return [];
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('id, name, description, updated_at, variable_defaults')
      .eq('user_id', session.session.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(transformPromptToAgent);
  } catch (error) {
    console.error('Error in fetchUserPrompts:', error);
    return [];
  }
}

/**
 * Get a specific prompt by ID
 */
export async function getPromptById(id: string): Promise<AgentOption | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.user?.id) {
      return null;
    }

    const { data, error } = await supabase
      .from('prompts')
      .select('id, name, description, updated_at, variable_defaults')
      .eq('id', id)
      .eq('user_id', session.session.user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching prompt:', error);
      return null;
    }

    return transformPromptToAgent(data);
  } catch (error) {
    console.error('Error in getPromptById:', error);
    return null;
  }
}
