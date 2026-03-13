import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import translations, { supportedLanguages } from "../locales/translations";

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("agricam_language");
    return saved || navigator.language.split("-")[0] || "fr";
  });
  
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    localStorage.setItem("agricam_language", language);
    const langConfig = supportedLanguages.find(l => l.code === language);
    setIsRTL(langConfig?.rtl || false);
    document.documentElement.dir = langConfig?.rtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key) => {
    const keys = key.split(".");
    
    // Try current language first
    let value = translations[language];
    if (value) {
      for (const k of keys) {
        if (value != null && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }
      if (typeof value === "string") return value;
      if (Array.isArray(value)) return value;
    }
    
    // Fallback to French
    if (language !== "fr") {
      let fallback = translations.fr;
      if (fallback) {
        for (const k of keys) {
          if (fallback != null && typeof fallback === "object" && k in fallback) {
            fallback = fallback[k];
          } else {
            return key;
          }
        }
        if (typeof fallback === "string") return fallback;
        if (Array.isArray(fallback)) return fallback;
      }
    }
    
    return key;
  }, [language]);

  const changeLanguage = (newLang) => {
    if (supportedLanguages.find(l => l.code === newLang)) {
      setLanguageState(newLang);
      // Persist to backend if user is logged in
      const token = localStorage.getItem("agricam_token");
      if (token) {
        const API_BASE = process.env.REACT_APP_BACKEND_URL + "/api";
        fetch(`${API_BASE}/user/update-profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ language: newLang })
        }).catch(() => {});
      }
    }
  };

  // Load language from user profile on mount (if logged in)
  useEffect(() => {
    const token = localStorage.getItem("agricam_token");
    if (token) {
      const API_BASE = process.env.REACT_APP_BACKEND_URL + "/api";
      fetch(`${API_BASE}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(user => {
          if (user?.language && supportedLanguages.find(l => l.code === user.language)) {
            setLanguageState(user.language);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      t,
      isRTL,
      supportedLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
