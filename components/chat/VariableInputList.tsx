/**
 * AI Matrx Mobile - Variable Input List Component
 * Manages and displays all variable inputs for an agent
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatVariableName, initializeVariableValues } from '@/lib/variable-utils';
import { PromptVariable } from '@/types/agent';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { VariableInput } from './VariableInput';

interface VariableInputListProps {
  variableDefaults: PromptVariable[];
  onValuesChange: (values: Record<string, string>) => void;
  initialValues?: Record<string, string>;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  hasMessages?: boolean;
}

export function VariableInputList({
  variableDefaults,
  onValuesChange,
  initialValues,
  isExpanded = true,
  onToggleExpanded,
  hasMessages = false,
}: VariableInputListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // Initialize variable values
  const [values, setValues] = useState<Record<string, string>>(() => {
    return initialValues || initializeVariableValues(variableDefaults);
  });

  // Update parent when values change
  useEffect(() => {
    onValuesChange(values);
  }, [values, onValuesChange]);

  const handleValueChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleExpanded?.();
  };

  // Don't show if no variables
  if (!variableDefaults || variableDefaults.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Collapsible header - only show after first message */}
      {hasMessages && onToggleExpanded && (
        <TouchableOpacity
          style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          onPress={handleToggle}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? 'Collapse variables' : 'Expand variables'}
        >
          <View style={styles.headerContent}>
            <Ionicons name="options-outline" size={20} color={colors.primary} />
            <Text style={[styles.headerText, { color: colors.text }]}>
              Variables ({variableDefaults.length})
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      )}

      {/* Variable inputs */}
      {isExpanded && (
        <ScrollView
          style={[styles.content, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {variableDefaults.map((variable, index) => (
            <View key={variable.name} style={styles.variableContainer}>
              {/* Variable label */}
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {formatVariableName(variable.name)}
                  {variable.required && <Text style={[styles.required, { color: colors.error }]}> *</Text>}
                </Text>
                {variable.helpText && (
                  <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                    {variable.helpText}
                  </Text>
                )}
              </View>

              {/* Variable input */}
              <VariableInput
                variable={variable}
                value={values[variable.name] || ''}
                onChange={(value) => handleValueChange(variable.name, value)}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  headerText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    maxHeight: 400,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    gap: Layout.spacing.lg,
  },
  variableContainer: {
    gap: Layout.spacing.sm,
  },
  labelRow: {
    gap: Layout.spacing.xs,
  },
  label: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '600',
  },
  required: {
    fontSize: 15,
    fontWeight: '600',
  },
  helpText: {
    ...Typography.caption1,
    fontSize: 13,
  },
});
