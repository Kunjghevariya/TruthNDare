import React, { useState } from 'react';
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

const createGuestName = () => `guest-${Math.random().toString(36).slice(2, 7)}`;

export default function GuestScreen() {
  const { continueAsGuest } = useSession();
  const [username, setUsername] = useState(createGuestName());
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Missing username', 'Pick a temporary player name before continuing.');
      return;
    }

    setLoading(true);

    try {
      await continueAsGuest({ username: username.trim().toLowerCase() });
      router.replace(ROUTES.lobby);
    } catch (error) {
      Alert.alert('Unable to continue', normalizeError(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen gradient="auth">
      <View style={styles.shell}>
        <AuthHero
          eyebrow="Quick play"
          title="Jump in fast with a disposable guest identity."
          description="Guest mode is now a real authenticated session, so temporary players can still create rooms and join multiplayer flows without breaking protected API routes."
          tone="success"
        />

        <AppCard style={styles.formCard}>
          <Text style={styles.formTitle}>Guest access</Text>
          <AppTextInput
            label="Guest username"
            placeholder="guest-player"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            hint="This name will show up in the lobby, chat, and player wheel."
          />
          <AppButton label="Continue as guest" onPress={handleGuestLogin} loading={loading} />
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
});
