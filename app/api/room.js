import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import socket from './socket';


// const API_URL = 'http://localhost:8002/api/v1/room';
const API_URL = 'https://truthndare-backend.onrender.com/api/v1/room';


const createRoom = async (name, isPrivate, password) => {
    try {
        const token = await AsyncStorage.getItem('@refresh_token');
        if (!token) {
            throw new Error('No token found');
        }
        const response = await axios.post(`${API_URL}/create`,
            { name, isPrivate, password }, 
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

const joinRoom = async (name, code, password) => {
    try {
        const token = await AsyncStorage.getItem('@refresh_token');
        if (!token) {
            throw new Error('No token found');
        }
        const response = await axios.post(`${API_URL}/join`, 
            { name, code, password },
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
        console.error('Join Room Error:', error);
        throw error.response ? error.response.data : new Error('Network error');
    }
};

const getRoom = async (code) => {
    try {
        const token = await AsyncStorage.getItem('@refresh_token');
        if (!token) {
            throw new Error('No token found');
        }
        const response = await axios.get(`${API_URL}/showroom`, {
            params: { code },
            headers: { 
                Authorization: `Bearer ${token}` 
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Get Room Error:', error);
        throw error.response ? error.response.data : new Error('Network error');
    }
};

export { createRoom, joinRoom, getRoom };
