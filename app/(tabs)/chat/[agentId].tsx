/**
 * AI Matrx Mobile - Agent Chat Conversation Screen
 * Chat interface with agent-specific variable inputs
 */

import { ChatInput } from '@/components/chat/ChatInput';
import { MessageList } from '@/components/chat/MessageList';
import { VariableInputList } from '@/components/chat/VariableInputList';
import { getAgentById } from '@/constants/agents';
import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useAgentChat } from '@/hooks/use-agent-chat';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { buildUserInputWithVariables, initializeVariableValues } from '@/lib/variable-utils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AgentConversationScreen() {
  const { agentId } = useLocalSearchParams<{ agentId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // Get agent configuration
  const agent = getAgentById(agentId || '');
  
  if (!agent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Error',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>Agent not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const variableDefaults = agent.variableDefaults || [];
  const hasVariables = variableDefaults.length > 0;

  // Initialize chat hook
  const {
    messages,
    isStreaming,
    statusMessage,
    sendMessage,
  } = useAgentChat({
    initialAgent: agent,
  });

  // Variable state
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() =>
    initializeVariableValues(variableDefaults)
  );
  const [isVariablesExpanded, setIsVariablesExpanded] = useState(true);

  // Collapse variables after first message
  useEffect(() => {
    if (messages.length > 0 && isVariablesExpanded) {
      setIsVariablesExpanded(false);
    }
  }, [messages.length]);

  const handleSend = useCallback(
    (messageText: string) => {
      // Build complete user input with variables
      const userInput = hasVariables
        ? buildUserInputWithVariables(variableDefaults, variableValues, messageText)
        : messageText;

      // Send message with variables
      sendMessage(userInput, {
        variables: hasVariables ? variableValues : undefined,
      });
    },
    [variableValues, variableDefaults, hasVariables, sendMessage]
  );

  const handleVariablesChange = useCallback((values: Record<string, string>) => {
    setVariableValues(values);
  }, []);

  const handleToggleVariables = useCallback(() => {
    setIsVariablesExpanded((prev) => !prev);
  }, []);

  const hasMessages = messages.length > 0;
  const placeholderText = hasVariables && !hasMessages
    ? 'Enter your message (or press send to use variables only)'
    : 'Ask Matrx';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: agent.name,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerBackTitle: 'Agents',
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <MessageList
          messages={messages as any}
          streamingMessageId={isStreaming ? messages[messages.length - 1]?.id : undefined}
          isTyping={isStreaming}
          statusMessage={statusMessage}
        />

        {/* Variable inputs - Always visible when agent has variables */}
        {hasVariables && (
          <View style={[styles.variablesContainer, { backgroundColor: colors.background }]}>
            <VariableInputList
              variableDefaults={variableDefaults}
              onValuesChange={handleVariablesChange}
              initialValues={variableValues}
              isExpanded={isVariablesExpanded}
              onToggleExpanded={handleToggleVariables}
              hasMessages={hasMessages}
            />
          </View>
        )}

        {/* Chat input */}
        <ChatInput
          onSend={handleSend}
          isSending={isStreaming}
          placeholder={placeholderText}
          selectedAgent={agent}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.xl,
    gap: Layout.spacing.md,
  },
  errorText: {
    ...Typography.headline,
    textAlign: 'center',
  },
  variablesContainer: {
    // Minimal container - the component handles its own styling
  },
});
