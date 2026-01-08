/**
 * AI Matrx Mobile - Chat Bubble Component
 * Message bubble with native iOS styling
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Message } from '@/types/chat';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MarkdownText } from './MarkdownText';
import { MessageActions } from './MessageActions';

interface ChatBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatBubble = React.memo(function ChatBubble({ message, isStreaming }: ChatBubbleProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  const isUser = message.role === 'user';
  
  const bubbleStyle = isUser
    ? { backgroundColor: colors.messageBubbleUser }
    : { backgroundColor: colors.messageBubbleAgent };
    
  const textStyle = isUser
    ? { color: colors.messageTextUser }
    : { color: colors.messageTextAgent };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.agentContainer]}>
      <View style={[styles.bubble, bubbleStyle, isUser ? styles.userBubble : styles.agentBubble]}>
        {isUser ? (
          <Text style={[styles.messageText, textStyle]}>
            {message.content}
          </Text>
        ) : (
          <View>
            <MarkdownText content={message.content} isUser={isUser} />
            {isStreaming && <Text style={[styles.cursor, textStyle]}>▋</Text>}
          </View>
        )}
      </View>
      
      {/* Show actions for AI messages only, not during streaming */}
      {!isUser && !isStreaming && (
        <MessageActions
          messageId={message.id}
          content={message.content}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: Layout.spacing.xs,
    maxWidth: Layout.chat.messageMaxWidth,
    width: '100%',
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
    maxWidth: '100%',
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
  cursor: {
    opacity: 0.7,
  },
});
