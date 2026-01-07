/**
 * AI Matrx Mobile - Home Screen
 * Dashboard with quick actions and recent activity
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui';
import { useAuth } from '@/components/providers/AuthProvider';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch latest data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: 'new-chat',
      title: 'New Chat',
      description: 'Start a conversation with an AI agent',
      icon: 'chatbubble-ellipses-outline',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/(tabs)/chat');
      },
    },
    {
      id: 'agents',
      title: 'Browse Agents',
      description: 'Explore available AI agents',
      icon: 'people-outline',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/(tabs)/chat');
      },
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return 'there';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {getUserName()}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.surface }]}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="person" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <Card
                key={action.id}
                variant="elevated"
                onPress={action.onPress}
                style={styles.actionCard}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name={action.icon} size={24} color={colors.primary} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  {action.title}
                </Text>
                <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  {action.description}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Recent Conversations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Conversations
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chat')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Empty state */}
          <Card variant="default" style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                No conversations yet
              </Text>
              <Text style={[styles.emptyDescription, { color: colors.textTertiary }]}>
                Start chatting with an AI agent to see your conversations here
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  greeting: {
    ...Typography.subhead,
  },
  userName: {
    ...Typography.largeTitle,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    ...Typography.title2,
    marginBottom: Layout.spacing.md,
  },
  seeAll: {
    ...Typography.subhead,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  actionCard: {
    flex: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  actionTitle: {
    ...Typography.headline,
    marginBottom: Layout.spacing.xs,
  },
  actionDescription: {
    ...Typography.caption1,
  },
  emptyCard: {
    marginTop: -Layout.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  emptyTitle: {
    ...Typography.headline,
    marginTop: Layout.spacing.md,
  },
  emptyDescription: {
    ...Typography.subhead,
    textAlign: 'center',
    marginTop: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.lg,
  },
});
