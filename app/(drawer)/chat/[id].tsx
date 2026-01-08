/**
 * AI Matrx Mobile - Chat Screen
 * Main chat interface with messages and input
 */

import { AgentBottomSheet } from '@/components/chat/AgentBottomSheet';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageList } from '@/components/chat/MessageList';
import { ModeBottomSheet } from '@/components/chat/ModeBottomSheet';
import { Colors } from '@/constants/colors';
import { useAgentChat } from '@/hooks/use-agent-chat';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { generateConversationTitle, saveMessage, updateConversation } from '@/lib/conversations';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// Default agent ID for testing
const DEFAULT_AGENT_ID = '35d8f884-5178-4c3e-858d-c5b7adfa186a';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // Initialize agent chat
  const {
    messages,
    currentAgent,
    conversationId,
    isStreaming,
    statusMessage,
    sendMessage,
    setAgent,
    newConversation,
  } = useAgentChat({
    initialAgent: {
      id: DEFAULT_AGENT_ID,
      name: 'Fast',
      promptId: DEFAULT_AGENT_ID,
      variables: [],
    },
  });

  const [selectedAgent, setSelectedAgent] = useState({
    id: DEFAULT_AGENT_ID,
    name: 'Fast',
  });
  const [selectedMode, setSelectedMode] = useState({ id: 'chat', name: 'Chat' });
  const [showAgentSheet, setShowAgentSheet] = useState(false);
  const [showModeSheet, setShowModeSheet] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('New Chat');

  // Update title when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const convertedMessages = messages.map((msg: any) => ({
        ...msg,
        conversationId: id || '',
        createdAt: new Date().toISOString(),
      }));
      const title = generateConversationTitle(convertedMessages);
      setConversationTitle(title);
      if (id) {
        updateConversation(id, { title });
      }
    }
  }, [messages, id]);

  // Save messages to storage
  useEffect(() => {
    if (id && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        const convertedMessage = {
          ...lastMessage,
          conversationId: id,
          createdAt: new Date().toISOString(),
        };
        saveMessage(id, convertedMessage);
      }
    }
  }, [messages, id]);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const handleAgentSelect = useCallback((agent: any) => {
    setSelectedAgent(agent);
    setShowAgentSheet(false);
    setAgent({
      id: agent.id,
      name: agent.name,
      promptId: agent.id,
      variables: [],
    });
  }, [setAgent]);

  const handleModeSelect = useCallback((mode: any) => {
    setSelectedMode(mode);
    setShowModeSheet(false);
  }, []);

  const handleAttachFile = useCallback(() => {
    // TODO: Open file picker action sheet
    console.log('File attachment not implemented yet');
  }, []);

  const handleVoiceRecord = useCallback(() => {
    // TODO: Start voice recording
    console.log('Voice recording not implemented yet');
  }, []);

  const handleNewChat = useCallback(() => {
    const newChatId = Date.now().toString();
    router.push(`/(drawer)/chat/${newChatId}` as any);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <ChatHeader
          title={conversationTitle}
          onNewChatPress={handleNewChat}
        />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <MessageList
            messages={messages as any}
            streamingMessageId={isStreaming ? messages[messages.length - 1]?.id : undefined}
            isTyping={isStreaming}
            statusMessage={statusMessage}
          />

          <ChatInput
            onSend={handleSend}
            isSending={isStreaming}
            selectedAgent={selectedAgent}
            onAgentSelect={() => setShowAgentSheet(true)}
            onModeSelect={() => setShowModeSheet(true)}
            onAttachFile={handleAttachFile}
            onVoiceRecord={handleVoiceRecord}
          />
        </KeyboardAvoidingView>

        {/* Agent Selection Bottom Sheet */}
        <AgentBottomSheet
          visible={showAgentSheet}
          selectedAgentId={selectedAgent.id}
          onSelect={handleAgentSelect}
          onClose={() => setShowAgentSheet(false)}
        />

        {/* Mode Selection Bottom Sheet */}
        <ModeBottomSheet
          visible={showModeSheet}
          selectedModeId={selectedMode.id}
          onSelect={handleModeSelect}
          onClose={() => setShowModeSheet(false)}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
});
