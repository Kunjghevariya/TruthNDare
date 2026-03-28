import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../../components/layout/app-screen';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { AppTextInput } from '../../../components/ui/app-text-input';
import { ROUTES } from '../../../constants/routes';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useSession } from '../../../providers/session-provider';
import { normalizeError } from '../../../utils/errors';
import { AuthHero } from '../components/auth-hero';

export default function RegisterScreen() {
  const { isAuthenticated, signUp } = useSession();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROUTES.lobby);
    }
  }, [isAuthenticated]);

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleRegister = async () => {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert('Missing details', 'Fill in username, email, and password to continue.');
      return;
    }

    if (form.password.length < 6) {
      Alert.alert('Weak password', 'Use at least 6 characters for a more reliable account.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Password mismatch', 'Your password confirmation does not match.');
      return;
    }

    setLoading(true);

    try {
      await signUp({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      Alert.alert('Account created', 'You can sign in now with your new account.');
      router.replace(ROUTES.login);
    } catch (error) {
      Alert.alert('Unable to create account', normalizeError(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen gradient="auth">
      <View style={styles.shell}>
        <AuthHero
          eyebrow="Fresh setup"
          title="Create a clean player profile before you host the chaos."
          description="The new account flow validates inputs, keeps the UI consistent, and prepares the session layer for real deployment instead of relying on ad-hoc local state."
        />

        <AppCard style={styles.formCard}>
          <Text style={styles.formTitle}>Register</Text>
          <AppTextInput
            label="Username"
            placeholder="Choose a player name"
            autoCapitalize="none"
            value={form.username}
            onChangeText={(value) => updateField('username', value)}
          />
          <AppTextInput
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(value) => updateField('email', value)}
          />
          <AppTextInput
            label="Password"
            placeholder="At least 6 characters"
            secureTextEntry
            value={form.password}
            onChangeText={(value) => updateField('password', value)}
          />
          <AppTextInput
            label="Confirm password"
            placeholder="Repeat the password"
            secureTextEntry
            value={form.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
          />
          <AppButton label="Create account" onPress={handleRegister} loading={loading} />
          <AppButton label="Back to login" variant="secondary" onPress={() => router.replace(ROUTES.login)} />
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.xl,
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },
  formCard: {
    gap: SPACING.md,
  },
  formTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 28,
  },
});
