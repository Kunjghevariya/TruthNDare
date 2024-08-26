import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import * as Clipboard from 'expo-clipboard';
import Showprofile from './component/showprofile';
import { getRoom } from './api/room';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const GradientBackground = styled(LinearGradient);

const Showroom = () => {
  const [roomID, setRoomID] = useState('');
  const [rID, setRID] = useState('');
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rcode, setrcode] = useState("");

  const route = useRoute();
  const navigation = useNavigation();
  const roomCode = route.params?.roomCode;

  useEffect(() => {
    const getPlayerName = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('@username');
        if (storedUsername) {
          setPlayerName(storedUsername);
        }
      } catch (error) {
        console.error('Failed to load player name from AsyncStorage:', error);
      }
    };

    getPlayerName();
  }, []);

  useEffect(() => {
    if (!playerName) return;

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
      if (roomCode) {
        setRoomID(roomCode);
        fetchRoomDetails(roomCode);
        newSocket.emit('joinRoom', { roomID: roomCode, playerName });
      }
    });

    newSocket.on("connect_error", (err) => {
      // the reason of the error, for example "xhr poll error"
      console.log(err.message);
    
      // some additional description, for example the status code of the initial HTTP response
      console.log(err.description);
    
      // some additional context, for example the XMLHttpRequest object
      console.log(err.context);
    });

    newSocket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on('start', () => {
      navigation.navigate('start', { roomCode, rID });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      newSocket.disconnect();
      newSocket.off('message');
    };
  }, [roomCode, navigation, playerName]);

  const fetchRoomDetails = useCallback(async (roomCode) => {
    setLoading(true);
    try {
      const roomDetails = await getRoom(roomCode);
      setrcode(roomDetails._id);
      setPlayers(roomDetails.players);
      setRID(roomDetails._id);
      console.log(rID)
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
      console.error('Socket not connected or roomID not set');
    }
  }, [socket, roomID]);

  const refreshPlayerNames = useCallback(() => {
    if (roomID) {
      fetchRoomDetails(roomID);
      if (socket && socket.connected) {
        socket.emit('refreshPlayers', roomID);
      } else {
        console.error('Socket not connected');
      }
    }
  }, [roomID, socket, fetchRoomDetails]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() === '') return;
    if (socket && roomID) {
      socket.emit('sendMessage', { roomID, text: newMessage, playerName });
      setNewMessage('');
    }
  }, [newMessage, socket, roomID, playerName]);

  return (
    <GradientBackground colors={['#06beb6', '#48b1bf']} className="flex-1 p-4">
      <Showprofile username={playerName} />
      <Text className="text-4xl text-white mb-6 md:text-5xl">Room</Text>
      <ScrollView>
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
          <View className="bg-white rounded-md p-4  h-auto">
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
          <View className="flex-1 bg-white rounded-md p-4">
            <Text className="text-2xl text-black mb-4">Chat</Text>
            <FlatList
              data={messages}
              renderItem={({ item }) => (
                <View
                  key={item.id}
                  className="mb-2 flex-row border border-black m-2 text-center items-center"
                >
                  <Text className="text-white bg-black mr-3 h-full text-sm">
                    {item.playerName}{' '}
                  </Text>
                  <Text className="text-black bg-white mr-3">:</Text>
                  <Text className="text-black bg-white w-full">{item.text}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
            />
            <View className="flex-row items-center mt-4">
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                className="bg-gray-200 rounded-md p-2 flex-1"
                placeholder="Type a message..."
                placeholderTextColor="#888888"
              />
              <TouchableOpacity
                className="bg-blue-600 rounded-md p-2 ml-2"
                onPress={handleSendMessage}
              >
                <Text className="text-white">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>
    </GradientBackground>
  );
};

export default Showroom;
