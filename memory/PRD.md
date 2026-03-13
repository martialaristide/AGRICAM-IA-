# AGRICAM IA - Product Requirements Document

## Original Problem Statement
Enterprise-grade precision agriculture platform "AGRICAM IA" with AI-powered crop analysis, multi-role dashboards, drone/robot management, and comprehensive farm management tools for African agriculture.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI, dark theme
- **Backend**: FastAPI + MongoDB (motor async), modular routes
- **AI**: Gemini via emergentintegrations with OpenAI failover chain
- **i18n**: Custom LanguageContext with 20+ languages (FR, EN, ES, DE, AR, ZH, African languages)

## User Roles (6)
1. **Admin** - Platform management, predictive analytics, user CRM, A/B tests
2. **Farmer (Agriculteur)** - Parcels, blockchain traceability, crop analysis, IoT
3. **Supplier (Fournisseur)** - Demand forecasting, smart logistics, inventory, revenue
4. **Bank (Banque)** - AgriScore credit scoring, parametric insurance, risk zones
5. **Seed Analyst** - Digital twin simulation, genomic analysis, seed batch certification
6. **Agronomist** - Epidemiological modeling, intervention planning, carbon tracking

## Backend Architecture (Refactored)
```
/app/backend/
  core.py              # Shared: db, auth, AI helpers, model failover
  server.py            # Main app + legacy routes (auth, parcels, etc.)
  routes/
    agriscore.py       # AgriScore credit scoring (Bank)
    digital_twin.py    # Digital twin simulation (Seed Analyst)
    predictive.py      # Platform analytics (Admin)
    blockchain.py      # Product traceability (Farmer)
    epidemiology.py    # Disease modeling (Agronomist)
    supplier_analytics.py  # Demand & logistics (Supplier)
    management_api.py  # Admin management
    payments.py        # NetWalletPay integration
```

## AGRICAMIA 2.0 API Endpoints (New)
- `/api/predictive/platform-health`, `/api/predictive/growth-forecast`, `/api/predictive/security-alerts`, `/api/predictive/ai-insights`
- `/api/agriscore/scores`, `/api/agriscore/compute`, `/api/agriscore/risk-zones`, `/api/agriscore/insurance-simulate`
- `/api/digital-twin/simulations`, `/api/digital-twin/simulate`, `/api/digital-twin/genomic-analysis`, `/api/digital-twin/seed-batches`
- `/api/blockchain/products`, `/api/blockchain/trace`, `/api/blockchain/trace/{batch_id}`, `/api/blockchain/verify/{qr_code}`
- `/api/epidemiology/alerts`, `/api/epidemiology/predict-spread`, `/api/epidemiology/intervention-plan`, `/api/epidemiology/carbon-tracking`
- `/api/supplier-analytics/demand-forecast`, `/api/supplier-analytics/logistics-optimization`, `/api/supplier-analytics/inventory-alerts`, `/api/supplier-analytics/revenue-analytics`

## Demo Accounts
- Admin: admin@agricam.ai / Admin@2026
- Farmer: agriculteur@agricam.ai / Farmer@2026
- Supplier: fournisseur@agricam.ai / Supplier@2026
- Bank: banque@agricam.ai / Bank@2026
- Seed Analyst: analyste@agricam.ai / Analyst@2026
- Agronomist: agronome@agricam.ai / Agronomist@2026

## Completed Features
- [x] Multi-role dashboards (6 roles) with dark futuristic theme
- [x] i18n translation system - 20+ languages with automatic fallback
- [x] App reload/redirect bug fixed (401 interceptor + splash screen)
- [x] Intelligent Camera module with AI analysis (5 modes) + failover
- [x] Satellite zone capture and AI analysis
- [x] Farmer onboarding wizard with guided assistant
- [x] 14-day freemium trial system
- [x] **AGRICAMIA 2.0**: Predictive analytics (Admin)
- [x] **AGRICAMIA 2.0**: AgriScore dynamic credit scoring (Bank) with AI
- [x] **AGRICAMIA 2.0**: Digital twin simulation & genomic analysis (Seed Analyst) with AI
- [x] **AGRICAMIA 2.0**: Epidemiological modeling & intervention planning (Agronomist) with AI
- [x] **AGRICAMIA 2.0**: Blockchain traceability (Farmer)
- [x] **AGRICAMIA 2.0**: Smart logistics & demand forecasting (Supplier)
- [x] Backend refactoring: core.py module + 6 new modular route files
- [x] AI Insights generation for Admin dashboard
- [x] Parametric insurance simulation for Bank
- [x] Carbon tracking for Agronomist

## P2 Features (Backlog)
- [ ] Complete migration of legacy routes from server.py to modular files
- [ ] Real Mobile Money integration (CinetPay/PayDunya)
- [ ] Twilio SMS integration
- [ ] NetWalletPay - functional once network allows
- [ ] SEO optimization with react-helmet-async
- [ ] Offline camera analysis support
- [ ] Real-time WebSocket notifications
- [ ] Export PDF/CSV reports from dashboards

## Testing Status
- Iteration 21: 16 backend tests, 100% pass
- Iteration 22: 25 backend tests + 5 frontend dashboards, 100% pass
