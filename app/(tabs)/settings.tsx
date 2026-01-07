/**
 * AI Matrx Mobile - Settings Screen
 * User settings and app configuration
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppStorage, StorageKeys } from '@/lib/storage';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user, signOut } = useAuth();
  const { requestPermissions, expoPushToken } = useNotifications();

  const [hapticsEnabled, setHapticsEnabled] = React.useState(() => {
    return AppStorage.getBoolean(StorageKeys.HAPTICS_ENABLED) ?? true;
  });
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(() => {
    return AppStorage.getBoolean(StorageKeys.NOTIFICATIONS_ENABLED) ?? false;
  });

  const handleHapticsToggle = (value: boolean) => {
    setHapticsEnabled(value);
    AppStorage.setBoolean(StorageKeys.HAPTICS_ENABLED, value);
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      setNotificationsEnabled(granted);
      AppStorage.setBoolean(StorageKeys.NOTIFICATIONS_ENABLED, granted);
    } else {
      setNotificationsEnabled(false);
      AppStorage.setBoolean(StorageKeys.NOTIFICATIONS_ENABLED, false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await signOut();
          },
        },
      ]
    );
  };

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Preferences',
      items: [
        {
          id: 'haptics',
          title: 'Haptic Feedback',
          subtitle: 'Vibration feedback for interactions',
          icon: 'phone-portrait-outline',
          type: 'toggle',
          value: hapticsEnabled,
          onToggle: handleHapticsToggle,
        },
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: expoPushToken ? 'Enabled' : 'Enable to receive updates',
          icon: 'notifications-outline',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: handleNotificationsToggle,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'version',
          title: 'Version',
          subtitle: '1.0.0',
          icon: 'information-circle-outline',
          type: 'navigation',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'signout',
          title: 'Sign Out',
          icon: 'log-out-outline',
          type: 'action',
          onPress: handleSignOut,
          destructive: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const textColor = item.destructive ? colors.error : colors.text;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.settingItem, { backgroundColor: colors.surface }]}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
        activeOpacity={item.type === 'toggle' ? 1 : 0.7}
      >
        <View style={[styles.settingIcon, { backgroundColor: (item.destructive ? colors.error : colors.primary) + '20' }]}>
          <Ionicons
            name={item.icon}
            size={20}
            color={item.destructive ? colors.error : colors.primary}
          />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: textColor }]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        )}
        {item.type === 'navigation' && (
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* User Info */}
        <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.userInitial}>
              {user?.email?.[0].toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userEmail, { color: colors.text }]}>
              {user?.email || 'user@example.com'}
            </Text>
            <Text style={[styles.userMeta, { color: colors.textTertiary }]}>
              {user?.user_metadata?.full_name || 'AI Matrx User'}
            </Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title.toUpperCase()}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
              {section.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderSettingItem(item)}
                  {index < section.items.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}
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
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  title: {
    ...Typography.largeTitle,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderRadius: Layout.radius.lg,
    marginBottom: Layout.spacing.xl,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    ...Typography.title1,
    color: '#FFFFFF',
  },
  userInfo: {
    marginLeft: Layout.spacing.md,
    flex: 1,
  },
  userEmail: {
    ...Typography.headline,
  },
  userMeta: {
    ...Typography.subhead,
    marginTop: 2,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    ...Typography.caption1,
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
    marginLeft: Layout.spacing.sm,
  },
  sectionContent: {
    borderRadius: Layout.radius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  settingTitle: {
    ...Typography.body,
  },
  settingSubtitle: {
    ...Typography.caption1,
    marginTop: 2,
  },
  separator: {
    height: 0.5,
    marginLeft: 60,
  },
});
