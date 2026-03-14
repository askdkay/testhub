import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Har request mein token bhejo
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    console.log('Sending request with token:', token ? 'Present' : 'Missing'); // DEBUG LINE
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;