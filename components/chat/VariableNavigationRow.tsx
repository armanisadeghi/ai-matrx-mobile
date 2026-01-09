/**
 * AI Matrx Mobile - Variable Navigation Row Component
 * iOS Settings-style navigation row for variable display
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatVariableName, getVariableDisplayValue } from '@/lib/variable-utils';
import { PromptVariable } from '@/types/agent';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface VariableNavigationRowProps {
  variable: PromptVariable;
  value: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function VariableNavigationRow({
  variable,
  value,
  onPress,
  isFirst = false,
  isLast = false,
}: VariableNavigationRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const displayValue = getVariableDisplayValue(variable, value);
  const isEmpty = !value || !value.trim();
  const formattedLabel = formatVariableName(variable.name);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed
            ? Platform.select({ ios: colors.border, android: colors.border })
            : colors.surface,
        },
        isFirst && styles.firstRow,
        isLast && styles.lastRow,
      ]}
      android_ripple={{ color: colors.border }}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${formattedLabel}`}
      accessibilityHint={`Current value: ${displayValue}`}
    >
      <View style={styles.content}>
        {/* Left side - Label */}
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
            {formattedLabel}
            {variable.required && (
              <Text style={[styles.required, { color: colors.error }]}> *</Text>
            )}
          </Text>
        </View>

        {/* Right side - Value and Chevron */}
        <View style={styles.valueContainer}>
          <Text
            style={[
              styles.value,
              {
                color: isEmpty ? colors.textTertiary : colors.textSecondary,
              },
            ]}
            numberOfLines={1}
          >
            {displayValue}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
            style={styles.chevron}
          />
        </View>
      </View>

      {/* Bottom border */}
      {!isLast && (
        <View
          style={[
            styles.separator,
            { backgroundColor: colors.border },
          ]}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: Platform.select({ ios: 44, android: 48 }),
  },
  firstRow: {
    borderTopLeftRadius: Layout.radius.lg,
    borderTopRightRadius: Layout.radius.lg,
  },
  lastRow: {
    borderBottomLeftRadius: Layout.radius.lg,
    borderBottomRightRadius: Layout.radius.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    minHeight: Platform.select({ ios: 44, android: 48 }),
  },
  labelContainer: {
    flex: 0,
    flexShrink: 0,
    marginRight: Layout.spacing.md,
  },
  label: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '400',
  },
  required: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Layout.spacing.xs,
  },
  value: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'right',
    flexShrink: 1,
  },
  chevron: {
    flexShrink: 0,
    marginLeft: Layout.spacing.xs,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Layout.spacing.lg,
  },
});

