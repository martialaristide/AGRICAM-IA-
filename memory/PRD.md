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

## Recent Changes (Feb 2026)
### Iteration 42 (current)
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
- **P1**: WebSocket real-time notifications
- **P1**: Supplier auto-registration on interactive map
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
