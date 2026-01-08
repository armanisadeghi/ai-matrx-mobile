/**
 * AI Matrx Mobile - Color System
 * Designed for native iOS feel with dark mode primary
 */

export const Colors = {
  light: {
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F2F2F7',
    surfaceElevated: '#FFFFFF',
    
    // Text
    text: '#000000',
    textSecondary: '#3C3C43',
    textTertiary: '#8E8E93',
    
    // Brand
    primary: '#0A84FF',
    primaryPressed: '#0077ED',
    
    // Semantic
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5856D6',
    
    // UI Elements
    border: '#C6C6C8',
    borderLight: '#E5E5EA',
    separator: '#C6C6C8',
    
    // Interactive
    tint: '#0A84FF',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#0A84FF',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.4)',
    
    // Chat specific
    messageBubbleUser: '#0A84FF',
    messageBubbleAgent: 'transparent',
    messageTextUser: '#FFFFFF',
    messageTextAgent: '#000000',
  },
  dark: {
    // Backgrounds
    background: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textTertiary: '#8E8E93',
    
    // Brand
    primary: '#0A84FF',
    primaryPressed: '#409CFF',
    
    // Semantic
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#5E5CE6',
    
    // UI Elements
    border: '#38383A',
    borderLight: '#48484A',
    separator: '#38383A',
    
    // Interactive
    tint: '#0A84FF',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#0A84FF',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.6)',
    
    // Chat specific
    messageBubbleUser: '#0A84FF',
    messageBubbleAgent: 'transparent',
    messageTextUser: '#FFFFFF',
    messageTextAgent: '#FFFFFF',
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorName = keyof typeof Colors.light;
