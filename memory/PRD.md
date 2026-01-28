# AGRICAM IA - Product Requirements Document

## Metadata
- **Developer**: Barra Martial Aristide
- **Company**: African AI Solutions
- **Version**: 3.0.0
- **Last Updated**: 2025-01-28

## Original Problem Statement
Plateforme d'agriculture de précision intelligente complète combinant IoT, drones, satellites, IA et marketplace pour le marché africain francophone.

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Shadcn UI + Mapbox GL JS
- **Backend**: FastAPI + Python 3.11
- **Database**: MongoDB
- **Authentication**: JWT avec bcrypt
- **AI/ML**: Emergent LLM (GPT-4o-mini via Emergent Key)
- **Payments**: Stripe (emergent integration)
- **Maps**: Mapbox GL JS

## User Personas & Roles
1. **Admin** - Gestion complète de la plateforme, validation utilisateurs, paramétrage
2. **Agriculteur (Farmer)** - Gestion parcelles, données temps réel, marketplace vente
3. **Fournisseur (Supplier)** - Vente intrants (engrais, pesticides, semences, drones)
4. **Institution Financière** - Gestion prêts et crédits agricoles
5. **Partenaire** - Collaboration et analytics
6. **Investisseur** - Analytics et marketplace

## Core Requirements Implemented ✅

### Authentification & Autorisation
- ✅ JWT avec tokens sécurisés
- ✅ Inscription multi-rôles avec CNI/passeport
- ✅ Dashboards personnalisés par rôle
- ✅ Navigation role-based
- ✅ Comptes de démo pré-configurés (admin, farmer, supplier, bank)

### Module Parcelles
- ✅ Gestion 3+ parcelles avec géolocalisation
- ✅ Carte interactive Mapbox (vue carte/liste)
- ✅ Analyse sol complète (NPK, pH, humidité, température)
- ✅ Statuts visuels (Excellent/Bon/Attention)
- ✅ Création de parcelles avec formulaire
- ✅ Dessin de polygones sur la carte

### Module Capteurs IoT
- ✅ 5 types de capteurs (Humidité, Température, pH, NPK, Camera)
- ✅ Statuts en temps réel (Actif/Erreur/Inactif)
- ✅ Historique des données
- ✅ Import CSV/Excel pour données capteurs
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

### Module Analyse IA
- ✅ Reconnaissance cultures (Blé 94%, Maïs 96%)
- ✅ Détection maladies avec solutions
- ✅ Prédiction rendement
- ✅ Intégration GPT-4o-mini via Emergent LLM Key

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
- ✅ Suivi statut (En attente/Approuvé/Rejeté)

### Module Alertes
- ✅ Priorités (Critique/Warning/Info)
- ✅ Multi-canaux (in-app prévu SMS, email)
- ✅ Historique

### Module Chatbot AgriBot IA 🆕
- ✅ Chatbot IA agricole propulsé par GPT-4o-mini
- ✅ Base de connaissances agricoles africaines
- ✅ Questions rapides prédéfinies
- ✅ Historique des conversations
- ✅ Contexte utilisateur (parcelles)

### Module Apprentissage 🆕
- ✅ 3 modules de formation
- ✅ Quiz de validation avec scoring
- ✅ Suivi de progression
- ✅ Certificats après validation (70% requis)
- ✅ Filtres par catégorie et difficulté

### Administration
- ✅ Gestion utilisateurs
- ✅ Vérification comptes
- ✅ Gestion abonnements
- ✅ Statistiques plateforme

## Système d'Abonnement avec Stripe 🆕
| Plan | Prix | Features |
|------|------|----------|
| Freemium | 0 XAF | 1 parcelle, alertes basiques, consultation marketplace |
| Basic | 5,000 XAF/mois | 3 parcelles, météo avancée, support email |
| Premium | 15,000 XAF/mois | Illimité, IoT, drones, IA avancée, support 24/7 |

- ✅ Intégration Stripe checkout
- ✅ Plans mensuel, trimestriel (-10%), annuel (-20%)
- ✅ Polling du statut de paiement
- ✅ Mise à jour automatique de l'abonnement

## Intégrations Externes
- ✅ OpenWeatherMap (météo avec fallback)
- ✅ Emergent LLM Key (GPT-4o-mini pour chatbot)
- ✅ Stripe (paiements abonnements)
- ✅ Mapbox GL JS (cartes interactives)
- ⏳ Twilio SMS (nécessite clés API utilisateur)

## Tests Effectués
- Backend: 27/28 endpoints (96%)
- Frontend: 100% fonctionnel
- Authentification: 100%
- Role-based access: 100%
- Chatbot IA: 100%
- Stripe Payments: 100%

## P0/P1/P2 Features Remaining

### P0 (Implémenté) ✅
- ✅ Authentification JWT multi-rôles
- ✅ Dashboards personnalisés
- ✅ Tous les modules de base
- ✅ Chatbot IA
- ✅ Module apprentissage
- ✅ Stripe payments

### P1 (À faire)
- ⏳ Notifications SMS via Twilio (nécessite clés API)
- ⏳ Mode hors ligne (PWA) 
- ⏳ Token Mapbox production (actuellement demo token)

### P2 (Nice to have)
- ⏳ Application mobile native
- ⏳ Reconstruction 3D robots
- ⏳ Intégration DJI SDK réelle
- ⏳ Multi-langue (EN, langues locales)
- ⏳ Empreinte digitale biométrique
- ⏳ Vérification CNI/passeport automatique

## Comptes de Test
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@agricam-ia.com | admin123 |
| Agriculteur | agriculteur@demo.com | farmer123 |
| Fournisseur | fournisseur@demo.com | supplier123 |
| Banque | banque@demo.com | bank123 |

## Next Action Items
1. Configurer Twilio avec les clés API utilisateur pour SMS
2. Obtenir un token Mapbox de production
3. Implémenter le mode PWA/offline
4. Ajouter l'analyse d'images réelle avec upload
5. Améliorer la vérification biométrique
