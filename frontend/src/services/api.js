import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("agricam_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("agricam_token");
      localStorage.removeItem("agricam_user");
      window.location.href = "/login";
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

// Chatbot
export const sendChatMessage = (message, context) => api.post("/chatbot/message", { message, context });
export const getChatHistory = () => api.get("/chatbot/history");
export const analyzeFile = (file, question) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("question", question || "Analyse ce fichier");
  return api.post("/chatbot/analyze-file", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

// Learning
export const getLearningModules = (category, difficulty) => api.get("/learning/modules", { params: { category, difficulty } });
export const getLearningModule = (moduleId) => api.get(`/learning/modules/${moduleId}`);
export const updateLearningProgress = (moduleId, completed, quizScore) => 
  api.post(`/learning/progress/${moduleId}`, null, { params: { completed, quiz_score: quizScore } });
export const getMyLearningProgress = () => api.get("/learning/my-progress");
export const getEbooks = (isFree) => api.get("/learning/ebooks", { params: { is_free: isFree } });
export const getCourses = (category, isFree) => api.get("/learning/courses", { params: { category, is_free: isFree } });

// Payments
export const createCheckoutSession = (packageId) => api.post(`/payments/create-checkout?package_id=${packageId}`);
export const getPaymentStatus = (sessionId) => api.get(`/payments/status/${sessionId}`);

// Import Data
export const importSensorsData = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/iot/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
export const importParcelsData = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/import/parcels", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
export const exportIoTData = (format) => api.get(`/iot/export?format=${format}`);
export const analyzeIoTData = (sensorIds, analysisType) => api.post("/iot/analyze", { sensor_ids: sensorIds, analysis_type: analysisType });

// Sensors CRUD (createSensor already defined above)
export const updateSensor = (sensorId, data) => api.put(`/sensors/${sensorId}`, data);
export const deleteSensor = (sensorId) => api.delete(`/sensors/${sensorId}`);

// Drones
export const getDrones = () => api.get("/drones");
export const createDrone = (data) => api.post("/drones", data);
export const connectDrone = (droneId) => api.put(`/drones/${droneId}/connect`);
export const disconnectDrone = (droneId) => api.put(`/drones/${droneId}/disconnect`);
export const createDroneMissionWithParams = (droneId, parcelId, missionType) => 
  api.post(`/drones/${droneId}/mission`, null, { params: { parcel_id: parcelId, mission_type: missionType } });

// Robots
export const getRobots = () => api.get("/robots");
export const createRobot = (data) => api.post("/robots", data);
export const assignRobotTask = (robotId, taskType, parcelId) => 
  api.put(`/robots/${robotId}/task`, null, { params: { task_type: taskType, parcel_id: parcelId } });

// Irrigation
export const createIrrigationSystem = (data) => api.post("/irrigation/systems", data);
export const configureIrrigation = (systemId, data) => api.put(`/irrigation/systems/${systemId}/config`, data);
export const addIrrigationZone = (systemId, name, area) => 
  api.post(`/irrigation/systems/${systemId}/zones`, null, { params: { name, area_hectares: area } });
export const aiIrrigationOptimize = () => api.post("/irrigation/ai-optimize");

// AI Features
export const aiWeatherPrediction = (location) => api.get(`/ai/weather-prediction/${location}`);
export const aiSatelliteAnalysis = (parcelId) => api.get(`/ai/satellite-analysis/${parcelId}`);
export const autoGenerateRecommendations = () => api.post("/recommendations/auto-generate");
export const generateAiAlerts = () => api.post("/alerts/generate-ai");

// Marketplace Enhanced
export const createProduct = (data) => api.post("/marketplace/products/create", data);
export const getMyProducts = () => api.get("/marketplace/my-products");
export const getInputs = (category) => api.get("/marketplace/inputs", { params: { category } });
export const getServices = () => api.get("/marketplace/services");
export const sendChatMessageToUser = (receiverId, productId, message) => 
  api.post("/marketplace/chat/send", { receiver_id: receiverId, product_id: productId, message });
export const getConversations = () => api.get("/marketplace/chat/conversations");
export const getChatWithUser = (partnerId) => api.get(`/marketplace/chat/${partnerId}`);
export const createContract = (data) => api.post("/marketplace/contracts", data);
export const getContracts = () => api.get("/marketplace/contracts");
export const signContract = (contractId) => api.put(`/marketplace/contracts/${contractId}/sign`);

// Financial
export const requestSubsidy = (data) => api.post("/financial/subsidies", data);
export const getSubsidies = () => api.get("/financial/subsidies");
export const uploadFinancialDocument = (file, documentType, loanId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", documentType);
  if (loanId) formData.append("loan_id", loanId);
  return api.post("/financial/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
export const getFinancialDocuments = () => api.get("/financial/documents");

// Analytics
export const getAnalyticsMetrics = () => api.get("/analytics/metrics");
export const generateAnalyticsReport = (reportType, format) => 
  api.post("/analytics/report", null, { params: { report_type: reportType, format } });

// News
export const getAgricultureNews = () => api.get("/news/agriculture");

// Currency
export const convertCurrency = (amount, fromCurrency, toCurrency) => 
  api.get("/currency/convert", { params: { amount, from_currency: fromCurrency, to_currency: toCurrency } });

// ============================================
// SATELLITE & DRONE ADVANCED APIs
// ============================================

// Satellite Data
export const getSatelliteNDVI = (parcelId) => api.get(`/satellite/ndvi/${parcelId}`);
export const getSatelliteTrueColor = (parcelId) => api.get(`/satellite/true-color/${parcelId}`);
export const getSatelliteMoisture = (parcelId) => api.get(`/satellite/moisture/${parcelId}`);
export const getSatelliteWeather = (parcelId) => api.get(`/satellite/weather/${parcelId}`);
export const getSatelliteStressAnalysis = (parcelId) => api.get(`/satellite/stress-analysis/${parcelId}`);
export const analyzeSatelliteImage = (file, parcelId, analysisType) => {
  const formData = new FormData();
  formData.append("file", file);
  if (parcelId) formData.append("parcel_id", parcelId);
  formData.append("analysis_type", analysisType || "full");
  return api.post("/satellite/analyze-image", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
export const getSatelliteHistory = (parcelId, limit) => 
  api.get("/satellite/history", { params: { parcel_id: parcelId, limit } });
export const getWorldCropsCartography = (region, cropType) => 
  api.get("/satellite/world-crops", { params: { region, crop_type: cropType } });

// Advanced Drone Management
export const getAdvancedDrones = () => api.get("/satellite/drones");
export const connectDroneAdvanced = (droneId, connectionType, ssid, password, ipAddress) => 
  api.post("/satellite/drones/connect", { 
    drone_id: droneId, 
    connection_type: connectionType, 
    ssid, 
    password, 
    ip_address: ipAddress 
  });
export const disconnectDroneAdvanced = (droneId) => api.post(`/satellite/drones/${droneId}/disconnect`);
export const getDroneStatus = (droneId) => api.get(`/satellite/drones/${droneId}/status`);
export const createFlightPlan = (droneId, parcelId, waypoints, altitude, speed, captureInterval, scheduledDate) => 
  api.post(`/satellite/drones/${droneId}/flight-plan`, {
    drone_id: droneId,
    parcel_id: parcelId,
    waypoints,
    altitude,
    speed,
    capture_interval: captureInterval,
    scheduled_date: scheduledDate
  });
export const getDroneFlightPlans = (droneId) => api.get(`/satellite/drones/${droneId}/flight-plans`);
export const startDroneMission = (droneId, planId) => api.post(`/satellite/drones/${droneId}/start-mission/${planId}`);
export const controlDroneAdvanced = (droneId, action) => 
  api.post(`/satellite/drones/${droneId}/control`, null, { params: { action } });
export const captureDroneImage = (droneId) => api.post(`/satellite/drones/${droneId}/capture`);
export const getDroneCaptures = (droneId, limit) => 
  api.get(`/satellite/drones/${droneId}/captures`, { params: { limit } });

// AI Camera Recognition
export const aiCameraRecognize = (file, parcelId) => {
  const formData = new FormData();
  formData.append("file", file);
  if (parcelId) formData.append("parcel_id", parcelId);
  return api.post("/satellite/ai/recognize", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
export const aiSoilAnalysis = (file, parcelId) => {
  const formData = new FormData();
  formData.append("file", file);
  if (parcelId) formData.append("parcel_id", parcelId);
  return api.post("/satellite/ai/soil-analysis", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};
export const aiPredictHarvest = (file, parcelId, cropType) => {
  const formData = new FormData();
  formData.append("file", file);
  if (parcelId) formData.append("parcel_id", parcelId);
  if (cropType) formData.append("crop_type", cropType);
  return api.post("/satellite/ai/predict-harvest", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export default api;
