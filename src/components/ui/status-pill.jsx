import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export const StatusPill = ({ label, tone = 'default' }) => {
  const toneStyles = {
    default: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      color: COLORS.textMuted,
    },
    success: {
      backgroundColor: 'rgba(92,225,167,0.12)',
      color: COLORS.success,
    },
    accent: {
      backgroundColor: 'rgba(255,122,89,0.12)',
      color: COLORS.accent,
    },
  }[tone];

  return (
    <View style={[styles.pill, { backgroundColor: toneStyles.backgroundColor }]}>
      <Text style={[styles.text, { color: toneStyles.color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
