/**
 * AI Matrx Mobile - Message List Component
 * Scrollable list of chat messages with auto-scroll
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Message } from '@/types/chat';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  streamingMessageId?: string;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  isTyping?: boolean;
  statusMessage?: string | null;
}

export function MessageList({
  messages,
  streamingMessageId,
  onEndReached,
  isLoadingMore,
  isTyping = false,
  statusMessage,
}: MessageListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const flashListRef = useRef<FlashListRef<Message>>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  const renderMessage = React.useCallback(({ item }: { item: Message }) => (
    <ChatBubble
      message={item}
      isStreaming={item.id === streamingMessageId}
    />
  ), [streamingMessageId]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
        Start a conversation
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
        Send a message to begin chatting with the agent
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <Text style={[styles.loadingText, { color: colors.textTertiary }]}>
          Loading more...
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlashList
        ref={flashListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
      />
      <TypingIndicator visible={isTyping} statusMessage={statusMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    // Extra padding at bottom for input
    paddingBottom: 120,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyTitle: {
    ...Typography.headline,
    marginBottom: Layout.spacing.xs,
  },
  emptySubtitle: {
    ...Typography.subhead,
    textAlign: 'center',
  },
  loadingFooter: {
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.caption1,
  },
});
