import React, { useRef } from 'react';
import { Animated, View, Text, TouchableOpacity } from 'react-native';
import { G, Path, Svg, Text as SvgText } from 'react-native-svg';

const Wheel = ({ playerNames, rotation, selectedPlayerIndex, onRotate }) => {
  const rotationInterpolation = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const generateSegments = (numSegments, selectedIndex) => {
    const segments = [];
    const angle = 360 / numSegments;
    const colors = ['green', 'red', 'orange', 'yellow'];

    for (let i = 0; i < numSegments; i++) {
      const startAngle = (angle * i) * (Math.PI / 180);
      const endAngle = (angle * (i + 1)) * (Math.PI / 180);
      const largeArcFlag = angle > 180 ? 1 : 0;

      const x1 = 100 + 100 * Math.cos(startAngle);
      const y1 = 100 + 100 * Math.sin(startAngle);
      const x2 = 100 + 100 * Math.cos(endAngle);
      const y2 = 100 + 100 * Math.sin(endAngle);

      const pathData = `
        M 100 100
        L ${x1} ${y1}
        A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;

      segments.push(
        <G key={i}>
          <Path
            d={pathData}
            fill={i === selectedIndex ? 'orange' : colors[i % colors.length]}
            stroke="black"
            strokeWidth="1"
          />
          <SvgText
            x={100 + 70 * Math.cos(startAngle + (endAngle - startAngle) / 2)}
            y={100 + 70 * Math.sin(startAngle + (endAngle - startAngle) / 2)}
            fill="white"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {playerNames[i]}
          </SvgText>
        </G>
      );
    }
    return segments;
  };

  return (
    <View>
      <Animated.View style={{ transform: [{ rotate: rotationInterpolation }] }}>
        <Svg height="300" width="300" viewBox="0 0 200 200">
          <G>{generateSegments(playerNames.length, selectedPlayerIndex)}</G>
        </Svg>
      </Animated.View>
      <TouchableOpacity
        className="mt-4 p-2 bg-white rounded"
        onPress={onRotate}
      >
        <Text className="text-black font-bold text-center">Rotate</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Wheel;
