import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Fetch full profile if needed, or just use decoded data for now
                // For simplicity, we use decoded data role if available, or fetch profile
                api.get('/auth/profile/').then(res => {
                    setUser(res.data);
                }).catch(() => {
                    localStorage.removeItem('access_token');
                    setUser(null);
                }).finally(() => setLoading(false));
            } catch (error) {
                localStorage.removeItem('access_token');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/token/', { username, password });
        localStorage.setItem('access_token', res.data.access);
        const decoded = jwtDecode(res.data.access);
        // Fetch profile immediately
        const profileRes = await api.get('/auth/profile/');
        setUser(profileRes.data);
    };

    const register = async (userData) => {
        await api.post('/auth/register/', userData);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
