import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { styled } from 'nativewind';
import React, { useRef, useState, useEffect } from 'react';
import { Animated, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { G, Path, Svg, Text as SvgText } from 'react-native-svg';
import io from 'socket.io-client';
import { getRoom } from './api/room';
import { useRoute, useNavigation } from '@react-navigation/native';

const GradientBackground = styled(LinearGradient);

const socket = io('https://truthndare-backend.onrender.com:8002'); // Replace with your backend URL

const Index = () => {
  const [selectplayer, setselectplayer] = useState('');
  const [show, setshow] = useState(false);
  const [playerNames, setPlayers] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const players = playerNames.length;
  const rotation = useRef(new Animated.Value(0)).current;
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const route = useRoute();
  const navigation = useNavigation();
  const roomCode = route.params?.roomCode;
  const degree = 700;

  useEffect(() => {
    if (roomCode) {
      fetchRoomDetails(roomCode);
    }
  }, [roomCode]);

  const fetchRoomDetails = async (roomCode) => {
    setLoading(true); // Start loading
    try {
      const roomDetails = await getRoom(roomCode);
      console.log('Room details:', roomDetails);
      setPlayers(roomDetails.players);
    } catch (error) {
      console.error('Error fetching room details:', error.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  const generateSegments = (numSegments, selectedIndex) => {
    const segments = [];
    const angle = 360 / numSegments;
    const colors = ['green', 'yellow', 'red'];

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
            fill={i === selectedIndex ? 'orange' : colors[i % 3]}
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

  const rotateWheel = () => {

    const anglePerSegment = 360 / players;
    const selectedPlayer = Math.floor(Math.random() * players);
    const selectangle = (selectedPlayer * anglePerSegment) - anglePerSegment / 2;
    const randomDegree = selectangle;

    Animated.timing(rotation, {
      toValue: 360 - randomDegree - anglePerSegment,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      const selectedAngle = selectangle;
      setSelectedPlayerIndex(selectedPlayer);
      console.log('Selected Player:', playerNames[selectedPlayer]);
      setselectplayer(playerNames[selectedPlayer]);
      setshow(true);
      setLoading(false); // End loading

      // Emit the selected player to the backend
      socket.emit('selectPlayer', { playerId: playerNames[selectedPlayer] });
    });
  };

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <GradientBackground
      colors={['#de6161', '#2657eb']}
      className="flex justify-center items-center h-full p-4"
    >
      <View className="justify-center items-center">
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <>
            <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
              <Svg height="300" width="300" viewBox="0 0 200 200">
                <G>{generateSegments(players, selectedPlayerIndex)}</G>
              </Svg>
            </Animated.View>
            <Text className=" absolute text-8xl text-center justify-center top-28 right-0">&#9001;</Text>
            <TouchableOpacity
              className="mt-4 p-2 bg-white rounded"
              onPress={rotateWheel}
            >
              <Text className="text-black font-bold">Rotate</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <TouchableOpacity
        className="m-2 bg-black rounded-md p-4 items-center w-1/2"
      >
        <Text className="text-white text-lg">
          <Link href="/roomjc">Back</Link>
        </Text>
      </TouchableOpacity>
      {show ? (
        <View className='bg-white absolute text-5xl p-5'>
          <Text className="text-3xl m-5">
            Selected Player: {selectplayer}
          </Text>
        </View>
      ) : null}
    </GradientBackground>
  );
};

export default Index;
