import { Platform } from 'react-native';

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const localOrigin = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

const apiOrigin = trimTrailingSlash(process.env.EXPO_PUBLIC_API_URL || localOrigin);
const socketOrigin = trimTrailingSlash(process.env.EXPO_PUBLIC_SOCKET_URL || apiOrigin);

export const APP_CONFIG = {
  appName: 'Truth N Dare',
  apiOrigin,
  apiBaseUrl: `${apiOrigin}/api/v1`,
  socketUrl: socketOrigin,
  supportEmail: 'support@truthndare.app',
};
