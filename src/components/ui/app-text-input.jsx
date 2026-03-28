import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export const AppTextInput = ({ label, hint, style, inputStyle, ...props }) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={COLORS.textDim}
        style={[styles.input, inputStyle]}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  label: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 58,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 16,
  },
  hint: {
    color: COLORS.textDim,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
