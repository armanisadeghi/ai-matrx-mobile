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

import type { DefaultRowState } from '@ai-matrx/agents/catalog';

import { getAgentCatalog } from './agent-catalog';
import { supabase } from './supabase';

/** How long to wait for the server's mandate resolution before saying so. */
const DEFAULT_ROW_TIMEOUT_MS = 20_000;

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
 * 🚨 NO HARDCODED AGENTS, AND NO SECOND RESOLUTION PATH. The package already
 * owns the one mandate-resolution door (`GET /mandates/{key}/resolution`,
 * called through the injected transport, with the org context and API-version
 * bridging that transport carries) and caches, drift-checks and screams about
 * the answer. This asks the CATALOG for its resolved default row instead of
 * re-fetching and re-parsing the same endpoint by hand — one key, one path.
 *
 * Throws with the reason when the mandate cannot produce a runnable agent; the
 * caller shows that reason rather than a placeholder.
 */
export async function resolveDefaultAgentOption(
  mandateKey: string,
): Promise<AgentOption> {
  const catalog = getAgentCatalog();
  catalog.ensureDefaultRow(mandateKey);

  const row = await new Promise<DefaultRowState>((resolve, reject) => {
    const settle = () => {
      const current = catalog.getDefaultRow(mandateKey);
      if (!current || current.loading) return false;
      unsubscribe();
      clearTimeout(timer);
      resolve(current);
      return true;
    };
    const unsubscribe = catalog.subscribe(() => {
      settle();
    });
    const timer = setTimeout(() => {
      unsubscribe();
      reject(
        new Error(
          `The default agent for "${mandateKey}" did not resolve in time. ` +
            'Check your connection and try again.',
        ),
      );
    }, DEFAULT_ROW_TIMEOUT_MS);
    // The row may already be resolved from a previous screen.
    settle();
  });

  if (row.error) throw new Error(row.error);
  const holderId = row.resolved?.holderId;
  if (!holderId) {
    throw new Error(
      `The default agent for "${mandateKey}" could not be named. ` +
        'Ask an administrator to bind this mandate to an agent.',
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
