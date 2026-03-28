import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../../components/layout/app-screen';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { AppTextInput } from '../../../components/ui/app-text-input';
import { ROUTES } from '../../../constants/routes';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useSession } from '../../../providers/session-provider';
import { AuthHero } from '../components/auth-hero';
import { normalizeError } from '../../../utils/errors';

export default function LoginScreen() {
  const { isAuthenticated, isHydrating, signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isHydrating && isAuthenticated) {
      router.replace(ROUTES.lobby);
    }
  }, [isAuthenticated, isHydrating]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please enter both your email and password.');
      return;
    }

    setLoading(true);

    try {
      await signIn({
        email: email.trim().toLowerCase(),
        password,
      });

      router.replace(ROUTES.lobby);
    } catch (error) {
      Alert.alert('Unable to sign in', normalizeError(error).message);
    } finally {
      setLoading(false);
    }
  };

  if (isHydrating) {
    return (
      <AppScreen gradient="auth" scroll={false} contentContainerStyle={styles.loaderWrap}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </AppScreen>
    );
  }

  return (
    <AppScreen gradient="auth">
      <View style={styles.shell}>
        <AuthHero
          eyebrow="Production-ready refresh"
          title="A sharper Truth or Dare lobby, rebuilt for modern devices."
          description="Sign in to create rooms, join live sessions, spin the player wheel, and keep the game state synced without the old brittle screen-by-screen logic."
        />

        <AppCard style={styles.formCard}>
          <Text style={styles.formTitle}>Login</Text>
          <AppTextInput
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <AppTextInput
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <AppButton label="Enter the lobby" onPress={handleLogin} loading={loading} />
          <View style={styles.links}>
            <AppButton label="Create account" variant="secondary" onPress={() => router.push(ROUTES.register)} />
            <AppButton label="Guest mode" variant="ghost" onPress={() => router.push(ROUTES.guest)} />
          </View>
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
    maxWidth: 780,
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
  links: {
    gap: 12,
  },
  loaderWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
