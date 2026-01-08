/**
 * AI Matrx Mobile - Agent Bottom Sheet
 * Agent selection with search
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface AgentBottomSheetProps {
  visible: boolean;
  selectedAgentId?: string;
  onSelect: (agent: Agent) => void;
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

  const snapPoints = useMemo(() => ['40%', '90%'], []);

  // Mock agents data
  const allAgents: Agent[] = useMemo(
    () => [
      {
        id: '35d8f884-5178-4c3e-858d-c5b7adfa186a',
        name: 'Fast',
        description: 'Quick responses for general queries',
        icon: 'flash',
      },
      {
        id: 'agent-2',
        name: 'Creative',
        description: 'Creative writing and brainstorming',
        icon: 'bulb',
      },
      {
        id: 'agent-3',
        name: 'Code Expert',
        description: 'Programming assistance and debugging',
        icon: 'code-slash',
      },
      {
        id: 'agent-4',
        name: 'Research',
        description: 'In-depth research and analysis',
        icon: 'search',
      },
    ],
    []
  );

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return allAgents;
    const query = searchQuery.toLowerCase();
    return allAgents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query)
    );
  }, [searchQuery, allAgents]);

  const handleSelectAgent = useCallback(
    (agent: Agent) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(agent);
      bottomSheetRef.current?.close();
    },
    [onSelect]
  );

  const renderAgent = useCallback(
    ({ item }: { item: Agent }) => {
      const isSelected = item.id === selectedAgentId;
      return (
        <TouchableOpacity
          style={[
            styles.agentItem,
            {
              backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
            },
          ]}
          onPress={() => handleSelectAgent(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.agentIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={item.icon as any || 'flash'} size={24} color={colors.primary} />
          </View>
          <View style={styles.agentInfo}>
            <Text style={[styles.agentName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.agentDescription, { color: colors.textSecondary }]}>
              {item.description}
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

        <BottomSheetFlatList
          data={filteredAgents}
          renderItem={renderAgent}
          keyExtractor={(item: Agent) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
});
