# AGRICAM IA - Product Requirements Document

## Original Problem Statement
Enterprise-grade precision agriculture platform with AI, multi-role dashboards, drone/robot management, intelligent mapping, and comprehensive farm tools for African agriculture.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + react-leaflet
- **Backend**: FastAPI + MongoDB (motor async)
- **AI**: Gemini via emergentintegrations
- **Storage**: Emergent Object Storage
- **i18n**: 21 languages, RTL Arabic

## Demo Accounts
- Admin: admin@agricam.ai / Admin@2026
- Farmer: agriculteur@agricam.ai / Farmer@2026
- Seed Analyst: analyste@agricam.ai / Analyst@2026
- Agronomist: agronome@agricam.ai / Agro@2026
- Trainer: formateur@agricam.ai / Trainer@2026
- Supplier: fournisseur@agricam.ai / Supplier@2026
- Bank: banque@agricam.ai / Bank@2026

## Completed Features

### Session 6 (26 Mar 2026)
- [x] CSS Compilation Fix
- [x] 15 African Languages (17 sections each)
- [x] Landing Page Full i18n (60+ keys)
- [x] Enhanced Word Documents (pro cover pages)

### Session 7 (27 Mar 2026)
- [x] **Advanced Seed Analysis Module**: Complete rebuild with 6 tabs
  - Lots: Create, view all, filter by status (certifie/test/attente/rejete), change status
  - Upload: 6 data types (images, genomes, growth indices, climate, soil, phyto)
  - Jumeaux Numeriques: Full digital twin view with genetic profile, metadata
  - Genomique: AI-powered gene analysis with CRISPR feasibility, expression scores
  - Croisement: AI crossing simulator with multi-generation results, protocol guide
  - Climat: Climate adaptation evaluation with projections 2030-2070, stress indices
- [x] **Dropdown Visibility Fix**: bg-white text-slate-900 on Parcelles, CapteursIoT, AnalyseImages, Irrigation
- [x] **AGRI GENIUS**: Verified naming throughout chatbot and sidebar
- [x] **Export**: CSV and JSON report downloads from seed analysis

## API Endpoints (New)
- POST /api/digital-twin/seed-batches - Create batch
- PUT /api/digital-twin/seed-batches/{id}/status - Update status
- POST /api/digital-twin/crossing-simulation - AI crossing sim
- POST /api/digital-twin/climate-adaptation - Climate evaluation
- POST /api/digital-twin/genomic-analysis - Gene analysis
- POST /api/digital-twin/upload-seed-data - Upload files
- GET /api/digital-twin/export/{format} - Export CSV/JSON

### Session 8 (27 Mar 2026)
- [x] **Trainer File Uploads Fixed**: Fixed critical NameError in `storage.py` (EMERGENT_KEY → emergent_key). Fixed axios Content-Type header blocking multipart boundary in `api.js`. Added PPT/PPTX support to backend + frontend. Video and ebook uploads now working end-to-end.
- [x] **Training Page Upload Fixed**: Connected ELearning.jsx file upload zone to backend API. Previously, the file input was hidden with no click handler and the submit button only added to local state. Now properly creates training via API and uploads files to Object Storage.
- [x] **AGRI GENIUS Voice**: Added free browser-based speech-to-text (SpeechRecognition) and text-to-speech (SpeechSynthesis) to AGRI GENIUS chatbot. Microphone button, auto-speak toggle, per-message replay. All responses now sent in user's selected language via context injection. Mobile responsive with overlay sidebar.
- [x] **PWA Offline/Online**: Registered Service Worker in index.js, cache static assets + API routes for offline use. Added NetworkStatus component showing online/offline banner.
- [x] **Landing Page i18n**: Rewrote LandingPage.jsx to use translations from LanguageContext. Added LanguageSelector in navbar. Added 30+ new translation keys for pricing, CTA, features.
- [x] **Admin Security Dashboard**: Created /security route with SecurityDashboard.jsx. Backend endpoint /api/admin/security/dashboard returns stats (score, users, blocked, activity). Login logging (success/failed) in security_logs collection. 4 tabs: Vue d'ensemble, Logs, Bloques, Menaces.
- [x] **Token Auto-Deduction**: Updated payment status handler to set ai_tokens_unlimited=True and ai_token_balance=999999 on successful payment.
- [x] **Guided Tour**: Created GuidedTour.jsx with 7 interactive steps targeting nav elements. Shows on first visit, dismissable, with progress bar.
- [x] **Blocked User Protection**: Login now checks is_blocked flag and returns 403 if blocked.
- [x] **AGRI GENIUS Micro Fix**: Improved SpeechRecognition with explicit mic permission request, error messages (not-allowed, no-speech, network), auto-send after final transcript, voice loading for TTS.
- [x] **Guided Tour i18n**: Tour steps now translated via LanguageContext. Added tour translation keys for FR and EN. Smart positioning to stay within viewport.
- [x] **DJI Mini 3 Pro Module**: Complete drone management dashboard at /drone-dji with:
  - Fleet management (register/view drones, battery/status monitoring)
  - Mission planning (create missions with altitude, speed, overlap, waypoints)
  - Live telemetry simulation (real-time GPS, altitude, battery, wind, temperature)
  - Photo gallery with AI analysis (NDVI, health status, disease detection, crop identification)
  - Backend API at /api/drone-manager/ with 8 endpoints

## P0 Remaining
- [ ] Supplier self-registration with admin moderation

## P1 Backlog
- [ ] WebSocket notifications
- [ ] Real drone/robot connection guide (replace simulation)
- [ ] Refactor server.py (>4700 lines) into /routes modules

## Testing
- Iteration 30-31: i18n, docs, translations - 100% PASS
- Iteration 32: Seed analysis module, dropdowns, AGRI GENIUS - 100% PASS (Backend 9/9)
- Session 8: Trainer upload fix verified via curl (video + ebook + download) - ALL PASS
- Session 9 (1 May 2026): NetWalletPay integration verified via live curl tests
  - Token endpoint OK (200) with `primary_key + Email + grant_type=primary_key`
  - /providers endpoint live (4 providers: MTN, Orange, NetWallet, EU)
  - /countries endpoint live (15 countries)
  - /request-payment correctly rejects invalid phone (NetWalletPay error 4007)

## Session 9 (1 May 2026) - NetWalletPay Mobile Money Integration
- [x] **Real NetWalletPay API integration** (replacing Stripe mock):
  - Live token authentication via `POST /api/v1/token` (primary_key + Email + grant_type)
  - Token caching (15 min expiry per NetWalletPay spec)
  - Collection request via `POST /api/v1/global/collection/request-payment`
  - Webhook handler at `POST /api/webhook/netwalletpay` with X-CallbackToken
  - SHA-256 hash support (toggleable via NETWALLETPAY_USE_HASH env var)
  - Phone number normalization (auto-prefix 237 for Cameroon)
  - Real error handling with NetWalletPay error codes (4007, etc.)
- [x] **Credentials configured in .env**:
  - NETWALLETPAY_PRIMARY_KEY, NETWALLETPAY_SECONDARY_KEY
  - NETWALLETPAY_MERCHANT_ID, NETWALLETPAY_EMAIL
  - NETWALLETPAY_BASE_URL=https://netwalletpay.com
  - PUBLIC_BACKEND_URL for webhook callback
- [x] **Frontend** (`/paiements`): existing UI works as-is, calls new live endpoints
- [x] **Subscription auto-activation** on successful payment (via webhook + status check)

## Session 10 (6 May 2026) - Sidebar reorganization + new branding
- [x] **Service Worker bug fix**: app shell (JS/CSS bundles) now uses network-first strategy (was cache-first → caused stale bundle freeze on splash screen). CACHE_NAME bumped to v3, auto-update on every load with controllerchange listener.
- [x] **New AGRICAM IA logo** integrated (camera+leaves+circuit motif): `/branding/agricam-logo.png` (678 KB).
  - Updated: SplashScreen, Sidebar header, Login, Register, LandingPage, manifest.json (192/512), index.html (favicon, apple-touch-icon, theme_color #84cc16).
- [x] **Sidebar reorganized into 6 collapsible groups** (was 25+ flat items):
  - Direct: Dashboard, role-specific dashboard
  - Groups: Analyse & IA / Cultures & Terrain / Flotte autonome / Marketplace & Finance / Formation & Conseil / Administration (admin only)
  - Bottom: Alertes, Paramètres
  - Auto-expand the group containing the active route
  - Group state persisted in localStorage `agricam_nav_groups`
- [x] **Rich tooltip descriptions** on every module + every group (MODULE_DESCRIPTIONS dict, 30+ entries) — guides user on what each feature does.
- [x] **Lime/amber color palette** matching new logo (replaced emerald accents in Layout, Splash, header, footer, hover states, active states).
- [x] Google Play Console developer account ID recorded: 7354790267085214824 (entity: African AI Solutions).
- [x] Splash temporarily disabled (latent re-render bug under investigation — not blocking).
