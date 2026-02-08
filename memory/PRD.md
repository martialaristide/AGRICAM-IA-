# AGRICAM IA - Product Requirements Document

## Metadata
- **Developer**: Barra Martial Aristide
- **Company**: African AI Solutions
- **Version**: 8.0.0
- **Last Updated**: 2025-12-19

## Overview
Plateforme d'agriculture de précision intelligente avec **deux applications** :
1. **Application Web** (React + FastAPI)
2. **Application Mobile Native** (React Native / Expo)

---

## 🌐 APPLICATION WEB

### Stack Technique
- **Frontend**: React 18 + Tailwind CSS + Shadcn UI + Leaflet
- **Backend**: FastAPI + Python 3.11
- **Database**: MongoDB
- **AI**: Emergent LLM (Gemini)

### Fonctionnalités Complètes ✅
- ✅ Dashboard avec statistiques temps réel
- ✅ Gestion parcelles avec cartes satellite (Leaflet/ESRI)
- ✅ Capteurs IoT avec configuration WiFi
- ✅ Analyse IA images/vidéos/CSV (Gemini)
- ✅ Irrigation intelligente automatisée
- ✅ Mobile Money (Orange 698226903 / MTN 653722443)
- ✅ Robot Control avec 3D LIDAR
- ✅ Caméra IA temps réel
- ✅ Dev Analytics style Google Analytics
- ✅ E-Learning avec certificats
- ✅ Marketplace
- ✅ PWA (mode hors-ligne)
- ✅ Export PDF/Word/CSV
- ✅ Support 15 langues

### URL Web
```
https://smart-farm-23.preview.emergentagent.com
```

---

## 📱 APPLICATION MOBILE NATIVE

### Stack Technique
- **Framework**: React Native + Expo SDK 54
- **Navigation**: React Navigation 6
- **Storage**: Expo SecureStore
- **Camera**: Expo Camera + Image Picker
- **Location**: Expo Location

### Structure Mobile
```
/app/mobile/agricam-mobile/
├── App.js                    # Point d'entrée
├── app.json                  # Config Expo
├── src/
│   ├── components/           # Card, Button, Badge, StatCard...
│   ├── constants/theme.js    # Couleurs, spacing, API_URL
│   ├── navigation/           # Tab + Stack Navigator
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── ParcellesScreen.js
│   │   ├── CapteursScreen.js
│   │   ├── AnalyseIAScreen.js
│   │   └── ProfileScreen.js
│   └── services/api.js       # Axios + SecureStore
```

### Fonctionnalités Mobile ✅
- ✅ Authentification JWT
- ✅ Dashboard avec stats
- ✅ Liste des parcelles (Grid/List view)
- ✅ Surveillance capteurs IoT
- ✅ Analyse IA avec caméra native
- ✅ Profil et paramètres
- ✅ Notifications push (prêt)
- ✅ Mode hors-ligne (SecureStore)

### Build Mobile
```bash
# Développement
cd /app/mobile/agricam-mobile
npx expo start

# Build APK Android
npx eas build --platform android

# Build iOS (macOS requis)
npx eas build --platform ios
```

---

## 🔐 Comptes de Test

| Rôle | Email | Password |
|------|-------|----------|
| Admin | admin@agricam-ia.com | admin123 |
| Farmer | agriculteur@demo.com | farmer123 |

---

## ⚠️ APIs Simulées

| Feature | Status | Notes |
|---------|--------|-------|
| Mobile Money | MOCK | Ajoutez clés CinetPay/PayDunya |
| Robot Control | MOCK | Architecture hardware-ready |
| Camera IA | MOCK | Analyse simulée |
| SMS | MOCK | Ajoutez clés Twilio |

---

## 📋 Prochaines Étapes

1. **Build APK/IPA** - Générer les fichiers d'installation
2. **Publier sur stores** - Google Play + App Store
3. **Ajouter clés Mobile Money** - CinetPay ou PayDunya
4. **Intégration Twilio** - SMS réels

---

## 📂 Architecture Complète

```
/app/
├── backend/                  # FastAPI Backend
│   ├── server.py
│   ├── config.py
│   ├── database.py
│   └── services/
│       └── payment_service.py
├── frontend/                 # React Web App
│   ├── public/
│   │   ├── manifest.json    # PWA
│   │   ├── service-worker.js
│   │   └── offline.html
│   └── src/
│       ├── pages/           # 15+ pages
│       ├── components/
│       └── services/
├── mobile/                   # React Native Mobile App
│   └── agricam-mobile/
│       ├── App.js
│       ├── app.json
│       └── src/
│           ├── screens/     # 6 écrans
│           ├── components/
│           └── services/
└── memory/
    └── PRD.md
```

---

**© 2024 African AI Solutions - Barra Martial Aristide**
