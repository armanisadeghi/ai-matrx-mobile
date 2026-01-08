/**
 * AI Matrx Mobile - Markdown Text Component
 * Optimized markdown rendering for AI chat responses
 * 
 * Features:
 * - Theme-based styling (recommended by library)
 * - Performance optimized with memoization
 * - Type-safe implementation
 * - Ready for LaTeX support extension
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Markdown from 'react-native-marked';

interface MarkdownTextProps {
  content: string;
  isUser?: boolean;
}

/**
 * Memoized markdown component for chat messages
 * Optimized for streaming text performance
 * 
 * Uses library best practices:
 * - Memoized styles to prevent re-creation on each render
 * - Type-safe style definitions (no 'as any')
 * - Performance-optimized FlatList props
 * - Proper memoization comparison function
 */
export const MarkdownText = React.memo(
  function MarkdownText({ content, isUser }: MarkdownTextProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];
    const { width: windowWidth } = useWindowDimensions();

    const textColor = isUser ? colors.messageTextUser : colors.messageTextAgent;
    
    // Calculate max content width based on message bubble constraints
    const maxContentWidth = Math.min(
      windowWidth - (Layout.spacing.lg * 4), // Account for padding
      Layout.chat.messageMaxWidth - (Layout.chat.messagePadding * 2)
    );

    // Memoize styles to prevent re-creation on each render
    // This is critical for streaming performance
    const styles = useMemo(
      () => ({
        text: {
          ...Typography.body,
          color: textColor,
          maxWidth: maxContentWidth,
        },
        paragraph: {
          marginBottom: 8,
          maxWidth: maxContentWidth,
        },
        codespan: {
          fontFamily: 'monospace' as const,
          backgroundColor: colors.surface,
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 4,
        },
        code: {
          fontFamily: 'monospace' as const,
          backgroundColor: colors.surface,
          padding: 12,
          borderRadius: 8,
          marginVertical: 8,
          maxWidth: maxContentWidth,
        },
        code_block: {
          fontFamily: 'monospace' as const,
          backgroundColor: colors.surface,
          padding: 12,
          borderRadius: 8,
          marginVertical: 8,
          maxWidth: maxContentWidth,
        },
        blockquote: {
          borderLeftColor: colors.primary,
          borderLeftWidth: 4,
          paddingLeft: 12,
          marginVertical: 8,
          opacity: 0.8,
          maxWidth: maxContentWidth,
        },
        link: {
          color: colors.primary,
          textDecorationLine: 'underline' as const,
        },
        list_item: {
          marginBottom: 4,
          maxWidth: maxContentWidth,
        },
        bullet_list: {
          marginVertical: 4,
          maxWidth: maxContentWidth,
        },
        ordered_list: {
          marginVertical: 4,
          maxWidth: maxContentWidth,
        },
        table: {
          marginVertical: 8,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          maxWidth: maxContentWidth,
        },
        th: {
          backgroundColor: colors.surface,
          padding: 8,
          fontWeight: '600' as const,
          color: textColor,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        td: {
          padding: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          color: textColor,
        },
        tr: {
          flexDirection: 'row' as const,
        },
        hr: {
          backgroundColor: colors.border,
          height: 1,
          marginVertical: 12,
          maxWidth: maxContentWidth,
        },
        strong: {
          fontWeight: '600' as const,
          color: textColor,
        },
        em: {
          fontStyle: 'italic' as const,
          color: textColor,
        },
      }),
      [textColor, colors.surface, colors.border, colors.primary, maxContentWidth]
    );

    return (
      <View style={{ width: '100%', maxWidth: maxContentWidth }}>
        <Markdown
          value={content}
          styles={styles}
          flatListProps={{
            scrollEnabled: false,
            initialNumToRender: 8, // Recommended by library for performance
          }}
        />
      </View>
    );
  },
  // Only re-render when content or user status changes
  (prev, next) => prev.content === next.content && prev.isUser === next.isUser
);
