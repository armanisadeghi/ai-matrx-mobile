/**
 * AI Matrx Mobile - the ONE agent catalog
 *
 * 🚨 THERE IS ONE AGENT PICKER on this platform and it lives in
 * `@ai-matrx/agents/catalog` (ruling D1, 2026-09-08). This file is the app's
 * entire contribution to it: a Supabase client, an identity, a transport, a
 * storage adapter and two sinks. Everything else — which rows exist, what
 * order they are in, the tabs, the counts, the filters, the search, the
 * favourite write, the mandate-resolved default row and its drift banner —
 * belongs to the package and is identical in every Matrx client.
 *
 * Nothing here catches, retries, validates or reinterprets a package result
 * (C22: the hard parts live in the package). If something needs handling, it
 * gets handled IN the package and released.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createAgentCatalog,
  type AgentCatalog,
  type AgentCatalogClient,
} from '@ai-matrx/agents/catalog';
import { createMatrxTransport } from '@ai-matrx/agents/matrx';

import { requireUserId, startIdentityMirror } from './identity';
import { getAccessToken, supabase } from './supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

let cached: AgentCatalog | null = null;

/**
 * The app's single catalog. Built lazily so nothing touches Supabase at module
 * load, and cached so the whole app shares one registry and one read.
 */
export function getAgentCatalog(): AgentCatalog {
  if (cached) return cached;
  startIdentityMirror();
  cached = createAgentCatalog({
    client: supabase as unknown as AgentCatalogClient,
    identity: { requireUserId },
    // React Native has no localStorage; the package's async storage seam takes
    // an AsyncStorage-shaped store verbatim (@ai-matrx/agents 0.9.0).
    storage: AsyncStorage,
    // Clients never walk the mandate ladder — the default row is resolved by
    // the server through this transport.
    transport: createMatrxTransport({
      baseUrl: API_BASE_URL,
      credentials: {
        get: async () => {
          const accessToken = await getAccessToken();
          return accessToken ? { kind: 'user', accessToken } : null;
        },
      },
      source: 'matrx-mobile.agent-catalog',
    }),
    errorSink: (event) => {
      // eslint-disable-next-line no-console
      console.error(`[agent-catalog] ${event.code}: ${event.message}`, event.context ?? {});
    },
    notifier: (event) => {
      // eslint-disable-next-line no-console
      console.warn(`[agent-catalog] ${event.title}: ${event.message}`);
    },
  });
  return cached;
}

/**
 * The mandate whose Holder is this app's default chat agent. The package
 * resolves the REAL agent behind it through the server and prints its real
 * name — never a hardcoded label. (This app previously shipped four hardcoded
 * agents, three of which named the wrong agent entirely.)
 */
export const MOBILE_DEFAULT_CHAT_MANDATE = 'chat.default_new_chat';
