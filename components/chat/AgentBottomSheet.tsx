/**
 * AI Matrx Mobile - Agent Bottom Sheet
 * Agent selection with search
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useAgents } from '@/hooks/use-agents';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AgentOption } from '@/types/agent';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AgentBottomSheetProps {
  visible: boolean;
  selectedAgentId?: string;
  onSelect: (agent: AgentOption) => void;
  onClose: () => void;
}

export const AgentBottomSheet = React.memo(function AgentBottomSheet({
  visible,
  selectedAgentId,
  onSelect,
  onClose,
}: AgentBottomSheetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { agents, defaultAgents, customAgents, isLoading } = useAgents();

  const snapPoints = useMemo(() => ['50%', '90%'], []);

  // Filter agents by search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.description?.toLowerCase().includes(query)
    );
  }, [searchQuery, agents]);

  // Separate into default and custom for section headers
  const { filteredDefault, filteredCustom } = useMemo(() => {
    const defaultIds = new Set(defaultAgents.map(a => a.id));
    return {
      filteredDefault: filteredAgents.filter(a => defaultIds.has(a.id)),
      filteredCustom: filteredAgents.filter(a => !defaultIds.has(a.id)),
    };
  }, [filteredAgents, defaultAgents]);

  // Create list data with section headers
  const listData = useMemo(() => {
    const data: Array<{ type: 'header' | 'agent'; agent?: AgentOption; title?: string }> = [];
    
    if (filteredDefault.length > 0) {
      data.push({ type: 'header', title: 'Default Agents' });
      filteredDefault.forEach(agent => data.push({ type: 'agent', agent }));
    }
    
    if (filteredCustom.length > 0) {
      data.push({ type: 'header', title: 'Your Custom Agents' });
      filteredCustom.forEach(agent => data.push({ type: 'agent', agent }));
    }
    
    return data;
  }, [filteredDefault, filteredCustom]);

  const handleSelectAgent = useCallback(
    (agent: AgentOption) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(agent);
      bottomSheetRef.current?.close();
    },
    [onSelect]
  );

  const renderItem = useCallback(
    ({ item }: { item: typeof listData[0] }) => {
      if (item.type === 'header') {
        return (
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {item.title}
          </Text>
        );
      }

      const agent = item.agent!;
      const isSelected = agent.id === selectedAgentId;
      return (
        <TouchableOpacity
          style={[
            styles.agentItem,
            {
              backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
            },
          ]}
          onPress={() => handleSelectAgent(agent)}
          activeOpacity={0.7}
        >
          <View style={[styles.agentIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={agent.icon as any || 'flash'} size={24} color={colors.primary} />
          </View>
          <View style={styles.agentInfo}>
            <Text style={[styles.agentName, { color: colors.text }]}>
              {agent.name}
            </Text>
            <Text style={[styles.agentDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {agent.description || 'No description'}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      );
    },
    [selectedAgentId, colors, handleSelectAgent]
  );

  const keyExtractor = useCallback(
    (item: typeof listData[0], index: number) => {
      return item.type === 'header' ? `header-${index}` : `agent-${item.agent!.id}`;
    },
    []
  );

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Select Agent</Text>

        <BottomSheetTextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Search agents..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading agents...
            </Text>
          </View>
        ) : (
          <BottomSheetFlatList
            data={listData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No agents found
                </Text>
              </View>
            }
          />
        )}
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  title: {
    ...Typography.title2,
    marginBottom: Layout.spacing.md,
  },
  searchInput: {
    ...Typography.body,
    fontSize: 16,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.radius.md,
    marginBottom: Layout.spacing.md,
  },
  listContent: {
    paddingBottom: Layout.spacing.xl,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    marginBottom: Layout.spacing.sm,
    gap: Layout.spacing.md,
  },
  agentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    ...Typography.headline,
    fontSize: 16,
    marginBottom: 2,
  },
  agentDescription: {
    ...Typography.caption1,
    fontSize: 13,
  },
  sectionHeader: {
    ...Typography.subhead,
    fontWeight: '600',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    marginTop: Layout.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    marginTop: Layout.spacing.md,
  },
});
