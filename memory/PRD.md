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
- Demo users (300): Demo@2026

## Completed Features

### Session 1-3 (Previous)
- [x] 7 role dashboards, 21+ language support, AGRICAMIA 2.0
- [x] Payment flow, Trainer role, Theme customization, Profile photo
- [x] Camera IA rewrite, Carte Agricole, Admin security, Data export

### Session 4 (19 Mar 2026)
- [x] RTL Layout Support for Arabic
- [x] Camera IA Enhancement with external camera selection

### Session 5 (25 Mar 2026)
- [x] Complete ES/DE/ZH translations (17 sections each)
- [x] Login page i18n, Camera IA i18n
- [x] Agribot quota limits removed
- [x] 300 demo users seeded (307 total)
- [x] Global theme initialization
- [x] Word documentation generation (4 docs via python-docx)
- [x] Documentation download page and API endpoints

### Session 6 (26 Mar 2026)
- [x] **CSS Compilation Fix**: Fixed orphaned CSS variables in index.css (lines 99-102) that blocked frontend build
- [x] **Complete African Languages**: Added 11 missing sections (landing, parcels, analysis, drones, robots, marketplace, leadCapture, exitIntent, privacy, subscription, payment) to all 15 African/Cameroonian languages
- [x] **Verified Documentation**: /api/docs/list and /api/docs/download/{filename} working, 4 Word documents downloadable
- [x] **Verified 307 Users**: Admin dashboard correctly displays seeded data

## Translation Coverage

### Main Languages (6) - 17 sections each
| Language | Code | RTL | Status |
|----------|------|-----|--------|
| French | fr | No | Complete |
| English | en | No | Complete |
| Spanish | es | No | Complete |
| German | de | No | Complete |
| Arabic | ar | Yes | Complete |
| Chinese | zh | No | Complete |

### African Languages (15) - 17 sections each
| Language | Code | Flag | Status |
|----------|------|------|--------|
| Kiswahili | sw | KE | Complete |
| Hausa | ha | NG | Complete |
| Yoruba | yo | NG | Complete |
| Wolof | wo | SN | Complete |
| Bambara | bam | ML | Complete |
| Fulfulde | ff | CM | Complete |
| Ewondo | ew | CM | Complete |
| Bassa | bas | CM | Complete |
| Douala | dua | CM | Complete |
| Bafoussam | baf | CM | Complete |
| Igbo | ig | NG | Complete |
| Amharique | am | ET | Complete |
| Lingala | ln | CD | Complete |
| Malagasy | mg | MG | Complete |
| Zulu | zu | ZA | Complete |

## P1 Remaining
- [ ] Enhance Admin Security Dashboard (intrusion detection, resource monitoring)
- [ ] Supplier self-registration with moderation workflow
- [ ] Parcel drawing on map with nearby supplier recommendations
- [ ] WebSocket real-time notifications

## P2 Backlog
- [ ] Real Mobile Money integration (currently MOCKED)
- [ ] Complete server.py refactoring (>4600 lines)
- [ ] Offline map caching
- [ ] Database protection dashboard
- [ ] Bank role features for agricultural credit

## Testing Status
- Iteration 23-29: All features tested, 95-100% pass rates
- Iteration 30: CSS fix, Documentation, Languages, RTL - 100% PASS (backend + frontend)

## Key API Endpoints
- `/api/docs/list` - List Word documents
- `/api/docs/download/{filename}` - Download Word document
- `/api/agribot/chat` - AI chat (no quota limits)
- `/api/suppliers/map` - Geospatial supplier search
- `/api/tracking/activity` - User activity tracking
