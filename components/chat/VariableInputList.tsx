/**
 * AI Matrx Mobile - Variable Input List Component
 * Displays variables as clean navigation rows with bottom sheet editing
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatVariableName, initializeVariableValues } from '@/lib/variable-utils';
import { PromptVariable } from '@/types/agent';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { VariableNavigationRow } from './VariableNavigationRow';
import { VariableEditorSheet } from './VariableEditorSheet';

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

  // Track which variable is being edited
  const [editingVariable, setEditingVariable] = useState<PromptVariable | null>(null);

  // Update parent when values change
  useEffect(() => {
    onValuesChange(values);
  }, [values, onValuesChange]);

  const handleValueChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleOpenEditor = useCallback((variable: PromptVariable) => {
    setEditingVariable(variable);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditingVariable(null);
  }, []);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleExpanded?.();
  };

  // Don't show if no variables
  if (!variableDefaults || variableDefaults.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        {/* Collapsible header - only show after first message */}
        {hasMessages && onToggleExpanded && (
          <TouchableOpacity
            style={[
              styles.header,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              },
            ]}
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

        {/* Variable navigation rows */}
        {isExpanded && (
          <ScrollView
            style={[styles.content, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.rowsContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {variableDefaults.map((variable, index) => {
                // Use nullish coalescing to properly fall back to defaultValue
                const currentValue = values[variable.name] ?? variable.defaultValue ?? '';
                return (
                  <VariableNavigationRow
                    key={variable.name}
                    variable={variable}
                    value={currentValue}
                    onPress={() => handleOpenEditor(variable)}
                    isFirst={index === 0}
                    isLast={index === variableDefaults.length - 1}
                  />
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Bottom Sheet Editor */}
      <VariableEditorSheet
        variable={editingVariable}
        value={
          editingVariable
            ? values[editingVariable.name] ?? editingVariable.defaultValue ?? ''
            : ''
        }
        onChange={(value) => {
          if (editingVariable) {
            handleValueChange(editingVariable.name, value);
          }
        }}
        onClose={handleCloseEditor}
        isOpen={editingVariable !== null}
      />
    </>
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
    maxHeight: 500,
  },
  contentContainer: {
    padding: Layout.spacing.md,
  },
  rowsContainer: {
    borderRadius: Layout.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
