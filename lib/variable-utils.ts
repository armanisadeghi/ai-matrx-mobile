/**
 * AI Matrx Mobile - Variable Utilities
 * Helper functions for formatting and handling agent variables
 */

import { PromptVariable } from '@/types/agent';

/**
 * Convert snake_case or kebab-case to Title Case
 * e.g., "creativity_level" -> "Creativity Level"
 */
export function formatVariableName(name: string): string {
  return name
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Initialize variable values from variable defaults
 * Only includes variables that have a truthy defaultValue
 * Matches web version behavior exactly (line 73 of ChatContainer.tsx)
 */
export function initializeVariableValues(
  variableDefaults: PromptVariable[]
): Record<string, string> {
  const values: Record<string, string> = {};
  variableDefaults.forEach((variable) => {
    // Use truthy check to match web version: if (variable.defaultValue)
    // This excludes: undefined, null, and empty string ''
    // Empty strings are intentionally excluded - they fall back to helpText display
    if (variable.defaultValue) {
      values[variable.name] = variable.defaultValue;
    }
  });
  return values;
}

/**
 * Format variables for display in chat history
 * Returns formatted string like:
 * "Topic: AI for healthcare
 *  Creativity Level: Balanced - Mix of practical and innovative"
 */
export function formatVariablesForDisplay(
  variableDefaults: PromptVariable[],
  variableValues: Record<string, string>
): string {
  const lines: string[] = [];
  
  variableDefaults.forEach((varDef) => {
    const value = variableValues[varDef.name] || varDef.defaultValue || '';
    if (value) {
      const formattedName = formatVariableName(varDef.name);
      lines.push(`${formattedName}: ${value}`);
    }
  });
  
  return lines.join('\n');
}

/**
 * Build complete user input for API submission
 * Combines formatted variables and optional user message text
 */
export function buildUserInputWithVariables(
  variableDefaults: PromptVariable[],
  variableValues: Record<string, string>,
  userMessageText?: string
): string {
  const variableDisplay = formatVariablesForDisplay(variableDefaults, variableValues);
  
  if (userMessageText?.trim()) {
    return variableDisplay ? `${variableDisplay}\n\n${userMessageText}` : userMessageText;
  }
  
  return variableDisplay;
}

/**
 * Parse "Other" option value
 * e.g., "Other: Custom value" -> "Custom value"
 */
export function parseOtherValue(value: string): string | null {
  if (value.startsWith('Other: ')) {
    return value.substring(7);
  }
  return null;
}

/**
 * Format "Other" option value
 * e.g., "Custom value" -> "Other: Custom value"
 */
export function formatOtherValue(customText: string): string {
  return `Other: ${customText}`;
}

/**
 * Parse checkbox value (newline-separated string) into array
 */
export function parseCheckboxValue(value: string): string[] {
  if (!value) return [];
  return value.split('\n').filter((v) => v.trim());
}

/**
 * Format checkbox array into newline-separated string
 */
export function formatCheckboxValue(values: string[]): string {
  return values.join('\n');
}

/**
 * Validate required variables
 * Returns array of missing variable names
 */
export function validateRequiredVariables(
  variableDefaults: PromptVariable[],
  variableValues: Record<string, string>
): string[] {
  const missing: string[] = [];
  
  variableDefaults.forEach((varDef) => {
    if (varDef.required) {
      const value = variableValues[varDef.name];
      if (!value || !value.trim()) {
        missing.push(formatVariableName(varDef.name));
      }
    }
  });
  
  return missing;
}

/**
 * Validate number input against min/max constraints
 */
export function validateNumberInput(
  value: string,
  min?: number,
  max?: number
): { valid: boolean; error?: string } {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, error: `Value must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, error: `Value must be at most ${max}` };
  }
  
  return { valid: true };
}

/**
 * Increment/decrement number with step
 */
export function adjustNumberValue(
  currentValue: string,
  step: number = 1,
  direction: 'up' | 'down',
  min?: number,
  max?: number
): string {
  const current = parseFloat(currentValue) || 0;
  const adjusted = direction === 'up' ? current + step : current - step;
  
  // Apply constraints
  let final = adjusted;
  if (min !== undefined && final < min) final = min;
  if (max !== undefined && final > max) final = max;
  
  // Preserve decimal places from step
  const decimals = step.toString().includes('.') 
    ? step.toString().split('.')[1].length 
    : 0;
  
  return final.toFixed(decimals);
}

/**
 * Determine if a variable value should show count summary vs full text
 * Used for navigation row display
 */
export function shouldShowCountSummary(variable: PromptVariable, value: string): boolean {
  const componentType = variable.customComponent?.type || 'textarea';
  
  // Checkbox always shows count
  if (componentType === 'checkbox') {
    return true;
  }
  
  // For other types, show count if value is very long or multi-line
  if (value.length > 50 || value.includes('\n')) {
    return true;
  }
  
  return false;
}

/**
 * Get display preview for a variable value in navigation rows
 * Smart truncation and summary based on content type
 * 
 * Note: This function expects the value parameter to already have defaultValue
 * applied (via nullish coalescing in the calling code)
 */
export function getVariableDisplayValue(variable: PromptVariable, value: string): string {
  const componentType = variable.customComponent?.type || 'textarea';
  
  // Empty value - show help text as placeholder
  // This matches web version behavior (line 96 of PublicVariableInputs)
  if (!value || value.trim() === '') {
    return variable.helpText || 'Not set';
  }
  
  // Checkbox - show count summary
  if (componentType === 'checkbox') {
    const selected = parseCheckboxValue(value);
    if (selected.length === 0) return variable.helpText || 'None selected';
    if (selected.length === 1) {
      const firstValue = selected[0];
      return firstValue.length > 30 ? `${firstValue.substring(0, 30)}...` : firstValue;
    }
    return `${selected.length} selected`;
  }
  
  // Toggle - show the current state
  if (componentType === 'toggle') {
    return value;
  }
  
  // For all other types (textarea, radio, select, number)
  // Show first line if multi-line, truncate if too long
  const firstLine = value.split('\n')[0];
  
  if (firstLine.length <= 40) {
    return firstLine;
  }
  
  return `${firstLine.substring(0, 40)}...`;
}
