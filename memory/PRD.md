# AGRICAM IA - Product Requirements Document

## Original Problem Statement
Enterprise-grade precision agriculture platform "AGRICAM IA" with AI-powered crop analysis, multi-role dashboards, drone/robot management, and comprehensive farm management tools for African agriculture.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI, dark theme
- **Backend**: FastAPI + MongoDB (motor async), modular routes
- **AI**: Gemini via emergentintegrations with OpenAI failover chain
- **Storage**: Emergent Object Storage (videos, ebooks, images)
- **i18n**: Custom LanguageContext with 21+ languages, per-user persistence

## User Roles (7)
1. **Admin** - Platform management, predictive analytics, user CRM, exports
2. **Farmer (Agriculteur)** - Parcels, blockchain, crop analysis, IoT
3. **Supplier (Fournisseur)** - Demand forecasting, smart logistics, inventory
4. **Bank (Banque)** - AgriScore credit scoring, parametric insurance
5. **Seed Analyst** - Digital twin simulation, genomic analysis
6. **Agronomist** - Epidemiological modeling, intervention planning
7. **Trainer (Formateur)** - Training CRUD, ebook sales, video MP4 upload, verification

## Demo Accounts
- Admin: admin@agricam.ai / Admin@2026
- Farmer: agriculteur@agricam.ai / Farmer@2026
- Supplier: fournisseur@agricam.ai / Supplier@2026
- Bank: banque@agricam.ai / Bank@2026
- Seed Analyst: analyste@agricam.ai / Analyst@2026
- Agronomist: agronome@agricam.ai / Agro@2026
- Trainer: formateur@agricam.ai / Trainer@2026

## Backend Architecture
```
/app/backend/
  core.py              # Shared: db, auth, AI helpers
  storage.py           # NEW: Object storage (put_object, get_object)
  server.py            # Main app + legacy routes
  routes/
    trainer.py         # Trainer CRUD + file uploads (video/ebook)
    payments.py        # Mobile Money payments (JWT fix applied)
    blockchain.py      # Product traceability
    camera_ai.py       # Camera AI analysis
    agriscore.py       # Credit scoring
    digital_twin.py    # Seed simulation
    predictive.py      # Admin analytics
    epidemiology.py    # Disease modeling
    supplier_analytics.py  # Logistics
    management_api.py  # Admin management
```

## Completed Features (All Tested 100%)
### Phase 0 (Previous sessions)
- [x] Multi-role dashboards (7 roles)
- [x] i18n 21+ languages
- [x] AGRICAMIA 2.0: All advanced dashboards
- [x] Camera IA, Blockchain, Satellite, IoT

### Phase 1 (13 Mar 2026)
- [x] Payment bug fix (JWT secret mismatch)
- [x] Payment Success/Failure pages
- [x] Theme customization (4 themes)
- [x] Change password (functional dialog)
- [x] Profile photo + LinkedIn for all users
- [x] Admin Analytics Export (CSV, Excel, PDF, Word)
- [x] Trainer (Formateur) role - dashboard + CRUD
- [x] Geolocation weather alerts
- [x] Per-user language persistence

### Phase 2 (13 Mar 2026)
- [x] Video MP4 upload via object storage
- [x] Ebook file upload with download control
- [x] Trainer file type validation (rejects invalid formats)
- [x] File download/streaming endpoints
- [x] Formations filtered by role on ELearning page
- [x] Landing page multilingual (hero section translatable)

## Known Limitations
- NetWalletPay: Simulated mode in preview (network restriction)
- Camera AI: Graceful fallback when models unavailable

## P1 Tasks Remaining
- [ ] Security dashboard (intrusion detection, user blocking)
- [ ] Database protection
- [ ] WebSocket real-time notifications
- [ ] Real Mobile Money integration

## P2 Backlog
- [ ] Complete server.py refactoring
- [ ] Full landing page multilingual (all sections)
- [ ] SEO optimization
- [ ] Offline camera support
- [ ] Export from all dashboards

## Testing Status
- Iteration 23: Payment flow - 100% pass
- Iteration 24: Trainer + Settings - 100% pass
- Iteration 25: File uploads + Multilingual - 100% pass
