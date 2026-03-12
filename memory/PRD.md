# AGRICAM IA - PRD (Product Requirements Document)

## Original Problem Statement
Enterprise-level precision agriculture platform "AGRICAM IA" with drone/robot management, AI-powered analytics, AgriBot assistant, parcel management, admin dashboard, real-time climate alerts, and full multi-language support.

## User Language: French

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI (port 3000)
- **Backend**: FastAPI + MongoDB (port 8001)
- **AI**: emergentintegrations (Gemini via Emergent LLM Key)
- **External APIs**: OpenWeatherMap

## Test Credentials
- Admin: admin@agricam.ai / Admin@2026
- Farmer: agriculteur@agricam.ai / Farmer@2026
- Supplier: fournisseur@agricam.ai / Supplier@2026
- Bank: banque@agricam.ai / Bank@2026

## What's Been Implemented

### Core Platform Features (Completed)
- Full marketing landing page with lead capture
- Multi-page app: Dashboard, Parcels, Drones, Robots, Satellites, AGRI GENIUS, Camera IA, Irrigation, Marketplace, Alerts, Settings
- Real-time weather integration (OpenWeatherMap)
- Real-time climate notifications
- 4 user roles (Admin, Farmer, Supplier, Bank)
- WebRTC Camera IA

### Phase 1 - P0 Corrections (Completed)
1. **AgriBot Fallback System**: TTLCache (500 entries, 1h TTL) + 15+ agricultural keyword fallback responses
2. **Admin Access Control System**: Grant/revoke/reduce/extend trial access with audit logs
3. **User Activity Tracking**: Page views, online users, platform stats
4. **Exit Intent Conversion**: Auto-detect mouse leave → personalized offers
5. **Database Browser**: Admin-only collection browsing with pagination
6. **Translation Keys Fixed**: All nav keys resolved

### Phase 1 - Feature Enhancement (Completed)
1. **AGRI GENIUS Rebrand**: Removed all "Gemini Pro" mentions, renamed AgriBot to "AGRI GENIUS" across entire app (sidebar, chat, footer)
2. **13 Languages**: FR, EN, ES, DE, AR, ZH + 7 African: Fulfulde (🇨🇲), Ewondo (🇨🇲), Bambara (🇲🇱), Hausa (🇳🇬), Swahili (🇰🇪), Wolof (🇸🇳), Yoruba (🇳🇬)
3. **Parcelles Enhanced**: Satellite map with maxZoom 21, wind direction, pressure, visibility, sunrise/sunset, feels_like data. Export to CSV, Excel, JSON, GeoJSON
4. **AGRI GENIUS Language-Aware**: Responds in the app's active language
5. **Admin CRM Platform**: Contacts (users + leads), transactions, revenue stats (ARPU, conversion rate), CSV export
6. **Drone Camera Connection**: Real WebRTC camera connection via WiFi, zoom in/out, AI analysis
7. **Robot Camera + AI Detection**: Camera connection, AI detection overlays (crops, pests, soil, leaves with confidence %), screenshot export
8. **Irrigation Plan Generator**: IA-powered plan with zones, water calculations, material lists, CSV/JSON export
9. **Satellite Capture Scheduling**: Schedule captures by date/time/source/resolution
10. **Formation/Training System**: Create courses (video, ebook, PowerPoint, live), categories, levels, pricing
11. **Marketplace Product Images**: Upload product images + quality grade selection
12. **Settings Language Integration**: Full language selector with all 13 languages connected to LanguageContext
13. **AI Recommendations**: Enhanced with real-time data source indicators (Capteurs, Drones, Robots, AGRI GENIUS, Meteo)

### Backend API Endpoints

#### Access Control
- `POST /api/admin/access/grant` - Grant trial access
- `POST /api/admin/access/update` - Revoke/reduce/extend
- `GET /api/admin/access/logs` - Access audit log
- `GET /api/admin/access/expired` - Expired trials

#### User Tracking
- `POST /api/tracking/activity` - Track page views
- `GET /api/admin/tracking/users-online` - Online users (15min)
- `GET /api/admin/tracking/stats` - Platform stats

#### CRM
- `GET /api/admin/crm/contacts` - All contacts (users + leads)
- `GET /api/admin/crm/transactions` - Transaction flow
- `GET /api/admin/crm/revenue-stats` - Revenue KPIs

#### Campaigns
- `GET /api/campaigns/exit-offers` - User-specific offers
- `POST /api/campaigns/claim-offer` - Claim offer
- `GET /api/admin/campaigns/stats` - Campaign metrics

#### Database
- `GET /api/admin/database/collections` - List collections
- `GET /api/admin/database/browse/{name}` - Browse with pagination

#### Formations
- `POST /api/formations` - Create course
- `GET /api/formations` - List published courses

#### Export
- `GET /api/admin/export/{collection}?format=csv|json` - Export any collection

#### AgriBot
- `POST /api/chatbot/message` - Chat (cache → AI → fallback, logs source)

## Remaining Tasks

### P1 - Important
- Complete multi-language coverage across ALL page text (not just nav)
- Backend refactoring (server.py → modular routes)
- Advanced SEO implementation

### P2 - Backlog
- Real Mobile Money integration (CinetPay/PayDunya) - needs API keys
- Real SMS integration (Twilio) - needs API keys
- Full 3D environment reconstruction AI
- Video AI recognition (fruits/leaves/pests identification)
- Push to GitHub (via "Save to Github")

## Key Files
- `/app/backend/server.py` - Main backend (monolith)
- `/app/frontend/src/pages/AccessControl.jsx` - Admin platform (6 tabs)
- `/app/frontend/src/pages/DatabaseBrowser.jsx` - DB browser
- `/app/frontend/src/pages/Parcelles.jsx` - Enhanced parcels with export
- `/app/frontend/src/pages/AgribotIA.jsx` - AGRI GENIUS chat
- `/app/frontend/src/pages/IrrigationAuto.jsx` - Irrigation plan generator
- `/app/frontend/src/pages/ImagesSatellites.jsx` - Satellite scheduling
- `/app/frontend/src/pages/ELearning.jsx` - Formation system
- `/app/frontend/src/components/DroneVideoStream.jsx` - Drone camera
- `/app/frontend/src/components/Robot3DViewer.jsx` - Robot camera + AI
- `/app/frontend/src/components/ExitIntentModal.jsx` - Exit intent
- `/app/frontend/src/locales/translations.js` - 13 languages
