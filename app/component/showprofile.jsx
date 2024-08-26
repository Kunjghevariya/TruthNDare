import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Showprofile = () => {
  const [username, setUsername] = useState("notfound");
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

  return (
    <SafeAreaView className="absolute top-14 left-2 w-48">
      <View className="bg-white p-4 rounded-lg shadow-md">
        <Text className="text-gray-600">Username:</Text>
        <Text className="text-xl font-bold">{username}</Text>
      </View>
    </SafeAreaView>
  );
}

export default Showprofile;
