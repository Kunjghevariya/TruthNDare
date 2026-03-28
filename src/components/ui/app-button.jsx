import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

const VARIANTS = {
  primary: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    textColor: COLORS.white,
  },
  secondary: {
    backgroundColor: COLORS.surfaceRaised,
    borderColor: COLORS.borderStrong,
    textColor: COLORS.text,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    textColor: COLORS.textMuted,
  },
};

export const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessory,
}) => {
  const palette = VARIANTS[variant] || VARIANTS.primary;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: isDisabled ? 0.55 : pressed ? 0.9 : 1,
        },
        variant === 'primary' ? SHADOWS.glow : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.textColor} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, { color: palette.textColor }, textStyle]}>{label}</Text>
          {accessory}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
