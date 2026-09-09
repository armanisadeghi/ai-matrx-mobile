/**
 * AI Matrx Mobile - Agent Selection Screen
 *
 * 🚨 THERE IS ONE AGENT PICKER. This screen renders
 * `AgentListInlinePicker` from `@ai-matrx/agents/catalog/native` — the same
 * rows, order, tabs, counts and filters every other Matrx client shows.
 *
 * What used to be here: a second hand-rolled list, over the same four
 * hardcoded constants the chat sheet used (three of which named the wrong
 * agent). Two hand-rolled lists in one app is exactly how one client's agent
 * list stops matching another's.
 */

import { AgentListInlinePicker } from '@ai-matrx/agents/catalog/native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MOBILE_DEFAULT_CHAT_MANDATE } from '@/lib/agent-catalog';
import { warmAgent } from '@/lib/api/agent';
import { AppStorage, StorageKeys } from '@/lib/storage';

export default function AgentSelectionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const handleAgentSelect = useCallback((agentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AppStorage.setString(StorageKeys.LAST_AGENT_ID, agentId);
    // Pre-warm the selected agent for a faster first response. The platform's
    // agent id IS the id the execution route takes.
    warmAgent({ prompt_id: agentId }).catch(console.warn);
    router.push(`/(tabs)/chat/${agentId}` as never);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Chat</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select an agent to start a conversation
        </Text>
      </View>

      <AgentListInlinePicker
        consumerId="mobile.agent-gallery"
        onSelect={handleAgentSelect}
        defaultMandateKey={MOBILE_DEFAULT_CHAT_MANDATE}
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
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
  },
  title: {
    ...Typography.largeTitle,
  },
  subtitle: {
    ...Typography.subhead,
    marginTop: 2,
  },
});
