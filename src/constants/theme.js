import { Platform } from 'react-native';

export const COLORS = {
  ink: '#081120',
  inkSoft: '#16233b',
  surface: '#101a2c',
  surfaceRaised: '#16243d',
  border: 'rgba(255, 255, 255, 0.12)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',
  text: '#f3f7ff',
  textMuted: '#a2b0cc',
  textDim: '#7c8ba8',
  accent: '#ff7a59',
  accentStrong: '#ff5a36',
  accentAlt: '#35d0ba',
  accentAltStrong: '#1db5a2',
  success: '#5ce1a7',
  danger: '#ff7676',
  card: 'rgba(10, 18, 33, 0.72)',
  cardStrong: 'rgba(15, 24, 41, 0.9)',
  overlay: 'rgba(6, 10, 20, 0.7)',
  white: '#ffffff',
  black: '#000000',
};

export const GRADIENTS = {
  auth: ['#081120', '#12213c', '#1f3f66'],
  lobby: ['#091223', '#12203a', '#162a4a'],
  room: ['#051019', '#10253a', '#144c5d'],
  game: ['#190c22', '#202b4e', '#0d5c68'],
};

export const RADIUS = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
};

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const TYPOGRAPHY = {
  heading: 'SpaceMono',
  mono: 'SpaceMono',
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui',
  }),
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 10,
  },
  glow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 7,
  },
};
