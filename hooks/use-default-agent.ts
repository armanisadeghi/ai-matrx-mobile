/**
 * AI Matrx Mobile - useDefaultAgent
 *
 * Resolves this app's default chat agent through its MANDATE, on the server.
 *
 * 🚨 NO HARDCODED AGENTS. This app used to open every chat on a constant named
 * "General Chat" whose id actually resolves to an agent called "Agent Ledger" —
 * a label lying on screen with nothing that could notice. The mandate is asked
 * instead, and when it cannot answer this hook returns the REASON so the screen
 * can say it, rather than substituting a stand-in.
 */

import { useEffect, useState } from 'react';

import { MOBILE_DEFAULT_CHAT_MANDATE } from '@/lib/agent-catalog';
import { resolveDefaultAgentOption } from '@/lib/agents';
import type { AgentOption } from '@/types/agent';

interface UseDefaultAgentResult {
  agent: AgentOption | null;
  error: string | null;
  isLoading: boolean;
}

export function useDefaultAgent(
  mandateKey: string = MOBILE_DEFAULT_CHAT_MANDATE,
): UseDefaultAgentResult {
  const [agent, setAgent] = useState<AgentOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    resolveDefaultAgentOption(mandateKey)
      .then((resolved) => {
        if (cancelled) return;
        setAgent(resolved);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setAgent(null);
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mandateKey]);

  return { agent, error, isLoading };
}
