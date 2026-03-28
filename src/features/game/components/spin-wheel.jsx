import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Circle, G, Path, Polygon, Svg, Text as SvgText } from 'react-native-svg';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';

export const WHEEL_PALETTES = [
  {
    base: '#ff7a59',
    active: '#ffd3c7',
    halo: 'rgba(255,122,89,0.26)',
    ring: 'rgba(255,122,89,0.44)',
    text: COLORS.white,
    activeText: COLORS.ink,
  },
  {
    base: '#37d0ba',
    active: '#c6fff4',
    halo: 'rgba(55,208,186,0.26)',
    ring: 'rgba(55,208,186,0.4)',
    text: COLORS.white,
    activeText: COLORS.ink,
  },
  {
    base: '#6f8cff',
    active: '#d8e1ff',
    halo: 'rgba(111,140,255,0.24)',
    ring: 'rgba(111,140,255,0.4)',
    text: COLORS.white,
    activeText: COLORS.ink,
  },
  {
    base: '#f6b144',
    active: '#ffe7ba',
    halo: 'rgba(246,177,68,0.24)',
    ring: 'rgba(246,177,68,0.38)',
    text: COLORS.ink,
    activeText: COLORS.ink,
  },
  {
    base: '#b269ff',
    active: '#ead9ff',
    halo: 'rgba(178,105,255,0.24)',
    ring: 'rgba(178,105,255,0.36)',
    text: COLORS.white,
    activeText: COLORS.ink,
  },
  {
    base: '#ff6ea8',
    active: '#ffd4e4',
    halo: 'rgba(255,110,168,0.24)',
    ring: 'rgba(255,110,168,0.36)',
    text: COLORS.white,
    activeText: COLORS.ink,
  },
];

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArcSegment = (centerX, centerY, radius, startAngle, endAngle) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
};

const getPlayerBadge = (playerName) => {
  if (!playerName) {
    return 'GO';
  }

  return playerName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 3);
};

export const SpinWheel = ({
  playerNames,
  rotation,
  selectedPlayerIndex,
  selectedPlayerName,
  onSpin,
  disabled = false,
  buttonLabel,
}) => {
  const wheelSize = 332;
  const center = wheelSize / 2;
  const radius = 146;
  const angleStep = playerNames.length ? 360 / playerNames.length : 360;
  const hasSelection = typeof selectedPlayerIndex === 'number';
  const activePalette = hasSelection
    ? WHEEL_PALETTES[selectedPlayerIndex % WHEEL_PALETTES.length]
    : {
        active: COLORS.white,
        base: COLORS.accent,
        halo: 'rgba(255,255,255,0.08)',
        ring: 'rgba(255,255,255,0.16)',
        text: COLORS.white,
        activeText: COLORS.ink,
      };

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.pointerWrap}>
        <Svg width={48} height={40} viewBox="0 0 48 40">
          <Circle cx="24" cy="12" r="9" fill={hasSelection ? activePalette.active : COLORS.white} />
          <Polygon points="24,40 42,10 6,10" fill={hasSelection ? activePalette.active : COLORS.white} />
        </Svg>
      </View>

      <Animated.View style={[styles.wheelWrap, { transform: [{ rotate: rotateInterpolation }] }]}>
        <Svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
          <Circle cx={center} cy={center} r={radius + 22} fill={activePalette.halo} />
          <Circle cx={center} cy={center} r={radius + 12} fill={activePalette.ring} />
          <Circle cx={center} cy={center} r={radius + 6} fill="rgba(8,17,32,0.5)" />

          <G>
            {playerNames.map((playerName, index) => {
              const startAngle = index * angleStep;
              const endAngle = startAngle + angleStep;
              const midAngle = startAngle + angleStep / 2;
              const textPoint = polarToCartesian(center, center, radius - 48, midAngle);
              const palette = WHEEL_PALETTES[index % WHEEL_PALETTES.length];
              const isSelected = index === selectedPlayerIndex;

              return (
                <G key={`${playerName}-${index}`}>
                  <Path
                    d={describeArcSegment(center, center, radius, startAngle, endAngle)}
                    fill={isSelected ? palette.active : palette.base}
                    opacity={hasSelection && !isSelected ? 0.48 : 1}
                    stroke={isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(8,17,32,0.34)'}
                    strokeWidth="2"
                  />
                  <SvgText
                    x={textPoint.x}
                    y={textPoint.y}
                    fill={isSelected ? palette.activeText : palette.text}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily={TYPOGRAPHY.heading}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    rotation={midAngle}
                    origin={`${textPoint.x}, ${textPoint.y}`}
                  >
                    {playerName.slice(0, 12)}
                  </SvgText>
                </G>
              );
            })}
          </G>

          <Circle cx={center} cy={center} r={52} fill="rgba(8,17,32,0.95)" />
          <Circle cx={center} cy={center} r={40} fill={hasSelection ? activePalette.base : COLORS.accent} />
          <SvgText
            x={center}
            y={center - 6}
            fill={COLORS.white}
            fontSize="10"
            fontFamily={TYPOGRAPHY.heading}
            textAnchor="middle"
            letterSpacing="1"
          >
            {hasSelection ? 'Picked' : 'Ready'}
          </SvgText>
          <SvgText
            x={center}
            y={center + 14}
            fill={COLORS.white}
            fontSize="18"
            fontFamily={TYPOGRAPHY.heading}
            textAnchor="middle"
          >
            {getPlayerBadge(selectedPlayerName)}
          </SvgText>
        </Svg>
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        disabled={disabled || playerNames.length < 2}
        onPress={onSpin}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: hasSelection ? activePalette.active : COLORS.white,
            opacity: disabled || playerNames.length < 2 ? 0.45 : pressed ? 0.92 : 1,
          },
        ]}
      >
        <Text style={styles.buttonText}>
          {playerNames.length < 2 ? 'Need 2+ players' : buttonLabel || 'Start spin'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 18,
  },
  pointerWrap: {
    marginBottom: -20,
    zIndex: 2,
  },
  wheelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    minHeight: 58,
    minWidth: 196,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: COLORS.ink,
    fontFamily: TYPOGRAPHY.heading,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
