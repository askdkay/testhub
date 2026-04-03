import { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';
import { 
    auth, 
    googleProvider, 
    setupRecaptcha,
    signInWithGoogle,
    sendOTP as firebaseSendOTP,
    onAuthStateChanged
} from '../services/firebase';
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
    const [firebaseUser, setFirebaseUser] = useState(null);

    // ✅ Listen to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
            console.log('Firebase Auth State:', fbUser?.email || fbUser?.phoneNumber || 'No user');
            setFirebaseUser(fbUser);
        });
        return () => unsubscribe();
    }, []);

    // ✅ Check existing session
    useEffect(() => {
        const checkLoggedInUser = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Verify token with backend
                    const res = await API.get('/auth/verify');
                    if (res.data.valid) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error('Session expired');
                    logout();
                }
                setLoading(false);
            } else {
                setLoading(false);
            }
        };
        checkLoggedInUser();
    }, []);

    // ✅ Save session helper
    const saveSession = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // ✅ Regular Login
    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await API.post('/auth/login', { email, password });
            saveSession(res.data.token, res.data.user);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        } finally {
            setLoading(false);
        }
    };

    // ✅ GOOGLE LOGIN (Fixed for production)
// ✅ GOOGLE LOGIN (Fixed)
const loginWithGoogle = async () => {
    setLoading(true);
    try {
        const firebaseUser = await signInWithGoogle();
        
        if (!firebaseUser) {
            throw new Error('No user returned from Google');
        }

        console.log('Firebase user:', firebaseUser.email);
        
        const res = await API.post('/auth/social-login', {
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            uid: firebaseUser.uid,
            provider: 'google'
        });

        saveSession(res.data.token, res.data.user);
        return { success: true };
        
    } catch (error) {
        console.error('Google Login Error:', error);
        let errorMessage = 'Google Login Failed';
        
        if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup was blocked. Please allow popups for this site.';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'Domain not authorized. Contact support.';
        }
        
        return { success: false, message: errorMessage };
    } finally {
        setLoading(false);
    }
};

// ✅ PHONE AUTH - Send OTP
const sendOTP = async (phoneNumber) => {
    try {
        let cleanPhone = phoneNumber.replace(/\s/g, '');
        if (!cleanPhone.startsWith('+')) {
            cleanPhone = `+91${cleanPhone}`;
        }
        
        console.log('Sending OTP to:', cleanPhone);
        
        const appVerifier = setupRecaptcha();
        
        if (!appVerifier) {
            throw new Error('Recaptcha not initialized');
        }
        
        const confirmationResult = await firebaseSendOTP(cleanPhone, appVerifier);
        window.confirmationResult = confirmationResult;
        
        return { success: true };
        
    } catch (error) {
        console.error('Send OTP Error:', error);
        return { success: false, message: error.message || 'Failed to send OTP' };
    }
};

    // ✅ PHONE AUTH - Verify OTP
    const verifyOTP = async (otp) => {
        try {
            if (!window.confirmationResult) {
                throw new Error('No OTP request found. Please send OTP first.');
            }
            
            const result = await window.confirmationResult.confirm(otp);
            const firebaseUser = result.user;
            
            console.log('Phone verified:', firebaseUser.phoneNumber);
            
            // Send to backend
            const res = await API.post('/auth/social-login', {
                phone: firebaseUser.phoneNumber,
                uid: firebaseUser.uid,
                name: 'Student',
                provider: 'phone'
            });

            saveSession(res.data.token, res.data.user);
            return { success: true };
            
        } catch (error) {
            console.error('Verify OTP Error:', error);
            let errorMessage = 'Invalid OTP';
            
            if (error.code === 'auth/invalid-verification-code') {
                errorMessage = 'Invalid OTP. Please try again.';
            } else if (error.code === 'auth/code-expired') {
                errorMessage = 'OTP expired. Please request a new one.';
            }
            
            return { success: false, message: errorMessage };
        }
    };

    // ✅ ADMIN LOGIN
    const adminLogin = async (email, password) => {
        setLoading(true);
        try {
            const res = await API.post('/auth/login', { email, password });
            
            if (res.data.user.role !== 'admin') {
                setLoading(false);
                return { success: false, message: 'Access Denied: You are not an Admin.' };
            }

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

    // ✅ REGISTER
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

    // ✅ LOGOUT
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Also sign out from Firebase
        if (auth) {
            auth.signOut().catch(console.error);
        }
    };

    const value = {
        user,
        login,
        register,
        adminLogin,
        logout,
        loading,
        loginWithGoogle,
        sendOTP,
        verifyOTP
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};