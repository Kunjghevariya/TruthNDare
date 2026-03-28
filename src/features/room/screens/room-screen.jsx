import React, { startTransition, useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { AppScreen } from '../../../components/layout/app-screen';
import { Reveal } from '../../../components/motion/reveal';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { EmptyState } from '../../../components/ui/empty-state';
import { SectionHeading } from '../../../components/ui/section-heading';
import { StatusPill } from '../../../components/ui/status-pill';
import { ROUTES } from '../../../constants/routes';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useSession } from '../../../providers/session-provider';
import { getRoomByCode, leaveRoom } from '../../../services/rooms';
import { connectSocket } from '../../../services/socket';
import { normalizeError } from '../../../utils/errors';
import { ChatPanel } from '../components/chat-panel';
import { PlayerListCard } from '../components/player-list-card';

export default function RoomScreen() {
  const { roomCode } = useLocalSearchParams();
  const { isAuthenticated, rememberRoom, session } = useSession();
  const { width } = useWindowDimensions();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Connecting live room updates…');
  const [socketState, setSocketState] = useState('connecting');
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  const username = session?.user?.username || 'player';
  const normalizedRoomCode = Array.isArray(roomCode) ? roomCode[0] : roomCode;
  const isWide = width >= 980;
  const isLeader = room?.leader === username;
  const playerCount = room?.players?.length || 0;

  const loadRoom = useCallback(async () => {
    if (!normalizedRoomCode) {
      return;
    }

    setLoading(true);

    try {
      const response = await getRoomByCode(normalizedRoomCode);
      setRoom(response.data);
      await rememberRoom(normalizedRoomCode);
    } catch (error) {
      Alert.alert('Unable to load room', normalizeError(error).message);
    } finally {
      setLoading(false);
    }
  }, [normalizedRoomCode, rememberRoom]);

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
      setStatusMessage('Connected to the room.');
      socket.emit('joinRoom', { roomID: normalizedRoomCode, playerName: username });
    };

    const handleRoomJoined = (payload) => {
      if (payload?.roomCode !== normalizedRoomCode) {
        return;
      }

      setStatusMessage(`${payload.playerName} joined the room.`);

      if (payload.players) {
        startTransition(() => {
          setRoom((current) => ({
            ...(current || {}),
            players: payload.players,
            code: payload.roomCode,
            name: current?.name || payload.roomName || 'Room',
            leader: payload.leader || current?.leader,
          }));
        });
      } else {
        loadRoom();
      }
    };

    const handleMessage = (message) => {
      if (message?.roomID && message.roomID !== normalizedRoomCode) {
        return;
      }

      startTransition(() => {
        setMessages((current) => [...current, message]);
      });
    };

    const handleRoomUpdate = (payload) => {
      if (payload?.code !== normalizedRoomCode) {
        return;
      }

      startTransition(() => {
        setRoom((current) => {
          if (current?.leader && current.leader !== payload.leader) {
            setStatusMessage(`Leadership moved to ${payload.leader}.`);
          }

          return payload;
        });
      });
    };

    const handlePlayerLeft = (payload) => {
      if (payload?.roomCode !== normalizedRoomCode) {
        return;
      }

      if (payload.leaderChanged && payload.leader) {
        setStatusMessage(`${payload.playerName} left. ${payload.leader} is now the leader.`);
        return;
      }

      setStatusMessage(`${payload.playerName} left the room.`);
    };

    const handleStart = (payload) => {
      const payloadRoomCode = payload?.roomCode || normalizedRoomCode;

      router.push({
        pathname: ROUTES.game,
        params: { roomCode: payloadRoomCode },
      });
    };

    const handleDisconnect = () => {
      setSocketState('reconnecting');
      setStatusMessage('Disconnected. Reconnecting to the room…');
    };

    const handleConnectError = (error) => {
      setSocketState('error');
      setStatusMessage(error?.message ? `Live sync issue: ${error.message}` : 'Live sync issue. Retrying connection…');
    };

    const handleRoomError = (payload) => {
      if (payload?.roomCode && payload.roomCode !== normalizedRoomCode) {
        return;
      }

      if (payload?.message) {
        setStatusMessage(payload.message);
        Alert.alert('Room action blocked', payload.message);
      }
    };

    const handleRoomClosed = (payload) => {
      if (payload?.roomCode !== normalizedRoomCode) {
        return;
      }

      rememberRoom('');
      Alert.alert('Room closed', payload?.reason || 'This room is no longer active.');
      router.replace(ROUTES.lobby);
    };

    socket.on('connect', handleConnect);
    socket.on('userJoined', handleRoomJoined);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('message', handleMessage);
    socket.on('roomUpdated', handleRoomUpdate);
    socket.on('start', handleStart);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('roomError', handleRoomError);
    socket.on('roomClosed', handleRoomClosed);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('userJoined', handleRoomJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('message', handleMessage);
      socket.off('roomUpdated', handleRoomUpdate);
      socket.off('start', handleStart);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('roomError', handleRoomError);
      socket.off('roomClosed', handleRoomClosed);
    };
  }, [loadRoom, normalizedRoomCode, rememberRoom, username]);

  const copyRoomCode = async () => {
    await Clipboard.setStringAsync(normalizedRoomCode || '');
    Alert.alert('Copied', 'The room code is ready to share.');
  };

  const startGame = () => {
    if (!isLeader) {
      Alert.alert('Leader only', 'Only the current room leader can start the game for everyone.');
      return;
    }

    const socket = connectSocket();
    setStatusMessage('Starting the game on every connected device…');
    socket.emit('start', { roomCode: normalizedRoomCode });
  };

  const handleLeaveRoom = async () => {
    setLeaving(true);

    try {
      await leaveRoom(normalizedRoomCode);
      const socket = connectSocket();
      socket.emit('leaveRoom', {
        roomCode: normalizedRoomCode,
      });
      await rememberRoom('');
      router.replace(ROUTES.lobby);
    } catch (error) {
      Alert.alert('Unable to leave room', normalizeError(error).message);
    } finally {
      setLeaving(false);
    }
  };

  const sendMessage = (text) => {
    const socket = connectSocket();
    socket.emit('sendMessage', {
      roomID: normalizedRoomCode,
      playerName: username,
      text,
    });
  };

  const workflowSteps = [
    'Leader creates the room and becomes the default host automatically.',
    'Every member who joins gets synced to all devices with the same room state.',
    'Only the leader can start the room and trigger the shared game flow.',
    'If the leader leaves, the next member in line becomes the new leader automatically.',
  ];

  return (
    <AppScreen gradient="room" contentContainerStyle={styles.screen}>
      <View style={styles.shell}>
        <Reveal delay={0}>
          <SectionHeading
            eyebrow="Live room"
            title={room?.name || 'Room'}
            description="This room now follows a stronger multiplayer workflow with a real leader, shared start rules, auto-reassignment, and scroll-friendly layout."
            action={
              <View style={styles.headerPills}>
                <StatusPill label={normalizedRoomCode || 'No code'} tone="accent" />
                <StatusPill
                  label={socketState === 'connected' ? 'Live sync on' : socketState === 'error' ? 'Sync issue' : 'Connecting'}
                  tone={socketState === 'connected' ? 'success' : 'default'}
                />
              </View>
            }
          />
        </Reveal>

        <Reveal delay={80}>
          <AppCard style={styles.heroCard}>
            <View style={styles.heroMeta}>
              <Text style={styles.heroLabel}>Room code</Text>
              <Text style={styles.heroCode}>{normalizedRoomCode || '—'}</Text>
              <Text style={styles.heroStatus}>{statusMessage}</Text>
              <View style={styles.heroMetaRow}>
                <StatusPill label={room?.phase === 'playing' ? 'Game live' : 'Lobby open'} tone={room?.phase === 'playing' ? 'accent' : 'default'} />
                <StatusPill label={isLeader ? 'You are leader' : `Leader: ${room?.leader || 'loading'}`} tone={isLeader ? 'success' : 'default'} />
                <StatusPill label={`${playerCount} players`} tone="default" />
              </View>
            </View>
            <View style={styles.heroActions}>
              <AppButton label="Copy code" onPress={copyRoomCode} />
              <AppButton label="Refresh players" variant="secondary" onPress={loadRoom} loading={loading} />
              <AppButton
                label={room?.phase === 'playing' ? 'Open live game' : 'Start game'}
                variant="ghost"
                onPress={
                  room?.phase === 'playing'
                    ? () =>
                        router.push({
                          pathname: ROUTES.game,
                          params: { roomCode: normalizedRoomCode },
                        })
                    : startGame
                }
                disabled={room?.phase !== 'playing' && (!isLeader || playerCount < 2)}
              />
              <AppButton label="Leave room" variant="secondary" onPress={handleLeaveRoom} loading={leaving} />
            </View>
          </AppCard>
        </Reveal>

        {!room && !loading ? (
          <Reveal delay={140}>
            <AppCard>
              <EmptyState
                title="Room not found"
                description="Try joining again from the lobby, or ask the leader for a fresh invite code."
              />
            </AppCard>
          </Reveal>
        ) : (
          <>
            <Reveal delay={160}>
              <AppCard style={styles.workflowCard}>
                <Text style={styles.workflowTitle}>Room workflow</Text>
                <View style={styles.workflowList}>
                  {workflowSteps.map((step, index) => (
                    <View key={step} style={styles.workflowItem}>
                      <View style={styles.workflowMarker}>
                        <Text style={styles.workflowMarkerText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.workflowText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </AppCard>
            </Reveal>

            <Reveal delay={220}>
              <View style={[styles.contentRow, isWide && styles.contentRowWide]}>
                <View style={[styles.column, styles.columnLeft]}>
                  <PlayerListCard
                    currentUser={username}
                    leader={room?.leader}
                    phase={room?.phase}
                    players={room?.players || []}
                  />
                  <AppCard style={styles.helperCard}>
                    <Text style={styles.helperTitle}>Leader controls</Text>
                    <Text style={styles.helperText}>
                      {isLeader
                        ? 'You are the leader. Starting the game will move every connected device into the shared game screen.'
                        : `Only ${room?.leader || 'the leader'} can start the game. If they leave, leadership moves to the next member automatically.`}
                    </Text>
                    <AppButton
                      label={isLeader ? 'Start for everyone' : 'Waiting for leader'}
                      variant="secondary"
                      onPress={startGame}
                      disabled={!isLeader || playerCount < 2}
                    />
                  </AppCard>
                </View>

                <View style={[styles.column, styles.columnRight]}>
                  <ChatPanel
                    messages={messages}
                    onSendMessage={sendMessage}
                    sendingDisabled={socketState !== 'connected'}
                    currentPlayerName={username}
                  />
                </View>
              </View>
            </Reveal>
          </>
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
    gap: SPACING.lg,
    width: '100%',
    maxWidth: 1220,
    alignSelf: 'center',
  },
  heroCard: {
    gap: 18,
  },
  headerPills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  heroMeta: {
    gap: 6,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  heroLabel: {
    color: COLORS.textDim,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroCode: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 34,
  },
  heroStatus: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 20,
  },
  heroActions: {
    gap: 12,
  },
  workflowCard: {
    gap: 16,
  },
  workflowTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 24,
  },
  workflowList: {
    gap: 12,
  },
  workflowItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  workflowMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  workflowMarkerText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 13,
  },
  workflowText: {
    flex: 1,
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 22,
  },
  contentRow: {
    gap: SPACING.md,
  },
  contentRowWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  column: {
    gap: SPACING.md,
  },
  columnLeft: {
    flex: 0.95,
  },
  columnRight: {
    flex: 1.25,
  },
  helperCard: {
    gap: 12,
  },
  helperTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 24,
  },
  helperText: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 22,
  },
});
