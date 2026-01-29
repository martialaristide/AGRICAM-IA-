import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Parcelles from "./pages/Parcelles";
import CapteursIoT from "./pages/CapteursIoT";
import GestionDrones from "./pages/GestionDrones";
import ImagesSatellites from "./pages/ImagesSatellites";
import AnalyseImagesIA from "./pages/AnalyseImagesIA";
import IrrigationAuto from "./pages/IrrigationAuto";
import RecommandationsIA from "./pages/RecommandationsIA";
import Marketplace from "./pages/Marketplace";
import Analytics from "./pages/Analytics";
import Alertes from "./pages/Alertes";
import Parametres from "./pages/Parametres";
import Financial from "./pages/Financial";
import Chatbot from "./pages/Chatbot";
import Apprentissage from "./pages/Apprentissage";
import CameraIA from "./pages/CameraIA";
import Robots from "./pages/Robots";
import { Toaster } from "./components/ui/sonner";

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("agricam_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("agricam_token");
      const savedUser = localStorage.getItem("agricam_user");
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("agricam_token", accessToken);
    localStorage.setItem("agricam_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("agricam_token");
    localStorage.removeItem("agricam_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Splash Screen Component
const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 flex flex-col items-center justify-center z-50">
      {/* Logo */}
      <div className="animate-pulse mb-8">
        <img
          src="https://customer-assets.emergentagent.com/job_agricam-ia/artifacts/pkl5v1nd_logo%20Afrian%20ai%20solutions.png"
          alt="African AI Solutions"
          className="h-32 w-auto drop-shadow-2xl"
        />
      </div>
      
      {/* App Name */}
      <h1 className="text-5xl font-bold text-white mb-4 font-[Manrope] tracking-tight">
        AGRICAM <span className="text-emerald-400">IA</span>
      </h1>
      
      {/* Tagline */}
      <p className="text-xl text-emerald-200 mb-8">
        Agriculture de précision intelligente
      </p>
      
      {/* Loading Animation */}
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
      
      {/* Developer Credit */}
      <div className="absolute bottom-8 text-center">
        <p className="text-emerald-300/60 text-sm">
          Développé par <span className="font-semibold text-emerald-300">Barra Martial Aristide</span>
        </p>
        <p className="text-emerald-400/80 text-sm mt-1 font-semibold">
          African AI Solutions
        </p>
      </div>
    </div>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="parcelles" element={<Parcelles />} />
            <Route path="capteurs" element={<CapteursIoT />} />
            <Route path="drones" element={<GestionDrones />} />
            <Route path="satellites" element={<ImagesSatellites />} />
            <Route path="analyse-ia" element={<AnalyseImagesIA />} />
            <Route path="irrigation" element={<IrrigationAuto />} />
            <Route path="recommandations" element={<RecommandationsIA />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="alertes" element={<Alertes />} />
            <Route path="financial" element={<Financial />} />
            <Route path="chatbot" element={<Chatbot />} />
            <Route path="apprentissage" element={<Apprentissage />} />
            <Route path="parametres" element={<Parametres />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
