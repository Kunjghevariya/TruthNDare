import React, { useState } from 'react';
import { Alert, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Link, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { registerUser } from './api/auth';

const GradientBackground = styled(LinearGradient);

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await registerUser(email, password, username);
      Alert.alert('Success', response.message);
      navigation.navigate('index');
      console.log(response);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground
      colors={['#3a7bd5', '#3a6073']}
      className="flex justify-center items-center h-full p-4"
    >
      <Text className="text-5xl text-white mb-4 md:text-6xl m-9">Register</Text>
      <View className="w-80 px-4">
        <TextInput
          placeholder="Username"
          placeholderTextColor="black"
          className="bg-white rounded-md p-2 mb-4 text-lg h-12"
          onChangeText={setUsername}
          value={username}
        />
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
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="black"
          secureTextEntry
          className="bg-white rounded-md p-2 mb-4 text-lg h-12"
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />
        <TouchableOpacity
          className="bg-red-600 rounded-md p-4 items-center"
          onPress={handleRegister}
          disabled={loading}
        >
          <Text className="text-white text-lg">{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>
        <View className="my-3 flex-row justify-center gap-3 m-3">
          <TouchableOpacity
            className="bg-black rounded-md p-4 items-center w-1/2"
          >
            <Link href="/">
              <Text className="text-white text-lg">LogIn</Text>
            </Link>
          </TouchableOpacity>
          {/* <TouchableOpacity
            className="bg-black rounded-md p-4 items-center w-1/2"
          >
            <Link href="/guest">
              <Text className="text-white text-lg">Guest</Text>
            </Link>
          </TouchableOpacity> */}
        </View>
      </View>
    </GradientBackground>
  );
}

export default Register;
