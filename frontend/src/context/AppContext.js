import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000
});

const AppContext = createContext(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        return {
            members: [],
            setMembers: () => {},
            loading: false,
            error: null,
            fetchMembers: () => {}
        };
    }
    return context;
}

export function AppProvider({ children }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('🔄 Fetching members from API...');
            const response = await API.get('/members');
            console.log('📦 API Response:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                console.log(`✅ Loaded ${response.data.length} members from API`);
                setMembers(response.data);
            } else if (response.data && response.data.data) {
                // Some APIs wrap in data property
                console.log(`✅ Loaded ${response.data.data.length} members from API`);
                setMembers(response.data.data);
            } else {
                console.log('⚠️ API returned empty or invalid data');
                // DON'T clear members - keep existing data
            }
        } catch (err) {
            console.error('❌ Failed to fetch members:', err.message);
            setError('Backend not connected');
            // DON'T clear members on error - keep whatever we have
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const value = {
        members,
        setMembers,
        loading,
        error,
        fetchMembers
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export default AppContext;