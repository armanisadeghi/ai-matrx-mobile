/**
 * AI Matrx Mobile - Chat Input Component
 * Native iOS-style message input with attachment support
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AgentOption } from '@/types/agent';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatInputProps {
  onSend: (message: string) => void;
  onAttachment?: (uri: string) => void;
  isSending?: boolean;
  placeholder?: string;
  selectedAgent?: AgentOption;
  onAgentSelect?: () => void;
  onModeSelect?: () => void;
  onAttachFile?: () => void;
  onVoiceRecord?: () => void;
  hasVariableValues?: boolean; // Allow sending with empty message if variables have values
}

export function ChatInput({
  onSend,
  onAttachment,
  isSending = false,
  placeholder = 'Ask Matrx',
  selectedAgent,
  onAgentSelect,
  onModeSelect,
  onAttachFile,
  onVoiceRecord,
  hasVariableValues = false,
}: ChatInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const inputRef = useRef<TextInput>(null);
  
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(20); // Start with single line (lineHeight)

  const handleSend = () => {
    // Allow sending if: (message has content) OR (has variable values)
    if ((!message.trim() && !hasVariableValues) || isSending) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(message.trim());
    setMessage('');
    setInputHeight(20); // Reset to single line height
  };

  const handleAttachFile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAttachFile?.();
  };

  const handleVoiceRecord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onVoiceRecord?.();
  };

  const handleAgentSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAgentSelect?.();
  };

  const handleModeSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onModeSelect?.();
  };

  const handleContentSizeChange = (event: { nativeEvent: { contentSize: { height: number } } }) => {
    const { height } = event.nativeEvent.contentSize;
    const lineHeight = 20;
    const maxRows = 8;
    const maxHeight = lineHeight * maxRows; // 160px for 8 lines of text
    
    // Let the input grow naturally based on content
    const newHeight = Math.max(Math.min(height, maxHeight), lineHeight);
    setInputHeight(newHeight);
  };

  // Can send if: (has message text) OR (has variable values)
  const canSend = (message.trim().length > 0 || hasVariableValues) && !isSending;
  const insets = useSafeAreaInsets();

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
      <BlurView intensity={80} tint={colorScheme ?? 'dark'} style={styles.blurContainer}>
        <View style={[
          styles.container, 
          { 
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom || (Platform.OS === 'ios' ? 8 : 16)
          }
        ]}>
          {/* Input text area */}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.text, height: inputHeight }]}
              value={message}
              onChangeText={setMessage}
              placeholder={placeholder}
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={4000}
              onContentSizeChange={handleContentSizeChange}
              returnKeyType="default"
              blurOnSubmit={false}
              editable={!isSending}
            />
          </View>

          {/* Action buttons row */}
          <View style={styles.actionsRow}>
            {/* Add files/photos button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAttachFile}
              accessibilityLabel="Add attachment"
              accessibilityRole="button"
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Mode selector button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleModeSelect}
              accessibilityLabel="Select mode"
              accessibilityRole="button"
            >
              <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Agent selector button */}
            <TouchableOpacity
              style={[styles.agentButton, { backgroundColor: colors.surface }]}
              onPress={handleAgentSelect}
              accessibilityLabel="Select agent"
              accessibilityRole="button"
            >
              <Ionicons name="flash" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text 
                style={[styles.agentText, { color: colors.text }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedAgent?.name || 'Select Agent'}
              </Text>
            </TouchableOpacity>

            {/* Spacer */}
            <View style={styles.spacer} />

            {/* Voice record button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVoiceRecord}
              accessibilityLabel="Voice input"
              accessibilityRole="button"
            >
              <Ionicons name="mic-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Realtime button (placeholder) */}
            <TouchableOpacity
              style={styles.actionButton}
              accessibilityLabel="Realtime chat"
              accessibilityRole="button"
              disabled
            >
              <Ionicons name="videocam-outline" size={24} color={colors.textTertiary} />
            </TouchableOpacity>

            {/* Send button - always visible */}
            <TouchableOpacity
              style={[
                styles.sendButton, 
                { 
                  backgroundColor: canSend ? colors.primary : colors.surface,
                  opacity: canSend ? 1 : 0.4
                }
              ]}
              onPress={handleSend}
              disabled={!canSend}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons 
                  name="arrow-up" 
                  size={20} 
                  color={canSend ? "#FFFFFF" : colors.textTertiary} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    width: '100%',
    borderTopLeftRadius: Layout.radius.xl,
    borderTopRightRadius: Layout.radius.xl,
    overflow: 'hidden',
  },
  container: {
    paddingTop: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: Layout.radius.xl,
    borderTopRightRadius: Layout.radius.xl,
  },
  inputRow: {
    marginBottom: Layout.spacing.sm,
  },
  input: {
    ...Typography.body,
    fontSize: 16, // Prevent iOS zoom
    lineHeight: 20,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    paddingHorizontal: Layout.spacing.md,
    borderWidth: 0,
    outlineWidth: 0,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    paddingTop: Layout.spacing.xs,
    paddingRight: Layout.spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  agentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.radius.xl,
    height: 36,
    maxWidth: 140, // Prevent agent name from pushing send button off screen
  },
  agentText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    // Ensure icon is properly centered and not cut off
    overflow: 'visible',
  },
});
