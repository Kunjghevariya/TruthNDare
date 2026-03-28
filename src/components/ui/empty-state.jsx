import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

export const EmptyState = ({ title, description }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 18,
    gap: 8,
  },
  title: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 18,
  },
  description: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
