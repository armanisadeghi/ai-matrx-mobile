/**
 * AI Matrx Mobile - Markdown Text Component
 * Optimized markdown rendering for AI chat responses
 */

import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet } from 'react-native';
import Markdown from 'react-native-marked';

interface MarkdownTextProps {
  content: string;
  isUser?: boolean;
}

/**
 * Memoized markdown component for chat messages
 * Optimized for streaming text performance
 */
export const MarkdownText = React.memo(
  function MarkdownText({ content, isUser }: MarkdownTextProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

    const textColor = isUser ? colors.messageTextUser : colors.messageTextAgent;

    return (
      <Markdown
        value={content}
        flatListProps={{
          scrollEnabled: false,
        }}
        styles={{
          text: {
            ...Typography.body,
            color: textColor,
          },
          paragraph: {
            marginBottom: 8,
          },
          codespan: {
            fontFamily: 'monospace',
            backgroundColor: colors.surface,
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 4,
          },
          code: {
            fontFamily: 'monospace',
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
            textDecorationLine: 'underline',
          },
          list_item: {
            flexDirection: 'row',
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
            fontWeight: '600',
            color: textColor,
          },
          em: {
            fontStyle: 'italic',
            color: textColor,
          },
        } as any}
      />
    );
  },
  // Only re-render when content actually changes
  (prev, next) => prev.content === next.content && prev.isUser === next.isUser
);

const styles = StyleSheet.create({
  // Styles are defined inline in the Markdown component
  // This is here for consistency with other components
});
