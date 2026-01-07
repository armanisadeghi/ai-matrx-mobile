/**
 * AI Matrx Mobile - Typography System
 * Uses system fonts for native iOS/Android feel
 */

import { Platform, TextStyle } from 'react-native';

// System font family (SF Pro on iOS, Roboto on Android)
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography = {
  // Large Title - Used for main screen titles
  largeTitle: {
    fontFamily,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: 0.37,
  } as TextStyle,

  // Title 1 - Primary titles
  title1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: 0.36,
  } as TextStyle,

  // Title 2 - Secondary titles
  title2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.35,
  } as TextStyle,

  // Title 3 - Tertiary titles
  title3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 25,
    letterSpacing: 0.38,
  } as TextStyle,

  // Headline - Emphasized body text
  headline: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.41,
  } as TextStyle,

  // Body - Main content text
  body: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.41,
  } as TextStyle,

  // Callout - Secondary content
  callout: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.32,
  } as TextStyle,

  // Subhead - Section headers
  subhead: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.24,
  } as TextStyle,

  // Footnote - Additional info
  footnote: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.08,
  } as TextStyle,

  // Caption 1 - Small labels
  caption1: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0,
  } as TextStyle,

  // Caption 2 - Extra small labels
  caption2: {
    fontFamily,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 13,
    letterSpacing: 0.07,
  } as TextStyle,
};

export type TypographyVariant = keyof typeof Typography;
