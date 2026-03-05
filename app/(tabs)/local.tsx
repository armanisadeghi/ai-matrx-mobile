/**
 * Local PC Tab
 *
 * Lists the user's registered Matrx Local instances and lets them connect
 * to any PC that has an active Cloudflare tunnel. Once connected, tool
 * invocation works identically to the local desktop experience.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchLocalInstances,
  getConnection,
  closeConnection,
  type LocalInstance,
  type ConnectionState,
} from '@/lib/local-engine';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function formatLastSeen(lastSeen: string): string {
  const diff = Date.now() - new Date(lastSeen).getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function stateColor(state: ConnectionState): string {
  switch (state) {
    case 'connected': return '#22c55e';
    case 'connecting': return '#f59e0b';
    case 'error': return '#ef4444';
    default: return '#6b7280';
  }
}

function stateLabel(state: ConnectionState): string {
  switch (state) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting…';
    case 'error': return 'Error';
    default: return 'Disconnected';
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Device row component
// ──────────────────────────────────────────────────────────────────────────────

interface DeviceRowProps {
  instance: LocalInstance;
  onConnect: (inst: LocalInstance) => void;
  onDisconnect: (instanceId: string) => void;
  connectionState: ConnectionState;
}

function DeviceRow({ instance, onConnect, onDisconnect, connectionState }: DeviceRowProps) {
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const canConnect = instance.tunnel_active && !!instance.tunnel_url;

  return (
    <View style={styles.deviceCard}>
      {/* Header row */}
      <View style={styles.deviceHeader}>
        <View style={styles.deviceTitleRow}>
          <Text style={styles.deviceName}>
            {instance.instance_name || instance.hostname || 'Unknown Device'}
          </Text>
          <View style={[styles.onlineBadge, { backgroundColor: instance.is_online ? '#22c55e20' : '#6b728020' }]}>
            <View style={[styles.onlineDot, { backgroundColor: instance.is_online ? '#22c55e' : '#6b7280' }]} />
            <Text style={[styles.onlineBadgeText, { color: instance.is_online ? '#22c55e' : '#6b7280' }]}>
              {instance.is_online ? 'Online' : 'Offline'}
            </Text>
          </View>
          {instance.tunnel_active && (
            <View style={styles.tunnelBadge}>
              <Ionicons name="radio-outline" size={10} color="#3b82f6" />
              <Text style={styles.tunnelBadgeText}>Tunnel</Text>
            </View>
          )}
        </View>

        <Text style={styles.deviceSubtitle}>
          {instance.platform} · {instance.architecture} · {formatLastSeen(instance.last_seen)}
        </Text>
      </View>

      {/* Specs */}
      {(instance.cpu_model || instance.ram_total_gb) && (
        <View style={styles.specsRow}>
          {instance.cpu_model && (
            <View style={styles.specItem}>
              <Ionicons name="hardware-chip-outline" size={12} color="#9ca3af" />
              <Text style={styles.specText} numberOfLines={1}>{instance.cpu_model}</Text>
            </View>
          )}
          {instance.ram_total_gb && (
            <View style={styles.specItem}>
              <Ionicons name="server-outline" size={12} color="#9ca3af" />
              <Text style={styles.specText}>{instance.ram_total_gb} GB</Text>
            </View>
          )}
        </View>
      )}

      {/* Tunnel URL */}
      {instance.tunnel_url && (
        <Text style={styles.tunnelUrl} numberOfLines={1}>{instance.tunnel_url}</Text>
      )}

      {/* Connection status + button */}
      <View style={styles.deviceFooter}>
        {connectionState !== 'disconnected' && (
          <View style={styles.connStatusRow}>
            {isConnecting && <ActivityIndicator size="small" color="#f59e0b" style={{ marginRight: 4 }} />}
            <View style={[styles.connDot, { backgroundColor: stateColor(connectionState) }]} />
            <Text style={[styles.connLabel, { color: stateColor(connectionState) }]}>
              {stateLabel(connectionState)}
            </Text>
          </View>
        )}

        {isConnected ? (
          <TouchableOpacity
            style={[styles.connectBtn, styles.disconnectBtn]}
            onPress={() => onDisconnect(instance.instance_id)}
          >
            <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
            <Text style={[styles.connectBtnText, { color: '#ef4444' }]}>Disconnect</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.connectBtn, !canConnect && styles.connectBtnDisabled]}
            disabled={!canConnect || isConnecting}
            onPress={() => onConnect(instance)}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="link-outline" size={16} color={canConnect ? '#fff' : '#6b7280'} />
            )}
            <Text style={[styles.connectBtnText, !canConnect && { color: '#6b7280' }]}>
              {isConnecting ? 'Connecting…' : canConnect ? 'Connect' : 'No Tunnel'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main screen
// ──────────────────────────────────────────────────────────────────────────────

export default function LocalTab() {
  const insets = useSafeAreaInsets();
  const [instances, setInstances] = useState<LocalInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connStates, setConnStates] = useState<Record<string, ConnectionState>>({});

  const loadInstances = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchLocalInstances();
      setInstances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInstances();
    const interval = setInterval(() => loadInstances(true), 30_000);
    return () => clearInterval(interval);
  }, [loadInstances]);

  const handleConnect = useCallback(async (inst: LocalInstance) => {
    setConnStates((prev) => ({ ...prev, [inst.instance_id]: 'connecting' }));
    try {
      const conn = getConnection(inst);
      conn.setStateChangeHandler((state) => {
        setConnStates((prev) => ({ ...prev, [inst.instance_id]: state }));
      });
      await conn.connect();
    } catch (err) {
      console.error('[LocalTab] Connect failed:', err);
      setConnStates((prev) => ({ ...prev, [inst.instance_id]: 'error' }));
    }
  }, []);

  const handleDisconnect = useCallback((instanceId: string) => {
    closeConnection(instanceId);
    setConnStates((prev) => ({ ...prev, [instanceId]: 'disconnected' }));
  }, []);

  const onlineCount = instances.filter((i) => i.is_online).length;
  const tunnelCount = instances.filter((i) => i.tunnel_active).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Local Devices</Text>
        <Text style={styles.headerSubtitle}>
          {loading ? 'Loading…' : `${onlineCount} online · ${tunnelCount} with tunnel`}
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Content */}
      {loading && instances.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.emptyText}>Loading devices…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadInstances(true)}
              tintColor="#6366f1"
            />
          }
        >
          {instances.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="desktop-outline" size={48} color="#374151" />
              <Text style={styles.emptyTitle}>No devices registered</Text>
              <Text style={styles.emptySubtitle}>
                Install Matrx Local on your computer, sign in with this account,
                and your device will appear here.
              </Text>
            </View>
          ) : (
            instances.map((inst) => (
              <DeviceRow
                key={inst.instance_id}
                instance={inst}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                connectionState={connStates[inst.instance_id] ?? 'disconnected'}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#27272a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fafafa',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#450a0a20',
    borderWidth: 1,
    borderColor: '#7f1d1d40',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#ef4444',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d4d4d8',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
  },
  deviceCard: {
    backgroundColor: '#18181b',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#27272a',
    overflow: 'hidden',
    marginBottom: 4,
  },
  deviceHeader: {
    padding: 16,
    paddingBottom: 10,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fafafa',
  },
  deviceSubtitle: {
    fontSize: 12,
    color: '#71717a',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tunnelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    backgroundColor: '#1d4ed820',
  },
  tunnelBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3b82f6',
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '60%',
  },
  specText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  tunnelUrl: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#52525b',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  deviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#27272a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  connStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  connDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
  },
  connLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    marginLeft: 'auto',
  },
  connectBtnDisabled: {
    backgroundColor: '#27272a',
  },
  disconnectBtn: {
    backgroundColor: '#450a0a40',
    borderWidth: 1,
    borderColor: '#7f1d1d60',
  },
  connectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
