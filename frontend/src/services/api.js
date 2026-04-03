import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Request interceptor - Har request mein token add karo
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Error handling
API.interceptors.response.use(
    (response) => {
        // console.log('API Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        // console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
        
        // Agar 401 error aaye to login page redirect
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;