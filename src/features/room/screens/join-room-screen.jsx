import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../../components/layout/app-screen';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { AppTextInput } from '../../../components/ui/app-text-input';
import { SectionHeading } from '../../../components/ui/section-heading';
import { ROUTES } from '../../../constants/routes';
import { SPACING } from '../../../constants/theme';
import { useSession } from '../../../providers/session-provider';
import { joinRoom } from '../../../services/rooms';
import { normalizeError } from '../../../utils/errors';

export default function JoinRoomScreen() {
  const { isAuthenticated, lastRoomCode, rememberRoom } = useSession();
  const [roomCode, setRoomCode] = useState(lastRoomCode || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isAuthenticated]);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Missing room code', 'Paste or type the invite code before continuing.');
      return;
    }

    setLoading(true);

    try {
      await joinRoom({
        code: roomCode.trim().toUpperCase(),
        password: password.trim(),
      });

      await rememberRoom(roomCode.trim().toUpperCase());
      router.replace({
        pathname: ROUTES.room,
        params: { roomCode: roomCode.trim().toUpperCase() },
      });
    } catch (error) {
      Alert.alert('Unable to join room', normalizeError(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen gradient="room">
      <View style={styles.shell}>
        <SectionHeading
          eyebrow="Join flow"
          title="Reconnect with a room in just a couple of fields."
          description="Room history is remembered locally, so jumping back into active lobbies is much faster than before."
        />

        <AppCard style={styles.card}>
          <AppTextInput
            label="Room code"
            placeholder="123456"
            autoCapitalize="characters"
            value={roomCode}
            onChangeText={setRoomCode}
          />
          <AppTextInput
            label="Password"
            placeholder="Only if the host protected the room"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View style={styles.actions}>
            <AppButton label="Join room" onPress={handleJoinRoom} loading={loading} />
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
  actions: {
    gap: 12,
  },
});
