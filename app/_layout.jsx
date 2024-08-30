import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { createContext, useState, useContext } from 'react';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

// Create Context for Room Code
const RoomCodeContext = createContext();

export const useRoomCode = () => useContext(RoomCodeContext);

export default function RootLayout() {
  const [roomCode, setRoomCode] = useState('');

  return (
    <RoomCodeContext.Provider value={{ roomCode, setRoomCode }}>
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
        />
      </Stack>
    </RoomCodeContext.Provider>
  );
}
