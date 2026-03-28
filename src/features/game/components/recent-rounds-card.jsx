import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../../../components/ui/app-card';
import { EmptyState } from '../../../components/ui/empty-state';
import { StatusPill } from '../../../components/ui/status-pill';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../../constants/theme';

const formatRoundTime = (createdAt) => {
  if (!createdAt) {
    return 'Just now';
  }

  const value = new Date(createdAt);

  if (Number.isNaN(value.getTime())) {
    return 'Just now';
  }

  return value.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const RecentRoundsCard = ({ recentRounds = [] }) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Recent rounds</Text>
          <Text style={styles.caption}>A quick memory of the best turns so the game feels alive, not reset every spin.</Text>
        </View>
        <StatusPill label={`${recentRounds.length} saved`} tone="accent" />
      </View>

      {recentRounds.length ? (
        <View style={styles.list}>
          {recentRounds
            .slice()
            .reverse()
            .map((round, index) => (
              <View key={`${round.playerName}-${round.choice}-${round.createdAt || index}`} style={styles.item}>
                <View style={styles.itemTop}>
                  <Text style={styles.playerName}>{round.playerName}</Text>
                  <Text style={styles.time}>{formatRoundTime(round.createdAt)}</Text>
                </View>
                <View style={styles.pills}>
                  <StatusPill label={round.choice} tone="accent" />
                  {round.tone ? <StatusPill label={round.tone} tone="default" /> : null}
                  {round.intensity ? <StatusPill label={round.intensity} tone="default" /> : null}
                </View>
                <Text style={styles.prompt}>{round.prompt}</Text>
              </View>
            ))}
        </View>
      ) : (
        <EmptyState
          title="No rounds yet"
          description="Once the first Truth or Dare lands, the last few turns will show up here."
        />
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 24,
  },
  caption: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 21,
  },
  list: {
    gap: 12,
  },
  item: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    gap: 10,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  playerName: {
    flex: 1,
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 15,
  },
  time: {
    color: COLORS.textDim,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 12,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prompt: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 21,
  },
});
