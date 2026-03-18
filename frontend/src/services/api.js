import axios from 'axios';

// ✅ PRODUCTION READY - Environment variable based API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🌐 API Base URL:', API_BASE_URL);

const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for cookies if you use them
    timeout: 30000 // 30 seconds timeout
});

// Request interceptor - Har request mein token add karo
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Don't log sensitive data in production
        if (import.meta.env.MODE !== 'production') {
            console.log('📤 API Request:', config.method?.toUpperCase(), config.url, config.data);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Error handling
API.interceptors.response.use(
    (response) => {
        if (import.meta.env.MODE !== 'production') {
            console.log('📥 API Response:', response.status, response.config.url);
        }
        return response;
    },
    (error) => {
        // Log errors in all environments
        console.error('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });
        
        // Agar 401 error aaye to login page redirect
        if (error.response?.status === 401) {
            console.log('🔒 Unauthorized - Redirecting to login');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        // Agar 500 error aaye to show user-friendly message
        if (error.response?.status === 500) {
            error.message = 'Server error. Please try again later.';
        }
        
        // Agar network error aaye
        if (error.code === 'ECONNABORTED') {
            error.message = 'Request timeout. Please check your connection.';
        }
        
        return Promise.reject(error);
    }
);

export default API;