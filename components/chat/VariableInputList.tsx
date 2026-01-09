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
  hasMessages?: boolean;
}

export function VariableInputList({
  variableDefaults,
  onValuesChange,
  initialValues,
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

  // Don't show if no variables
  if (!variableDefaults || variableDefaults.length === 0) {
    return null;
  }

  // Don't show variables if there are messages (variables are only for first message)
  if (hasMessages) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        {/* Variable navigation rows - always expanded, no collapsible header */}
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
