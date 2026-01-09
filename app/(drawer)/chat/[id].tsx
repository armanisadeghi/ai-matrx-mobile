/**
 * AI Matrx Mobile - Chat Screen
 * Main chat interface with messages and input
 */

import { AgentBottomSheet } from '@/components/chat/AgentBottomSheet';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageList } from '@/components/chat/MessageList';
import { ModeBottomSheet } from '@/components/chat/ModeBottomSheet';
import { DEFAULT_AGENTS } from '@/constants/agents';
import { Colors } from '@/constants/colors';
import { useAgentChat } from '@/hooks/use-agent-chat';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { generateConversationTitle, saveMessage, updateConversation } from '@/lib/conversations';
import { AgentOption } from '@/types/agent';
import { useDrawerStatus } from '@react-navigation/drawer';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const drawerStatus = useDrawerStatus();

  // Initialize agent chat with first default agent
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
    initialAgent: DEFAULT_AGENTS[0],
  });

  const [selectedAgent, setSelectedAgent] = useState<AgentOption>(DEFAULT_AGENTS[0]);
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

  const handleAgentSelect = useCallback((agent: AgentOption) => {
    setSelectedAgent(agent);
    setShowAgentSheet(false);
    setAgent(agent);
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
    // Clear current conversation state
    newConversation();
    setConversationTitle('New Chat');
    
    // Navigate to new chat with new ID
    const newChatId = Date.now().toString();
    router.push(`/(drawer)/chat/${newChatId}` as any);
  }, [newConversation]);

  const isDrawerOpen = drawerStatus === 'open';

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

        <View style={styles.contentView}>
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
        </View>

        {/* Dim overlay when drawer is open */}
        {isDrawerOpen && (
          <View
            style={[
              styles.dimOverlay,
              { backgroundColor: colors.text },
            ]}
            pointerEvents="none"
          />
        )}

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
  contentView: {
    flex: 1,
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
});
