
import axios from 'axios';

const API_URL = 'https://truthndare-backend.onrender.com/api/v1/users'; 

 const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, 
      { email, password }, 
      { withCredentials: true } 
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const registerUser = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, 
      { username, email, password },
      { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  };

  export {loginUser,registerUser};
