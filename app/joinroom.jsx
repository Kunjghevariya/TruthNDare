import React, { useState, useEffect } from 'react';
import { Link, useNavigation } from 'expo-router';
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import Showprofile from './component/showprofile';
import socket from './api/socket'; // Import your socket instance
import { joinRoom } from './api/room';

const GradientBackground = styled(LinearGradient);

const JoinRoom = () => {
  const [roomID, setRoomID] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigation = useNavigation();

  useEffect(() => {
    socket.on('userJoined', (username) => {
      setStatus(`${username} joined the room`);
    });

    // Listen for the 'start' event if needed
    socket.on('start', () => {
      Alert.alert('Notification', 'The game has started!');
    });

    // Cleanup on component unmount
    return () => {
      socket.off('userJoined');
      socket.off('start');
    };
  }, []);

  const handleJoinRoom = async () => {
    if (!roomID) {
      Alert.alert('Error', 'Room ID is required');
      return;
    }

    setLoading(true); // Start loading

    try {
      const roomDetails = await joinRoom(null, roomID, password);
      console.log('Joined room successfully:', roomDetails);
      Alert.alert('Success', 'Joined the room successfully');
      navigation.navigate('showroom', { roomCode: roomID });

      // Emit event after joining the room
      socket.emit('joinRoom', roomID);
    } catch (error) {
      console.error('Error joining room:', error.message);
      Alert.alert('Error', error.message || 'An error occurred while joining the room');
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <GradientBackground
      colors={['#30E8BF', '#FF8235']}
      className="flex justify-center items-center h-full p-4"
    >
      <Showprofile username={"kunjghevariya"} />
      <Text className="text-5xl text-white mb-4 md:text-6xl m-9">Join Room</Text>
      <View className="w-80 px-4">
        <TextInput
          placeholder="Room ID"
          placeholderTextColor="black"
          value={roomID}
          onChangeText={setRoomID}
          className="bg-white rounded-md p-2 h-12 mb-4 text-lg"
        />
        <TextInput
          placeholder="Password (if any)"
          placeholderTextColor="black"
          value={password}
          onChangeText={setPassword}
          className="bg-white rounded-md p-2 h-12 mb-4 text-lg"
          secureTextEntry
        />
        <TouchableOpacity
          className="bg-red-600 rounded-md p-4 items-center"
          onPress={handleJoinRoom}
          disabled={loading} // Disable button while loading
        >
          <Text className="text-white text-lg">Join</Text>
        </TouchableOpacity>
        <View className="my-3 flex-row justify-center gap-3 m-3">
          <TouchableOpacity
            className="bg-black rounded-md p-4 items-center w-1/2"
          >
            <Link href={"/roomjc"}>
              <Text className="text-white text-lg">Back</Text>
            </Link>
          </TouchableOpacity>
        </View>
        {loading && <ActivityIndicator size="large" color="#ffffff" className="mt-4" />}
        {status && <Text className="text-white mt-4">{status}</Text>}
      </View>
    </GradientBackground>
  );
};

export default JoinRoom;
