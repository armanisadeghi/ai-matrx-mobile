/**
 * AI Matrx Mobile - Input Component
 * Native iOS-style text input with proper font size for iOS (no zoom)
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      isPassword,
      style,
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const borderColor = error
      ? colors.error
      : isFocused
      ? colors.primary
      : colors.border;

    return (
      <View style={styles.container}>
        {label && (
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </Text>
        )}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor,
              backgroundColor: colors.surface,
            },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.text,
              },
              leftIcon ? styles.inputWithLeftIcon : undefined,
              (rightIcon || isPassword) ? styles.inputWithRightIcon : undefined,
              style,
            ]}
            placeholderTextColor={colors.textTertiary}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={isPassword && !showPassword}
            autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
            autoCorrect={isPassword ? false : props.autoCorrect}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
          {rightIcon && !isPassword && (
            <View style={styles.rightIcon}>{rightIcon}</View>
          )}
        </View>
        {error && (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        )}
        {hint && !error && (
          <Text style={[styles.hint, { color: colors.textTertiary }]}>
            {hint}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.lg,
  },
  label: {
    ...Typography.subhead,
    fontWeight: '500',
    marginBottom: Layout.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.height.input,
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  input: {
    flex: 1,
    ...Typography.body,
    // Minimum 16px font size prevents iOS zoom on focus
    fontSize: Math.max(Typography.body.fontSize ?? 16, 16),
    height: '100%',
    ...Platform.select({
      ios: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    }),
  },
  inputWithLeftIcon: {
    paddingLeft: Layout.spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: Layout.spacing.sm,
  },
  leftIcon: {
    marginRight: Layout.spacing.xs,
  },
  rightIcon: {
    marginLeft: Layout.spacing.xs,
  },
  error: {
    ...Typography.caption1,
    marginTop: Layout.spacing.xs,
  },
  hint: {
    ...Typography.caption1,
    marginTop: Layout.spacing.xs,
  },
});
