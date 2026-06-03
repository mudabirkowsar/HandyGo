import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { EXPO_PUBLIC_API_BASE_URL } from '@env'; 

const EXPO_PUBLIC_API_BASE_URL = 'https://7f21-122-173-24-203.ngrok-free.app';

const API = axios.create({
    baseURL: EXPO_PUBLIC_API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor to attach the token from AsyncStorage
API.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        console.error("Error reading token", e);
    }
    return config;
});

// ==========================================
// CORE FUNCTIONS
// ==========================================

// --- AUTH & REGISTRATION ---
export const loginUser = async (credentials) => {
    try {
        const response = await API.post('/user-auth/login', credentials);
        return response;
    } catch (error) {
        console.error("User login error", error);
        throw error;
    }
};
export const registerUser = (data) => API.post('/user-auth/register', data);

// --- PROFILE ---
export const getUserProfile = () => API.get('/user-detail/profile');
export const updateUserProfile = (data) => API.patch('/user-detail/profile', data);


// --- CATEGORIES ---
export const fetchCategories = () => API.get('/user-category/all');

export const fetchServices = () => API.get('/services');
export const fetchServiceDetail = (id) => API.get(`/services/${id}`);


//Provider Routes
export const fetchAllProviders = (params) => { return API.get('/user-providers/providers/nearby', { params }); };
export const fetchProviderById = (id) => API.get(`/user-providers/providers/${id}`);




// --- LOGOUT ---
export const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('companyToken');
};

export default API; 