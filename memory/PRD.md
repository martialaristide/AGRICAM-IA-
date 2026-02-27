# AGRICAM IA - Product Requirements Document

## Version: 14.0.0 | Date: 2026-02-27

---

## Co-Fondateurs
- **Barra Martial Aristide** - Co-Fondateur & CTO
- **Kenfack Claude Priscy Steffe** - Co-Fondatrice & CEO

## Comptes Test
| Role | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@agricam.ai | adminpassword |
| Agriculteur | jean.dupont@agricam.ai | farmerpassword |

---

## Architecture
```
/app/
├── backend/
│   ├── server.py                       # API FastAPI (3550+ lignes)
│   ├── routes/
│   │   ├── advanced_api.py             # AgriBot, Drones, Reports, Weather, Zones
│   │   └── agremo_api.py              # Analyse Avancee style Agremo
│   ├── services/
│   │   ├── agribot_ai_service.py      # Gemini AI
│   │   ├── agremo_analysis_service.py  # Comptage, prescription, ravageurs
│   │   ├── weather_service.py
│   │   └── zone_analysis_service.py
│   └── tests/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── AgribotIA.jsx           # v14 ChatGPT-style redesign
│       │   ├── CameraIA.jsx            # v14 WebRTC camera access
│       │   ├── DevAnalytics.jsx        # v14 Tour de Controle (6 tabs)
│       │   ├── Parcelles.jsx           # v14 Info bubbles + climat + NPK
│       │   ├── AnalyseAvancee.jsx      # v13 Agremo (5 onglets)
│       │   ├── Dashboard.jsx           # Meteo integree
│       │   ├── GestionDronesAvance.jsx # DroneVideoStream
│       │   ├── GestionRobotsAvance.jsx # Robot3DViewer
│       │   ├── MarketplaceEnhanced.jsx
│       │   └── website/ (5 pages marketing)
│       ├── components/
│       │   ├── Layout.jsx              # v14 NotificationBell + LanguageSelector
│       │   ├── DroneVideoStream.jsx
│       │   ├── Robot3DViewer.jsx
│       │   ├── WeatherWidget.jsx
│       │   └── LanguageSelector.jsx
│       ├── contexts/LanguageContext.jsx
│       └── locales/translations.js
```

---

## Fonctionnalites Completees

### v14.0.0 (2026-02-27) - Major UI/UX Overhaul
- **AgriBot IA ChatGPT**: Interface conversationnelle, sidebar historique, conversations localStorage, quick prompts, outils IA (prediction, analyse sol, maladies, ecologique)
- **Notifications Climat**: Cloche en header, dropdown alertes meteo temps reel, badge non-lus
- **Parcelles Enrichies**: 6 info-bulles (culture, superficie, humidite, temperature, pH, pays), composition NPK en barres, donnees climatiques, selecteur de pays
- **Camera IA WebRTC**: Acces camera reel (telephone/webcam/USB), device selector, capture & analyse, auto-analyse 5s, HUD overlay
- **DevAnalytics Tour de Controle**: 6 onglets (Sante plateforme, Utilisateurs, Comportement, Conversion, SEO, Activite), entonnoir conversion, messages marketing freemium, export JSON
- **Fix debordements texte**: CSS global overflow fixes
- **Code mort supprime**: LandingPagePro.jsx, ancien Marketplace.jsx

### v13.0.0 - Analyse Avancee Agremo
- 12 endpoints API Agremo (comptage, prescription, ravageurs, rapports, exports, missions)
- Page Analyse Avancee 5 onglets
- DroneVideoStream + Robot3DViewer integres
- Multi-langue 6 langues

### Versions anterieures
- Site marketing 5 pages, Dashboard meteo, Marketplace, AgriBot IA Gemini
- Gestion drones/robots avancee, SEO, RGPD, Capture leads

---

## Elements MOCKED
- Analyse Agremo: donnees simulees (pas de vraie IA d'images)
- Notifications climat: alertes aleatoires
- Sante plateforme DevAnalytics: simulee cote client
- Messages conversion: toast seulement (pas de vrai SMS/email)
- Mobile Money: simulation
- SMS: simulation
- Camera IA video: flux reel si permission accordee, sinon demo

---

## Prochaines Etapes

### P0 - Haute Priorite
1. Refactoring backend server.py (3550+ lignes) en modules
2. Integrer traductions t() dans toutes les pages

### P1 - Moyenne Priorite
3. Integration Mobile Money reelle (CinetPay/PayDunya) - attente cles API
4. Integration SMS Twilio
5. Pages parametres fonctionnelles

### P2 - Backlog
6. Publication Google Play
7. Tests automatises complets
8. SEO avance (sitemap auto-genere)
9. Import donnees d'autres plateformes d'analyse
