# AGRICAM IA - Product Requirements Document

## Original Problem Statement
Enterprise-grade precision agriculture platform with AI, multi-role dashboards, drone/robot management, intelligent mapping, and comprehensive farm tools for African agriculture.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + react-leaflet
- **Backend**: FastAPI + MongoDB (motor async), modular routes
- **AI**: Gemini via emergentintegrations with failover
- **Storage**: Emergent Object Storage (videos, ebooks)
- **Map**: OpenStreetMap + Leaflet (free, no API key)
- **i18n**: 21+ languages, per-user persistence, full RTL support for Arabic

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
- [x] 7 role dashboards, 21+ language support, AGRICAMIA 2.0
- [x] Payment flow, Trainer role, Theme customization, Profile photo
- [x] Camera IA rewrite, Carte Agricole, Admin security, Data export

### Session 4 (19 Mar 2026)
- [x] RTL Layout Support for Arabic
- [x] Camera IA Enhancement with external camera selection

### Session 5 (25 Mar 2026)
- [x] **Complete ES/DE/ZH translations**: Spanish, German, Chinese went from ~24-56 strings to ~393 each (matching FR/EN completeness). Added all sections: landing, parcels, analysis, drones, robots, marketplace, auth, leadCapture, exitIntent, privacy, pages (dashboard, irrigation, formation, accessControl, satellite, camera, agribot), roles (all 6), subscription, payment.
- [x] **Login page i18n**: Added useLanguage() hook, LanguageSelector component on login page. All labels (email, password, login button, register link, demo accounts) now translated.
- [x] **Camera IA i18n**: Permission screen, denied screen, buttons, status labels, result display, history all translated in 6 languages.
- [x] **Layout i18n fixes**: "Reduire" -> t("common.collapse"), "Agriculture de precision" -> t("common.precisionAg"). Added expand/collapse/precisionAg keys to all 6 languages.
- [x] **New translation keys**: auth.loginSubtitle, auth.demoAccounts, 15+ camera-specific keys across all languages.

## Translation Coverage (6 main languages)
| Language | Code | Strings | RTL | Status |
|----------|------|---------|-----|--------|
| French | fr | ~397 | No | Complete |
| English | en | ~396 | No | Complete |
| Spanish | es | ~396 | No | Complete |
| German | de | ~396 | No | Complete |
| Arabic | ar | ~396 | Yes | Complete |
| Chinese | zh | ~396 | No | Complete |

African languages (SW, HA, YO, WO, etc.): ~38 strings each, fallback to French for missing keys.

## P1 Remaining
- [ ] Enhance Admin Security Dashboard (intrusion detection, resource monitoring)
- [ ] Supplier self-registration with moderation workflow
- [ ] Parcel drawing on map with nearby supplier recommendations
- [ ] WebSocket real-time notifications

## P2 Backlog
- [ ] Real Mobile Money integration (currently MOCKED)
- [ ] Complete server.py refactoring
- [ ] Offline map caching
- [ ] Database protection dashboard
- [ ] African language full translations

## Testing Status
- Iteration 23-26: All features 100% pass
- Iteration 27: RTL Layout + Camera IA - 100% pass
- Iteration 28: Camera IA backend code review - passed
- Iteration 29: i18n ES/DE/ZH/Login/Camera - 95% pass (Camera content fixed after)
