import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [language, setLanguage] = useState(() => {
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

  const t = (key) => {
    const keys = key.split(".");
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to French
        value = translations.fr;
        for (const k2 of keys) {
          if (value && value[k2]) {
            value = value[k2];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  const changeLanguage = (newLang) => {
    if (supportedLanguages.find(l => l.code === newLang)) {
      setLanguage(newLang);
    }
  };

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
