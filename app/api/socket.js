// socket.js
import io from 'socket.io-client';

const SOCKET_URL = 'https://truthndare-backend.onrender.com:8002'; // Your server URL
const socket = io(SOCKET_URL, {
  transports: ['websocket'], // Use WebSocket transport
});

export default socket;
