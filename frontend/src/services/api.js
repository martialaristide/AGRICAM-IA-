import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dashboard
export const getDashboardStats = () => api.get("/dashboard/stats");

// Parcels
export const getParcels = () => api.get("/parcels");
export const getParcel = (id) => api.get(`/parcels/${id}`);
export const createParcel = (data) => api.post("/parcels", data);
export const updateParcel = (id, data) => api.put(`/parcels/${id}`, data);

// Sensors
export const getSensors = () => api.get("/sensors");
export const getSensorsStats = () => api.get("/sensors/stats");
export const createSensor = (data) => api.post("/sensors", data);
export const updateSensorValue = (id, value) => api.put(`/sensors/${id}/value?value=${value}`);

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
export const analyzeImage = (imageId) => api.post(`/image-analysis/${imageId}/analyze`);

// Irrigation
export const getIrrigationSystems = () => api.get("/irrigation");
export const getIrrigationStats = () => api.get("/irrigation/stats");
export const createIrrigationSystem = (data) => api.post("/irrigation", data);
export const controlIrrigation = (id, action) => api.put(`/irrigation/${id}/control?action=${action}`);

// Recommendations
export const getRecommendations = () => api.get("/recommendations");
export const getRecommendationsStats = () => api.get("/recommendations/stats");
export const createRecommendation = (data) => api.post("/recommendations", data);
export const updateRecommendationStatus = (id, action) => api.put(`/recommendations/${id}/action?action=${action}`);

// Marketplace
export const getMarketplaceProducts = (params) => api.get("/marketplace/products", { params });
export const createMarketplaceProduct = (data) => api.post("/marketplace/products", data);
export const updateProductStatus = (id, status) => api.put(`/marketplace/products/${id}/status?status=${status}`);

// Alerts
export const getAlerts = (unreadOnly = false) => api.get("/alerts", { params: { unread_only: unreadOnly } });
export const createAlert = (data) => api.post("/alerts", data);
export const markAlertRead = (id) => api.put(`/alerts/${id}/read`);

// Seed Database
export const seedDatabase = () => api.post("/seed");

export default api;
