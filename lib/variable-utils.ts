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
 */
export function initializeVariableValues(
  variableDefaults: PromptVariable[]
): Record<string, string> {
  const values: Record<string, string> = {};
  variableDefaults.forEach((variable) => {
    values[variable.name] = variable.defaultValue;
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
