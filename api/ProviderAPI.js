import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_API_BASE_URL } from '@env';

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
    const response = await ProviderAPI.post('/provider-auth/login', credentials);
    return response;
};

// Register as a Service Provider
export const registerProvider = (data) => ProviderAPI.post('/provider-auth/register', data);

export const updateProviderDocs = (data) => ProviderAPI.post('/provider-auth/upload-documents', data);

// Get Provider Profile
export const getProviderProfile = () => ProviderAPI.get('/provider/profile');

// Update Provider Availability
export const updateAvailability = (status) => ProviderAPI.patch('/provider/availability', { status });

// Add/Update a Service
export const addService = (serviceData) => ProviderAPI.post('/provider/services', serviceData);
export const deleteService = (serviceId) => ProviderAPI.delete(`/provider/services/${serviceId}`);

// Logout
export const logoutProvider = async () => {
    await AsyncStorage.removeItem('providerToken');
};

export default ProviderAPI;