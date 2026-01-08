/**
 * AI Matrx Mobile - Chat Input Component
 * Native iOS-style message input with attachment support
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
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

interface Agent {
  id: string;
  name: string;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  onAttachment?: (uri: string) => void;
  isSending?: boolean;
  placeholder?: string;
  selectedAgent?: Agent;
  onAgentSelect?: () => void;
  onModeSelect?: () => void;
  onAttachFile?: () => void;
  onVoiceRecord?: () => void;
}

export function ChatInput({
  onSend,
  onAttachment,
  isSending = false,
  placeholder = 'Ask Matrx',
  selectedAgent = { id: 'default', name: 'Fast' },
  onAgentSelect,
  onModeSelect,
  onAttachFile,
  onVoiceRecord,
}: ChatInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const inputRef = useRef<TextInput>(null);
  
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(Layout.chat.inputMinHeight);

  const handleSend = () => {
    if (!message.trim() || isSending) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(message.trim());
    setMessage('');
    setInputHeight(Layout.chat.inputMinHeight);
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
    const newHeight = Math.min(
      Math.max(height, Layout.chat.inputMinHeight),
      Layout.chat.inputMaxHeight
    );
    setInputHeight(newHeight);
  };

  const canSend = message.trim().length > 0 && !isSending;
  const insets = useSafeAreaInsets();

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
      <BlurView intensity={80} tint={colorScheme ?? 'dark'} style={styles.blurContainer}>
        <View style={[styles.container, { borderTopColor: colors.border }]}>
          {/* Input placeholder with icon */}
          <View style={styles.inputRow}>
            <View style={styles.placeholderRow}>
              <Ionicons name="shield-checkmark" size={20} color={colors.textSecondary} />
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
              <Text style={[styles.agentText, { color: colors.text }]}>{selectedAgent.name}</Text>
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

            {/* Send button */}
            {message.trim().length > 0 && (
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: colors.primary }]}
                onPress={handleSend}
                disabled={!canSend}
                accessibilityLabel="Send message"
                accessibilityRole="button"
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    width: '100%',
  },
  container: {
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    paddingTop: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  inputRow: {
    marginBottom: Layout.spacing.sm,
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
  },
  input: {
    ...Typography.body,
    fontSize: 16, // Prevent iOS zoom
    lineHeight: 22,
    flex: 1,
    maxHeight: Layout.chat.inputMaxHeight,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    borderWidth: 0,
    outlineWidth: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    paddingTop: Layout.spacing.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  agentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.radius.xl,
    height: 36,
  },
  agentText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
