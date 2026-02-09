// AGRICAM IA Mobile - API Service
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/theme';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('Error getting token:', error);
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth functions
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.access_token) {
    await SecureStore.setItemAsync('authToken', response.data.access_token);
    await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('authToken');
  await SecureStore.deleteItemAsync('user');
};

export const getUser = async () => {
  const user = await SecureStore.getItemAsync('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = async () => {
  const token = await SecureStore.getItemAsync('authToken');
  return !!token;
};

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

// Parcels
export const getParcels = () => api.get('/parcels');
export const createParcel = (data) => api.post('/parcels', data);
export const getParcelById = (id) => api.get(`/parcels/${id}`);

// Sensors
export const getSensors = () => api.get('/sensors');
export const getSensorsStats = () => api.get('/sensors/stats');

// Irrigation
export const getIrrigationSystems = () => api.get('/irrigation');
export const controlIrrigation = (id, action) => api.post(`/irrigation/${id}/control`, { action });

// AI Analysis
export const uploadImageForAnalysis = async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'analysis.jpg',
  });
  return api.post('/analysis/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Recommendations
export const getRecommendations = () => api.get('/recommendations');
export const generateRecommendations = (parcelId) => api.post('/ai/generate-recommendations', { parcel_id: parcelId });

// Alerts
export const getAlerts = () => api.get('/alerts');
export const markAlertRead = (id) => api.put(`/alerts/${id}/read`);

// Marketplace
export const getMarketplaceProducts = () => api.get('/marketplace/products');

// E-Learning
export const getCourses = () => api.get('/learning/courses');
export const getMyCourses = () => api.get('/learning/my-courses');
export const enrollCourse = (courseId) => api.post(`/learning/enroll/${courseId}`);

// Mobile Money
export const initiateMobilePayment = (data) => api.post('/payment/mobile-money', data);
export const getPaymentHistory = () => api.get('/payment/history');

// Weather
export const getWeather = (lat, lon) => api.get(`/weather?lat=${lat}&lon=${lon}`);

export default api;
