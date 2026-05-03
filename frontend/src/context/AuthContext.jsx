import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const validateSession = async () => {
            if (user && user.token) {
                try {
                    const { data } = await api.get('/auth/me');
                    // Sync backend data with local state, keeping the token
                    const updatedUser = { ...user, ...data };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                } catch (err) {
                    console.error('Session validation failed:', err);
                    if (err.response?.status === 401) {
                        logout();
                    }
                }
            }
        };
        validateSession();
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUserData = (newData) => {
        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
