import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../../api/UserAPI';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // States for authenticated user profile session
    const [user, setUser] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStoredData = async () => {
            try {
                // Fetch potential auth session tokens/profiles from storage
                const [uToken, uData] = await Promise.all([
                    AsyncStorage.getItem('userToken'),
                    AsyncStorage.getItem('userData'),
                ]);

                if (uToken && uData) {
                    const parsedUser = JSON.parse(uData);
                    // Attach token back to Axios headers for persistent API requests
                    API.defaults.headers.common['Authorization'] = `Bearer ${uToken}`;
                    
                    setUserToken(uToken);
                    setUser(parsedUser);
                }
            } catch (e) {
                console.error("Failed to load auth data", e);
            } finally {
                setLoading(false);
            }
        };

        loadStoredData();
    }, []);

    // Helper to set API Header (Call this after any successful login action)
    const setApiHeader = (token) => {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    // --- USER LOGIN ---
    const loginUser = async (identifier, password) => {
        try {
            const response = await API.post('/user-auth/login', {
                identifier,
                password
            });

            if (response.data.success) {
                // FIXED: Destructured directly from response.data instead of response.data.user
                const { token, user: loggedInUser } = response.data;
                console.log("AXIOS RESPONSE DATA:", response.data);

                // Handle empty string role configurations safely before storage
                if (loggedInUser && (!loggedInUser.role || String(loggedInUser.role).trim() === "")) {
                    loggedInUser.role = "customer";
                }

                const safeRole = loggedInUser?.role ? String(loggedInUser.role).toLowerCase().trim() : "customer";

                // Persist session locally without undefined crashes
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userData', JSON.stringify(loggedInUser));
                await AsyncStorage.setItem('userRole', safeRole); 

                // Configure shared states
                setApiHeader(token);
                setUserToken(token);
                setUser(loggedInUser);

                return {
                    success: true,
                    user: loggedInUser,
                    token,
                    message: response.data.message || "Login successful"
                };
            }

            return {
                success: false,
                message: response.data.message || "Invalid credentials response"
            };

        } catch (error) {
            console.log("LOGIN ERROR DETECTED:", error?.response?.data || error.message);

            const serverErrorMessage = error?.response?.data?.message;

            return {
                success: false,
                message: serverErrorMessage || error.message || "Network layout connection failure"
            };
        }
    };

    // --- GENERAL LOGOUT (Clears everything) ---
    const logout = async () => {
        try {
            const keys = ['userToken', 'userData', 'userRole'];
            await AsyncStorage.multiRemove(keys);

            // Strip default interceptor authorizations
            delete API.defaults.headers.common['Authorization'];

            setUser(null); 
            setUserToken(null);
        } catch (e) {
            console.error("Logout failed", e);
        }
    };

    return (
        <AuthContext.Provider value={{
            user, 
            userToken,
            loading,
            loginUser,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};