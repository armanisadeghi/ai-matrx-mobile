/**
 * AI Matrx Mobile - Variable Input Component
 * Renders different input types based on variable configuration
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { adjustNumberValue, formatCheckboxValue, formatOtherValue, parseCheckboxValue, parseOtherValue } from '@/lib/variable-utils';
import { PromptVariable } from '@/types/agent';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface VariableInputProps {
  variable: PromptVariable;
  value: string;
  onChange: (value: string) => void;
}

export function VariableInput({ variable, value, onChange }: VariableInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const componentType = variable.customComponent?.type || 'textarea';

  // Render appropriate component based on type
  switch (componentType) {
    case 'toggle':
      return (
        <ToggleInput
          variable={variable}
          value={value}
          onChange={onChange}
          colors={colors}
        />
      );
    case 'radio':
      return (
        <RadioInput
          variable={variable}
          value={value}
          onChange={onChange}
          colors={colors}
        />
      );
    case 'checkbox':
      return (
        <CheckboxInput
          variable={variable}
          value={value}
          onChange={onChange}
          colors={colors}
        />
      );
    case 'select':
      return (
        <SelectInput
          variable={variable}
          value={value}
          onChange={onChange}
          colors={colors}
        />
      );
    case 'number':
      return (
        <NumberInput
          variable={variable}
          value={value}
          onChange={onChange}
          colors={colors}
        />
      );
    case 'textarea':
    default:
      return (
        <TextareaInput
          variable={variable}
          value={value}
          onChange={onChange}
          colors={colors}
        />
      );
  }
}

// ============================================================================
// TEXTAREA INPUT
// ============================================================================

interface InputComponentProps {
  variable: PromptVariable;
  value: string;
  onChange: (value: string) => void;
  colors: any;
}

function TextareaInput({ variable, value, onChange, colors }: InputComponentProps) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.textarea,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={variable.helpText || `Enter ${variable.name}`}
        placeholderTextColor={colors.textTertiary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );
}

// ============================================================================
// TOGGLE INPUT
// ============================================================================

function ToggleInput({ variable, value, onChange, colors }: InputComponentProps) {
  const toggleValues = variable.customComponent?.toggleValues || ['No', 'Yes'];
  const [offLabel, onLabel] = toggleValues;
  const isOn = value === onLabel;

  const handleToggle = (newValue: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(newValue ? onLabel : offLabel);
  };

  return (
    <View style={[styles.toggleContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.toggleContent}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>
          {isOn ? onLabel : offLabel}
        </Text>
        <Switch
          value={isOn}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={Platform.OS === 'ios' ? undefined : colors.surface}
          ios_backgroundColor={colors.border}
        />
      </View>
    </View>
  );
}

// ============================================================================
// RADIO INPUT
// ============================================================================

function RadioInput({ variable, value, onChange, colors }: InputComponentProps) {
  const [showModal, setShowModal] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState('');
  
  const options = variable.customComponent?.options || [];
  const allowOther = variable.customComponent?.allowOther || false;

  const displayValue = value || '(not selected)';
  const parsedOther = parseOtherValue(value);

  const handleSelect = (option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (option === 'Other') {
      setShowOtherInput(true);
      setOtherText(parsedOther || '');
    } else {
      onChange(option);
      setShowModal(false);
      setShowOtherInput(false);
    }
  };

  const handleOtherSubmit = () => {
    if (otherText.trim()) {
      onChange(formatOtherValue(otherText.trim()));
      setShowModal(false);
      setShowOtherInput(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selectButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowModal(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Select ${variable.name}`}
      >
        <Text style={[styles.selectButtonText, { color: colors.text }]} numberOfLines={1}>
          {displayValue}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCloseButton}>
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Option</Text>
            <View style={styles.modalCloseButton} />
          </View>

          <ScrollView style={styles.modalContent}>
            {showOtherInput ? (
              <View style={styles.otherInputContainer}>
                <TextInput
                  style={[
                    styles.otherInput,
                    { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  value={otherText}
                  onChangeText={setOtherText}
                  placeholder="Enter custom value"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                  multiline
                />
                <TouchableOpacity
                  style={[styles.otherSubmitButton, { backgroundColor: colors.primary }]}
                  onPress={handleOtherSubmit}
                  accessibilityRole="button"
                >
                  <Text style={styles.otherSubmitText}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.otherCancelButton, { backgroundColor: colors.surface }]}
                  onPress={() => setShowOtherInput(false)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.otherCancelText, { color: colors.text }]}>Back to Options</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {options.map((option) => (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [
                      styles.radioOption,
                      { backgroundColor: pressed ? colors.border : colors.surface },
                    ]}
                    onPress={() => handleSelect(option)}
                  >
                    <View style={styles.radioOptionContent}>
                      <Text style={[styles.radioOptionText, { color: colors.text }]}>{option}</Text>
                      {value === option && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                      )}
                    </View>
                  </Pressable>
                ))}
                {allowOther && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.radioOption,
                      { backgroundColor: pressed ? colors.border : colors.surface },
                    ]}
                    onPress={() => handleSelect('Other')}
                  >
                    <View style={styles.radioOptionContent}>
                      <Text style={[styles.radioOptionText, { color: colors.text }]}>Other...</Text>
                      {parsedOther && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                      )}
                    </View>
                  </Pressable>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

// ============================================================================
// CHECKBOX INPUT
// ============================================================================

function CheckboxInput({ variable, value, onChange, colors }: InputComponentProps) {
  const [showModal, setShowModal] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState('');
  
  const options = variable.customComponent?.options || [];
  const allowOther = variable.customComponent?.allowOther || false;
  const selectedValues = parseCheckboxValue(value);

  const displayValue = selectedValues.length > 0 
    ? `${selectedValues.length} selected` 
    : '(none selected)';

  const toggleOption = (option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter((v) => v !== option)
      : [...selectedValues, option];
    onChange(formatCheckboxValue(newValues));
  };

  const handleOtherSubmit = () => {
    if (otherText.trim()) {
      const otherValue = formatOtherValue(otherText.trim());
      const newValues = [...selectedValues, otherValue];
      onChange(formatCheckboxValue(newValues));
      setOtherText('');
      setShowOtherInput(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selectButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowModal(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Select ${variable.name}`}
      >
        <Text style={[styles.selectButtonText, { color: colors.text }]} numberOfLines={1}>
          {displayValue}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCloseButton}>
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Options</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalCloseButton}>
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {showOtherInput ? (
              <View style={styles.otherInputContainer}>
                <TextInput
                  style={[
                    styles.otherInput,
                    { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  value={otherText}
                  onChangeText={setOtherText}
                  placeholder="Enter custom value"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                  multiline
                />
                <TouchableOpacity
                  style={[styles.otherSubmitButton, { backgroundColor: colors.primary }]}
                  onPress={handleOtherSubmit}
                  accessibilityRole="button"
                >
                  <Text style={styles.otherSubmitText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.otherCancelButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    setShowOtherInput(false);
                    setOtherText('');
                  }}
                  accessibilityRole="button"
                >
                  <Text style={[styles.otherCancelText, { color: colors.text }]}>Back to Options</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option);
                  return (
                    <Pressable
                      key={option}
                      style={({ pressed }) => [
                        styles.checkboxOption,
                        { backgroundColor: pressed ? colors.border : colors.surface },
                      ]}
                      onPress={() => toggleOption(option)}
                    >
                      <View style={styles.checkboxOptionContent}>
                        <Text style={[styles.checkboxOptionText, { color: colors.text }]}>{option}</Text>
                        <View
                          style={[
                            styles.checkbox,
                            { borderColor: colors.border },
                            isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                          ]}
                        >
                          {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
                {allowOther && (
                  <>
                    {selectedValues
                      .filter((v) => v.startsWith('Other: '))
                      .map((otherValue) => {
                        const customText = parseOtherValue(otherValue);
                        return (
                          <Pressable
                            key={otherValue}
                            style={({ pressed }) => [
                              styles.checkboxOption,
                              { backgroundColor: pressed ? colors.border : colors.surface },
                            ]}
                            onPress={() => toggleOption(otherValue)}
                          >
                            <View style={styles.checkboxOptionContent}>
                              <Text style={[styles.checkboxOptionText, { color: colors.text }]}>
                                {customText}
                              </Text>
                              <View
                                style={[
                                  styles.checkbox,
                                  { backgroundColor: colors.primary, borderColor: colors.primary },
                                ]}
                              >
                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                              </View>
                            </View>
                          </Pressable>
                        );
                      })}
                    <Pressable
                      style={({ pressed }) => [
                        styles.addOtherButton,
                        { backgroundColor: pressed ? colors.border : colors.surface, borderColor: colors.primary },
                      ]}
                      onPress={() => setShowOtherInput(true)}
                    >
                      <Ionicons name="add-circle" size={20} color={colors.primary} />
                      <Text style={[styles.addOtherText, { color: colors.primary }]}>Add Custom Option</Text>
                    </Pressable>
                  </>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

// ============================================================================
// SELECT INPUT
// ============================================================================

function SelectInput({ variable, value, onChange, colors }: InputComponentProps) {
  // Use same component as Radio but with a different visual style
  return <RadioInput variable={variable} value={value} onChange={onChange} colors={colors} />;
}

// ============================================================================
// NUMBER INPUT
// ============================================================================

function NumberInput({ variable, value, onChange, colors }: InputComponentProps) {
  const min = variable.customComponent?.min;
  const max = variable.customComponent?.max;
  const step = variable.customComponent?.step || 1;

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = adjustNumberValue(value, step, 'up', min, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = adjustNumberValue(value, step, 'down', min, max);
    onChange(newValue);
  };

  return (
    <View style={[styles.numberContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.numberButton, { borderRightColor: colors.border }]}
        onPress={handleDecrement}
        accessibilityRole="button"
        accessibilityLabel="Decrease value"
      >
        <Ionicons name="remove" size={20} color={colors.text} />
      </TouchableOpacity>
      
      <TextInput
        style={[styles.numberInput, { color: colors.text }]}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        textAlign="center"
      />
      
      <TouchableOpacity
        style={[styles.numberButton, { borderLeftColor: colors.border }]}
        onPress={handleIncrement}
        accessibilityRole="button"
        accessibilityLabel="Increase value"
      >
        <Ionicons name="add" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
  },
  textarea: {
    ...Typography.body,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    minHeight: 100,
  },
  toggleContainer: {
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    ...Typography.body,
    fontSize: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    minHeight: 48,
  },
  selectButtonText: {
    ...Typography.body,
    fontSize: 16,
    flex: 1,
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    overflow: 'hidden',
  },
  numberButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  numberInput: {
    ...Typography.body,
    fontSize: 16,
    flex: 1,
    height: 48,
    paddingHorizontal: Layout.spacing.md,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalCloseButton: {
    minWidth: 60,
  },
  modalCloseText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    ...Typography.headline,
    fontSize: 17,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  radioOption: {
    borderRadius: Layout.radius.md,
    marginBottom: Layout.spacing.xs,
  },
  radioOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    minHeight: 56,
  },
  radioOptionText: {
    ...Typography.body,
    fontSize: 16,
    flex: 1,
    paddingRight: Layout.spacing.md,
  },
  checkboxOption: {
    borderRadius: Layout.radius.md,
    marginBottom: Layout.spacing.xs,
  },
  checkboxOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    minHeight: 56,
  },
  checkboxOptionText: {
    ...Typography.body,
    fontSize: 16,
    flex: 1,
    paddingRight: Layout.spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOtherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    marginTop: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  addOtherText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
  otherInputContainer: {
    padding: Layout.spacing.md,
  },
  otherInput: {
    ...Typography.body,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    minHeight: 100,
    marginBottom: Layout.spacing.md,
  },
  otherSubmitButton: {
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  otherSubmitText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  otherCancelButton: {
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
  },
  otherCancelText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
  },
});
