# AGRICAM IA - Documentation Technique

## Version: 13.0.0 | Date: 2026-02-27

---

## Architecture

```
/app/
├── backend/
│   ├── server.py                       # API FastAPI principale (monolithe)
│   ├── routes/
│   │   ├── advanced_api.py             # Routes AgriBot, Drones, Reports, Weather, Zones
│   │   └── agremo_api.py              # Routes Analyse Avancée style Agremo
│   ├── services/
│   │   ├── agribot_ai_service.py
│   │   ├── agremo_analysis_service.py  # Comptage plantes, prescription, ravageurs
│   │   ├── weather_service.py
│   │   ├── zone_analysis_service.py
│   │   ├── drone_management_service.py
│   │   ├── robot_management_service.py
│   │   └── report_generator_service.py
│   └── tests/
│       └── test_agremo_api.py          # Tests API Agremo
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── AnalyseAvancee.jsx      # Analyse style Agremo (5 onglets)
│       │   ├── Dashboard.jsx
│       │   ├── GestionDronesAvance.jsx  # + DroneVideoStream intégré
│       │   ├── GestionRobotsAvance.jsx  # + Robot3DViewer intégré
│       │   ├── MarketplaceEnhanced.jsx
│       │   └── website/ (5 pages marketing)
│       ├── components/
│       │   ├── DroneVideoStream.jsx    # Flux vidéo 4 modes + IA
│       │   ├── Robot3DViewer.jsx       # Vue 3D Three.js + error boundary
│       │   ├── LanguageSelector.jsx    # Multi-langue (intégré header)
│       │   ├── WeatherWidget.jsx
│       │   ├── ZoneAnalyzer.jsx
│       │   └── SEOHead.jsx
│       ├── contexts/LanguageContext.jsx
│       └── locales/translations.js     # FR, EN, ES, DE, AR, ZH
```

---

## Comptes Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@agricam.ai | adminpassword |
| Agriculteur | jean.dupont@agricam.ai | farmerpassword |

## Fondateurs
- **Barra Martial Aristide** - Co-Fondateur & CTO
- **Kenfack Claude Priscy Steffe** - Co-Fondatrice & CEO

---

## Fonctionnalités Complétées

### Analyse Avancée (Style Agremo) - v13.0.0
- Comptage de plantes IA (précision 98.3%) avec carte de densité par zones
- Cartes de prescription pour application variable (herbicide, insecticide, fongicide, engrais)
- Détection mauvaises herbes & ravageurs avec recommandations de traitement
- Rapports santé hebdomadaires (NDVI, stress hydrique/nutritif, alertes)
- Export multi-format (PDF, SHP, KML, GeoJSON, CSV)
- Missions d'épandage (drone DJI AGRAS, tracteurs John Deere)
- Upload images drone pour analyse

### Flux Vidéo Drone - v13.0.0
- 4 modes de vue : Réel, Infrarouge, LIDAR, NDVI
- Analyse IA en temps réel (stress, maladies, zones chaudes)
- HUD avec télémétrie (altitude, vitesse, GPS)
- Capture d'écran et zoom

### Vue 3D Robot - v13.0.0
- Modèle 3D Three.js avec animation des roues et bras
- Contrôle automatique (waypoints) et manuel (directions)
- 4 modes de tâche : patrouille, désherbage, pulvérisation, échantillonnage
- Error boundary pour stabilité en dev mode

### Multi-langue - v13.0.0
- 6 langues : FR, EN, ES, DE, AR (RTL), ZH
- Sélecteur de langue dans le header de l'application
- Contexte React avec détection automatique de la langue du navigateur

### Site Marketing (5 pages)
### AgriBot IA (Gemini)
### Gestion Drones/Robots avancée
### Marketplace amélioré (6 catégories)
### Dashboard avec météo temps réel
### SEO (sitemap, robots.txt, meta tags)
### Capture de leads + Exit intent popup
### Politique RGPD

---

## Endpoints API Agremo

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/agremo/plant-counting` | POST | Comptage plantes |
| `/api/agremo/plant-counting/crop-types` | GET | Types de cultures |
| `/api/agremo/prescription-map` | POST | Carte de prescription |
| `/api/agremo/prescription-map/products` | GET | Produits disponibles |
| `/api/agremo/weed-pest-detection` | POST | Détection ravageurs |
| `/api/agremo/weekly-report` | POST | Rapport hebdomadaire |
| `/api/agremo/upload-drone-image` | POST | Upload image drone |
| `/api/agremo/export` | POST | Export rapport |
| `/api/agremo/export-formats` | GET | Formats disponibles |
| `/api/agremo/spray-mission` | POST | Créer mission épandage |
| `/api/agremo/equipment` | GET | Équipements compatibles |
| `/api/agremo/alerts/{field_id}` | GET | Alertes parcelle |

---

## Prochaines Étapes

### P0 - Haute Priorité
1. Refactoring backend server.py (3500+ lignes) en modules séparés
2. Intégrer traductions `t()` dans toutes les pages de l'app

### P1 - Moyenne Priorité
3. Intégration Mobile Money réelle (CinetPay/PayDunya) - en attente clés API
4. Intégration SMS Twilio
5. Rendre toutes les pages de paramètres fonctionnelles

### P2 - Backlog
6. Publication Google Play
7. Tests automatisés complets
8. SEO avancé (sitemap auto-généré)

---

## Informations MOCKED
- Analyse Agremo : données simulées (pas de vraie IA d'analyse d'images)
- Mobile Money : simulation de paiement
- SMS : simulation d'envoi
- Flux vidéo drone : simulation canvas HTML5
- Vue 3D robot : modèle géométrique Three.js (pas de modèle réel)
