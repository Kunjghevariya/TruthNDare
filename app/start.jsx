import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Text, TouchableOpacity, View } from 'react-native';
import io from 'socket.io-client';
import { getRoom } from './api/room';
import ChatComponent from './component/chatcomponent';
import Wheel from './component/gamewheel';

const GradientBackground = styled(LinearGradient);

const socket = io('https://truthndare-backend.onrender.com'); 

const Start = () => {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [playerNames, setPlayerNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState(null);
  const [messages, setMessages] = useState([]);
  const [playerName, setPlayerName] = useState('');

  const route = useRoute();
  const navigation = useNavigation();
  const roomCode = route.params?.roomCode;

  useEffect(() => {
    const getPlayerName = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('@username');
        if (storedUsername) setPlayerName(storedUsername);
      } catch (error) {
        console.error('Failed to load player name from AsyncStorage:', error);
      }
    };

    getPlayerName();
  }, []);

  useEffect(() => {
    if (roomCode) {
      fetchRoomDetails(roomCode);
    }

    socket.emit('joinRoom', roomCode);

    socket.on('rotateWheel', (data) => {
      console.log('Received rotateWheel event:', data);
      if (data && typeof data.selectedPlayer === 'number') {
        startRotation(data.selectedPlayer);
      } else {
        console.error('Invalid data received for rotateWheel:', data);
      }
    });

    socket.on('countdown', (seconds) => {
      setCountdown(seconds);
    });

    socket.on('message', (message) => {
      console.log(`Message received in room ${roomCode}: ${message}`);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('rotateWheel');
      socket.off('countdown');
      socket.off('message');
    };
  }, [roomCode]);

  const handleSendMessage = useCallback((message) => {
    if (socket && roomCode) {
      socket.emit('sendMessage', { roomID: roomCode, text: message, playerName });
    } else {
      Alert.alert('Error', 'Socket not connected or roomID not set');
    }
  }, [socket, roomCode, playerName]);

  const fetchRoomDetails = async (roomCode) => {
    setLoading(true);
    try {
      const roomDetails = await getRoom(roomCode);
      console.log('Room details:', roomDetails);
      setPlayerNames(roomDetails.players);
    } catch (error) {
      console.error('Error fetching room details:', error.message);
      Alert.alert('Error', 'Failed to fetch room details.');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(2);
    socket.emit('countdown', 2);
    setTimeout(() => {
      const playerIndex = Math.floor(Math.random() * playerNames.length);
      socket.emit('rotateWheel', { roomID: roomCode, selectedPlayer: playerIndex });
    }, 2000);
  };

  const startRotation = (selectedPlayerIndex = null) => {
    if (selectedPlayerIndex === null) return;
  
    const anglePerSegment = 360 / playerNames.length;
    const selectAngle = (selectedPlayerIndex * anglePerSegment) - anglePerSegment / 2;
  

    rotation.setValue(0);
  
    console.log('Rotating wheel...');
    
    Animated.timing(rotation, {
      toValue: 360 * 5 + selectAngle,
      duration: 4000, 
      useNativeDriver: true, 
    }).start(() => {
      setSelectedPlayerIndex(selectedPlayerIndex);
      setSelectedPlayer(playerNames[selectedPlayerIndex]);
      setShowResult(true);
      setLoading(false);
    });
  };
  

  const backHandle = () => {
    navigation.navigate('showroom', { roomCode });
  };

  return (
    <GradientBackground
      colors={['#de6161', '#2657eb']}
      className="flex justify-center items-center h-full p-4"
    >
      {/* <View className="flex-1 px-2 my-2 h-2/3 md:h-96">
        <ChatComponent messages={messages} onSendMessage={handleSendMessage} />
      </View> */}
      <View className="justify-center items-center">
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <>
            <Wheel
              playerNames={playerNames}
              rotation={rotation}
              selectedPlayerIndex={selectedPlayerIndex}
              onRotate={startCountdown}
            />
            <Text className="absolute text-8xl text-center justify-center top-24 right-0">&#9001;</Text>
          </>
        )}
      </View>
      <TouchableOpacity
        className="m-2 bg-black rounded-md p-4 items-center w-1/2"
        onPress={backHandle}
      >
        <Text className="text-white text-lg">Back</Text>
      </TouchableOpacity>
      <View className="absolute bottom-10">
        <Text className="text-white text-2xl">
          {countdown > 0 ? `Starting in ${countdown}s` : 'Spinning!'}
        </Text>
      </View>
    </GradientBackground>
  );
};

export default Start;
