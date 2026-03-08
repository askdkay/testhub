import axios from 'axios';

// Use environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log requests in development only
        if (process.env.NODE_ENV === 'development') {
            console.log('API Request:', config);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.error('API Error:', error);
        }
        
        return Promise.reject(error);
    }
);

export default API;