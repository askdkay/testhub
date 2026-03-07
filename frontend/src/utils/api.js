import axios from 'axios';

const API = axios.create({
    // Aapke backend ka URL (Check karein ki port 5000 hi hai na)
    baseURL: 'http://localhost:5000/api', 
});

// Ye interceptor token ko har request ke saath apne aap bhej dega
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;