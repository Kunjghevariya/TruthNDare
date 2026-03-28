import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../../../components/ui/app-card';
import { StatusPill } from '../../../components/ui/status-pill';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../../constants/theme';

export const PlayerRosterCard = ({
  players,
  leader,
  selectedPlayer,
  currentPlayerName,
}) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Player lineup</Text>
          <Text style={styles.caption}>Leader, active player, and everyone still in the room.</Text>
        </View>
        <StatusPill label={`${players.length} online`} tone="success" />
      </View>

      <View style={styles.roster}>
        {players.map((player) => {
          const isLeader = player === leader;
          const isSelected = player === selectedPlayer;
          const isCurrentPlayer = player === currentPlayerName;

          return (
            <View
              key={player}
              style={[
                styles.playerCard,
                isSelected ? styles.playerCardSelected : null,
                isCurrentPlayer ? styles.playerCardSelf : null,
              ]}
            >
              <View style={styles.playerTopRow}>
                <Text style={styles.playerName}>
                  {player}
                  {isCurrentPlayer ? ' (you)' : ''}
                </Text>
                {isLeader ? <StatusPill label="Leader" tone="accent" /> : null}
              </View>

              <Text style={styles.playerMeta}>
                {isSelected
                  ? 'Current round focus'
                  : isLeader
                    ? 'Controls game flow'
                    : 'Waiting for the next spin'}
              </Text>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  roster: {
    gap: 12,
  },
  playerCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    gap: 8,
  },
  playerCardSelected: {
    borderColor: 'rgba(255,122,89,0.34)',
    backgroundColor: 'rgba(255,122,89,0.12)',
  },
  playerCardSelf: {
    borderColor: 'rgba(53,208,186,0.34)',
  },
  playerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  playerName: {
    flex: 1,
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 15,
  },
  playerMeta: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
