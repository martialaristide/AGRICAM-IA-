# AGRICAM IA — Product Requirements Document

## Original Problem Statement
A multi-tier precision agriculture SaaS platform for the African market. Pre-pitch demo for investors, ministers and experts requires polished UI, full responsive layout, proper theming (light/dark), localized error messages for NetWalletPay (MTN/Orange Mobile Money), and complete translations across new modular features.

## User
- Primary language: **French** (FR)
- Has a major investor/minister pitch presentation imminent
- Budget-constrained: requested 15-credit cap for this iteration

## Core Modules
- AGRI GENIUS (Gemini voice AI assistant)
- DJI Drone telemetry & simulation
- Seed Analysis (AI-powered)
- Admin Analytics Dashboard (Recharts)
- Modular SaaS Licensing (free / premium_farmer / cooperative / enterprise)
- Support Ticketing System
- Marketplace V2 (with confirmation dialog flow)
- Mobile Money Payments (NetWalletPay live)

## Architecture
- Frontend: React 19 + Tailwind + shadcn/ui
- Backend: FastAPI (async) + MongoDB (Motor)
- Routes split: `/app/backend/routes/{licensing,support,marketplace_v2,payments,drone_manager}.py`
- i18n: 21 languages with FR/EN as primary, auto-fallback to FR

## Recent Changes (2026)
### Iteration 46 (June 2026 — current)
- 🌍 **Multilingual WhatsApp alerts**: fr/pidgin/fulfulde — `WA_L10N` frame + `WA_CATALOG` (titles/actions translated), user pref `alert_language` via GET/POST /api/elevage/settings, language selector in Alerts tab. Verified: pidgin 'ALARM QUICK QUICK', fulfulde 'TINNDINOL'
- ⏱️ **Continuous camera monitoring**: background asyncio loop (starts on router startup), GET/POST /api/elevage/cameras/monitoring {enabled, interval_minutes 2-120}, parallel scan (Semaphore 4, 25s timeout/cam), auto alerts, last_run/last_result stored. Verified loop ran autonomously. Currently DISABLED (demo camera is fictive)
- 🐖 **YOLO porcins pipeline**: dataset collection POST /api/elevage/vision/dataset (+stats), photos in /app/backend/dataset/{species}/, custom model auto-load from /app/backend/models/agricam_livestock.pt or YOLO_CUSTOM_MODEL env, pig/goat class mapping added, training guide /app/GUIDE_YOLO_PORCINS.md (Roboflow + Colab)
- 🔧 Hardening (from test report): 25s timeout on manual camera detect (504), parallel bounded auto-scan
- ✅ **TESTED by testing_agent (iteration_41.json): 100% backend (30/30), 100% frontend** — YOLO real detection, VitaBif ingest+auth, epidemiology, multilingual, monitoring, dataset, mobile
- Backlog noted from report: dataset photos on container disk (consider object storage for scale), shadcn Select for language selector (cosmetic)

### Iteration 45
- 🎥 **Real camera system (20+ per farm)**: `routes/elevage_vision.py` — camera CRUD (RTSP/HTTP IP cameras), `POST /cameras/{id}/detect` grabs a real frame (OpenCV) and runs **YOLOv8n** (ultralytics, torch CPU installed); `POST /vision/detect-frame` for photo upload tests. Real detections verified E2E (3 persons + bus on real photo, annotated image returned). Person detected → automatic security alert. Gemini fallback if YOLO down. Note: pigs not in COCO → Gemini fallback / fine-tuned model roadmap
- 📡 **VitaBif collars (real ingestion, per user's technical dossier)**: `POST /farms/{id}/gateway` generates gateway API key + payload doc; `POST /vitabif/ingest` (X-Gateway-Key auth) receives real LoRa gateway packets: heart rate (MAX30102), body temp (DS18B20), activity MPU6050 (marche/rumination/immobilité/boiterie), ultrasonic virtual fence (inside/near_limit/outside), water/feed probe (pH/turbidity/conductivity/humidity). Per-species thresholds → auto alerts (tested: 6 anomalies → 6 WhatsApp alerts; bad key → 401)
- 🦠 **Regional epidemiology network**: `POST /epidemiology/scan` — ≥3 farms same species+symptom in 7 days → anonymized alert 'transmise_aux_autorites' (MINEPIA/PATNUC). Verified with 3-farm cluster. UI section in Coopérative tab (scan button + alert cards)
- 🗂️ **Two-module sidebar**: new group « AGRICAM IA ÉLEVAGE » (Mon Élevage + Caméras & Détection YOLO via ?tab=cameras) alongside existing AGRICAM IA groups
- ⚠️ Incident fixed: disk-full during torch install truncated server.py end + duplicated a router include — repaired (syntax OK). Torch CPU-only now installed (nvidia libs removed)
- Nouveau tab « Caméras » : ajout caméra (nom/URL RTSP/type), détection YOLO par caméra, test photo, dialogue clé passerelle VitaBif

### Iteration 44
- 📲 **WhatsApp Business ready-to-plug**: `_send_whatsapp()` in elevage.py supports Meta Cloud API (WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID) & Twilio (TWILIO_ACCOUNT_SID/AUTH_TOKEN/WHATSAPP_FROM) via env; automatic fallback to SIMULATION when keys absent. `GET /api/elevage/whatsapp/config` + frontend banner shows mode. Alerts carry `whatsapp_status` (envoyé/simulé)
- 🛰️ **GPS Collars + Geofencing map**: `GET /api/elevage/farms/{id}/collars` (simulated LoRaWAN collars, 300m geofence, auto 'evasion' alert), new tab « Carte GPS » (`ElevageMap.jsx`, react-leaflet, red markers outside fence)
- 🏢 **Cooperative multi-farm dashboard**: `GET /api/elevage/cooperative/dashboard` (aggregated farms/members/species/health/alerts), new tab « Coopérative » (`CooperativeView.jsx`)
- ✅ **TESTED by testing_agent (iteration_40.json): 100% backend (7/7 pytest), 100% frontend (all 8 tabs, mobile 390x844 no overflow, regressions /dashboard & /marketplace OK)**

### Iteration 43
- 🐄 **NEW MODULE: AgriCam Élevage IA** (additive, per spec doc) — namespace `/api/elevage/`
  - Backend `/app/backend/routes/elevage.py`: seed/census (4 filières: bovins/porcins/ovins/volailles), farms, animals (fiches + carnet sanitaire + weight history), dashboard aggregates, simulated camera scan + env sensors (temp/NH₃/CO₂/water/feed), health & security event simulation, WhatsApp alert previews (channel=whatsapp_sim, ready for real WhatsApp Business API), feed recommendations (marketplace-linked), price predictions (seasonal), Gemini Vision animal photo diagnosis (`POST /api/elevage/diagnose`)
  - Frontend: `/elevage` route, "Mon Élevage" sidebar tab (admin/farmer/agronomist), page `MonElevage.jsx` + 6 components in `components/elevage/` (Cheptel, Animaux, Alertes+WhatsApp preview, Environnement, Diagnostic IA, Économie)
  - Feature flag: `ELEVAGE_IA_ENABLED` (env, default true)
  - Collections: `elevage_farms`, `elevage_animals`, `elevage_health_events`, `elevage_security_events`, `elevage_env_readings`, `elevage_alerts`, `elevage_feed_recommendations`
  - ✅ Tested: all endpoints via curl E2E (seed 519 animals, scan, env, simulate, price, feed, alerts), Gemini diagnose pipeline OK, UI verified via screenshots (overview + alerts/WhatsApp)
- 📞 **Contact info updated everywhere**: +237 652 686 424, Yaoundé Fouda face Hôtel Mansel (ContactPage, PrivacyPolicy, WebsiteFooter, SEOHead)
- 📱 **Capacitor configured** for native APK/iOS: `@capacitor/core|android|ios|cli` installed, `frontend/capacitor.config.json` (appId `com.africanaisolutions.agricam`), `viewport-fit=cover`, full French build guide at `/app/GUIDE_APK.md` for the friend with the Google Dev account
- WHATSAPP ALERTS ARE SIMULATED (in-app preview) — real WhatsApp Business API keys needed to go live

### Iteration 42
- 🚨 **CRITICAL BUG FIX**: AGRI GENIUS page rendered blank — fixed missing `voiceGender` / `availableVoices` state declarations in `AgribotIA.jsx`
- 🎬 **Demo Tour Mode**: Created `/app/frontend/src/components/DemoTour.jsx` — auto-piloted 4-step pitch overlay (Voice AI → Drone → Seed → Marketplace), 30s/step, navigation auto, controls (prev/pause/next), minimizable. Launched via "🎬 Mode Demo" button in header (admin only).
- ✅ Verified: AGRI GENIUS renders fully, voice M/F toggle visible, Demo Tour launches and shows "Etape 1/4 AGRI GENIUS"

### Iteration 41
- Fixed `tml>` HTML overflow at page load (rogue text in `index.html`)
- Dashboard mobile responsive (tabs scroll, padding p-4 sm:p-6, text-xs sm:text-sm)
- Voice gender toggle ♀/♂ in AGRI GENIUS with persistence (localStorage)
- More human voice tuning: rate 0.88, pitch 0.92/1.05 by gender, prefer premium FR voices (Amélie, Thomas, Google FR, Microsoft)
- Auto-detect African voices when available (CM, SN, MA, TN, DZ)

### Iteration 40
- ✅ Added `licensing`, `support`, `marketplaceV2` translation keys to FR + EN (21-lang fallback to FR)
- ✅ Refactored `Licensing.jsx` and `SupportCenter.jsx` to use `useLanguage().t()` for all visible labels
- ✅ Improved mobile responsiveness: `max-w-full overflow-x-hidden`, `sm:` breakpoints for headings/grids, `flex-wrap` on metadata rows
- ✅ Fixed NetWalletPay error surface: frontend now displays backend `detail` message (validation regex matches MTN 650-654/670-689 & Orange 655-659/690-699)
- ✅ Verified light/dark theme CSS coherence: `[data-theme="light"]` overrides + `:root:not([data-theme="light"])` dark overrides remain comprehensive
- ✅ Test credentials documented at `/app/memory/test_credentials.md`

### Previous (handoff)
- Sidebar grouped into logical modules with dropdowns
- Custom AGRICAM IA logo (lime/yellow scheme) integrated
- 577 demo users / 873 parcels / 1753 sensors seeded
- PWA service worker cache bug fixed
- Recharts analytics dashboard at `/admin-analytics`
- Marketing flyer / pitch deck prompts generated
- Licensing/Support/Marketplace V2 modular routes added
- NetWalletPay live integration + webhooks

## Pending / Backlog
- **P1**: User provides WhatsApp keys (Meta or Twilio) → real sending activates automatically (code ready, no dev needed). Farmers' `phone` field on user doc is used as recipient
- **P1**: WebSocket real-time notifications
- **P1**: Supplier auto-registration on interactive map
- **P2**: Élevage: epidemiology regional alerts, genetic lineage tracking
- **P1**: AdminSupport.jsx & MarketplaceEnhanced.jsx hardcoded FR text → use `t()` (low impact since FR is default)
- **P1**: PurchaseConfirmDialog.jsx → use `t()` for translations
- **P2**: Seed Analysis radar/visual comparison mode
- **P2**: Refactor `/app/backend/server.py` (4700+ lines) into modular routers
- **P2**: Architectural guide for real DJI drone / robot hardware integration

## Known Issues
- NetWalletPay **sandbox** returns "A general error occurred" for some test numbers — upstream behavior, frontend surfaces it cleanly. Production keys + real phone needed for full E2E test.
- GuidedTour z-index occasionally blocks clicks on dashboard (partial fix applied earlier).

## Tech Stack Versions
- React 19, FastAPI latest, MongoDB via Motor
- emergentintegrations (Gemini AI)
- Recharts, lucide-react, sonner

## Critical Files
- `/app/frontend/src/locales/translations.js` (1759+ lines, 21 langs)
- `/app/frontend/src/contexts/LanguageContext.jsx` (t() with FR fallback)
- `/app/frontend/src/index.css` (theme CSS overrides — comprehensive)
- `/app/frontend/src/pages/Licensing.jsx`, `SupportCenter.jsx`, `MobileMoneyPayment.jsx`
- `/app/backend/routes/payments.py` (NetWalletPay validation + webhook)
- `/app/backend/routes/{licensing,support,marketplace_v2}.py`
