import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Showprofile = () => {
  const [username, setUsername] = useState('notfound');
  const [menuVisible, setMenuVisible] = useState(false);
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
      navigation.navigate('login'); // Redirect to the login screen
    } catch (error) {
      console.error('Error during logout', error);
    }
  };

  const toggleMenu = () => {
    console.log('Profile clicked'); // Debugging log
    setMenuVisible(!menuVisible);
  };

  return (
    <SafeAreaView className="absolute top-14 left-2 w-48">
      <TouchableOpacity onPress={toggleMenu}>
        <View className="bg-white p-4 rounded-lg shadow-md">
          <Text className="text-gray-600">Username:</Text>
          <Text className="text-xl font-bold">{username}</Text>
        </View>
      </TouchableOpacity>

      {menuVisible && (
        <View className="mt-2 bg-white p-4 rounded-lg shadow-md">
          <TouchableOpacity onPress={handleLogout}>
            <Text className="text-red-600">Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Showprofile;
