import axios from 'axios';

// ✅ PRODUCTION URL - Render backend (Direct connection)
const API_BASE_URL = 'https://testhub-66a0.onrender.com/api';

console.log('🌐 API Base URL:', API_BASE_URL);

const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor - Token add karne ke liye
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Error handle karne ke liye
API.interceptors.response.use(
    (response) => {
        console.log('📥 API Response:', response.status);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.response?.data?.message || error.message
        });
        
        // Agar token expire ho jaye toh wapas login par bhejein
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default API;