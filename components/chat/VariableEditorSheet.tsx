/**
 * AI Matrx Mobile - Variable Editor Bottom Sheet
 * Native bottom sheet for editing variable values
 */

import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatVariableName } from '@/lib/variable-utils';
import { PromptVariable } from '@/types/agent';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { VariableInput } from './VariableInput';

interface VariableEditorSheetProps {
  variable: PromptVariable | null;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function VariableEditorSheet({
  variable,
  value,
  onChange,
  onClose,
  isOpen,
}: VariableEditorSheetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['60%', '90%'], []);

  // Open/close the sheet based on isOpen prop
  useEffect(() => {
    if (isOpen && variable) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen, variable]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.close();
    onClose();
  }, [onClose]);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const handleValueChange = useCallback((newValue: string) => {
    // Medium haptic on value change
    if (newValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onChange(newValue);
  }, [onChange, value]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  if (!variable) return null;

  const formattedLabel = formatVariableName(variable.name);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={handleSheetChange}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.border,
      }}
      style={styles.bottomSheet}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>
              {formattedLabel}
              {variable.required && (
                <Text style={[styles.required, { color: colors.error }]}> *</Text>
              )}
            </Text>
            {variable.helpText && (
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                {variable.helpText}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close editor"
          >
            <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content - Scrollable */}
        <BottomSheetScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <VariableInput
            variable={variable}
            value={value}
            onChange={handleValueChange}
          />
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.sm,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  title: {
    ...Typography.title3,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  required: {
    fontSize: 20,
    fontWeight: '600',
  },
  helpText: {
    ...Typography.caption1,
    fontSize: 14,
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    paddingBottom: Platform.select({ ios: Layout.spacing.xxl, android: Layout.spacing.xl }),
  },
});

