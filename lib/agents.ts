/**
 * AI Matrx Mobile - Agents
 *
 * Reads for the ONE thing the picker does not hand back: an agent's variable
 * definitions, which this app's chat pipeline needs to render its variable
 * inputs. The picker's contract is `onSelect(agentId)` and nothing else, so
 * this module turns that id into the `AgentOption` the chat screens use.
 *
 * 🚨 THIS REPLACES `lib/prompts.ts`, WHICH COULD NEVER HAVE WORKED. It queried
 * a table named `prompts` that does not exist in the platform database, caught
 * the PostgREST error and returned `[]` — so the agent sheet silently never
 * showed anything but four hardcoded constants, three of which named the wrong
 * agent (their ids resolve in `agent.definition` to "Agent Ledger",
 * "Knowledge Search Test" and "Balanced News Analysis"). The canonical table is
 * `agent.definition` and the canonical variables column is
 * `variable_definitions`.
 */

import { AgentOption, PromptVariable } from '@/types/agent';

import { getAccessToken, supabase } from './supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

interface AgentDefinitionRow {
  id: string;
  name: string | null;
  description: string | null;
  variable_definitions: unknown;
}

function toAgentOption(row: AgentDefinitionRow): AgentOption {
  return {
    id: row.id,
    name: row.name || 'Untitled agent',
    description: row.description || undefined,
    // The platform's agent id IS the id the agent-execution route takes.
    promptId: row.id,
    variableDefaults: Array.isArray(row.variable_definitions)
      ? (row.variable_definitions as PromptVariable[])
      : [],
  };
}

/**
 * Read one agent by id. Returns `null` when this user cannot see it — the
 * caller must SAY so; never substitute a different agent.
 */
export async function fetchAgentOption(
  agentId: string,
): Promise<AgentOption | null> {
  const { data, error } = await supabase
    .schema('agent')
    .from('definition')
    .select('id, name, description, variable_definitions')
    .eq('id', agentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not read agent ${agentId}: ${error.message}`);
  }
  if (!data) return null;
  return toAgentOption(data as AgentDefinitionRow);
}

/**
 * Resolve this app's default chat agent through its MANDATE.
 *
 * 🚨 NO HARDCODED AGENTS. A client never walks the mandate ladder itself and
 * never ships a pinned agent id — it asks the server which agent holds the
 * mandate, then reads that agent's real name and variables. Throws with the
 * reason when the mandate cannot produce a runnable agent; the caller shows
 * that reason rather than a placeholder.
 */
export async function resolveDefaultAgentOption(
  mandateKey: string,
): Promise<AgentOption> {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/mandates/${encodeURIComponent(mandateKey)}/resolution`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    },
  );
  if (!response.ok) {
    throw new Error(
      `The default agent for "${mandateKey}" could not be resolved (HTTP ${response.status}). ` +
        'Sign in again, or ask an administrator to bind this mandate to an agent.',
    );
  }
  const body = (await response.json()) as {
    agent_id?: string | null;
    definition_agent_id?: string | null;
    holder_type?: string | null;
  };
  const holderId = body.definition_agent_id ?? body.agent_id ?? null;
  if (body.holder_type && body.holder_type !== 'agent') {
    throw new Error(
      `The mandate "${mandateKey}" names a ${body.holder_type}, and a chat needs an agent.`,
    );
  }
  if (!holderId) {
    throw new Error(
      `The mandate "${mandateKey}" resolved without naming an agent. Bind it to an agent.`,
    );
  }
  const agent = await fetchAgentOption(holderId);
  if (!agent) {
    throw new Error(
      `The default agent for "${mandateKey}" exists, but this account cannot read it.`,
    );
  }
  return agent;
}
