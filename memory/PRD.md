# AGRICAM IA - Product Requirements Document

## Metadata
- **Developer**: Barra Martial Aristide
- **Company**: African AI Solutions
- **Version**: 3.0.0
- **Last Updated**: 2025-02-08

## Original Problem Statement
Plateforme d'agriculture de précision intelligente complète combinant IoT, drones, satellites, IA et marketplace pour le marché africain francophone.

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Shadcn UI + Leaflet (cartes)
- **Backend**: FastAPI + Python 3.11
- **Database**: MongoDB (persistent)
- **Authentication**: JWT avec bcrypt
- **AI/ML**: Emergent LLM (GPT-5.2, Gemini)
- **Maps**: Leaflet + OpenStreetMap/ESRI Satellite

## User Personas & Roles
1. **Admin** - Gestion complète de la plateforme, validation utilisateurs, paramétrage
2. **Agriculteur (Farmer)** - Gestion parcelles, données temps réel, marketplace vente
3. **Fournisseur (Supplier)** - Vente intrants (engrais, pesticides, semences, drones)
4. **Institution Financière** - Gestion prêts et crédits agricoles
5. **Partenaire** - Collaboration et analytics
6. **Investisseur** - Analytics et marketplace

## Completed Features ✅

### Phase 1 - Fondations (2025-02-08)
- ✅ **Cartes Satellite Interactives** - Leaflet avec tuiles ESRI World Imagery
- ✅ **Géolocalisation Parcelles** - Marqueurs colorés selon statut (Excellent=vert, Bon=bleu, Attention=jaune)
- ✅ **Import Coordonnées GPS** - Saisie manuelle ou import depuis fichier
- ✅ **Tooltips Interactifs** - Info-bulles sur tous les boutons et actions
- ✅ **Branding African AI Solutions** - Logo et crédits développeur
- ✅ **Badge Emergent Retiré** - Aucune mention Emergent visible

### Module Authentification
- ✅ JWT avec tokens sécurisés
- ✅ Inscription multi-rôles
- ✅ Dashboards personnalisés par rôle
- ✅ Navigation role-based
- ✅ Comptes de démo pré-configurés

### Module Parcelles
- ✅ Gestion parcelles avec géolocalisation
- ✅ Carte satellite interactive (Leaflet)
- ✅ Analyse sol complète (NPK, pH, humidité, température)
- ✅ Statuts visuels (Excellent/Bon/Attention)
- ✅ Import/Export CSV des parcelles
- ✅ Création de parcelles avec coordonnées GPS

### Module Capteurs IoT
- ✅ 5 types de capteurs (Humidité, Température, pH, NPK, Camera)
- ✅ Statuts en temps réel (Actif/Erreur/Inactif)
- ✅ Historique des données
- ✅ Export CSV

### Module Drones
- ✅ Planification missions de vol
- ✅ Contrôle (Démarrer/Pause/Arrêter/Compléter)
- ✅ Suivi progression
- ✅ Conditions météo intégrées

### Module Images Satellites
- ✅ Analyse NDVI
- ✅ Zones de stress
- ✅ Sources drone/satellite

### Module Irrigation
- ✅ Systèmes automatisés
- ✅ Zones d'irrigation
- ✅ Contrôles (Pause/Arrêter)
- ✅ Efficacité %

### Module Recommandations IA
- ✅ Priorités (URGENT/ÉLEVÉE/MOYENNE)
- ✅ Actions (Appliquer/Reporter/Ignorer)
- ✅ Source IA identifiée

### Module Marketplace
- ✅ Produits avec certifications (Bio, Premium, HVE)
- ✅ Onglets (Vente/Acheteurs/Producteurs)
- ✅ Commandes et transactions
- ✅ Filtres de recherche

### Module Financier
- ✅ Demandes de prêts
- ✅ Validation par institutions
- ✅ Suivi statut

### Administration
- ✅ Gestion utilisateurs
- ✅ Vérification comptes
- ✅ Gestion abonnements
- ✅ Statistiques plateforme

## Système d'Abonnement
| Plan | Prix | Features |
|------|------|----------|
| Freemium | 0 XAF | 1 parcelle, alertes basiques, consultation marketplace |
| Basic | 5,000 XAF/mois | 3 parcelles, météo avancée, support email |
| Premium | 15,000 XAF/mois | Illimité, IoT, drones, IA avancée, support 24/7 |

## Intégrations Externes
- ✅ OpenWeatherMap (météo avec fallback)
- ✅ Emergent LLM Key (GPT-5.2, Gemini)
- ✅ Leaflet + ESRI (cartes satellite)
- ⏳ Stripe (paiements)
- ⏳ Twilio (SMS)

## P0/P1/P2 Features Remaining

### P0 (À faire)
- ⏳ Configuration WiFi des capteurs
- ⏳ Analyse d'images IA fonctionnelle (upload + analyse)
- ⏳ Analyse vidéo IA

### P1 (Important)
- ⏳ Intégration paiement Stripe
- ⏳ Notifications SMS (Twilio ou simulation)
- ⏳ Système d'irrigation intelligent avec détection défaillances
- ⏳ Agent IA pour recommandations automatiques
- ⏳ Recherche globale dans marketplace

### P2 (Futur)
- ⏳ Mode hors ligne (PWA)
- ⏳ Langues camerounaises (Fulbe, Bassa, Ewondo, etc.)
- ⏳ Entrée/sortie vocale
- ⏳ Contrôle robot avec reconstruction 3D
- ⏳ Module e-learning complet
- ⏳ Plateforme analytics développeur (style Google Analytics)
- ⏳ Prédiction rendements avec graphiques

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agricam-ia.com | admin123 |
| Agriculteur | agriculteur@demo.com | farmer123 |
| Fournisseur | fournisseur@demo.com | supplier123 |
| Banque | banque@demo.com | bank123 |

## Next Action Items
1. Phase 2: Configuration WiFi capteurs, association capteur-parcelle
2. Phase 3: Analyse IA images/vidéos fonctionnelle avec diagrammes
3. Phase 4: Irrigation intelligente avec IA
4. Phase 5: Alertes SMS et recommandations automatiques
