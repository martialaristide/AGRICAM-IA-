# AGRICAM IA - Product Requirements Document

## Version: 14.2.0 | Date: 2026-02-28

---

## Fondateurs
- **Barra Martial Aristide** - Co-Fondateur & CTO
- **Kenfack Claude Priscy Steffe** - Co-Fondatrice & CEO

## Comptes Test
| Role | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@agricam.ai | Admin@2026 |
| Agriculteur | agriculteur@agricam.ai | Farmer@2026 |
| Fournisseur | fournisseur@agricam.ai | Supplier@2026 |
| Banque | banque@agricam.ai | Bank@2026 |

---

## Fonctionnalites Completees

### v14.2 - OpenWeatherMap Live + Corrections
- **Notifications climat REELLES** via OpenWeatherMap (plus simulees)
  - Alertes intelligentes basees sur temperature, humidite, vent, pluie
  - Previsions 24h avec probabilite de pluie
  - GPS des parcelles utilise pour localisation precise
- **Meteo parcelles en temps reel** : selection d'une parcelle affiche LIVE weather + conseils agricoles (irrigation, pulverisation)
- **Route meteo corrigee** : /weather/current (GPS) et /weather/city/{name} sans conflit
- **Camera IA** : endpoint corrige (Form -> JSON), page fonctionnelle
- **AgriBot IA** : 4 endpoints corriges (defaults, JSON body, budget handling)
- **Lead capture modal** : ne bloque plus les utilisateurs connectes (double verif + interval)

### v14.0-14.1 - UI/UX Overhaul
- AgriBot IA style ChatGPT, Camera IA WebRTC, DevAnalytics Tour de Controle
- 4 comptes test multi-roles, notification bell, info bubbles parcelles

### v13.0 - Analyse Avancee Agremo
- 12 endpoints API, page 5 onglets, DroneVideoStream, Robot3DViewer

### Versions anterieures
- Site marketing, Dashboard meteo, Marketplace, Gestion drones/robots, SEO, RGPD

---

## APIs REELLES (plus simulees)
- OpenWeatherMap : meteo en temps reel + previsions + alertes climat
- Gemini AI : AgriBot IA chat, predictions, analyses sol, conseils

## Elements MOCKED
- Camera IA : analyse de frames simulee
- DevAnalytics : sante plateforme simulee cote client
- Mobile Money / SMS : simulation
- Analyse Agremo : donnees simulees

---

## Prochaines Etapes

### P0
1. Refactoring backend server.py en modules
2. Traductions t() dans toutes les pages

### P1
3. Integration Mobile Money reelle
4. Integration SMS Twilio
5. Pages parametres fonctionnelles

### P2
6. Publication Google Play
7. Tests pytest complets
8. Import donnees externes
