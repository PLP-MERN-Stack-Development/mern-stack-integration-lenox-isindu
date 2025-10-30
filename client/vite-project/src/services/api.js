import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Health check function
export const healthCheck = async () => {
  try {
    const response = await API.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend server is not responding');
  }
};

// Database test function
export const testDatabase = async () => {
  try {
    const response = await API.get('/test-db');
    return response.data;
  } catch (error) {
    throw new Error('Cannot connect to database');
  }
};

export default API;