import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearLastRoomCode,
  clearSession,
  getLastRoomCode,
  getSession,
  saveLastRoomCode,
  saveSession,
} from '../services/storage';
import { createGuestUser, loginUser, logoutUser, registerUser } from '../services/auth';
import { disconnectSocket } from '../services/socket';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [lastRoomCode, setLastRoomCode] = useState('');
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [storedSession, storedRoomCode] = await Promise.all([getSession(), getLastRoomCode()]);
        setSession(storedSession);
        setLastRoomCode(storedRoomCode || '');
      } finally {
        setIsHydrating(false);
      }
    };

    hydrate();
  }, []);

  const persistSession = useCallback(async (nextSession) => {
    setSession(nextSession);
    await saveSession(nextSession);
  }, []);

  const rememberRoom = useCallback(async (roomCode) => {
    setLastRoomCode(roomCode || '');
    await saveLastRoomCode(roomCode || '');
  }, []);

  const signIn = useCallback(
    async ({ email, password }) => {
      const response = await loginUser({ email, password });
      const nextSession = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      };

      await persistSession(nextSession);
      return nextSession;
    },
    [persistSession]
  );

  const signUp = useCallback(async (payload) => {
    return registerUser(payload);
  }, []);

  const continueAsGuest = useCallback(
    async ({ username }) => {
      const response = await createGuestUser({ username });
      const nextSession = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      };

      await persistSession(nextSession);
      return nextSession;
    },
    [persistSession]
  );

  const signOut = useCallback(async () => {
    const refreshToken = session?.refreshToken;

    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch {
      // Clear local session even if the network call fails.
    } finally {
      disconnectSocket();
      setSession(null);
      setLastRoomCode('');
      await Promise.all([clearSession(), clearLastRoomCode()]);
    }
  }, [session?.refreshToken]);

  const value = useMemo(
    () => ({
      session,
      lastRoomCode,
      isHydrating,
      isAuthenticated: Boolean(session?.accessToken && session?.user?.username),
      signIn,
      signUp,
      signOut,
      continueAsGuest,
      rememberRoom,
      setSession: persistSession,
    }),
    [continueAsGuest, isHydrating, lastRoomCode, persistSession, rememberRoom, session, signIn, signOut, signUp]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error('useSession must be used within SessionProvider.');
  }

  return value;
};
