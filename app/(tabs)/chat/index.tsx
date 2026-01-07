/**
 * AI Matrx Mobile - Agent Selection Screen
 * Browse and select AI agents to chat with
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card, LoadingSpinner } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/lib/api';
import { Agent } from '@/types/chat';
import { AppStorage, StorageKeys } from '@/lib/storage';

// Mock agents for initial testing (replace with API call)
const MOCK_AGENTS: Agent[] = [
  {
    id: 'general-assistant',
    name: 'General Assistant',
    description: 'A helpful AI assistant for everyday tasks and questions',
    capabilities: ['conversation', 'questions', 'writing'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'code-helper',
    name: 'Code Helper',
    description: 'Specialized in programming and software development',
    capabilities: ['coding', 'debugging', 'code-review'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Expert in creative writing, storytelling, and content creation',
    capabilities: ['writing', 'storytelling', 'editing'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function AgentSelectionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setError(null);
      // TODO: Replace with actual API call
      // const response = await api.get<Agent[]>('/api/agents');
      // if (response.error) throw new Error(response.error.message);
      // setAgents(response.data || []);
      
      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAgents(MOCK_AGENTS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAgents();
  };

  const handleAgentSelect = (agent: Agent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AppStorage.setString(StorageKeys.LAST_AGENT_ID, agent.id);
    router.push(`/(tabs)/chat/${agent.id}`);
  };

  const getAgentIcon = (agentId: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      'general-assistant': 'chatbubble-ellipses',
      'code-helper': 'code-slash',
      'creative-writer': 'pencil',
    };
    return icons[agentId] || 'person';
  };

  const renderAgent = ({ item }: { item: Agent }) => (
    <Card
      variant="elevated"
      onPress={() => handleAgentSelect(item)}
      style={styles.agentCard}
    >
      <View style={styles.agentHeader}>
        <View style={[styles.agentIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={getAgentIcon(item.id)} size={28} color={colors.primary} />
        </View>
        <View style={styles.agentStatus}>
          <View style={[styles.statusDot, { backgroundColor: item.isActive ? colors.success : colors.textTertiary }]} />
          <Text style={[styles.statusText, { color: colors.textTertiary }]}>
            {item.isActive ? 'Available' : 'Offline'}
          </Text>
        </View>
      </View>
      <Text style={[styles.agentName, { color: colors.text }]}>
        {item.name}
      </Text>
      <Text style={[styles.agentDescription, { color: colors.textSecondary }]}>
        {item.description}
      </Text>
      <View style={styles.capabilities}>
        {item.capabilities.slice(0, 3).map((cap) => (
          <View key={cap} style={[styles.capabilityTag, { backgroundColor: colors.surface }]}>
            <Text style={[styles.capabilityText, { color: colors.textTertiary }]}>
              {cap}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading agents..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Chat</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select an agent to start a conversation
        </Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <Card variant="outlined" onPress={fetchAgents} style={styles.retryButton}>
            <Text style={{ color: colors.primary }}>Tap to retry</Text>
          </Card>
        </View>
      ) : (
        <FlatList
          data={agents}
          renderItem={renderAgent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No agents available
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  title: {
    ...Typography.largeTitle,
  },
  subtitle: {
    ...Typography.body,
    marginTop: Layout.spacing.xs,
  },
  listContent: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  agentCard: {
    marginBottom: Layout.spacing.md,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  agentIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...Typography.caption1,
  },
  agentName: {
    ...Typography.title3,
    marginBottom: Layout.spacing.xs,
  },
  agentDescription: {
    ...Typography.body,
    marginBottom: Layout.spacing.md,
  },
  capabilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.xs,
  },
  capabilityTag: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.radius.sm,
  },
  capabilityText: {
    ...Typography.caption2,
    textTransform: 'capitalize',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  errorText: {
    ...Typography.body,
    textAlign: 'center',
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  retryButton: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xxxl,
  },
  emptyText: {
    ...Typography.body,
    marginTop: Layout.spacing.md,
  },
});
