/**
 * AI Matrx Mobile - Agent Bottom Sheet
 *
 * 🚨 THERE IS ONE AGENT PICKER and this file is not it — it is only the SHEET
 * CHROME around it. The rows, their order, the Mine/Shared/All/Public tabs and
 * their counts, the sort, favourites, category and tag filters, the search, the
 * detail peek and the mandate-resolved default row all come from
 * `@ai-matrx/agents/catalog/native`, so this app's list is the same list the
 * web app, the Chrome extension, the desktop app and the Workflow Studio show.
 *
 * What used to be here: a hand-rolled list over four HARDCODED agents plus a
 * Supabase read of a `prompts` table that does not exist, whose error was
 * swallowed into an empty array. Three of the four constants named the wrong
 * agent. Do not reintroduce a local list — `scripts/check-canonical-pickers.ts`
 * will fail the build, and a behaviour the package lacks is a package change
 * made and released in the same session.
 */

import { AgentListSheet } from '@ai-matrx/agents/catalog/native';
import BottomSheet from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOBILE_DEFAULT_CHAT_MANDATE } from '@/lib/agent-catalog';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AgentBottomSheetProps {
  visible: boolean;
  selectedAgentId?: string;
  /** The picker's ONLY contract back to this app. */
  onSelect: (agentId: string) => void;
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
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => ['60%', '90%'], []);

  const handleSelect = useCallback(
    (agentId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(agentId);
      bottomSheetRef.current?.close();
    },
    [onSelect],
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
      topInset={insets.top}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
    >
      <View style={styles.container}>
        <AgentListSheet
          title="Select Agent"
          consumerId="mobile.chat"
          onSelect={handleSelect}
          activeAgentId={selectedAgentId ?? null}
          defaultMandateKey={MOBILE_DEFAULT_CHAT_MANDATE}
        />
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
