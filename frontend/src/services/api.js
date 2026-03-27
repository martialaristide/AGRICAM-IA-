import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to all requests, and let axios handle Content-Type for FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("agricam_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let axios auto-set Content-Type with boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors - use soft redirect to avoid full page reload
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Only redirect if not already on login/register pages
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("agricam_token");
        localStorage.removeItem("agricam_user");
        // Dispatch custom event instead of hard reload
        window.dispatchEvent(new CustomEvent("agricam-logout"));
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getMe = () => api.get("/auth/me");

// Admin
export const getAdminDashboard = () => api.get("/admin/dashboard");
export const getAdminUsers = (role) => api.get("/admin/users", { params: { role } });
export const verifyUser = (userId) => api.put(`/admin/users/${userId}/verify`);
export const updateSubscription = (userId, type) => api.put(`/admin/users/${userId}/subscription?subscription_type=${type}`);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

// Weather
export const getWeather = (location) => api.get(`/weather/${location}`);

// AI Analysis
export const analyzeCrop = (parcelId, imageBase64) => {
  const formData = new FormData();
  formData.append("parcel_id", parcelId);
  if (imageBase64) formData.append("image_base64", imageBase64);
  return api.post("/ai/analyze-crop", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
export const generateRecommendations = (parcelId) => api.post(`/ai/generate-recommendations?parcel_id=${parcelId}`);
export const predictYield = (parcelId) => api.post(`/ai/predict-yield?parcel_id=${parcelId}`);

// Dashboard
export const getDashboardStats = () => api.get("/dashboard/stats");

// Parcels
export const getParcels = () => api.get("/parcels");
export const getParcel = (id) => api.get(`/parcels/${id}`);
export const createParcel = (data) => api.post("/parcels", data);
export const updateParcel = (id, data) => api.put(`/parcels/${id}`, data);
export const deleteParcel = (id) => api.delete(`/parcels/${id}`);
export const importParcels = (formData) => api.post("/import/parcels", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});

// Sensors
export const getSensors = () => api.get("/sensors");
export const getSensorsStats = () => api.get("/sensors/stats");
export const createSensor = (data) => api.post("/sensors", data);
export const addSensorData = (id, data) => api.post(`/sensors/${id}/data`, data);
export const getSensorHistory = (id, limit = 100) => api.get(`/sensors/${id}/history`, { params: { limit } });

// Drone Missions
export const getDroneMissions = () => api.get("/drone-missions");
export const getDroneStats = () => api.get("/drone-missions/stats");
export const createDroneMission = (data) => api.post("/drone-missions", data);
export const controlDroneMission = (id, action) => api.put(`/drone-missions/${id}/control?action=${action}`);

// Aerial Images
export const getAerialImages = () => api.get("/aerial-images");
export const getAerialImagesStats = () => api.get("/aerial-images/stats");
export const createAerialImage = (data) => api.post("/aerial-images", data);

// Image Analysis
export const getImageAnalyses = () => api.get("/image-analysis");
export const getImageAnalysisStats = () => api.get("/image-analysis/stats");

// Irrigation
export const getIrrigationSystems = () => api.get("/irrigation");
export const getIrrigationStats = () => api.get("/irrigation/stats");
export const controlIrrigation = (id, action) => api.put(`/irrigation/${id}/control?action=${action}`);

// Recommendations
export const getRecommendations = () => api.get("/recommendations");
export const getRecommendationsStats = () => api.get("/recommendations/stats");
export const updateRecommendationStatus = (id, action) => api.put(`/recommendations/${id}/action?action=${action}`);

// Marketplace
export const getMarketplaceProducts = (params) => api.get("/marketplace/products", { params });
export const createMarketplaceProduct = (data) => api.post("/marketplace/products", data);
export const createOrder = (productId, quantity, address, paymentMethod) => 
  api.post("/marketplace/orders", null, { params: { product_id: productId, quantity, delivery_address: address, payment_method: paymentMethod } });
export const getOrders = () => api.get("/marketplace/orders");
export const updateOrderStatus = (orderId, status) => api.put(`/marketplace/orders/${orderId}/status?status=${status}`);

// Financial
export const requestLoan = (amount, purpose, duration, institutionId, parcelId) =>
  api.post("/financial/loans", null, { params: { amount, purpose, duration_months: duration, institution_id: institutionId, parcel_id: parcelId } });
export const getLoans = () => api.get("/financial/loans");
export const decideLoan = (loanId, approved, notes) => 
  api.put(`/financial/loans/${loanId}/decision`, null, { params: { approved, notes } });

// Alerts
export const getAlerts = (unreadOnly = false) => api.get("/alerts", { params: { unread_only: unreadOnly } });
export const createAlert = (data) => api.post("/alerts", data);
export const markAlertRead = (id) => api.put(`/alerts/${id}/read`);

// Export
export const exportParcelsCSV = () => api.get("/export/parcels", { responseType: "blob" });
export const exportSensorsCSV = () => api.get("/export/sensors", { responseType: "blob" });

// Seed Database
export const seedDatabase = () => api.post("/seed");

export default api;
