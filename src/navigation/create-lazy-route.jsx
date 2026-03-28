import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

const RouteFallback = () => (
  <View style={styles.container}>
    <ActivityIndicator color={COLORS.accent} size="large" />
    <Text style={styles.text}>Loading the next screen…</Text>
  </View>
);

export const createLazyRoute = (loader) => {
  const LazyScreen = lazy(loader);

  return function LazyRoute(props) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <LazyScreen {...props} />
      </Suspense>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.ink,
    gap: 12,
  },
  text: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.body,
    fontSize: 14,
  },
});
