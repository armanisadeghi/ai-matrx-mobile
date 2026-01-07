/**
 * AI Matrx Mobile - Layout Constants
 * Consistent spacing and sizing throughout the app
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Layout = {
  // Screen dimensions
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  // Safe area defaults (actual values should come from useSafeAreaInsets)
  safeArea: {
    top: Platform.OS === 'ios' ? 47 : 24,
    bottom: Platform.OS === 'ios' ? 34 : 0,
  },

  // Standard spacing scale (based on 4px grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Border radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  // Component heights
  height: {
    button: 50,
    buttonSmall: 36,
    input: 50,
    inputMultiline: 100,
    header: 44,
    tabBar: 49,
    listItem: 44,
    avatar: {
      sm: 32,
      md: 40,
      lg: 56,
      xl: 80,
    },
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
  },

  // Chat specific
  chat: {
    messagePadding: 12,
    messageRadius: 18,
    messageMaxWidth: SCREEN_WIDTH * 0.75,
    inputMinHeight: 36,
    inputMaxHeight: 120,
  },

  // Animation durations (ms)
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
};

export type SpacingKey = keyof typeof Layout.spacing;
export type RadiusKey = keyof typeof Layout.radius;
