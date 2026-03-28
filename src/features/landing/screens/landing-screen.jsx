import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { AppScreen } from '../../../components/layout/app-screen';
import { Reveal } from '../../../components/motion/reveal';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { SectionHeading } from '../../../components/ui/section-heading';
import { StatusPill } from '../../../components/ui/status-pill';
import { ROUTES } from '../../../constants/routes';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useSession } from '../../../providers/session-provider';

export default function LandingScreen() {
  const { isAuthenticated, isHydrating, session } = useSession();
  const { width } = useWindowDimensions();
  const isWide = width >= 980;

  const highlights = [
    {
      title: 'Play instantly',
      description: 'Jump in as a guest, open a room in seconds, and start playing without a long setup.',
    },
    {
      title: 'Best for groups',
      description: 'Friends, house parties, birthdays, game nights, and quick online hangouts all fit naturally here.',
    },
    {
      title: 'Shared live turns',
      description: 'One wheel, one selected player, one truth or dare prompt for the whole room to react to together.',
    },
  ];

  const moments = [
    'Create a room and share the invite code with your group.',
    'Let everyone join, chat, and settle into the room together.',
    'Spin the wheel, choose Truth or Dare, and keep the round moving.',
  ];

  return (
    <AppScreen gradient="lobby">
      <View style={styles.shell}>
        <Reveal delay={0}>
          <View style={[styles.hero, isWide ? styles.heroWide : null]}>
            <View style={styles.heroCopy}>
              <StatusPill label="Party game" tone="accent" />
              <Text style={styles.heroTitle}>Truth or Dare made for real group energy.</Text>
              <Text style={styles.heroDescription}>
                A playful landing page for everyone to discover the game, join fast, and move into live rooms without the old technical clutter.
              </Text>

              <View style={[styles.heroActions, isWide ? styles.heroActionsWide : null]}>
                {isAuthenticated && !isHydrating ? (
                  <AppButton
                    label={`Open lobby${session?.user?.username ? ` for ${session.user.username}` : ''}`}
                    onPress={() => router.push(ROUTES.lobby)}
                    style={styles.primaryButton}
                  />
                ) : (
                  <>
                    <AppButton label="Play as guest" onPress={() => router.push(ROUTES.guest)} style={styles.primaryButton} />
                    <AppButton label="Sign in" variant="secondary" onPress={() => router.push(ROUTES.login)} style={styles.secondaryButton} />
                  </>
                )}

                <AppButton label="Create account" variant="ghost" onPress={() => router.push(ROUTES.register)} style={styles.secondaryButton} />
              </View>
            </View>

            <AppCard style={styles.heroShowcase}>
              <Text style={styles.showcaseEyebrow}>What people see</Text>
              <Text style={styles.showcaseTitle}>A cleaner room flow with more fun and less friction.</Text>
              <View style={styles.showcaseStack}>
                <View style={styles.showcasePanel}>
                  <Text style={styles.showcaseLabel}>Room vibe</Text>
                  <Text style={styles.showcaseText}>Live chat, shared countdowns, and one leader keeping the game moving.</Text>
                </View>
                <View style={[styles.showcasePanel, styles.showcasePanelAccent]}>
                  <Text style={styles.showcaseLabel}>Turn energy</Text>
                  <Text style={styles.showcaseText}>Wheel results feel bigger, prompts feel more human, and recent rounds stay visible.</Text>
                </View>
              </View>
            </AppCard>
          </View>
        </Reveal>

        <Reveal delay={120}>
          <SectionHeading
            eyebrow="Why it works"
            title="Built for people first, not just project demos."
            description="The public home now speaks to players, hosts, and friend groups instead of showing internal engineering status."
          />
        </Reveal>

        <Reveal delay={180}>
          <View style={[styles.highlightGrid, isWide ? styles.highlightGridWide : null]}>
            {highlights.map((item) => (
              <AppCard key={item.title} style={styles.highlightCard}>
                <Text style={styles.highlightTitle}>{item.title}</Text>
                <Text style={styles.highlightDescription}>{item.description}</Text>
              </AppCard>
            ))}
          </View>
        </Reveal>

        <Reveal delay={240}>
          <AppCard style={styles.stepsCard}>
            <SectionHeading
              eyebrow="How to start"
              title="Three simple moves"
              description="Enough structure to guide new players, without making the first visit feel heavy."
            />

            <View style={styles.steps}>
              {moments.map((item, index) => (
                <View key={item} style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{item}</Text>
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
    maxWidth: 1180,
    alignSelf: 'center',
    paddingBottom: SPACING.xxl,
  },
  hero: {
    gap: SPACING.lg,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  heroCopy: {
    flex: 1.1,
    gap: 16,
    justifyContent: 'center',
  },
  heroTitle: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 42,
    lineHeight: 50,
    maxWidth: 620,
  },
  heroDescription: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 17,
    lineHeight: 27,
    maxWidth: 640,
  },
  heroActions: {
    gap: 12,
    marginTop: 4,
  },
  heroActionsWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  primaryButton: {
    minWidth: 180,
  },
  secondaryButton: {
    minWidth: 160,
  },
  heroShowcase: {
    flex: 0.95,
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  showcaseEyebrow: {
    color: COLORS.accentAlt,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  showcaseTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 28,
    lineHeight: 36,
  },
  showcaseStack: {
    gap: 12,
  },
  showcasePanel: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(8,17,32,0.34)',
    padding: 16,
    gap: 8,
  },
  showcasePanelAccent: {
    backgroundColor: 'rgba(255,122,89,0.12)',
    borderColor: 'rgba(255,122,89,0.24)',
  },
  showcaseLabel: {
    color: COLORS.textDim,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  showcaseText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 23,
  },
  highlightGrid: {
    gap: SPACING.md,
  },
  highlightGridWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  highlightCard: {
    flex: 1,
    gap: 10,
  },
  highlightTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 24,
  },
  highlightDescription: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 23,
  },
  stepsCard: {
    gap: 18,
  },
  steps: {
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(53,208,186,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: COLORS.accentAlt,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 23,
  },
});
