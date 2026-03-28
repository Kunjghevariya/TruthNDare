import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { StatusPill } from '../../../components/ui/status-pill';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../../constants/theme';

const hexToRgba = (hex, alpha) => {
  const normalized = hex.replace('#', '');

  if (normalized.length !== 6) {
    return `rgba(255,122,89,${alpha})`;
  }

  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red},${green},${blue},${alpha})`;
};

export const RoundPanel = ({
  countdown,
  statusMessage,
  roundStatus,
  selectedPlayer,
  currentChoice,
  prompt,
  tone,
  intensity,
  durationLabel,
  isSelectedPlayer,
  isLeader,
  accentColor = COLORS.accent,
  onChooseTruth,
  onChooseDare,
  onResetRound,
}) => {
  const isCountingDown = countdown !== null;
  const showChoice = roundStatus === 'selected' && !currentChoice;
  const showPrompt = roundStatus === 'prompted' && currentChoice && prompt;
  const heroTint = hexToRgba(accentColor, 0.16);
  const heroBorder = hexToRgba(accentColor, 0.34);
  const resetLabel = showPrompt ? 'Open next turn' : 'Reset turn';

  return (
    <AppCard style={[styles.card, { borderColor: heroBorder }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>This turn</Text>
          <Text style={styles.title}>
            {isCountingDown
              ? countdown > 0
                ? `Spin begins in ${countdown}s`
                : 'Wheel is spinning now'
              : showPrompt
                ? `${selectedPlayer || 'Player'} drew ${currentChoice}`
                : showChoice
                  ? `${selectedPlayer || 'Player'} is up`
                  : 'Ready for the next spin'}
          </Text>
        </View>

        <View style={styles.pillRow}>
          <StatusPill
            label={
              isCountingDown
                ? 'Countdown live'
                : showPrompt
                  ? currentChoice
                  : showChoice
                    ? 'Choice pending'
                    : 'Wheel ready'
            }
            tone={showPrompt || showChoice ? 'accent' : 'default'}
          />
          {isSelectedPlayer ? <StatusPill label="Your turn" tone="success" /> : null}
        </View>
      </View>

      <Text style={styles.statusText}>{statusMessage}</Text>

      <View style={[styles.heroCard, { backgroundColor: heroTint, borderColor: heroBorder }]}>
        <Text style={styles.heroLabel}>Current player</Text>
        <Text style={styles.heroName}>{selectedPlayer || 'Waiting for the wheel'}</Text>
        <Text style={styles.heroDescription}>
          {isCountingDown
            ? 'Every device is watching the same countdown and will land on the same player.'
            : showPrompt
              ? `${selectedPlayer || 'The player'} picked ${currentChoice}. Let the moment land, then move on when the room is ready.`
              : showChoice
                ? isSelectedPlayer
                  ? 'Choose the kind of challenge you want. The room will see the same prompt instantly.'
                  : `Waiting for ${selectedPlayer || 'the selected player'} to choose Truth or Dare.`
                : isLeader
                  ? 'Spin when the room feels ready. Everyone will land on the same result together.'
                  : 'The room leader controls the shared spin. Stay ready for your turn.'}
        </Text>
      </View>

      {showChoice && isSelectedPlayer ? (
        <View style={styles.choiceRow}>
          <AppButton label="Choose truth" onPress={onChooseTruth} style={styles.choiceButton} />
          <AppButton label="Choose dare" variant="secondary" onPress={onChooseDare} style={styles.choiceButton} />
        </View>
      ) : null}

      {showPrompt ? (
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>{currentChoice} challenge</Text>
          <View style={styles.promptMeta}>
            {tone ? <StatusPill label={tone} tone="default" /> : null}
            {intensity ? <StatusPill label={intensity} tone="accent" /> : null}
            {durationLabel ? <StatusPill label={durationLabel} tone="default" /> : null}
          </View>
          <Text style={styles.promptText}>{prompt}</Text>
        </View>
      ) : null}

      {isLeader && !isCountingDown && roundStatus !== 'idle' ? (
        <AppButton label={resetLabel} variant="ghost" onPress={onResetRound} />
      ) : null}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 18,
  },
  header: {
    gap: 12,
  },
  headerCopy: {
    gap: 6,
  },
  eyebrow: {
    color: COLORS.accentAlt,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 24,
    lineHeight: 32,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusText: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  heroLabel: {
    color: COLORS.textDim,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  heroName: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 28,
    lineHeight: 34,
  },
  heroDescription: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 22,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    minWidth: 160,
  },
  promptCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 18,
    gap: 10,
  },
  promptMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptLabel: {
    color: COLORS.accentAlt,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  promptText: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 18,
    lineHeight: 28,
  },
});
