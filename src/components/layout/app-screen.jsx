import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, SPACING } from '../../constants/theme';

export const AppScreen = ({
  children,
  gradient = 'auth',
  scroll = true,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
}) => {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.scrollContent, contentContainerStyle]}>{children}</View>
  );

  return (
    <LinearGradient colors={GRADIENTS[gradient] || GRADIENTS.auth} style={styles.gradient}>
      <View style={[styles.orb, styles.orbLarge]} />
      <View style={[styles.orb, styles.orbSmall]} />
      <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: COLORS.ink,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  orbLarge: {
    width: 260,
    height: 260,
    top: -70,
    right: -60,
    backgroundColor: COLORS.accent,
  },
  orbSmall: {
    width: 180,
    height: 180,
    bottom: 70,
    left: -60,
    backgroundColor: COLORS.accentAlt,
  },
});
