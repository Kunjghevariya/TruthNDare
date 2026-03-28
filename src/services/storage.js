import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  session: 'tnd.session',
  lastRoomCode: 'tnd.lastRoomCode',
};

const canUseSecureStore = Platform.OS !== 'web';

const setSecureItem = async (key, value) => {
  if (canUseSecureStore) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  await AsyncStorage.setItem(key, value);
};

const getSecureItem = async (key) => {
  if (canUseSecureStore) {
    return SecureStore.getItemAsync(key);
  }

  return AsyncStorage.getItem(key);
};

const removeSecureItem = async (key) => {
  if (canUseSecureStore) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  await AsyncStorage.removeItem(key);
};

export const saveSession = async (session) => {
  await setSecureItem(KEYS.session, JSON.stringify(session));
};

export const getSession = async () => {
  const storedSession = await getSecureItem(KEYS.session);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch {
    await clearSession();
    return null;
  }
};

export const clearSession = async () => {
  await removeSecureItem(KEYS.session);
};

export const saveLastRoomCode = async (roomCode) => {
  if (!roomCode) {
    await AsyncStorage.removeItem(KEYS.lastRoomCode);
    return;
  }

  await AsyncStorage.setItem(KEYS.lastRoomCode, roomCode);
};

export const getLastRoomCode = async () => {
  return AsyncStorage.getItem(KEYS.lastRoomCode);
};

export const clearLastRoomCode = async () => {
  await AsyncStorage.removeItem(KEYS.lastRoomCode);
};
