# AGRICAM IA - Product Requirements Document

## Original Problem Statement
Enterprise-grade precision agriculture platform "AGRICAM IA" with AI-powered crop analysis, multi-role dashboards, drone/robot management, and comprehensive farm management tools.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI, dark theme
- **Backend**: FastAPI + MongoDB (motor async)
- **AI**: Gemini via emergentintegrations with OpenAI failover
- **i18n**: Custom LanguageContext with 20+ languages (FR, EN, ES, DE, AR, ZH, African languages)

## User Roles
1. **Admin** - Full platform management, analytics, user CRM
2. **Farmer (Agriculteur)** - Parcel management, crop analysis, IoT monitoring
3. **Supplier (Fournisseur)** - Supply chain, inventory, orders
4. **Bank (Banque)** - Financial services, credit scoring, loans
5. **Seed Analyst** - Seed quality analysis, genomic modeling
6. **Agronomist** - Expert diagnostics, AR analysis, epidemiology

## Key Features Implemented
- Multi-role dashboards with dark futuristic theme
- 14-day freemium trial system
- AI-powered crop analysis (Camera IA module with 5 modes)
- Satellite zone capture and AI analysis
- Farmer onboarding wizard with guided assistant
- Language switching (20+ languages, FR default)
- IoT sensor management, drone/robot control
- AGRI GENIUS chatbot with conversation history
- Marketplace, E-Learning modules
- Auto irrigation management
- Payment integration (NetWalletPay - backend ready, blocked by network)

## Demo Accounts
- Admin: admin@agricam.ai / Admin@2026
- Farmer: agriculteur@agricam.ai / Farmer@2026
- Supplier: fournisseur@agricam.ai / Supplier@2026
- Bank: banque@agricam.ai / Bank@2026
- Seed Analyst: analyste@agricam.ai / Analyst@2026
- Agronomist: agronome@agricam.ai / Agronomist@2026

## API Endpoints
- Auth: /api/auth/login, /api/auth/register
- Camera: /api/camera/analyze, /api/camera/scans, /api/camera/satellite-analyze
- Parcels: /api/parcels (CRUD)
- Dashboard: /api/dashboard/stats
- User: /api/user/update-profile
- Chatbot: /api/chatbot/message
- Payments: /api/payments/netwalletpay/*

## P0 Features (Completed)
- [x] i18n translation bug fixed - full app language switching works
- [x] App reload/redirect bug fixed (401 interceptor + splash screen)
- [x] Intelligent Camera module with AI failover (Gemini → OpenAI)
- [x] Satellite zone capture and AI analysis
- [x] Farmer onboarding wizard with zone definition and assistant

## P1 Features (Upcoming)
- [ ] AGRICAMIA 2.0 advanced AI features for all dashboards
- [ ] Functional backend logic for predictive analytics
- [ ] Digital twin simulation for Seed Analyst
- [ ] AR diagnostics for Agronomist
- [ ] Dynamic AgriScore credit scoring for Bank

## P2 Features (Backlog)
- [ ] Backend server.py monolith refactoring
- [ ] Real Mobile Money integration (CinetPay/PayDunya)
- [ ] Twilio SMS integration
- [ ] SEO optimization with react-helmet-async
- [ ] Offline camera analysis support
