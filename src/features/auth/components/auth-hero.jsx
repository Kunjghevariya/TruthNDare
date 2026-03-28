import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusPill } from '../../../components/ui/status-pill';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';

export const AuthHero = ({ eyebrow, title, description, tone = 'accent' }) => {
  return (
    <View style={styles.container}>
      <StatusPill label={eyebrow} tone={tone} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 34,
    lineHeight: 42,
  },
  description: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 560,
  },
});
