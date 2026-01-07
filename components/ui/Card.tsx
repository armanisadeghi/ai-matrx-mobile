/**
 * AI Matrx Mobile - Card Component
 * Elevated surface container with native iOS styling
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: TouchableOpacityProps['onPress'];
  haptic?: boolean;
}

export function Card({
  children,
  style,
  variant = 'default',
  onPress,
  haptic = true,
}: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const cardStyles = getCardStyles(variant, colors);

  const handlePress = (event: any) => {
    if (haptic && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.base, cardStyles, style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.base, cardStyles, style]}>{children}</View>;
}

function getCardStyles(
  variant: CardProps['variant'],
  colors: typeof Colors.dark
): ViewStyle {
  switch (variant) {
    case 'elevated':
      return {
        backgroundColor: colors.surfaceElevated,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      };
    case 'outlined':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      };
    default:
      return {
        backgroundColor: colors.surface,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Layout.radius.lg,
    padding: Layout.spacing.lg,
  },
});
