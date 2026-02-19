/**
 * AI Matrx Mobile - Agent Selection Screen
 * Browse and select AI agents to chat with
 */

import { Card } from '@/components/ui';
import { DEFAULT_AGENTS } from '@/constants/agents';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { warmAgent } from '@/lib/api/agent';
import { AppStorage, StorageKeys } from '@/lib/storage';
import { AgentOption } from '@/types/agent';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AgentSelectionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const [agents] = useState<AgentOption[]>(DEFAULT_AGENTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Pre-warm all agents for faster response
    await Promise.all(
      DEFAULT_AGENTS.map((agent) =>
        warmAgent({ prompt_id: agent.promptId }).catch(() => {})
      )
    );
    setRefreshing(false);
  };

  const handleAgentSelect = (agent: AgentOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AppStorage.setString(StorageKeys.LAST_AGENT_ID, agent.id);
    
    // Pre-warm the selected agent
    warmAgent({ prompt_id: agent.promptId }).catch(console.warn);
    
    // Navigate to chat conversation screen
    router.push(`/(tabs)/chat/${agent.id}` as any);
  };

  const getAgentIcon = (agent: AgentOption): keyof typeof Ionicons.glyphMap => {
    if (agent.icon) {
      return agent.icon as keyof typeof Ionicons.glyphMap;
    }
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      'general-chat': 'chatbubble-ellipses',
      'deep-research': 'search',
      'code-helper': 'code-slash',
    };
    return icons[agent.id] || 'person';
  };

  const renderAgent = ({ item }: { item: AgentOption }) => (
    <Card
      variant="elevated"
      onPress={() => handleAgentSelect(item)}
      style={styles.agentCard}
    >
      <View style={styles.agentHeader}>
        <View style={[styles.agentIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={getAgentIcon(item)} size={28} color={colors.primary} />
        </View>
        <View style={styles.agentStatus}>
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.statusText, { color: colors.textTertiary }]}>
            Available
          </Text>
        </View>
      </View>
      <Text style={[styles.agentName, { color: colors.text }]}>
        {item.name}
      </Text>
      <Text style={[styles.agentDescription, { color: colors.textSecondary }]}>
        {item.description || 'AI-powered assistant'}
      </Text>
      {item.variableDefaults && item.variableDefaults.length > 0 && (
        <View style={styles.capabilities}>
          <View style={[styles.capabilityTag, { backgroundColor: colors.surface }]}>
            <Ionicons name="options-outline" size={12} color={colors.primary} />
            <Text style={[styles.capabilityText, { color: colors.textTertiary }]}>
              {item.variableDefaults.length} {item.variableDefaults.length === 1 ? 'variable' : 'variables'}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Chat</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select an agent to start a conversation
        </Text>
      </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.radius.sm,
    gap: 4,
  },
  capabilityText: {
    ...Typography.caption2,
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
