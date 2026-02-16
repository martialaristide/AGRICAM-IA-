import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/Layout";
// Website Pages
import HomePage from "./pages/website/HomePage";
import SolutionsPage from "./pages/website/SolutionsPage";
import AboutPage from "./pages/website/AboutPage";
import PricingPage from "./pages/website/PricingPage";
import ContactPage from "./pages/website/ContactPage";
import PrivacyPolicyPage from "./pages/website/PrivacyPolicyPage";
// App Pages
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
import MarketplaceEnhanced from "./pages/MarketplaceEnhanced";
import Analytics from "./pages/Analytics";
import Alertes from "./pages/Alertes";
import Parametres from "./pages/Parametres";
import Financial from "./pages/Financial";
import ELearning from "./pages/ELearning";
import MobileMoneyPayment from "./pages/MobileMoneyPayment";
import RobotControl from "./pages/RobotControl";
import CameraIA from "./pages/CameraIA";
import DevAnalytics from "./pages/DevAnalytics";
import AgribotIA from "./pages/AgribotIA";
import GestionDronesAvance from "./pages/GestionDronesAvance";
import GestionRobotsAvance from "./pages/GestionRobotsAvance";
import { Toaster } from "./components/ui/sonner";
import { LanguageProvider } from "./contexts/LanguageContext";
import LeadCaptureModal from "./components/LeadCaptureModal";
import ExitIntentPopup from "./components/ExitIntentPopup";

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
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);

  useEffect(() => {
    // Check if lead already captured
    const leadCaptured = localStorage.getItem("agricam_lead_captured");
    if (!leadCaptured) {
      // Show lead capture after 5 seconds
      const timer = setTimeout(() => {
        setShowLeadCapture(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Exit intent detection
    const handleMouseLeave = (e) => {
      if (e.clientY < 10) {
        const exitShown = sessionStorage.getItem("agricam_exit_shown");
        const offerClaimed = localStorage.getItem("agricam_exit_offer_claimed");
        if (!exitShown && !offerClaimed) {
          setShowExitIntent(true);
          sessionStorage.setItem("agricam_exit_shown", "true");
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Website Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/accueil" element={<HomePage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/solutions/:id" element={<SolutionsPage />} />
            <Route path="/tarifs" element={<PricingPage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
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
              <Route path="parametres" element={<Parametres />} />
              <Route path="formation" element={<ELearning />} />
              <Route path="paiements" element={<MobileMoneyPayment />} />
              <Route path="robot-control" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <RobotControl />
                </ProtectedRoute>
              } />
              <Route path="camera-ia" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CameraIA />
                </ProtectedRoute>
              } />
              <Route path="dev-analytics" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DevAnalytics />
                </ProtectedRoute>
              } />
              <Route path="agribot-ia" element={<AgribotIA />} />
              <Route path="drones-avance" element={<GestionDronesAvance />} />
              <Route path="robots-avance" element={<GestionRobotsAvance />} />
            </Route>
          </Routes>
        </BrowserRouter>
        
        {/* Lead Capture Modal */}
        <LeadCaptureModal 
          isOpen={showLeadCapture} 
          onClose={() => setShowLeadCapture(false)}
          onSuccess={() => setShowLeadCapture(false)}
        />
        
        {/* Exit Intent Popup */}
        <ExitIntentPopup
          isOpen={showExitIntent}
          onClose={() => setShowExitIntent(false)}
        />
        
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
