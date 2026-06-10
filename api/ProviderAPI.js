import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { EXPO_PUBLIC_API_BASE_URL } from '@env';

const EXPO_PUBLIC_API_BASE_URL = 'https://9129-2401-4900-1c6a-2e7e-8cb1-caf3-6521-13ad.ngrok-free.app';


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

//Register and Login as a Service Provider
export const loginProvider = async (credentials) => {
    try {
        const response = await ProviderAPI.post('/provider-auth/login', credentials);
        return response;
    } catch (error) {
        console.error("Provider login error", error);
        throw error;
    }
};
export const registerProvider = (data) => ProviderAPI.post('/provider-auth/register', data);
export const updateProviderDocs = (formData) => {
    return ProviderAPI.post('/provider-auth/upload-documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        // Very important for large uploads
        transformRequest: (data, headers) => {
            return data; 
        },
    });
};

// Get Provider Profile
export const getProviderProfile = () => ProviderAPI.get('/providers/me');
export const updateProfile = (data) => ProviderAPI.put('/providers/update-profile', data,
    {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
);
export const updateProviderLocation = (coordinates) => ProviderAPI.put('/providers/update-location', coordinates);
export const updateProviderAvailability = (status) => ProviderAPI.put('/providers/update-availability', { availabilityStatus: status });
export const fetchMyDashboardReviews = (page = 1, limit = 20) => ProviderAPI.get(`/providers/my-reviews?page=${page}&limit=${limit}`);

//Working hours 
export const fetchWorkingHours = () => ProviderAPI.get('/provider-hours/working-hours');
export const updateWorkingHours = (workingHours) => ProviderAPI.put('/provider-hours/working-hours', { workingHours });
export const providerUpdateOvertime = (overtimeData) => ProviderAPI.put('/provider-hours/overtime', { ...overtimeData });

// services/providerService.js
export const fetchProviderServices = () => ProviderAPI.get('/provider-services/services');
export const addProviderService = (serviceData) => ProviderAPI.post('/provider-services/services', serviceData);
export const updateProviderService = (serviceId, serviceData) => ProviderAPI.put(`/provider-services/services/${serviceId}`, serviceData);
export const deleteProviderService = (serviceId) => ProviderAPI.delete(`/provider-services/services/${serviceId}`);

// 5. NEW: Update global pricing structure (perDayPrice & overtimeHourlyPrice)
export const updateGlobalBaseRates = (ratesData) => ProviderAPI.patch('/provider-services/prices/base-rates', ratesData);

//Booking routes
export const fetchBookings = () => ProviderAPI.get('/provider-bookings/provider-bookings');
export const acceptOrRejectBooking = (bookingId, data) => ProviderAPI.put(`/provider-bookings/provider-bookings/${bookingId}/respond`, data);
export const updateBookingStatus = (bookingId, data) => ProviderAPI.put(`/provider-bookings/provider-bookings/${bookingId}/status`, data);

// Logout
export const logoutProvider = async () => {
    await AsyncStorage.removeItem('providerToken');
};

export default ProviderAPI;