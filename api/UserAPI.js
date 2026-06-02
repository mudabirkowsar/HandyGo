import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { EXPO_PUBLIC_API_BASE_URL } from '@env'; 

const EXPO_PUBLIC_API_BASE_URL = 'https://5995-122-173-24-203.ngrok-free.app';

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
export const registerUser = (data) => API.post('/user-auth/register', data);


export const loginUser = async (credentials) => {
    try {
        const response = await API.post('/user-auth/login', credentials);
        return response;
    } catch (error) {
        console.error("User login error", error);
        throw error;
    }
};


// --- CATEGORIES ---
export const fetchCategories = () => API.get('/categories');
export const fetchServices = () => API.get('/services');
export const fetchServiceDetail = (id) => API.get(`/services/${id}`);

// --- PROFILE ---
export const getUserProfile = () => API.get('/user-detail/profile');
export const updateUserProfile = (data) => API.patch('/user-detail/profile', data);

//Provider Routes
export const fetchAllProviders = () => API.get('/providers/all');
export const fetchProviderById = (id) => API.get(`/providers/${id}`);
export const getProviderProfile = () => API.get('/providers/me');
export const updateProviderProfile = (data) => API.put('/providers/update-profile', data);
export const fetchProvidersWorkingHours = () => API.get(`/providers/working-hours`);
export const updateProvidersWorkingHours = (data) => API.put(`/providers/working-hours`, data);
export const updateWorkingStatus = (data) => API.patch(`/providers/working-hours/toggle-day`, data);



// --- LOGOUT ---
export const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('companyToken');
};

export default API; 