import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import * as Clipboard from 'expo-clipboard';
import Showprofile from './component/showprofile';
import { getRoom } from './api/room';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatComponent from './component/chatcomponent';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const GradientBackground = styled(LinearGradient);

const Showroom = () => {
  const [roomID, setRoomID] = useState('');
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rcode, setRcode] = useState("");

  const scrollRef = useRef(null); // Reference for the ScrollView

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
    if (!playerName || !roomCode) return;

    const newSocket = io('https://truthndare-backend.onrender.com', {
      transports: ['websocket'],
      withCredentials: true,
      secure: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setRoomID(roomCode);
      fetchRoomDetails(roomCode);
      newSocket.emit('joinRoom', { roomID: roomCode, playerName });
    });

    newSocket.on("connect_error", (err) => {
      console.error('Socket connection error:', err.message);
    });

    newSocket.on('message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    newSocket.on('start', () => {
      navigation.navigate('start', { roomCode, rID: rcode });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomCode, playerName, navigation]);

  const fetchRoomDetails = useCallback(async (roomCode) => {
    setLoading(true);
    try {
      const roomDetails = await getRoom(roomCode);
      setRcode(roomDetails._id);
      setPlayers(roomDetails.players);
    } catch (error) {
      console.error('Error fetching room details:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    Clipboard.setString(roomID);
    Alert.alert('Room ID copied to clipboard!');
  }, [roomID]);

  const startGame = useCallback(() => {
    if (socket && roomID) {
      socket.emit('start', roomID);
    } else {
      Alert.alert('Error', 'Socket not connected or roomID not set');
    }
  }, [socket, roomID]);

  const refreshPlayerNames = useCallback(() => {
    if (roomID) {
      fetchRoomDetails(roomID);
      if (socket && socket.connected) {
        socket.emit('refreshPlayers', roomID);
      } else {
        Alert.alert('Error', 'Socket not connected');
      }
    }
  }, [roomID, socket, fetchRoomDetails]);

  const handleSendMessage = useCallback((message) => {
    if (socket && roomID) {
      socket.emit('sendMessage', { roomID, text: message, playerName });
    } else {
      Alert.alert('Error', 'Socket not connected or roomID not set');
    }
  }, [socket, roomID, playerName]);

  return (
    <GradientBackground colors={['#06beb6', '#48b1bf']} className="flex-1 p-4">
      <ScrollView ref={scrollRef}>
        <Showprofile username={playerName} />
        <Text className="text-4xl text-white mb-6 md:text-5xl">Room</Text>
        <View className="flex-1 md:flex-row mt-28">
          <View className="flex- px-2">
            <TextInput
              value={roomID}
              className="bg-black text-white rounded-md p-2 h-12 mb-4 text-xl text-center"
              editable={false}
            />
            <TouchableOpacity
              className="bg-red-600 rounded-md p-4 items-center mb-4"
              onPress={copyToClipboard}
            >
              <Text className="text-white text-lg">Copy Room ID</Text>
            </TouchableOpacity>
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                className="bg-purple-600 rounded-md p-4 flex-1 mr-2"
                onPress={startGame}
              >
                <Text className="text-white text-lg text-center">Start Game</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-teal-600 rounded-md p-4 flex-1 ml-2"
                onPress={refreshPlayerNames}
              >
                <Text className="text-white text-lg text-center">Refresh Players</Text>
              </TouchableOpacity>
            </View>
            <View className="bg-white rounded-md p-4 h-auto">
              <Text className="text-2xl text-black mb-4">Players in the Room:</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#000000" />
              ) : (
                <ScrollView style={{ maxHeight: 150 }}>
                  {players.length ? (
                    players.map((player, index) => (
                      <Text key={index} className="text-black text-lg mb-2">
                        {player}
                      </Text>
                    ))
                  ) : (
                    <Text className="text-black text-lg">No players yet</Text>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
          <View className="flex-1 px-2 my-2 h-2/3 md:h-96">
            <ChatComponent messages={messages} onSendMessage={handleSendMessage} />
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        className=" bottom-0 right-0 absolute m-2 bg-black rounded-md p-4 items-center"
        onPress={() => scrollRef.current.scrollToEnd({ animated: true })}
      >
        <FontAwesome name="angle-double-down" size={24} color="white" />
      </TouchableOpacity>
    </GradientBackground>
  );
};

export default Showroom;