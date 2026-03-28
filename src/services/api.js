import axios from 'axios';
import { APP_CONFIG } from '../config/env';
import { clearSession, getSession, saveSession } from './storage';

const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

const toApiError = (error, fallbackMessage = 'Network error. Please try again.') => {
  const message = error?.response?.data?.message || error?.message || fallbackMessage;
  return new Error(message);
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  const response = await apiClient.post('/users/refresh-token', { refreshToken });
  return response.data?.data;
};

export const request = async (config, options = {}) => {
  const { requiresAuth = false, retryOnAuthFailure = true } = options;
  const session = requiresAuth ? await getSession() : null;

  try {
    const response = await apiClient({
      ...config,
      headers: {
        ...config.headers,
        ...(session?.accessToken
          ? {
              Authorization: `Bearer ${session.accessToken}`,
            }
          : {}),
      },
    });

    return response.data;
  } catch (error) {
    if (
      requiresAuth &&
      retryOnAuthFailure &&
      error?.response?.status === 401 &&
      session?.refreshToken
    ) {
      refreshPromise = refreshPromise || refreshAccessToken(session.refreshToken);

      try {
        const refreshedTokens = await refreshPromise;
        const updatedSession = {
          ...session,
          accessToken: refreshedTokens.accessToken,
          refreshToken: refreshedTokens.refreshToken,
        };

        await saveSession(updatedSession);
        return request(config, { requiresAuth, retryOnAuthFailure: false });
      } catch (refreshError) {
        await clearSession();
        throw toApiError(refreshError, 'Your session has expired. Please sign in again.');
      } finally {
        refreshPromise = null;
      }
    }

    throw toApiError(error);
  }
};
