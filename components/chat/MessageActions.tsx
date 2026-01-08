/**
 * AI Matrx Mobile - Message Actions
 * Action buttons for AI messages (TTS, copy, share, etc.)
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface MessageActionsProps {
  messageId: string;
  content: string;
  onRegenerate?: () => void;
}

export const MessageActions = React.memo(function MessageActions({
  messageId,
  content,
  onRegenerate,
}: MessageActionsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTextToSpeech = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement text-to-speech
    setIsSpeaking(!isSpeaking);
    console.log('Text-to-speech not implemented yet');
  };

  const handleCopyMessage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(content);
    // TODO: Show toast notification
  };

  const handleShareMessage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement share functionality
    console.log('Share not implemented yet');
  };

  const handleMoreActions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Copy', 'Share', 'Regenerate', 'Edit and Retry', 'Report'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 5,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              handleCopyMessage();
              break;
            case 2:
              handleShareMessage();
              break;
            case 3:
              onRegenerate?.();
              break;
            case 4:
              // Edit and retry
              console.log('Edit and retry not implemented');
              break;
            case 5:
              // Report
              console.log('Report not implemented');
              break;
          }
        }
      );
    } else {
      // Android - use a simpler alert for now
      Alert.alert('Message Actions', 'Choose an action', [
        { text: 'Copy', onPress: handleCopyMessage },
        { text: 'Share', onPress: handleShareMessage },
        { text: 'Regenerate', onPress: onRegenerate },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Text-to-Speech Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleTextToSpeech}
        accessibilityLabel="Listen to message"
        accessibilityRole="button"
      >
        <Ionicons
          name={isSpeaking ? 'stop-circle' : 'volume-medium'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Copy Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleCopyMessage}
        accessibilityLabel="Copy message"
        accessibilityRole="button"
      >
        <Ionicons name="copy-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleShareMessage}
        accessibilityLabel="Share message"
        accessibilityRole="button"
      >
        <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* More Actions Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleMoreActions}
        accessibilityLabel="More actions"
        accessibilityRole="button"
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    marginTop: Layout.spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
});
