import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import Showprofile from './component/showprofile';
import { Link, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GradientBackground = styled(LinearGradient);

const RoomJC = () => {
  const [username, setUsername] = useState("notfound");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('@username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Error fetching username', error);
      }
    };

    fetchUsername();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@access_token');
      await AsyncStorage.removeItem('@refresh_token');
      await AsyncStorage.removeItem('@username');
      Alert.alert('Logged out', 'You have been logged out successfully.');
      navigation.navigate('index'); // Redirect to the login screen
    } catch (error) {
      console.error('Error during logout', error);
    }
  };

  return (
    <GradientBackground
      colors={['#F3904F', '#3B4371']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <Showprofile username={username} />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-5xl text-white mb-4 md:text-6xl m-9">Room</Text>
          <View className="w-80 px-4 flex gap-4">
            <TouchableOpacity
              className="bg-red-600 rounded-md p-4 items-center"
            >
              <Link href="/createroom">
                <Text className="text-white text-lg">Create Room</Text>
              </Link>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-600 rounded-md p-4 items-center"
            >
              <Link href="/joinroom">
                <Text className="text-white text-lg">Join Room</Text>
              </Link>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-black border border-white rounded-md p-4 items-center"
              onPress={handleLogout}
            >
              <Text className="text-white text-lg">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

export default RoomJC;
