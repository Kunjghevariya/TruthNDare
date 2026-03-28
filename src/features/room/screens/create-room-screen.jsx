import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../../components/layout/app-screen';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { AppTextInput } from '../../../components/ui/app-text-input';
import { SectionHeading } from '../../../components/ui/section-heading';
import { ROUTES } from '../../../constants/routes';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useSession } from '../../../providers/session-provider';
import { createRoom } from '../../../services/rooms';
import { normalizeError } from '../../../utils/errors';

export default function CreateRoomScreen() {
  const { isAuthenticated, rememberRoom } = useSession();
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    if (!roomName.trim()) {
      Alert.alert('Missing room name', 'Give your room a name so people know what they are joining.');
      return;
    }

    if (isPrivate && !password.trim()) {
      Alert.alert('Password required', 'Private rooms need a password before they can be created.');
      return;
    }

    setLoading(true);

    try {
      const response = await createRoom({
        name: roomName.trim(),
        isPrivate,
        password: isPrivate ? password.trim() : '',
      });
      const roomCode = response.data.code;

      await rememberRoom(roomCode);
      router.replace({
        pathname: ROUTES.room,
        params: { roomCode },
      });
    } catch (error) {
      Alert.alert('Unable to create room', normalizeError(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen gradient="room">
      <View style={styles.shell}>
        <SectionHeading
          eyebrow="Host flow"
          title="Create a polished room with safer defaults."
          description="The new room form validates inputs, keeps private-room rules obvious, and stores the invite code for quick re-entry."
        />

        <AppCard style={styles.card}>
          <AppTextInput
            label="Room name"
            placeholder="Friday night chaos"
            value={roomName}
            onChangeText={setRoomName}
          />

          <View style={styles.switchRow}>
            <View style={styles.switchMeta}>
              <Text style={styles.switchTitle}>Private room</Text>
              <Text style={styles.switchDescription}>Turn this on to require a password before anyone can join.</Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              thumbColor={isPrivate ? COLORS.accent : '#f4f4f4'}
              trackColor={{ true: 'rgba(255,122,89,0.45)', false: 'rgba(255,255,255,0.12)' }}
            />
          </View>

          {isPrivate ? (
            <AppTextInput
              label="Room password"
              placeholder="Set a room password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          ) : null}

          <View style={styles.actions}>
            <AppButton label="Create room" onPress={handleSubmit} loading={loading} />
            <AppButton label="Back to lobby" variant="secondary" onPress={() => router.back()} />
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
    maxWidth: 820,
    alignSelf: 'center',
  },
  card: {
    gap: SPACING.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 10,
  },
  switchMeta: {
    flex: 1,
    gap: 6,
  },
  switchTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 18,
  },
  switchDescription: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
});
