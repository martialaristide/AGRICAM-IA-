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

## P0 Remaining
- [ ] Admin Security Dashboard (intrusion detection, monitoring)
- [ ] Presentation Mode (guided tour)
- [ ] Supplier self-registration

## P1 Backlog
- [ ] WebSocket notifications
- [ ] Refactor server.py (>4600 lines)

## Testing
- Iteration 30-31: i18n, docs, translations - 100% PASS
- Iteration 32: Seed analysis module, dropdowns, AGRI GENIUS - 100% PASS (Backend 9/9)
- Session 8: Trainer upload fix verified via curl (video + ebook + download) - ALL PASS
