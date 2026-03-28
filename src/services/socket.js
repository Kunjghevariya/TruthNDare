import { io } from 'socket.io-client';
import { APP_CONFIG } from '../config/env';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(APP_CONFIG.socketUrl, {
      autoConnect: false,
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 900,
      reconnectionDelayMax: 3000,
      timeout: 20000,
    });
  }

  return socket;
};

export const connectSocket = () => {
  const activeSocket = getSocket();

  if (!activeSocket.connected) {
    activeSocket.connect();
  }

  return activeSocket;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
