/**
 * AI Matrx Mobile - Drawer Content
 * Custom drawer with search, conversations, and quick actions
 */

import { Colors } from '@/constants/colors';
import { Layout } from '@/constants/layout';
import { Typography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function DrawerContent(props: DrawerContentComponentProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const [searchQuery, setSearchQuery] = useState('');

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newChatId = Date.now().toString();
    props.navigation.closeDrawer();
    router.push(`/(drawer)/chat/${newChatId}` as any);
  };

  const handleChatPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    props.navigation.closeDrawer();
    router.push(`/(drawer)/chat/${id}` as any);
  };

  // Mock conversation data
  const recentConversations = [
    { id: '1', title: 'NYC: The Musical Capital', lastMessage: 'Tell me about...', timestamp: '2h ago' },
    { id: '2', title: 'AI Assistant Offers Help', lastMessage: 'Hello! I\'m AI Matrx...', timestamp: '5h ago' },
    { id: '3', title: 'Teen Trivia Questions and Answers', lastMessage: 'Can you help...', timestamp: '1d ago' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for chats"
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* New Chat Button */}
      <TouchableOpacity
        style={[styles.newChatButton, { backgroundColor: colors.surface }]}
        onPress={handleNewChat}
        accessibilityLabel="New chat"
        accessibilityRole="button"
      >
        <Ionicons name="create-outline" size={24} color={colors.text} />
        <Text style={[styles.newChatText, { color: colors.text }]}>New chat</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Agents Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Agents</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Custom AI agents for specific tasks
          </Text>
        </View>

        {/* Recent Conversations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Chats</Text>

          {recentConversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={[styles.conversationItem, { backgroundColor: colors.surface }]}
              onPress={() => handleChatPress(conversation.id)}
              activeOpacity={0.7}
            >
              <View style={styles.conversationContent}>
                <Text
                  style={[styles.conversationTitle, { color: colors.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {conversation.title}
                </Text>
                <Text
                  style={[styles.conversationMessage, { color: colors.textSecondary }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {conversation.lastMessage}
                </Text>
              </View>
              <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                {conversation.timestamp}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Profile Section */}
      <View style={[styles.profileSection, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>Profile</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              Settings & Account
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Layout.spacing.lg,
    marginVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.radius.xl,
    gap: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    fontSize: 16,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    gap: Layout.spacing.md,
  },
  newChatText: {
    ...Typography.headline,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xs,
  },
  sectionTitle: {
    ...Typography.headline,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    ...Typography.caption1,
    marginTop: Layout.spacing.xs,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    marginTop: Layout.spacing.sm,
  },
  conversationContent: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  conversationTitle: {
    ...Typography.headline,
    fontSize: 15,
    marginBottom: 2,
  },
  conversationMessage: {
    ...Typography.caption1,
    fontSize: 13,
  },
  timestamp: {
    ...Typography.caption2,
    fontSize: 11,
  },
  profileSection: {
    borderTopWidth: 0.5,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.headline,
    fontSize: 16,
  },
  profileEmail: {
    ...Typography.caption1,
    fontSize: 13,
  },
});
