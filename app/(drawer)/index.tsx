/**
 * AI Matrx Mobile - Drawer Index
 * Redirects to new chat or latest conversation
 */

import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function DrawerIndex() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  useEffect(() => {
    // Delay navigation to ensure the navigation tree is mounted
    const timer = setTimeout(() => {
      // TODO: Check for recent conversations and redirect to latest
      // For now, create a new chat
      const newChatId = Date.now().toString();
      router.replace(`/(drawer)/chat/${newChatId}` as any);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
