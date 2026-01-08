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
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useMemo } from 'react';
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

    const textColor = isUser ? colors.messageTextUser : colors.messageTextAgent;

    // Memoize styles to prevent re-creation on each render
    // This is critical for streaming performance
    const styles = useMemo(
      () => ({
        text: {
          ...Typography.body,
          color: textColor,
        },
        paragraph: {
          marginBottom: 8,
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
        },
        blockquote: {
          borderLeftColor: colors.primary,
          borderLeftWidth: 4,
          paddingLeft: 12,
          marginVertical: 8,
          opacity: 0.8,
        },
        link: {
          color: colors.primary,
          textDecorationLine: 'underline' as const,
        },
        list_item: {
          marginBottom: 4,
        },
        bullet_list: {
          marginVertical: 4,
        },
        ordered_list: {
          marginVertical: 4,
        },
        hr: {
          backgroundColor: colors.border,
          height: 1,
          marginVertical: 12,
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
      [textColor, colors.surface, colors.border, colors.primary]
    );

    return (
      <Markdown
        value={content}
        styles={styles}
        flatListProps={{
          scrollEnabled: false,
          initialNumToRender: 8, // Recommended by library for performance
        }}
      />
    );
  },
  // Only re-render when content or user status changes
  (prev, next) => prev.content === next.content && prev.isUser === next.isUser
);
