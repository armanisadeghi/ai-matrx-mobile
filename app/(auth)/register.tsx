/**
 * AI Matrx Mobile - Register Screen
 * Native iOS-style registration with Supabase authentication
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

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError(null);
    
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);

    const { error: authError } = await signUp({ email, password, fullName });

    if (authError) {
      setError(authError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={60} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Check your email
          </Text>
          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            We've sent a confirmation link to {email}. Please check your inbox and confirm your email to continue.
          </Text>
          <Button
            title="Back to Sign In"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.successButton}
          />
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign up to get started
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
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.textTertiary} />}
            />

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
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoComplete="new-password"
              hint="Must be at least 8 characters"
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoComplete="new-password"
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Sign In
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
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  header: {
    marginBottom: Layout.spacing.xl,
  },
  backButton: {
    marginBottom: Layout.spacing.lg,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -Layout.spacing.sm,
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
  // Success state
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.xl,
  },
  successTitle: {
    ...Typography.title1,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  successText: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
  },
  successButton: {
    width: '100%',
  },
});
