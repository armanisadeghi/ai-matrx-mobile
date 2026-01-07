/**
 * AI Matrx Mobile - Loading Spinner Component
 * Centered loading indicator with optional message
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'large',
  message,
  fullScreen = false,
  style,
}: LoadingSpinnerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const content = (
    <>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: colors.background },
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.xl,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...Typography.subhead,
    marginTop: Layout.spacing.md,
    textAlign: 'center',
  },
});
