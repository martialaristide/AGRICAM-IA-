# AGRICAM IA - Product Requirements Document

## Original Problem Statement
Enterprise-grade precision agriculture platform with AI, multi-role dashboards, drone/robot management, intelligent mapping, and comprehensive farm tools for African agriculture.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + react-leaflet
- **Backend**: FastAPI + MongoDB (motor async), modular routes
- **AI**: Gemini via emergentintegrations with failover
- **Storage**: Emergent Object Storage (videos, ebooks)
- **Map**: OpenStreetMap + Leaflet (free, no API key)
- **i18n**: 21+ languages, per-user persistence

## User Roles (7)
1. Admin, 2. Farmer, 3. Supplier, 4. Bank, 5. Seed Analyst, 6. Agronomist, 7. Trainer

## Demo Accounts
- Admin: admin@agricam.ai / Admin@2026
- Farmer: agriculteur@agricam.ai / Farmer@2026
- Supplier: fournisseur@agricam.ai / Supplier@2026
- Bank: banque@agricam.ai / Bank@2026
- Seed Analyst: analyste@agricam.ai / Analyst@2026
- Agronomist: agronome@agricam.ai / Agro@2026
- Trainer: formateur@agricam.ai / Trainer@2026

## Completed Features
### Session 1 (Previous)
- [x] 7 role dashboards, i18n 21+ languages, AGRICAMIA 2.0

### Session 2 (13 Mar 2026)
- [x] Payment bug fix + Success/Failure pages
- [x] Theme customization (4 themes), Change password
- [x] Profile photo + LinkedIn, Admin Analytics Export (CSV/Excel/PDF)
- [x] Trainer role (trainings, ebooks, video upload, verification)
- [x] Geolocation weather alerts, Per-user language persistence

### Session 3 (Current)
- [x] **Camera IA rewrite** - Live camera preview, capture+analyze in one click, mode selector, fullscreen, history (19 Mar 2026)
- [x] **Carte Agricole** - Full-page Yango-style map with OpenStreetMap, 10 demo Cameroon suppliers, filter by category/culture/need/radius, season mode, WhatsApp/Call/Itineraire, search (19 Mar 2026)
- [x] **Admin block/unblock** - Block users with security logging, blocked users cannot login (19 Mar 2026)
- [x] **Security dashboard** - Intrusion detection stats, active protections panel (19 Mar 2026)

## Map API Endpoints
- GET /api/map/suppliers?lat=&lon=&radius=&category=&culture=&need=&search=
- POST /api/map/suppliers (create supplier)
- PUT /api/map/suppliers/{id} (update)
- PUT /api/map/suppliers/{id}/approve (admin)
- GET /api/map/seasons (current agricultural season)
- GET /api/map/categories (all filter options)

## P1 Remaining
- [ ] Supplier self-registration with moderation workflow
- [ ] Parcel drawing on map with nearby supplier recommendations
- [ ] Full landing page multilingual (all sections)
- [ ] WebSocket real-time notifications

## P2 Backlog
- [ ] Real Mobile Money integration
- [ ] Complete server.py refactoring
- [ ] Offline map caching
- [ ] Database protection dashboard

## Testing Status
- Iteration 23-25: Payment, Trainer, Uploads - 100% pass
- Iteration 26: Map + Camera + Admin Security - 13 backend + 21 frontend, 100% pass
