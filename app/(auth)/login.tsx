/**
 * AI Matrx Mobile - Login Screen
 * Native iOS-style login with Supabase authentication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/components/providers/AuthProvider';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Layout } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: authError } = await signIn({ email, password });

    if (authError) {
      setError(authError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
              <Ionicons name="cube" size={40} color="#FFFFFF" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              AI Matrx
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textTertiary} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoComplete="password"
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.spacing.xl,
    paddingTop: Layout.spacing.xxxl,
    paddingBottom: Layout.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: Layout.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.lg,
  },
  title: {
    ...Typography.largeTitle,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    ...Typography.body,
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.radius.md,
    marginBottom: Layout.spacing.lg,
  },
  errorText: {
    ...Typography.subhead,
    marginLeft: Layout.spacing.sm,
    flex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Layout.spacing.xl,
    marginTop: -Layout.spacing.sm,
  },
  forgotPasswordText: {
    ...Typography.subhead,
    fontWeight: '500',
  },
  button: {
    marginTop: Layout.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.xl,
  },
  footerText: {
    ...Typography.body,
  },
  footerLink: {
    ...Typography.body,
    fontWeight: '600',
  },
});
