import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../../components/layout/app-screen';
import { Reveal } from '../../../components/motion/reveal';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { SectionHeading } from '../../../components/ui/section-heading';
import { StatusPill } from '../../../components/ui/status-pill';
import { ROUTES } from '../../../constants/routes';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useSession } from '../../../providers/session-provider';
import { ProfileBanner } from '../components/profile-banner';

export default function LobbyScreen() {
  const { isAuthenticated, lastRoomCode, rememberRoom, session, signOut } = useSession();
  const { width } = useWindowDimensions();
  const isWide = width >= 960;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await signOut();
    router.replace(ROUTES.login);
  };

  const openLastRoom = async () => {
    if (!lastRoomCode) {
      Alert.alert('No saved room yet', 'Create or join a room first, then we can bring you back here fast.');
      return;
    }

    await rememberRoom(lastRoomCode);
    router.push({
      pathname: ROUTES.room,
      params: { roomCode: lastRoomCode },
    });
  };

  const quickStats = [
    {
      label: 'Identity',
      value: session?.user?.username || 'player',
      tone: 'success',
      description: 'Session restored from secure local storage.',
    },
    {
      label: 'Last room',
      value: lastRoomCode || 'No room yet',
      tone: 'accent',
      description: 'Jump back into the last active lobby in one tap.',
    },
    {
      label: 'Client state',
      value: 'Production ready',
      tone: 'default',
      description: 'Lazy routes, token refresh, and shared socket services are enabled.',
    },
  ];

  const featureCards = [
    {
      title: 'Realtime rooms',
      description: 'Room updates, chat, countdowns, and wheel events now move through one shared socket client instead of duplicated screen listeners.',
    },
    {
      title: 'Safer sessions',
      description: 'Login, refresh, logout, and guest mode all flow through the same session provider with stored tokens and retry support.',
    },
    {
      title: 'Deployable web app',
      description: 'The frontend exports static bundles cleanly, and the backend has a health endpoint plus deployment config for Render.',
    },
  ];

  const timeline = [
    'Create or join a room and share the code with your group.',
    'Watch the room sync update as players arrive and chat in real time.',
    'Start the wheel and let the room see one shared countdown and final selection.',
  ];

  return (
    <AppScreen gradient="lobby">
      <View style={styles.shell}>
        <Reveal delay={0}>
          <ProfileBanner
            username={session?.user?.username || 'player'}
            subtitle="Your session, room history, and tokens are now handled centrally."
            onLogout={handleLogout}
          />
        </Reveal>

        <Reveal delay={80}>
          <SectionHeading
            eyebrow="Lobby"
            title="Choose how you want to start the next round."
            description="Create a fresh room, join an invite code, or jump back into the last lobby you touched. This screen is now designed like a proper dashboard, with smoother motion and cleaner mobile scrolling."
            action={<StatusPill label={lastRoomCode ? `Last room ${lastRoomCode}` : 'Fresh session'} tone="accent" />}
          />
        </Reveal>

        <Reveal delay={140}>
          <View style={[styles.statsRow, isWide && styles.statsRowWide]}>
            {quickStats.map((item) => (
              <AppCard key={item.label} style={[styles.statCard, isWide && styles.statCardWide]}>
                <StatusPill label={item.label} tone={item.tone} />
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statDescription}>{item.description}</Text>
              </AppCard>
            ))}
          </View>
        </Reveal>

        <Reveal delay={220}>
          <View style={[styles.grid, isWide && styles.gridWide]}>
            <AppCard style={[styles.actionCard, styles.primaryActionCard]}>
              <Text style={styles.cardTitle}>Create a room</Text>
              <Text style={styles.cardDescription}>
                Set up a private or public lobby, invite everyone with a clean room code, and move straight into the synced room experience.
              </Text>
              <View style={styles.cardActions}>
                <AppButton label="Host now" onPress={() => router.push(ROUTES.createRoom)} />
              </View>
            </AppCard>

            <AppCard style={styles.actionCard}>
              <Text style={styles.cardTitle}>Join a room</Text>
              <Text style={styles.cardDescription}>
                Enter a code, reconnect fast, and keep your place in the live room without juggling separate navigation stacks.
              </Text>
              <View style={styles.cardActions}>
                <AppButton label="Enter invite" variant="secondary" onPress={() => router.push(ROUTES.joinRoom)} />
              </View>
            </AppCard>

            <AppCard style={styles.actionCard}>
              <Text style={styles.cardTitle}>Resume last room</Text>
              <Text style={styles.cardDescription}>
                Last active room: {lastRoomCode || 'None yet. Once you create or join a room, it will appear here.'}
              </Text>
              <View style={styles.cardActions}>
                <AppButton label="Open last room" variant="ghost" onPress={openLastRoom} />
              </View>
            </AppCard>
          </View>
        </Reveal>

        <Reveal delay={300}>
          <View style={[styles.featureGrid, isWide && styles.featureGridWide]}>
            {featureCards.map((item) => (
              <AppCard key={item.title} style={[styles.featureCard, isWide && styles.featureCardWide]}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDescription}>{item.description}</Text>
              </AppCard>
            ))}
          </View>
        </Reveal>

        <Reveal delay={380}>
          <AppCard style={styles.timelineCard}>
            <SectionHeading
              eyebrow="Round flow"
              title="How the upgraded experience moves"
              description="A quick walkthrough of the new room lifecycle."
            />
            <View style={styles.timeline}>
              {timeline.map((item, index) => (
                <View key={item} style={styles.timelineItem}>
                  <View style={styles.timelineMarker}>
                    <Text style={styles.timelineMarkerText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.timelineText}>{item}</Text>
                </View>
              ))}
            </View>
          </AppCard>
        </Reveal>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: SPACING.xl,
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    paddingBottom: SPACING.xxl,
  },
  grid: {
    gap: SPACING.md,
  },
  gridWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  actionCard: {
    gap: 12,
    flex: 1,
  },
  primaryActionCard: {
    backgroundColor: 'rgba(255, 122, 89, 0.12)',
  },
  cardActions: {
    marginTop: 'auto',
  },
  statsRow: {
    gap: SPACING.md,
  },
  statsRowWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statCard: {
    gap: 12,
  },
  statCardWide: {
    flex: 1,
  },
  statValue: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 24,
    lineHeight: 30,
  },
  statDescription: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 20,
  },
  featureGrid: {
    gap: SPACING.md,
  },
  featureGridWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  featureCard: {
    gap: 10,
  },
  featureCardWide: {
    flex: 1,
  },
  featureTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 22,
  },
  featureDescription: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 22,
  },
  cardTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 24,
  },
  cardDescription: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 22,
  },
  timelineCard: {
    gap: 20,
  },
  timeline: {
    gap: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  timelineMarkerText: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 13,
  },
  timelineText: {
    flex: 1,
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 22,
  },
});
