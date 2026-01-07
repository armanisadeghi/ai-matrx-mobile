/**
 * AI Matrx Mobile - Tab Layout
 * Native iOS tabs with SF Symbols and Liquid Glass effect
 */

import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Note: NativeTabs is experimental in SDK 54
// Using standard Tabs with native styling for stability
// Uncomment below when NativeTabs is stable:
// import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  // For iOS 26+ with NativeTabs (Liquid Glass), uncomment when stable:
  /*
  if (Platform.OS === 'ios') {
    return (
      <NativeTabs minimizeBehavior="onScrollDown">
        <NativeTabs.Trigger name="index">
          <Label>Home</Label>
          <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="chat">
          <Label>Chat</Label>
          <Icon sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <Label>Settings</Label>
          <Icon sf={{ default: 'gear', selected: 'gear' }} />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }
  */

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          // Native iOS tab bar height
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 34 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      {/* Hide explore from tabs if it exists */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
