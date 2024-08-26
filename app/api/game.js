import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socket from './socket';


// const API_URL = 'http://localhost:8002/api/v1/game';
const API_URL = 'https://truthndare-backend.onrender.com/api/v1/game';


const startGame = async (roomId) => {
    try {
        const token = await AsyncStorage.getItem('@refresh_token');
        if (!token) {
            throw new Error('No token found');
        }
        const response = await axios.post(`${API_URL}/start`,
            { roomId }, 
            { 
                headers: { 
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true 
            }
        );
        socket.emit('joinRoom', response.data.data.code);
        return response.data;
    } catch (error) {
        console.error('Create Room Error:', error);
        throw error.response ? error.response.data : new Error('Network error');
    }
};
export {startGame};
