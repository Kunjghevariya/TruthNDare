import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../../components/ui/app-button';
import { AppCard } from '../../../components/ui/app-card';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';

export const ProfileBanner = ({ username, subtitle, onLogout }) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.meta}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.username}>{username}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onLogout ? <AppButton label="Logout" variant="secondary" onPress={onLogout} /> : null}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: COLORS.textDim,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  username: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 24,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
  },
});
