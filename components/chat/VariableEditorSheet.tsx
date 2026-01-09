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
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
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
  
  // Keep a "display" version of variable that persists during close animation
  const [displayVariable, setDisplayVariable] = React.useState<PromptVariable | null>(variable);
  const [displayValue, setDisplayValue] = React.useState<string>(value);
  const [isClosing, setIsClosing] = React.useState(false);

  // Update display variable when a new variable is opened
  React.useEffect(() => {
    if (variable && !isClosing) {
      setDisplayVariable(variable);
      setDisplayValue(value);
    }
  }, [variable]);

  // Update display value when value changes (for live updates within the sheet)
  React.useEffect(() => {
    if (variable && !isClosing) {
      setDisplayValue(value);
    }
  }, [value]);

  // Snap points for the bottom sheet: half-open and fully-open
  // User can swipe between these, or swipe down to close
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  // Calculate the proper index based on isOpen and variable
  const sheetIndex = useMemo(() => {
    return isOpen && variable ? 0 : -1;
  }, [isOpen, variable]);

  const handleSheetChange = useCallback((index: number) => {
    // When sheet starts closing (from any snap point to -1)
    if (index === -1) {
      setIsClosing(true);
      onClose();
      // Clear display variable after animation completes
      setTimeout(() => {
        setDisplayVariable(null);
        setIsClosing(false);
      }, 300);
    } else {
      setIsClosing(false);
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

  const formattedLabel = displayVariable ? formatVariableName(displayVariable.name) : '';

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={sheetIndex}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
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
      {displayVariable ? (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header - No close button, native gestures only */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: colors.text }]}>
                {formattedLabel}
                {displayVariable.required && (
                  <Text style={[styles.required, { color: colors.error }]}> *</Text>
                )}
              </Text>
              {displayVariable.helpText && (
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  {displayVariable.helpText}
                </Text>
              )}
            </View>
          </View>

          {/* Content - Scrollable */}
          <BottomSheetScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <VariableInput
              variable={displayVariable}
              value={displayValue}
              onChange={handleValueChange}
              autoOpen={true}
              onRequestClose={onClose}
            />
          </BottomSheetScrollView>
        </View>
      ) : (
        <View />
      )}
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
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flex: 1,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: Layout.spacing.lg,
    paddingBottom: Platform.select({ ios: Layout.spacing.xxl, android: Layout.spacing.xl }),
  },
});

