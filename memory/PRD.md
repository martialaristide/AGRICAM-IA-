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

### Core Features (Completed)
- Full marketing landing page with lead capture
- Multi-page app: Dashboard, Parcels, Drones, Robots, Satellites, AgriBot, Camera IA, Irrigation, Marketplace, Alerts
- Real-time weather integration (OpenWeatherMap)
- Real-time climate notifications
- AgriBot IA with ChatGPT-style UI
- Analyse Avancee (Agremo-style analytics)
- Camera IA with WebRTC
- Dev Analytics (Tour de Controle)
- Multi-language system (FR, EN, ES, DE, AR, ZH)
- 4 user roles (Admin, Farmer, Supplier, Bank)

### P0 Fixes (Completed - March 4, 2026)
1. **AgriBot Fallback System**: TTLCache (500 entries, 1h TTL) + keyword-based fallback with 15+ agricultural responses. Cache hit = 0ms, AI = ~12s, fallback = instant. Response source logged to MongoDB.
2. **Admin Access Control System**:
   - Grant trial access with customizable duration and level (basic/premium)
   - Revoke, reduce, or extend access
   - Expired trial detection
   - Full access audit log
3. **User Activity Tracking**:
   - Page view tracking per user
   - Online users (15min window)
   - Platform usage statistics (today, weekly, top pages)
4. **Exit Intent Conversion System**:
   - Auto-detect mouse leaving viewport
   - Dynamic offers based on subscription (freemium → free trial/discount, basic → upgrade)
   - Claim tracking and campaign stats
5. **Database Browser**: Admin-only endpoint to list collections and browse documents with pagination
6. **Translation Fixes**: Added missing nav keys (admin, financial, advancedAnalysis, accessControl, database)

## API Endpoints

### Access Control
- `POST /api/admin/access/grant` - Grant trial access
- `POST /api/admin/access/update` - Revoke/reduce/extend
- `GET /api/admin/access/logs` - Access history
- `GET /api/admin/access/expired` - Expired trials

### User Tracking
- `POST /api/tracking/activity` - Track page views
- `GET /api/admin/tracking/users-online` - Online users
- `GET /api/admin/tracking/stats` - Usage stats

### Campaigns
- `GET /api/campaigns/exit-offers` - Get offers for user
- `POST /api/campaigns/claim-offer` - Claim an offer
- `GET /api/admin/campaigns/stats` - Campaign metrics

### Database
- `GET /api/admin/database/collections` - List collections
- `GET /api/admin/database/browse/{name}` - Browse collection

### AgriBot
- `POST /api/chatbot/message` - Chat (cache → AI → fallback)

## Remaining Tasks

### P1 - In Progress
- Complete multi-language (wrap ALL text with t() across all pages)
- Advanced SEO implementation
- User behavior analytics in DevAnalytics

### P2 - Backlog
- Backend refactoring (server.py → modular routes)
- Real Mobile Money integration (CinetPay/PayDunya)
- Real SMS integration (Twilio)
- Cart abandonment nudges
- Push to GitHub (via "Save to Github" feature)

## Key Files
- `/app/backend/server.py` - Main backend (monolith)
- `/app/frontend/src/pages/AccessControl.jsx` - Admin access control
- `/app/frontend/src/pages/DatabaseBrowser.jsx` - DB browser
- `/app/frontend/src/components/ExitIntentModal.jsx` - Exit intent
- `/app/frontend/src/components/Layout.jsx` - Main layout with tracking
- `/app/frontend/src/locales/translations.js` - Translation keys
