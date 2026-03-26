# AGRICAM IA - Product Requirements Document

## Original Problem Statement
Enterprise-grade precision agriculture platform with AI, multi-role dashboards, drone/robot management, intelligent mapping, and comprehensive farm tools for African agriculture.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + react-leaflet
- **Backend**: FastAPI + MongoDB (motor async), modular routes
- **AI**: Gemini via emergentintegrations with failover
- **Storage**: Emergent Object Storage (videos, ebooks)
- **Map**: OpenStreetMap + Leaflet (free, no API key)
- **i18n**: 21 languages, per-user persistence, full RTL support for Arabic

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

### Session 1-3 (Previous)
- [x] 7 role dashboards, 21+ language support
- [x] Payment flow, Trainer role, Theme customization, Profile photo
- [x] Camera IA rewrite, Carte Agricole, Admin security, Data export

### Session 4 (19 Mar 2026)
- [x] RTL Layout Support for Arabic
- [x] Camera IA with external camera selection

### Session 5 (25 Mar 2026)
- [x] Complete ES/DE/ZH translations (17 sections each)
- [x] Agribot quota limits removed, 300 demo users seeded
- [x] Word documentation generation + download endpoint

### Session 6 (26 Mar 2026)
- [x] **CSS Compilation Fix**: Fixed orphaned CSS variables blocking frontend build
- [x] **15 African Languages Completed**: All 17 sections for sw, ha, yo, wo, bam, ff, ew, bas, dua, baf, ig, am, ln, mg, zu
- [x] **Landing Page Full i18n**: HomePage.jsx, WebsiteNavbar.jsx, WebsiteFooter.jsx rewritten with 60+ translation keys
- [x] **Enhanced Word Documents**: Professional cover pages with structured layout, TOC, tables
- [x] **Theme Isolation**: Confirmed per-user via localStorage (no cross-user leaks)

## Translation Coverage - 21 Languages, 17 Sections Each
FR, EN, ES, DE, AR (RTL), ZH, SW, HA, YO, WO, BAM, FF, EW, BAS, DUA, BAF, IG, AM, LN, MG, ZU

## P0 Remaining (User Requested)
- [ ] Admin Security Dashboard (intrusion detection, resource monitoring)
- [ ] Presentation Mode (guided tour)
- [ ] Supplier self-registration with admin moderation

## P1 Backlog
- [ ] Real-time WebSocket notifications
- [ ] Refactor server.py (>4600 lines) into modular routers

## P2 Future
- [ ] Real Mobile Money integration (currently MOCKED)
- [ ] Offline map caching
- [ ] Bank role features for agricultural credit

## Testing Status
- Iteration 30: CSS fix, translations, docs API - 100% PASS
- Iteration 31: Landing i18n, language switching, docs, theme - 100% PASS

## Key API Endpoints
- `/api/docs/list`, `/api/docs/download/{filename}` - Documentation
- `/api/agribot/chat` - AI chat (unlimited)
- `/api/suppliers/map` - Geospatial search
- `/api/tracking/activity` - User activity tracking
