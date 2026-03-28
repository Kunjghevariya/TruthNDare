import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../../../components/ui/app-card';
import { EmptyState } from '../../../components/ui/empty-state';
import { StatusPill } from '../../../components/ui/status-pill';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../../constants/theme';

export const PlayerListCard = ({ currentUser, leader, phase, players }) => {
  const orderedPlayers = leader
    ? [...players].sort((left, right) => {
        if (left === leader) {
          return -1;
        }

        if (right === leader) {
          return 1;
        }

        return left.localeCompare(right);
      })
    : players;

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Players</Text>
          <Text style={styles.caption}>Everyone currently synced into this room.</Text>
        </View>
        <StatusPill label={phase === 'playing' ? 'Game live' : 'Lobby'} tone={phase === 'playing' ? 'accent' : 'default'} />
      </View>

      {orderedPlayers.length ? (
        <View style={styles.list}>
          {orderedPlayers.map((player) => (
            <View key={player} style={styles.playerRow}>
              <Text style={styles.playerName}>{player}</Text>
              <View style={styles.playerMeta}>
                {player === leader ? <StatusPill label="Leader" tone="accent" /> : null}
                {player === currentUser ? <StatusPill label="You" tone="success" /> : null}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          title="The room is empty"
          description="Share the invite code and refresh once people start joining."
        />
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
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
    lineHeight: 20,
  },
  list: {
    marginTop: 8,
    gap: 10,
  },
  playerRow: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  playerName: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
  },
  playerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
