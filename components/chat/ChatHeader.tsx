/**
 * AI Matrx Mobile - Chat Header
 * Native header with drawer toggle and new chat button
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChatHeaderProps {
  title: string;
  onMenuPress?: () => void;
  onNewChatPress?: () => void;
}

export const ChatHeader = React.memo(function ChatHeader({
  title,
  onMenuPress,
  onNewChatPress,
}: ChatHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.toggleDrawer();
    onMenuPress?.();
  };

  const handleNewChatPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNewChatPress?.();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.menuButton,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.text,
          },
        ]}
        onPress={handleMenuPress}
        accessibilityLabel="Open menu"
        accessibilityRole="button"
      >
        <Ionicons name="menu" size={24} color={colors.text} />
      </TouchableOpacity>

      <View
        style={[
          styles.titleContainer,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.text,
          },
        ]}
      >
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.newChatButton,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.text,
          },
        ]}
        onPress={handleNewChatPress}
        accessibilityLabel="New chat"
        accessibilityRole="button"
      >
        <Ionicons name="create-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  titleContainer: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    marginHorizontal: Layout.spacing.sm,
    borderRadius: 22,
    paddingHorizontal: Layout.spacing.lg,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    ...Typography.headline,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  newChatButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
