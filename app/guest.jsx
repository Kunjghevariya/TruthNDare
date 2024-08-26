import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import Checkbox from 'expo-checkbox';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { styled } from 'nativewind';
import Showprofile from './component/showprofile';
import { createRoom } from './api/room';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GradientBackground = styled(LinearGradient);

const Guest = () => {
  const [isChecked, setChecked] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleCreateRoom = async () => {
    try {
      const roomData = await createRoom(roomName, isChecked, password);
      await AsyncStorage.setItem('createdRoom', JSON.stringify(roomData));
      await AsyncStorage.setItem('roomCode', roomCode);

      Alert.alert('Success', 'Room created successfully');
      navigation.navigate('showroom', {
        roomCode: roomCode,
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
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
        >
          <Text className="text-white text-lg">Create</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-black rounded-md p-4 items-center mb-4"
          onPress={() => navigation.navigate('roomjc')}
        >
          <Text className="text-white text-lg">Back</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
};

export default Guest;
