/**
 * Local Engine Client
 *
 * Discovers the user's registered Matrx Local PC instances via the cloud API,
 * connects to the local engine through its Cloudflare tunnel URL over WebSocket,
 * and provides a simple interface for invoking local tools.
 *
 * Discovery flow:
 *   1. Call GET /api/local-instances on the Next.js web app (or Supabase directly)
 *   2. User picks a PC from the list
 *   3. Connect to wss://{tunnel_url}/ws?token={jwt}
 *   4. Send/receive JSON tool messages over the WebSocket
 */

import { supabase } from './supabase';

// Base URL of the matrx-admin Next.js web app — instances API lives there
const WEB_APP_BASE = process.env.EXPO_PUBLIC_WEB_APP_URL ?? 'https://ai-matrx-admin.vercel.app';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface LocalInstance {
  id: string;
  instance_id: string;
  instance_name: string;
  platform: string | null;
  os_version: string | null;
  architecture: string | null;
  hostname: string | null;
  cpu_model: string | null;
  cpu_cores: number | null;
  ram_total_gb: number | null;
  is_active: boolean;
  last_seen: string;
  tunnel_url: string | null;
  tunnel_active: boolean;
  tunnel_updated_at: string | null;
  is_online: boolean;
}

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Fetch instances
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all registered instances for the currently signed-in user.
 * Calls the Next.js API route which queries Supabase app_instances.
 */
export async function fetchLocalInstances(): Promise<LocalInstance[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const res = await fetch(`${WEB_APP_BASE}/api/local-instances`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (!res.ok) throw new Error(`Instances API returned ${res.status}`);
  const body = await res.json() as { instances: LocalInstance[] };
  return body.instances ?? [];
}

// ──────────────────────────────────────────────────────────────────────────────
// LocalEngineConnection
// ──────────────────────────────────────────────────────────────────────────────

export class LocalEngineConnection {
  private ws: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private pendingRequests = new Map<string, PendingRequest>();
  private onStateChange?: (state: ConnectionState) => void;
  private onMessage?: (msg: unknown) => void;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private tunnelUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /** The tunnel URL this connection was created with. Used to detect URL rotation. */
  readonly _tunnelUrl: string;

  constructor(tunnelUrl: string) {
    // Ensure no trailing slash
    this.tunnelUrl = tunnelUrl.replace(/\/$/, '');
    this._tunnelUrl = this.tunnelUrl;
  }

  get connectionState(): ConnectionState {
    return this.state;
  }

  setStateChangeHandler(handler: (state: ConnectionState) => void): void {
    this.onStateChange = handler;
  }

  setMessageHandler(handler: (msg: unknown) => void): void {
    this.onMessage = handler;
  }

  async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') return;
    this._setState('connecting');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      this._setState('error');
      throw new Error('Not authenticated — cannot connect to local engine');
    }

    const wsUrl = `${this.tunnelUrl.replace(/^https?/, (p) => (p === 'https' ? 'wss' : 'ws'))}/ws?token=${session.access_token}`;

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);
      } catch (err) {
        this._setState('error');
        reject(err);
        return;
      }

      const connectTimeout = setTimeout(() => {
        this.ws?.close();
        this._setState('error');
        reject(new Error('WebSocket connection timed out after 15s'));
      }, 15_000);

      this.ws.onopen = () => {
        clearTimeout(connectTimeout);
        this.reconnectAttempts = 0;
        this._setState('connected');
        resolve();
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectTimeout);
        this._rejectAll(new Error(`WebSocket closed: ${event.code} ${event.reason}`));
        this._setState('disconnected');
        this._scheduleReconnect();
      };

      this.ws.onerror = (event) => {
        clearTimeout(connectTimeout);
        this._setState('error');
        reject(new Error('WebSocket error — see console for details'));
        console.error('[LocalEngine] WebSocket error:', event);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as { id?: string };
          // Route to pending request if there's a matching id
          if (msg.id && this.pendingRequests.has(msg.id)) {
            const pending = this.pendingRequests.get(msg.id)!;
            clearTimeout(pending.timer);
            this.pendingRequests.delete(msg.id);
            pending.resolve(msg);
          }
          // Broadcast to global handler for pub/sub listeners
          this.onMessage?.(msg);
        } catch {
          // Non-JSON message, ignore
        }
      };
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this._rejectAll(new Error('Connection closed by client'));
    this.ws?.close();
    this.ws = null;
    this._setState('disconnected');
  }

  /**
   * Invoke a local tool by name. Returns the full response object.
   * Throws if not connected or if the request times out (2 minutes).
   */
  async invokeTool(
    toolName: string,
    input: Record<string, unknown>,
    timeoutMs = 120_000,
  ): Promise<unknown> {
    if (this.state !== 'connected' || !this.ws) {
      throw new Error('Not connected to local engine');
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const message = JSON.stringify({ id, tool: toolName, input });

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Tool "${toolName}" timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });
      this.ws!.send(message);
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _setState(state: ConnectionState): void {
    this.state = state;
    this.onStateChange?.(state);
  }

  private _rejectAll(reason: Error): void {
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(reason);
      this.pendingRequests.delete(id);
    }
  }

  private _scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // next attempt scheduled by onclose
      });
    }, delay);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Module-level singleton connection pool
// One connection per instance_id, reused across screens.
// ──────────────────────────────────────────────────────────────────────────────

const connections = new Map<string, LocalEngineConnection>();

/**
 * Get or create a connection to a local instance.
 *
 * If a connection already exists but the tunnel URL has changed (quick tunnel
 * URLs rotate every time the engine restarts), the old connection is closed and
 * a new one is created with the fresh URL.
 */
export function getConnection(instance: LocalInstance): LocalEngineConnection {
  if (!instance.tunnel_url) throw new Error('Instance has no tunnel URL');
  const key = instance.instance_id;
  const existing = connections.get(key);

  if (existing) {
    // If the URL changed (quick tunnel rotated), drop the stale connection.
    const existingUrl = (existing as LocalEngineConnection & { _tunnelUrl?: string })._tunnelUrl;
    if (existingUrl && existingUrl !== instance.tunnel_url) {
      existing.disconnect();
      connections.delete(key);
    } else {
      return existing;
    }
  }

  const conn = new LocalEngineConnection(instance.tunnel_url);
  connections.set(key, conn);
  return conn;
}

export function closeConnection(instanceId: string): void {
  const conn = connections.get(instanceId);
  if (conn) {
    conn.disconnect();
    connections.delete(instanceId);
  }
}

/**
 * Re-fetch instance data from the cloud, update the connection pool if the
 * tunnel URL has changed, and return fresh instances.
 *
 * Call this when reconnecting after a period offline, or when the user pulls
 * to refresh the devices list.
 */
export async function refreshInstances(): Promise<LocalInstance[]> {
  const instances = await fetchLocalInstances();
  // Close any cached connections whose instance no longer has a tunnel URL
  for (const [id, conn] of connections) {
    const current = instances.find((i) => i.instance_id === id);
    if (!current?.tunnel_url) {
      conn.disconnect();
      connections.delete(id);
    }
  }
  return instances;
}
