import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { EXPO_PUBLIC_API_BASE_URL } from '@env'; 

const EXPO_PUBLIC_API_BASE_URL = 'https://1b5e-2401-4900-1f33-9114-c9e8-30f-b90d-f76.ngrok-free.app';

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

//Address Routes
export const fetchUserAddresses = () => API.get('/user-addresses/');
export const addUserAddress = (data) => API.post('/user-addresses', data);
export const updateUserAddress = (id, data) => API.put(`/user-addresses/${id}`, data);
export const deleteUserAddress = (id) => API.delete(`/user-addresses/${id}`);

//Booking Routes
export const createBooking = (data) => API.post('/user-bookings/user-bookings', data);
export const fetchUserBookings = () => API.get('/user-bookings/user-bookings');
export const cancelBooking = (bookingId, reason) => API.put(`/user-bookings/cancel/${bookingId}`, { reason });




// --- LOGOUT ---
export const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('companyToken');
};

export default API; 