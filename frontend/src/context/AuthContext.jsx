import { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';
import { auth, googleProvider, setupRecaptcha } from '../services/firebase';
import { signInWithPopup, signInWithPhoneNumber } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedInUser = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
                setLoading(false);
            } else if (token) {
                try {
                    const res = await API.get('/auth/me'); 
                    setUser(res.data.user);
                } catch (error) {
                    console.error('Session expired');
                    logout();
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        checkLoggedInUser();
    }, []);

    const login = async (email, password) => {
        // ... (Aapka purana login logic same rahega) ...
        setLoading(true);
        try {
            const res = await API.post('/auth/login', { email, password });
            saveSession(res.data.token, res.data.user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    // --- NAYA: GOOGLE LOGIN LOGIC ---
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;
            
            // Firebase se data lekar apne custom backend ko bhejein
            const res = await API.post('/auth/social-login', {
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                uid: firebaseUser.uid,
                provider: 'google'
            });

            saveSession(res.data.token, res.data.user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message || 'Google Login Failed' };
        }
    };

    // --- NAYA: PHONE AUTH LOGIC ---
    const sendOTP = async (phoneNumber) => {
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const formatPhone = "+" + phoneNumber; // Ex: +919876543210
            const confirmationResult = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
            window.confirmationResult = confirmationResult;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message || 'Failed to send OTP' };
        }
    };

    const verifyOTP = async (otp) => {
        try {
            const result = await window.confirmationResult.confirm(otp);
            const firebaseUser = result.user;

            // Verified phone number apne backend me bhej kar login/register karwayein
            const res = await API.post('/auth/social-login', {
                phone: firebaseUser.phoneNumber,
                uid: firebaseUser.uid,
                provider: 'phone'
            });

            saveSession(res.data.token, res.data.user);
            return { success: true };
        } catch (error) {
            return { success: false, message: 'Invalid OTP' };
        }
    };

    // Helper function
    const saveSession = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData)); 
        setUser(userData);
    };

// --- ADMIN LOGIN LOGIC ---
    const adminLogin = async (email, password) => {
        setLoading(true);
        try {
            const res = await API.post('/auth/login', { email, password });
            
            // YAHAN CHECK KAREIN KI KYA WO ADMIN HAI?
            if (res.data.user.role !== 'admin') {
                setLoading(false);
                return { success: false, message: 'Access Denied: You are not an Admin.' };
            }

            // Agar admin hai, tabhi token aur data save karein
            saveSession(res.data.token, res.data.user);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Admin Login failed' 
            };
        } finally {
            setLoading(false);
        }
    };

    // --- REGISTER LOGIC ---
    const register = async (userData) => {
        setLoading(true);
        try {
            const res = await API.post('/auth/register', userData);
            saveSession(res.data.token, res.data.user);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        } finally {
            setLoading(false);
        }
    };



    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user, login, register, adminLogin, logout, loading,
        loginWithGoogle, sendOTP, verifyOTP // Naye functions export kiye
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};