import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if admin is logged in
        const token = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');
        
        if (token && adminData) {
            setAdmin(JSON.parse(adminData));
            setIsAuthenticated(true);
            
            // Set default auth header
            API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    // Login admin
    const login = async (identifier, password) => {
        try {
            setLoading(true);
            
            // Try API login
            try {
                const isMemberId = !identifier.includes('@');
                const response = await API.post(
                    isMemberId ? '/admin/member-login' : '/admin/login',
                    isMemberId ? { phone: identifier, password } : { email: identifier, password }
                );
                
                if (response.data.success) {
                    const { token, ...adminData } = response.data.data;
                    
                    // Save to localStorage
                    localStorage.setItem('adminToken', token);
                    localStorage.setItem('token', token);
                    localStorage.setItem('adminData', JSON.stringify(adminData));
                    
                    // Set default auth header
                    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    setAdmin(adminData);
                    setIsAuthenticated(true);
                    
                    toast.success(`Welcome back, ${adminData.name}!`);
                    return { success: true };
                }
            } catch (apiError) {
                // If API fails, use demo login
                if (identifier === 'admin@mess.com' && password === 'admin123') {
                    const demoAdmin = {
                        _id: '1',
                        name: 'Mess Manager',
                        email: 'admin@mess.com',
                        phone: '01700000000',
                        role: 'super_admin',
                        isActive: true
                    };
                    
                    const demoToken = 'demo_token_12345';
                    
                    localStorage.setItem('adminToken', demoToken);
                    localStorage.setItem('adminData', JSON.stringify(demoAdmin));
                    
                    API.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
                    
                    setAdmin(demoAdmin);
                    setIsAuthenticated(true);
                    
                    toast.success('Demo login successful!');
                    return { success: true };
                }
                
                throw apiError;
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid credentials';
            toast.error(message);
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    // Logout admin
    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('adminData');
        delete API.defaults.headers.common['Authorization'];
        setAdmin(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    // Update profile
    const updateProfile = async (data) => {
        try {
            const response = await API.put('/admin/profile', data);
            if (response.data.success) {
                const { token, ...adminData } = response.data.data;
                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminData', JSON.stringify(adminData));
                setAdmin(adminData);
                toast.success('Profile updated successfully');
                return { success: true };
            }
        } catch (error) {
            toast.error('Failed to update profile');
            return { success: false };
        }
    };

    const value = {
        admin,
        loading,
        isAuthenticated,
        login,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;