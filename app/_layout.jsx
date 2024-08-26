import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { useState } from 'react';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

export default function RootLayout() {
  const [roomCode, setroomCode] = useState('')
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="showroom"
        options={{
          headerShown: false,
        }}
        roomCode={roomCode}
        setroomCode={setroomCode}
      />
      <Stack.Screen
        name="roomjc"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="guest"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="createroom"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="joinroom"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="start"
        options={{
          headerShown: false,
        }}
        roomCode={roomCode}
        setroomCode={setroomCode}
      />
    </Stack>
  );
}
