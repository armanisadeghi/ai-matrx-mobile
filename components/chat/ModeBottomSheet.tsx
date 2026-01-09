/**
 * AI Matrx Mobile - Mode Bottom Sheet
 * Mode selection (chat, image gen, video gen, etc.)
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Mode {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

interface ModeBottomSheetProps {
  visible: boolean;
  selectedModeId?: string;
  onSelect: (mode: Mode) => void;
  onClose: () => void;
}

export const ModeBottomSheet = React.memo(function ModeBottomSheet({
  visible,
  selectedModeId,
  onSelect,
  onClose,
}: ModeBottomSheetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => ['50%'], []);

  const modes: Mode[] = useMemo(
    () => [
      {
        id: 'chat',
        name: 'Chat',
        description: 'General conversation and assistance',
        icon: 'chatbubble',
        available: true,
      },
      {
        id: 'agent',
        name: 'Agent Mode',
        description: 'Custom agent behaviors',
        icon: 'person',
        available: true,
      },
      {
        id: 'image',
        name: 'Image Generation',
        description: 'Create images from text',
        icon: 'image',
        available: false,
      },
      {
        id: 'video',
        name: 'Video Generation',
        description: 'Create videos from text',
        icon: 'videocam',
        available: false,
      },
    ],
    []
  );

  const handleSelectMode = useCallback(
    (mode: Mode) => {
      if (!mode.available) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(mode);
      bottomSheetRef.current?.close();
    },
    [onSelect]
  );

  const renderMode = useCallback(
    ({ item }: { item: Mode }) => {
      const isSelected = item.id === selectedModeId;
      return (
        <TouchableOpacity
          style={[
            styles.modeItem,
            {
              backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
              opacity: item.available ? 1 : 0.5,
            },
          ]}
          onPress={() => handleSelectMode(item)}
          activeOpacity={0.7}
          disabled={!item.available}
        >
          <View style={[styles.modeIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name={item.icon as any} size={28} color={colors.primary} />
          </View>
          <View style={styles.modeInfo}>
            <View style={styles.modeHeader}>
              <Text style={[styles.modeName, { color: colors.text }]}>
                {item.name}
              </Text>
              {!item.available && (
                <Text style={[styles.comingSoon, { color: colors.textTertiary }]}>
                  Coming Soon
                </Text>
              )}
            </View>
            <Text style={[styles.modeDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      );
    },
    [selectedModeId, colors, handleSelectMode]
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
        <Text style={[styles.title, { color: colors.text }]}>Select Mode</Text>

        <BottomSheetFlatList
          data={modes}
          renderItem={renderMode}
          keyExtractor={(item: any) => item.id}
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
  listContent: {
    paddingBottom: Layout.spacing.xl,
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderRadius: Layout.radius.lg,
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.md,
  },
  modeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeInfo: {
    flex: 1,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modeName: {
    ...Typography.headline,
    fontSize: 17,
  },
  comingSoon: {
    ...Typography.caption2,
    fontSize: 11,
  },
  modeDescription: {
    ...Typography.caption1,
    fontSize: 14,
  },
});
