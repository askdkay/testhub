import { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';

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
    // 1. Initial loading ko TRUE rakhein taaki page load hote hi redirect na ho
    const [loading, setLoading] = useState(true);

    // 2. NAYA LOGIC: Page load hone par token check karna
    useEffect(() => {
        const checkLoggedInUser = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user'); // User data bhi check karein

            if (token && storedUser) {
                // Agar token aur user data dono hain, toh direct state mein set kar dein
                setUser(JSON.parse(storedUser));
                setLoading(false);
            } else if (token) {
                // Agar sirf token hai, toh backend se user ka data mangwayein
                try {
                    // Dhyan dein: Iske liye aapke backend me '/auth/me' ya '/auth/profile' API honi chahiye
                    const res = await API.get('/auth/me'); 
                    setUser(res.data.user);
                } catch (error) {
                    console.error('Session expired or invalid token');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                } finally {
                    setLoading(false);
                }
            } else {
                // Koi token nahi hai matlab user logged out hai
                setLoading(false);
            }
        };

        checkLoggedInUser();
    }, []);

    // Login function
    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            // 3. User object ko bhi local storage me save karein taaki refresh pe data mile
            localStorage.setItem('user', JSON.stringify(res.data.user)); 
            setUser(res.data.user);
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
const adminLogin = async (email, password) => {
    setLoading(true);
    try {
        const res = await API.post('/auth/login', { email, password });
        
        // YAHAN CHECK KAREIN KI KYA WO ADMIN HAI?
        if (res.data.user.role !== 'admin') {
            return { success: false, message: 'Access Denied: You are not an Admin.' };
        }

        // Agar admin hai, tabhi token aur data save karein
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
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
    // Register function
    const register = async (userData) => {
        setLoading(true);
        try {
            const res = await API.post('/auth/register', userData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
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

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Logout pe user data bhi hata dein
        setUser(null);
    };

    // Context value
    const value = {
        user,
        login,
        register,
        adminLogin, // Admin login ke liye bhi same function use kar sakte hain, backend me role check hoga
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};