/**
 * AI Matrx Mobile - Root Layout
 * App entry point with providers and auth state management
 */

import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import { Colors } from '@/constants/colors';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(auth)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // User is signed in but on auth screen, redirect to main app
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      // User is not signed in but trying to access protected route
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, segments]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Custom themes with our colors
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Modal' 
          }} 
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RootLayoutNav />
      </NotificationProvider>
    </AuthProvider>
  );
}
