/**
 * AI Matrx Mobile - Chat Bubble Component
 * Message bubble with native iOS styling
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Message } from '@/types/chat';

interface ChatBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatBubble({ message, isStreaming }: ChatBubbleProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const isUser = message.role === 'user';
  
  const bubbleStyle = isUser
    ? { backgroundColor: colors.messageBubbleUser }
    : { backgroundColor: colors.messageBubbleAgent };
    
  const textStyle = isUser
    ? { color: colors.messageTextUser }
    : { color: colors.messageTextAgent };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.agentContainer]}>
      <View style={[styles.bubble, bubbleStyle, isUser ? styles.userBubble : styles.agentBubble]}>
        <Text style={[styles.messageText, textStyle]}>
          {message.content}
          {isStreaming && <Text style={styles.cursor}>▋</Text>}
        </Text>
      </View>
      <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Layout.spacing.xs,
    maxWidth: Layout.chat.messageMaxWidth,
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  agentContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    padding: Layout.chat.messagePadding,
    borderRadius: Layout.chat.messageRadius,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...Typography.body,
  },
  timestamp: {
    ...Typography.caption2,
    marginTop: Layout.spacing.xs,
    marginHorizontal: Layout.spacing.xs,
  },
  cursor: {
    opacity: 0.7,
  },
});
