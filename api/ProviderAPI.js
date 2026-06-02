import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { EXPO_PUBLIC_API_BASE_URL } from '@env';

const EXPO_PUBLIC_API_BASE_URL = 'https://5995-122-173-24-203.ngrok-free.app';


const ProviderAPI = axios.create({
    baseURL: EXPO_PUBLIC_API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor to specifically use 'providerToken'
ProviderAPI.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('providerToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        console.error("Error reading provider token", e);
    }
    return config;
});

// ==========================================
// PROVIDER SPECIFIC ENDPOINTS
// ==========================================

// Login as a Service Provider
export const loginProvider = async (credentials) => {
    try {
        const response = await ProviderAPI.post('/provider-auth/login', credentials);
        return response;
    } catch (error) {
        console.error("Provider login error", error);
        throw error;
    }
};

// Register as a Service Provider
export const registerProvider = (data) => ProviderAPI.post('/provider-auth/register', data);

export const updateProviderDocs = (data) => ProviderAPI.post('/provider-auth/upload-documents', data);

// Get Provider Profile
export const getProviderProfile = () => ProviderAPI.get('/provider/profile');

// Update Provider Availability
export const updateAvailability = (status) => ProviderAPI.patch('/provider/availability', { status });

//Working hours 
export const fetchWorkingHours = () => ProviderAPI.get('/provider-hours/working-hours');
export const updateWorkingHours = (workingHours) => ProviderAPI.put('/provider-hours/working-hours', { workingHours });
export const providerUpdateOvertime = (overtimeData) => ProviderAPI.put('/provider-hours/overtime', { ...overtimeData });

// Add/Update a Service
export const addService = (serviceData) => ProviderAPI.post('/provider/services', serviceData);
export const deleteService = (serviceId) => ProviderAPI.delete(`/provider/services/${serviceId}`);

// Logout
export const logoutProvider = async () => {
    await AsyncStorage.removeItem('providerToken');
};

export default ProviderAPI;