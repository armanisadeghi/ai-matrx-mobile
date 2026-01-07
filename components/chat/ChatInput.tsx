/**
 * AI Matrx Mobile - Chat Input Component
 * Native iOS-style message input with attachment support
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { pickImage, takePhoto } from '@/lib/permissions';

interface ChatInputProps {
  onSend: (message: string) => void;
  onAttachment?: (uri: string) => void;
  isSending?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onAttachment,
  isSending = false,
  placeholder = 'Message...',
}: ChatInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const inputRef = useRef<TextInput>(null);
  
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(Layout.chat.inputMinHeight);
  const [showActions, setShowActions] = useState(false);

  const handleSend = () => {
    if (!message.trim() || isSending) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(message.trim());
    setMessage('');
    setInputHeight(Layout.chat.inputMinHeight);
  };

  const handlePickImage = async () => {
    const image = await pickImage();
    if (image && onAttachment) {
      onAttachment(image.uri);
    }
    setShowActions(false);
  };

  const handleTakePhoto = async () => {
    const photo = await takePhoto();
    if (photo && onAttachment) {
      onAttachment(photo.uri);
    }
    setShowActions(false);
  };

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.min(
      Math.max(height, Layout.chat.inputMinHeight),
      Layout.chat.inputMaxHeight
    );
    setInputHeight(newHeight);
  };

  const canSend = message.trim().length > 0 && !isSending;

  return (
    <BlurView intensity={80} tint={colorScheme ?? 'dark'} style={styles.blurContainer}>
      <View style={[styles.container, { borderTopColor: colors.border }]}>
        {/* Attachment actions */}
        {showActions && (
          <View style={[styles.actionsRow, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={styles.actionButton} onPress={handlePickImage}>
              <Ionicons name="images" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputRow}>
          {/* Attachment button */}
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowActions(!showActions);
            }}
          >
            <Ionicons
              name={showActions ? 'close' : 'add'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>

          {/* Input field */}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { color: colors.text, height: inputHeight },
              ]}
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

          {/* Send button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: canSend ? colors.primary : colors.surface },
            ]}
            onPress={handleSend}
            disabled={!canSend}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name="arrow-up"
                size={20}
                color={canSend ? '#FFFFFF' : colors.textTertiary}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    borderTopWidth: 0.5,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.radius.md,
    marginBottom: Layout.spacing.sm,
    gap: Layout.spacing.md,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.radius.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Layout.spacing.sm,
  },
  attachButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    borderRadius: Layout.radius.xl,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    minHeight: Layout.chat.inputMinHeight + Layout.spacing.sm,
  },
  input: {
    ...Typography.body,
    fontSize: 16, // Prevent iOS zoom
    lineHeight: 20,
    maxHeight: Layout.chat.inputMaxHeight,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
