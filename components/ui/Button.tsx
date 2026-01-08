/**
 * AI Matrx Mobile - Button Component
 * Native iOS-style button with haptic feedback
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: boolean;
}

export const Button = React.memo(function Button({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  leftIcon,
  rightIcon,
  haptic = true,
  disabled,
  onPress,
  style,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const handlePress = (event: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
    if (haptic && !disabled && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const buttonStyles = getButtonStyles(variant, size, colors, disabled || isLoading);
  const textStyles = getTextStyles(variant, size, colors, disabled || isLoading);

  return (
    <TouchableOpacity
      style={[styles.base, buttonStyles, style]}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#FFFFFF' : colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.text, textStyles, leftIcon ? styles.textWithLeftIcon : undefined, rightIcon ? styles.textWithRightIcon : undefined]}>
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
});

function getButtonStyles(
  variant: ButtonProps['variant'],
  size: ButtonProps['size'],
  colors: typeof Colors.dark,
  isDisabled: boolean
): ViewStyle {
  const baseStyle: ViewStyle = {
    height: size === 'small' ? Layout.height.buttonSmall : Layout.height.button,
    paddingHorizontal: size === 'small' ? Layout.spacing.md : Layout.spacing.xl,
    borderRadius: Layout.radius.md,
    opacity: isDisabled ? 0.5 : 1,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: colors.primary,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      };
    case 'ghost':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
      };
    case 'destructive':
      return {
        ...baseStyle,
        backgroundColor: colors.error,
      };
    default:
      return baseStyle;
  }
}

function getTextStyles(
  variant: ButtonProps['variant'],
  size: ButtonProps['size'],
  colors: typeof Colors.dark,
  isDisabled: boolean
): TextStyle {
  const baseStyle: TextStyle = {
    ...Typography.headline,
    fontSize: size === 'small' ? 15 : 17,
  };

  switch (variant) {
    case 'primary':
    case 'destructive':
      return {
        ...baseStyle,
        color: '#FFFFFF',
      };
    case 'secondary':
      return {
        ...baseStyle,
        color: colors.text,
      };
    case 'ghost':
      return {
        ...baseStyle,
        color: colors.primary,
      };
    default:
      return baseStyle;
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  textWithLeftIcon: {
    marginLeft: Layout.spacing.sm,
  },
  textWithRightIcon: {
    marginRight: Layout.spacing.sm,
  },
});
