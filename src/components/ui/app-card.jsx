import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

export const AppCard = ({ children, style, elevated = true }) => {
  return <View style={[styles.card, elevated ? SHADOWS.soft : null, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
});
