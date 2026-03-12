# AGRICAM IA - PRD

## Original Problem Statement
Enterprise-level precision agriculture platform "AGRICAM IA" with drone/robot management, AI analytics, AgriBot assistant, parcel management, admin dashboard, climate alerts, full i18n.

## User Language: French

## Architecture
- **Frontend**: React + Tailwind + Shadcn/UI (port 3000)
- **Backend**: FastAPI + MongoDB (port 8001)
- **AI**: emergentintegrations (Emergent LLM Key)
- **External**: OpenWeatherMap

## Credentials
- Admin: admin@agricam.ai / Admin@2026
- Farmer: agriculteur@agricam.ai / Farmer@2026

## Implemented Features (All Tested)

### Core Platform
- Marketing landing page, Dashboard, Parcels, Drones, Robots, Satellites, AGRI GENIUS, Camera IA, Irrigation, Marketplace, Alerts, Settings, Access Control, Database Browser, ELearning
- 4 user roles (Admin, Farmer, Supplier, Bank)
- Real-time weather (OpenWeatherMap)

### P0 Fixes (Done)
- AGRI GENIUS rebrand (0 Gemini mentions)
- AgriBot cache+fallback (TTLCache 500/1h + 15+ keyword responses)
- Admin access control (grant/revoke/extend trials + audit log)
- User activity tracking (page views, online users, stats)
- Exit intent conversion (auto-detect + offers)
- Database browser (collections + pagination)

### Phase 1 Features (Done)
- 13 Languages: FR, EN, ES, DE, AR, ZH + Fulfulde, Ewondo, Bambara, Hausa, Swahili, Wolof, Yoruba
- Page-level translations (dashboard, irrigation, formation, accessControl, satellite, camera, agribot)
- Parcels: Satellite map zoom 21, full weather data (wind dir, pressure, visibility, sunrise/sunset), export CSV/Excel/JSON/GeoJSON
- AGRI GENIUS responds in app language
- Admin CRM: contacts, transactions, revenue stats, ARPU, conversion rate, CSV export
- Drone camera WebRTC connection, zoom, AI analysis
- Robot camera + AI detection overlays (crops, pests, soil, leaves with confidence %)
- Irrigation plan generator (zones, water calc, material lists, export)
- Satellite capture scheduling (date/time/source/resolution)
- Formation system (create courses: video, ebook, PowerPoint, live)
- Marketplace product images + quality grades
- Settings language selector (13 languages)

### Phase 2 Features (Done)
- AI Video Recognition API (7 detections: crops, pests, soil, vegetation with confidence %, recommendations)
- 3D Environment Reconstruction API (terrain, vegetation, obstacles, water sources, paths, weather)
- Robot 3D SVG environment visualization with reconstruct button
- Drone video AI detection display (color-coded by category)

### Phase 3 Features (Done)
- SEO: XML sitemap, robots.txt, meta per page, Open Graph, Twitter Cards, structured data (JSON-LD)
- Email notifications for trial expiry (auto-detect 2-day window, discount code generation)
- Notification history + user notifications API
- Backend modularization: admin_extended.py route module
- Admin "Send expiry alerts" button in Access Control

## Backend API Endpoints

### Auth: POST /api/auth/login, /api/auth/register
### Access: POST /api/admin/access/grant, /update; GET /logs, /expired
### Tracking: POST /api/tracking/activity; GET /admin/tracking/users-online, /stats
### CRM: GET /api/admin/crm/contacts, /transactions, /revenue-stats
### Campaigns: GET /api/campaigns/exit-offers; POST /claim-offer; GET /admin/campaigns/stats
### Database: GET /api/admin/database/collections, /browse/{name}
### Formations: POST /api/formations; GET /api/formations
### Export: GET /api/admin/export/{collection}
### ChatBot: POST /api/chatbot/message (cache → AI → fallback)
### SEO: GET /api/seo/sitemap, /robots, /meta/{page}
### AI: POST /api/ai/video-recognize, /ai/3d-reconstruct
### Notifications: POST /api/admin/notifications/trial-expiry; GET /notifications/my, /admin/notifications/history

## Remaining (P2 Backlog)
- Real Mobile Money integration (needs API keys)
- Real SMS integration (needs API keys)
- Full text i18n for ALL page content strings
- Complete backend refactoring (move all server.py routes to modules)
- Push to GitHub via "Save to Github"
