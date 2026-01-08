/**
 * AI Matrx Mobile - Typing Indicator Component
 * Animated typing indicator for AI responses
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface TypingIndicatorProps {
  visible: boolean;
  statusMessage?: string | null;
}

export const TypingIndicator = React.memo(function TypingIndicator({
  visible,
  statusMessage,
}: TypingIndicatorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      lottieRef.current?.play();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.dotsContainer}>
          {/* Fallback animated dots if Lottie file not available */}
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        </View>
        {statusMessage && (
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {statusMessage}
          </Text>
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    maxWidth: Layout.chat.messageMaxWidth,
    padding: Layout.chat.messagePadding,
    borderRadius: Layout.chat.messageRadius,
    borderBottomLeftRadius: 4,
    marginVertical: Layout.spacing.xs,
    marginHorizontal: Layout.spacing.lg,
  },
  content: {
    flexDirection: 'column',
    gap: Layout.spacing.xs,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...Typography.caption1,
    marginTop: 2,
  },
  lottie: {
    width: 60,
    height: 20,
  },
});
