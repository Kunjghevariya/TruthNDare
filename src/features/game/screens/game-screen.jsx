import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppScreen } from '../../../components/layout/app-screen';
import { Reveal } from '../../../components/motion/reveal';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { EmptyState } from '../../../components/ui/empty-state';
import { SectionHeading } from '../../../components/ui/section-heading';
import { StatusPill } from '../../../components/ui/status-pill';
import { ROUTES } from '../../../constants/routes';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useSession } from '../../../providers/session-provider';
import { getRoomByCode } from '../../../services/rooms';
import { connectSocket } from '../../../services/socket';
import { normalizeError } from '../../../utils/errors';
import { SpinWheel, WHEEL_PALETTES } from '../components/spin-wheel';
import { RoundPanel } from '../components/round-panel';
import { PlayerRosterCard } from '../components/player-roster-card';
import { RecentRoundsCard } from '../components/recent-rounds-card';
import { ChatPanel } from '../../room/components/chat-panel';

const createSpinTarget = (playerIndex, playerCount) => {
  const fullTurns = 5;
  const finalAngle = (360 / playerCount) * playerIndex + 360 / playerCount / 2;
  return fullTurns + finalAngle / 360;
};

const getRoundMessage = ({ room, username }) => {
  if (!room) {
    return 'Connecting game sync…';
  }

  const round = room.currentRound || {};

  if (round.status === 'selected' && round.selectedPlayer) {
    return round.selectedPlayer === username
      ? 'The wheel chose you. Pick Truth or Dare to reveal the challenge.'
      : `${round.selectedPlayer} is choosing between Truth and Dare.`;
  }

  if (round.status === 'prompted' && round.selectedPlayer && round.mode) {
    return round.selectedPlayer === username
      ? `You picked ${round.mode}. Take your moment, then open the next turn when the room is ready.`
      : `${round.selectedPlayer} picked ${round.mode}. Let the room enjoy it and get ready for the next turn.`;
  }

  return room.leader === username
    ? 'You control the next shared spin for the whole room.'
    : `${room.leader || 'The leader'} controls the next shared spin.`;
};

const toRoundState = (room) => {
  const round = room?.currentRound || {};

  return {
    status: round.status || 'idle',
    selectedPlayer: round.selectedPlayer || '',
    selectedPlayerIndex:
      typeof round.selectedPlayerIndex === 'number' ? round.selectedPlayerIndex : null,
    mode: round.mode || '',
    prompt: round.prompt || '',
    tone: round.tone || '',
    intensity: round.intensity || '',
    durationLabel: round.durationLabel || '',
  };
};

export default function GameScreen() {
  const { roomCode } = useLocalSearchParams();
  const { isAuthenticated, session } = useSession();
  const { width } = useWindowDimensions();
  const normalizedRoomCode = Array.isArray(roomCode) ? roomCode[0] : roomCode;
  const username = session?.user?.username || 'player';
  const isWide = width >= 1120;
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [roundState, setRoundState] = useState(toRoundState(null));
  const [socketState, setSocketState] = useState('connecting');
  const [statusMessage, setStatusMessage] = useState('Connecting game sync…');
  const [loading, setLoading] = useState(true);
  const rotation = useRef(new Animated.Value(0)).current;
  const roomRef = useRef(null);
  const countdownRef = useRef(null);

  const players = room?.players || [];
  const recentRounds = room?.recentRounds || [];
  const isLeader = room?.leader === username;
  const isSelectedPlayer = roundState.selectedPlayer === username;
  const selectedPalette = useMemo(() => {
    if (typeof roundState.selectedPlayerIndex !== 'number') {
      return WHEEL_PALETTES[0];
    }

    return WHEEL_PALETTES[roundState.selectedPlayerIndex % WHEEL_PALETTES.length];
  }, [roundState.selectedPlayerIndex]);

  useEffect(() => {
    countdownRef.current = countdown;
  }, [countdown]);

  const syncRoomSnapshot = useCallback((nextRoom) => {
    roomRef.current = nextRoom;
    setRoom(nextRoom);
    setRoundState(toRoundState(nextRoom));
  }, []);

  const loadRoom = useCallback(async () => {
    if (!normalizedRoomCode) {
      return;
    }

    setLoading(true);

    try {
      const response = await getRoomByCode(normalizedRoomCode);
      syncRoomSnapshot(response.data);
      setStatusMessage(getRoundMessage({ room: response.data, username }));
    } catch (error) {
      Alert.alert('Unable to load game', normalizeError(error).message);
    } finally {
      setLoading(false);
    }
  }, [normalizedRoomCode, syncRoomSnapshot, username]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.login);
      return;
    }

    loadRoom();
  }, [isAuthenticated, loadRoom]);

  useEffect(() => {
    if (!normalizedRoomCode || !username) {
      return;
    }

    const socket = connectSocket();

    const handleConnect = () => {
      setSocketState('connected');
      setStatusMessage(getRoundMessage({ room: roomRef.current, username }));
      socket.emit('joinRoom', { roomID: normalizedRoomCode, playerName: username });
    };

    const handleMessage = (message) => {
      if (message?.roomID && message.roomID !== normalizedRoomCode) {
        return;
      }

      startTransition(() => {
        setMessages((current) => [...current, message]);
      });
    };

    const handleCountdown = (payload) => {
      if (payload?.roomCode !== normalizedRoomCode) {
        return;
      }

      setCountdown(payload.seconds);
      setStatusMessage(
        payload.seconds > 0
          ? `Shared spin starts in ${payload.seconds}s on every device.`
          : 'Wheel is spinning now…'
      );
    };

    const handleRotateWheel = (payload) => {
      if (payload?.roomCode !== normalizedRoomCode) {
        return;
      }

      const nextIndex = payload.selectedPlayerIndex;
      const playerCount = payload.playerCount || roomRef.current?.players?.length || 1;
      const nextPlayer =
        payload.selectedPlayer || roomRef.current?.players?.[nextIndex] || 'Unknown player';

      if (typeof nextIndex !== 'number') {
        return;
      }

      setRoundState({
        status: 'selected',
        selectedPlayer: nextPlayer,
        selectedPlayerIndex: nextIndex,
        mode: '',
        prompt: '',
        tone: '',
        intensity: '',
        durationLabel: '',
      });

      rotation.stopAnimation(() => {
        rotation.setValue(0);

        Animated.timing(rotation, {
          toValue: createSpinTarget(nextIndex, Math.max(playerCount, 1)),
          duration: 3800,
          useNativeDriver: true,
        }).start(() => {
          setCountdown(null);
          setStatusMessage(
            nextPlayer === username
              ? 'The wheel chose you. Pick Truth or Dare.'
              : `${nextPlayer} was selected. Waiting for the choice.`
          );
        });
      });
    };

    const handleChallengeUpdated = (payload) => {
      if (payload?.roomCode !== normalizedRoomCode) {
        return;
      }

      setRoundState((current) => ({
        ...current,
        status: payload.status || 'prompted',
        selectedPlayer: payload.selectedPlayer || current.selectedPlayer,
        mode: payload.choice || current.mode,
        prompt: payload.prompt || current.prompt,
        tone: payload.tone || current.tone,
        intensity: payload.intensity || current.intensity,
        durationLabel: payload.durationLabel || current.durationLabel,
      }));
      setStatusMessage(
        payload.selectedPlayer === username
          ? `You picked ${payload.choice}. Here comes your challenge.`
          : `${payload.selectedPlayer} picked ${payload.choice}.`
      );
    };

    const handleRoomUpdate = (payload) => {
      if (payload?.code !== normalizedRoomCode) {
        return;
      }

      const previousLeader = roomRef.current?.leader;

      startTransition(() => {
        syncRoomSnapshot(payload);
      });

      if (previousLeader && previousLeader !== payload.leader) {
        setStatusMessage(`Leadership moved to ${payload.leader}.`);
        return;
      }

      if (countdownRef.current === null) {
        setStatusMessage(getRoundMessage({ room: payload, username }));
      }
    };

    const handleDisconnect = () => {
      setSocketState('reconnecting');
      setStatusMessage('Connection dropped. Reconnecting to live game sync…');
    };

    const handleConnectError = (error) => {
      setSocketState('error');
      setStatusMessage(error?.message ? `Socket issue: ${error.message}` : 'Socket issue. Retrying…');
    };

    const handleRoomError = (payload) => {
      if (payload?.roomCode && payload.roomCode !== normalizedRoomCode) {
        return;
      }

      if (payload?.message) {
        setStatusMessage(payload.message);
        Alert.alert('Game action blocked', payload.message);
      }
    };

    const handleRoomClosed = (payload) => {
      if (payload?.roomCode !== normalizedRoomCode) {
        return;
      }

      Alert.alert('Room closed', payload?.reason || 'This room is no longer active.');
      router.replace(ROUTES.lobby);
    };

    socket.on('connect', handleConnect);
    socket.on('message', handleMessage);
    socket.on('countdown', handleCountdown);
    socket.on('rotateWheel', handleRotateWheel);
    socket.on('challengeUpdated', handleChallengeUpdated);
    socket.on('roomUpdated', handleRoomUpdate);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('roomError', handleRoomError);
    socket.on('roomClosed', handleRoomClosed);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('message', handleMessage);
      socket.off('countdown', handleCountdown);
      socket.off('rotateWheel', handleRotateWheel);
      socket.off('challengeUpdated', handleChallengeUpdated);
      socket.off('roomUpdated', handleRoomUpdate);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('roomError', handleRoomError);
      socket.off('roomClosed', handleRoomClosed);
    };
  }, [normalizedRoomCode, rotation, syncRoomSnapshot, username]);

  const startSpin = () => {
    if (!isLeader) {
      Alert.alert('Leader only', 'Only the current leader can spin the wheel for the whole room.');
      return;
    }

    if (players.length < 2) {
      Alert.alert('Need more players', 'At least two players are needed before the wheel can start.');
      return;
    }

    if (countdown !== null) {
      Alert.alert('Spin in progress', 'A shared countdown is already running for the room.');
      return;
    }

    if (roundState.status !== 'idle') {
      Alert.alert('Finish the round', 'Reset the current round before starting a new spin.');
      return;
    }

    rotation.stopAnimation(() => {
      rotation.setValue(0);
    });
    setStatusMessage('Leader triggered the shared countdown for every device.');

    const socket = connectSocket();
    socket.emit('countdown', {
      roomCode: normalizedRoomCode,
      seconds: 3,
    });
  };

  const choosePrompt = (choice) => {
    if (!isSelectedPlayer || roundState.status !== 'selected') {
      return;
    }

    setStatusMessage(`Sending ${choice} choice to the room…`);
    const socket = connectSocket();
    socket.emit('chooseTruthOrDare', {
      roomCode: normalizedRoomCode,
      choice,
    });
  };

  const resetRound = () => {
    if (!isLeader) {
      return;
    }

    setStatusMessage('Resetting the round for the next spin…');
    const socket = connectSocket();
    socket.emit('resetRound', {
      roomCode: normalizedRoomCode,
    });
  };

  const sendMessage = (text) => {
    const socket = connectSocket();
    socket.emit('sendMessage', {
      roomID: normalizedRoomCode,
      playerName: username,
      text,
    });
  };

  return (
    <AppScreen gradient="game" contentContainerStyle={styles.screen}>
      <View style={styles.shell}>
        <Reveal delay={0}>
          <SectionHeading
            eyebrow="Live game"
            title="Truth or Dare now feels more like a real group game."
            description="The wheel picks one player, the prompt feels more personal, and the room keeps a memory of what just happened instead of feeling reset every turn."
            action={
              <View style={styles.headerPills}>
                <StatusPill label={normalizedRoomCode || 'No room'} tone="accent" />
                <StatusPill
                  label={
                    socketState === 'connected'
                      ? 'Live sync on'
                      : socketState === 'error'
                        ? 'Sync issue'
                        : 'Connecting'
                  }
                  tone={socketState === 'connected' ? 'success' : 'default'}
                />
              </View>
            }
          />
        </Reveal>

        <Reveal delay={80}>
          <AppCard style={styles.heroCard}>
            <View style={styles.heroMeta}>
              <Text style={styles.heroLabel}>Round control</Text>
              <Text style={styles.heroTitle}>
                {isLeader ? 'You are setting the pace for this room.' : `${room?.leader || 'Leader'} is setting the pace for this room.`}
              </Text>
              <Text style={styles.heroCopy}>{statusMessage}</Text>
              <View style={styles.heroPills}>
                <StatusPill label={`${players.length} players`} tone="default" />
                <StatusPill
                  label={roundState.status === 'prompted' ? `${roundState.mode} live` : roundState.status}
                  tone={roundState.status === 'idle' ? 'default' : 'accent'}
                />
                <StatusPill label={room?.phase === 'playing' ? 'Game live' : 'Lobby'} tone="success" />
              </View>
            </View>

            <View style={styles.heroActionStack}>
              <AppButton
                label="Back to room"
                variant="secondary"
                onPress={() =>
                  router.replace({
                    pathname: ROUTES.room,
                    params: { roomCode: normalizedRoomCode },
                  })
                }
              />
              <AppButton label="Refresh room" variant="ghost" onPress={loadRoom} loading={loading} />
            </View>
          </AppCard>
        </Reveal>

        {!players.length && !loading ? (
          <Reveal delay={140}>
            <AppCard>
              <EmptyState
                title="Not enough players"
                description="Go back to the room and make sure everyone has joined before starting the game flow."
              />
            </AppCard>
          </Reveal>
        ) : (
          <View style={[styles.gameGrid, isWide ? styles.gameGridWide : null]}>
            <View style={styles.mainColumn}>
              <Reveal delay={140}>
                <AppCard style={styles.wheelCard}>
                  <SpinWheel
                    playerNames={players}
                    rotation={rotation}
                    selectedPlayerIndex={roundState.selectedPlayerIndex}
                    selectedPlayerName={roundState.selectedPlayer}
                    onSpin={startSpin}
                    disabled={loading || !isLeader || countdown !== null || roundState.status !== 'idle'}
                    buttonLabel={
                      roundState.status === 'idle'
                        ? isLeader
                          ? 'Spin for room'
                          : 'Leader controls spin'
                        : 'Finish round first'
                    }
                  />

                  <View style={styles.wheelReadout}>
                    <Text style={styles.countdown}>
                      {countdown === null
                        ? roundState.status === 'prompted'
                          ? `${roundState.mode} challenge live`
                          : roundState.status === 'selected'
                            ? `${roundState.selectedPlayer || 'Player'} is choosing`
                            : 'Ready for the next spin'
                        : countdown > 0
                          ? `Spin starts in ${countdown}s`
                          : 'Wheel is spinning…'}
                    </Text>
                    <Text style={styles.helperText}>
                      {countdown === null
                        ? 'The wheel now changes mood with the selected player so it is obvious whose turn just landed.'
                        : 'Every device is following the same countdown and wheel rotation.'}
                    </Text>
                    <View style={styles.selectionBadge}>
                      <View
                        style={[
                          styles.selectionDot,
                          { backgroundColor: selectedPalette.base },
                        ]}
                      />
                      <Text style={styles.selectionText}>
                        {roundState.selectedPlayer
                          ? `Result: ${roundState.selectedPlayer}`
                          : 'No player selected yet'}
                      </Text>
                    </View>
                  </View>
                </AppCard>
              </Reveal>

              <Reveal delay={200}>
                <RoundPanel
                  countdown={countdown}
                  statusMessage={statusMessage}
                  roundStatus={roundState.status}
                  selectedPlayer={roundState.selectedPlayer}
                  currentChoice={roundState.mode}
                  prompt={roundState.prompt}
                  tone={roundState.tone}
                  intensity={roundState.intensity}
                  durationLabel={roundState.durationLabel}
                  isSelectedPlayer={isSelectedPlayer}
                  isLeader={isLeader}
                  accentColor={selectedPalette.base}
                  onChooseTruth={() => choosePrompt('Truth')}
                  onChooseDare={() => choosePrompt('Dare')}
                  onResetRound={resetRound}
                />
              </Reveal>
            </View>

            <View style={styles.sideColumn}>
              <Reveal delay={180}>
                <RecentRoundsCard recentRounds={recentRounds} />
              </Reveal>

              <Reveal delay={220}>
                <ChatPanel
                  messages={messages}
                  onSendMessage={sendMessage}
                  sendingDisabled={socketState !== 'connected'}
                  currentPlayerName={username}
                  title="Game chat"
                  caption="Keep the reactions, teasing, and support flowing while the next turn plays out."
                  placeholder="React to the turn"
                  emptyTitle="No game chat yet"
                  emptyDescription="Use the side chat to react to the wheel, cheer people on, and keep the room warm between turns."
                  minHeight={420}
                />
              </Reveal>

              <Reveal delay={260}>
                <PlayerRosterCard
                  players={players}
                  leader={room?.leader}
                  selectedPlayer={roundState.selectedPlayer}
                  currentPlayerName={username}
                />
              </Reveal>
            </View>
          </View>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: SPACING.xxl,
  },
  shell: {
    flex: 1,
    gap: SPACING.xl,
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
  },
  headerPills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  heroCard: {
    gap: 20,
  },
  heroMeta: {
    gap: 10,
  },
  heroLabel: {
    color: COLORS.accentAlt,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 28,
    lineHeight: 34,
  },
  heroCopy: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 22,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroActionStack: {
    gap: 12,
  },
  gameGrid: {
    gap: 20,
  },
  gameGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainColumn: {
    flex: 1.35,
    gap: 20,
  },
  sideColumn: {
    flex: 0.95,
    gap: 20,
  },
  wheelCard: {
    alignItems: 'center',
    gap: 26,
  },
  wheelReadout: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 18,
  },
  countdown: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 24,
    textAlign: 'center',
  },
  helperText: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  selectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(8,17,32,0.42)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectionDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  selectionText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 13,
    letterSpacing: 0.4,
  },
});
