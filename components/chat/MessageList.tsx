/**
 * AI Matrx Mobile - Message List Component
 * Scrollable list of chat messages with auto-scroll
 */

import React, { useRef, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChatBubble } from './ChatBubble';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  streamingMessageId?: string;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
}

export function MessageList({
  messages,
  streamingMessageId,
  onEndReached,
  isLoadingMore,
}: MessageListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble
      message={item}
      isStreaming={item.id === streamingMessageId}
    />
  );

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
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
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        inverted={false}
      />
    </KeyboardAvoidingView>
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
