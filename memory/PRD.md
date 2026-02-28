# AGRICAM IA - Product Requirements Document

## Version: 14.1.0 | Date: 2026-02-28

---

## Fondateurs
- **Barra Martial Aristide** - Co-Fondateur & CTO
- **Kenfack Claude Priscy Steffe** - Co-Fondatrice & CEO

## Comptes Test (MIS A JOUR v14.1)
| Role | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@agricam.ai | Admin@2026 |
| Agriculteur | agriculteur@agricam.ai | Farmer@2026 |
| Fournisseur | fournisseur@agricam.ai | Supplier@2026 |
| Banque | banque@agricam.ai | Bank@2026 |

---

## Architecture
```
/app/
├── backend/
│   ├── server.py                       # API FastAPI principale
│   ├── routes/
│   │   ├── advanced_api.py             # AgriBot IA (fixed JSON body)
│   │   └── agremo_api.py              # Analyse Avancee Agremo
│   ├── services/
│   │   ├── agribot_ai_service.py      # Gemini AI
│   │   ├── agremo_analysis_service.py
│   │   ├── weather_service.py
│   │   └── zone_analysis_service.py
│   └── tests/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── AgribotIA.jsx           # ChatGPT-style + budget handling
│       │   ├── CameraIA.jsx            # WebRTC real camera
│       │   ├── DevAnalytics.jsx        # Tour de Controle 6 tabs
│       │   ├── Parcelles.jsx           # Info bubbles + climat + NPK
│       │   ├── AnalyseAvancee.jsx      # Agremo 5 tabs
│       │   ├── Login.jsx               # Demo buttons fixed
│       │   └── Register.jsx            # Multi-step + role selection
│       └── components/
│           └── Layout.jsx              # NotificationBell + LanguageSelector
```

---

## Bugs Corriges v14.1 (2026-02-28)
- **AgriBot predict-yield**: Ajout defaults (country, surface_ha) pour eviter 422
- **AgriBot ecological-advice**: Change Form() -> JSON body (Pydantic model)
- **AgriBot disease-spread**: weather_conditions rendu optionnel
- **AgriBot frontend tools**: Correction noms de champs (disease_name, sensor_data, problem)
- **AgriBot budget**: Gestion gracieuse de l'erreur budget depasse avec message utilisateur
- **Camera IA analyze-frame**: Change Form() -> JSON body pour compatibilite frontend
- **Lead capture modal**: Ne s'affiche plus pour les utilisateurs deja connectes
- **Login demo buttons**: Mis a jour avec les nouveaux identifiants
- **Comptes test**: Nouveaux mots de passe securises (Admin@2026, etc.)

---

## Prochaines Etapes

### P0 - Haute Priorite
1. Refactoring backend server.py en modules separes
2. Integrer traductions t() dans toutes les pages

### P1 - Moyenne Priorite
3. Integration Mobile Money reelle (CinetPay/PayDunya) - attente cles API
4. Integration SMS Twilio
5. Pages parametres fonctionnelles

### P2 - Backlog
6. Publication Google Play
7. Tests automatises complets (pytest)
8. SEO avance
9. Import donnees externes

---

## Elements MOCKED
- Notifications climat: alertes aleatoires
- Sante plateforme DevAnalytics: simulee cote client
- Messages conversion: toast seulement
- Mobile Money + SMS: simulation
- Analyse Agremo: donnees simulees
