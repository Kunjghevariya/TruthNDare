import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginUser } from './api/auth';



const GradientBackground = styled(LinearGradient);

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); 

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await loginUser(email, password);
      const { accessToken, refreshToken } = response.data;
      const username = response.data.user.username;
      await AsyncStorage.setItem('@access_token', accessToken);
      await AsyncStorage.setItem('@refresh_token', refreshToken);
      await AsyncStorage.setItem('@username', username);
      
      Alert.alert('Success', response.message);
      navigation.navigate('roomjc');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground
      colors={['#ff5f6d', '#ffc371']}
      className="flex justify-center items-center h-full p-4"
    >
      <Text className="text-5xl text-white mb-4 md:text-6xl m-9">Login</Text>
      <View className="w-80 px-4">
        <TextInput
          placeholder="Email"
          placeholderTextColor="black"
          className="bg-white rounded-md p-2 mb-4 text-lg h-12"
          onChangeText={setEmail}
          value={email}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="black"
          secureTextEntry
          className="bg-white rounded-md p-2 mb-4 text-lg h-12"
          onChangeText={setPassword}
          value={password}
        />
        <TouchableOpacity
          className="bg-red-600 rounded-md p-4 items-center"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-lg">{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        <View className="my-3 flex-row justify-center gap-3 m-3">
          <TouchableOpacity
            className="bg-black rounded-md p-4 items-center w-1/2"
            onPress={() => navigation.navigate('register')}
          >
            <Text className="text-white text-lg">Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-black rounded-md p-4 items-center w-1/2"
            onPress={() => navigation.navigate('guest')}
          >
            <Text className="text-white text-lg">Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}
