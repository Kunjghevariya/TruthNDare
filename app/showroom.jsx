import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import * as Clipboard from 'expo-clipboard';
import Showprofile from './component/showprofile';
import { getRoom } from './api/room';
import io from 'socket.io-client';

const GradientBackground = styled(LinearGradient);

const Showroom = () => {
  const [roomID, setRoomID] = useState('');
  const [players, setPlayers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);

  const route = useRoute();
  const navigation = useNavigation();
  const roomCode = route.params?.roomCode;

  useEffect(() => {
    const newSocket = io('http://localhost:8002');
    setSocket(newSocket);
  
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      if (roomCode) {
        setRoomID(roomCode);
        fetchRoomDetails(roomCode);
        newSocket.emit('joinRoom', { roomCode, players });
      }
    });
  
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  
    newSocket.on('start', () => {
      console.log('Received startGame event');
      console.log(roomCode);
      navigation.navigate('start', {
        roomCode: roomCode,
      });
    });
  
    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  
    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
      newSocket.off('start');
    };
  }, [roomCode, navigation]);

  const fetchRoomDetails = async (roomCode) => {
    setLoading(true);
    try {
      const roomDetails = await getRoom(roomCode);
      console.log('Room details:', roomDetails);
      setPlayers(roomDetails.players);
    } catch (error) {
      console.error('Error fetching room details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(roomID);
    Alert.alert('Room ID copied to clipboard!');
  };

  const startGame = () => {
    socket.emit('start', roomID);
    console.log('emitted');
  };

  const refreshPlayerNames = () => {
    if (roomID) {
      fetchRoomDetails(roomID);
      if (socket && socket.connected) {
        socket.emit('refreshPlayers', roomID);
      } else {
        console.error('Socket not connected');
      }
    }
  };

  return (
    <GradientBackground
      colors={['#06beb6', '#48b1bf']}
      className="flex items-center h-full p-4"
    >
      <Showprofile username="kunjghevariya" />
      <Text className="text-5xl text-white mb-8 md:text-6xl m-14 mr-0 ml-auto">Room</Text>
      <View className="w-80 px-4">
        <TextInput
          value={roomID}
          className="bg-black text-white rounded-md p-2 h-12 mb-4 text-5xl text-center"
          editable={false}
        />
        <TouchableOpacity
          className="bg-red-600 rounded-md p-4 items-center"
          onPress={copyToClipboard}
        >
          <Text className="text-white text-lg">Copy Room ID</Text>
        </TouchableOpacity>
        <View className="my-3 flex-row justify-center gap-3 m-3">
          <TouchableOpacity
            className="bg-purple-600 rounded-md p-4 items-center w-1/2"
            onPress={startGame}
          >
            <Text className="text-white text-lg">Start Game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-teal-600 rounded-md p-4 items-center w-1/2"
            onPress={refreshPlayerNames}
          >
            <Text className="text-white text-lg">Refresh Players</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="w-full px-4 mt-8">
        <Text className="text-3xl text-white mb-4">Players in the Room:</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <View className="bg-white rounded-md p-4">
            {players.map((player, index) => (
              <Text key={index} className="text-black text-lg mb-2">{player}</Text>
            ))}
          </View>
        )}
      </View>
    </GradientBackground>
  );
};

export default Showroom;
