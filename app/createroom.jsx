import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useNavigation } from 'expo-router';
import { styled } from 'nativewind';
import Showprofile from './component/showprofile';
import { createRoom } from './api/room';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';

const GradientBackground = styled(LinearGradient);

const Guest = () => {
  const [isChecked, setChecked] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigation = useNavigation();

  const socket = io("https://truthndare-backend.onrender.com:8002");

  const handleCreateRoom = async () => {
    if (!roomName) {
      Alert.alert('Error', 'Room Name is required');
      return;
    }

    setLoading(true); // Start loading

    try {
      const roomData = await createRoom(roomName, isChecked, password); // Pass password if needed
      const roomCode = roomData.data.code;
      await AsyncStorage.setItem('createdRoom', JSON.stringify(roomData));
      await AsyncStorage.setItem('roomCode', roomCode);

      Alert.alert('Success', 'Room created successfully');
      navigation.navigate('showroom', { roomCode: roomCode });
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <GradientBackground
      colors={['#8360c3', '#2ebf91']}
      className="flex justify-center items-center h-full p-4"
    >
      <Showprofile username="kunjghevariya" />
      <Text className="text-5xl text-white mb-4 md:text-6xl m-9">Create Room</Text>
      <View className="w-80 px-4">
        <TextInput
          placeholder="Room Name"
          placeholderTextColor="black"
          className="bg-white rounded-md p-2 h-12 mb-4 text-lg"
          value={roomName}
          onChangeText={setRoomName}
        />
        <View className="flex-row items-center mb-4">
          <Checkbox value={isChecked} onValueChange={setChecked} />
          <Text className="ml-2 text-white">Make room private</Text>
        </View>
        {isChecked && (
          <TextInput
            placeholder="Password"
            placeholderTextColor="black"
            className="bg-white rounded-md p-2 h-12 mb-4 text-lg"
            value={password}
            onChangeText={setPassword}
          />
        )}
        <TouchableOpacity
          className="bg-black rounded-md p-4 items-center mb-4"
          onPress={handleCreateRoom}
          disabled={loading} // Disable button while loading
        >
          <Text className="text-white text-lg">Create</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black rounded-md p-4 items-center mb-4"
          onPress={() => navigation.navigate('roomjc')}
        >
          <Text className="text-white text-lg">Back</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color="#ffffff" className="mt-4" />}
      </View>
    </GradientBackground>
  );
};

export default Guest;
