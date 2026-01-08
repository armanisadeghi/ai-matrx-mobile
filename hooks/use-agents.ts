/**
 * AI Matrx Mobile - useAgents Hook
 * Manages default and custom user agents
 */

import { DEFAULT_AGENTS } from '@/constants/agents';
import { fetchUserPrompts } from '@/lib/prompts';
import { AgentOption } from '@/types/agent';
import { useCallback, useEffect, useState } from 'react';

interface UseAgentsReturn {
  agents: AgentOption[];
  defaultAgents: AgentOption[];
  customAgents: AgentOption[];
  isLoading: boolean;
  error: string | null;
  refreshAgents: () => Promise<void>;
}

/**
 * Hook to fetch and manage both default and custom agents
 */
export function useAgents(): UseAgentsReturn {
  const [customAgents, setCustomAgents] = useState<AgentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userPrompts = await fetchUserPrompts();
      setCustomAgents(userPrompts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';
      setError(errorMessage);
      console.error('Error fetching agents:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch agents on mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Combine default and custom agents
  const allAgents = [...DEFAULT_AGENTS, ...customAgents];

  return {
    agents: allAgents,
    defaultAgents: DEFAULT_AGENTS,
    customAgents,
    isLoading,
    error,
    refreshAgents: fetchAgents,
  };
}
