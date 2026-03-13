# AGRICAM IA - Product Requirements Document

## Original Problem Statement
Enterprise-grade precision agriculture platform "AGRICAM IA" with AI-powered crop analysis, multi-role dashboards, drone/robot management, and comprehensive farm management tools for African agriculture.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI, dark theme
- **Backend**: FastAPI + MongoDB (motor async), modular routes
- **AI**: Gemini via emergentintegrations with OpenAI failover chain
- **i18n**: Custom LanguageContext with 21+ languages (FR, EN, ES, DE, AR, ZH, African languages)

## User Roles (7)
1. **Admin** - Platform management, predictive analytics, user CRM, A/B tests
2. **Farmer (Agriculteur)** - Parcels, blockchain traceability, crop analysis, IoT
3. **Supplier (Fournisseur)** - Demand forecasting, smart logistics, inventory, revenue
4. **Bank (Banque)** - AgriScore credit scoring, parametric insurance, risk zones
5. **Seed Analyst** - Digital twin simulation, genomic analysis, seed batch certification
6. **Agronomist** - Epidemiological modeling, intervention planning, carbon tracking
7. **Trainer (Formateur)** - Training creation/publishing, ebook sales, video MP4, verification system

## Backend Architecture
```
/app/backend/
  core.py              # Shared: db, auth, AI helpers
  server.py            # Main app + legacy routes
  routes/
    agriscore.py       # AgriScore credit scoring (Bank)
    digital_twin.py    # Digital twin simulation (Seed Analyst)
    predictive.py      # Platform analytics (Admin)
    blockchain.py      # Product traceability (Farmer)
    epidemiology.py    # Disease modeling (Agronomist)
    supplier_analytics.py  # Demand & logistics (Supplier)
    management_api.py  # Admin management
    payments.py        # Mobile Money payments
    trainer.py         # NEW: Trainer CRUD (trainings, ebooks, profile, verification)
    camera_ai.py       # Camera AI analysis
```

## Demo Accounts
- Admin: admin@agricam.ai / Admin@2026
- Farmer: agriculteur@agricam.ai / Farmer@2026
- Supplier: fournisseur@agricam.ai / Supplier@2026
- Bank: banque@agricam.ai / Bank@2026
- Seed Analyst: analyste@agricam.ai / Analyst@2026
- Agronomist: agronome@agricam.ai / Agro@2026
- Trainer: formateur@agricam.ai / Trainer@2026

## Completed Features
- [x] Multi-role dashboards (7 roles) with dark futuristic theme
- [x] i18n translation system - 21+ languages with per-user persistence
- [x] App reload/redirect bug fixed
- [x] Intelligent Camera module with AI analysis + auto-start
- [x] Satellite zone capture and AI analysis
- [x] Farmer onboarding wizard
- [x] 14-day freemium trial system
- [x] AGRICAMIA 2.0: All 6 advanced dashboards
- [x] Backend refactoring to modular routes
- [x] Payment bug fix - JWT secret mismatch resolved (13 Mar 2026)
- [x] Payment Success/Failure dedicated pages (13 Mar 2026)
- [x] **Theme customization** - 4 themes: Sombre, Clair, Emeraude, Ocean (13 Mar 2026)
- [x] **Change password** - Functional dialog with validation (13 Mar 2026)
- [x] **Profile photo + LinkedIn** - Upload and save for all users (13 Mar 2026)
- [x] **Admin Analytics Export** - CSV, Excel (xlsx), PDF, Word (13 Mar 2026)
- [x] **Trainer (Formateur) role** - Full CRUD: trainings, ebooks, profile, verification (13 Mar 2026)
- [x] **Geolocation weather alerts** - Auto-detect user location (13 Mar 2026)
- [x] **Per-user language persistence** - Saves to backend profile (13 Mar 2026)

## Known Limitations
- NetWalletPay: External API unreachable in preview environment. Payments use simulated mode.
- Camera AI: Falls back gracefully when AI models unavailable.

## P1 Tasks Remaining
- [ ] Formateur: Video upload (MP4) with storage integration
- [ ] Formateur: ebook file upload with download control
- [ ] Training enrollment flow from ELearning page
- [ ] Landing page full multi-language support
- [ ] Formations filtered by user role on ELearning page

## P2 Features (Backlog)
- [ ] Security dashboard - intrusion detection, user blocking
- [ ] Database protection against jailbreak/scraping
- [ ] Resource management monitoring
- [ ] Complete server.py refactoring
- [ ] Real Mobile Money integration
- [ ] WebSocket real-time notifications
- [ ] Export PDF/CSV from all dashboards

## Testing Status
- Iteration 23: Payment flow - 8 backend + 6 frontend, 100% pass
- Iteration 24: Trainer + Settings - 17 backend + 8 frontend flows, 100% pass (13 Mar 2026)
