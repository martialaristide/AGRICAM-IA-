# AGRICAM IA - Application Mobile

Application mobile native React Native / Expo pour la plateforme d'agriculture de précision AGRICAM IA.

## 🚀 Fonctionnalités

- **Dashboard** - Vue d'ensemble de vos parcelles et alertes
- **Parcelles** - Gestion et visualisation de vos parcelles agricoles
- **Capteurs IoT** - Surveillance en temps réel des capteurs
- **Analyse IA** - Analyse d'images avec intelligence artificielle
- **Profil** - Paramètres et gestion du compte

## 📱 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app sur votre téléphone (pour le développement)

### Développement

```bash
# Installer les dépendances
cd /app/mobile/agricam-mobile
npm install

# Lancer l'application
npx expo start

# Scanner le QR code avec Expo Go (Android) ou Camera (iOS)
```

### Build APK (Android)

```bash
# Build de développement
npx expo run:android

# Build de production (EAS)
npx eas build --platform android --profile production
```

### Build IPA (iOS)

```bash
# Nécessite macOS avec Xcode
npx expo run:ios

# Build de production (EAS)
npx eas build --platform ios --profile production
```

## 🔧 Configuration

L'API backend est configurée dans `/src/constants/theme.js`:

```javascript
export const API_URL = 'https://agri-checkout.preview.emergentagent.com/api';
```

## 📂 Structure

```
agricam-mobile/
├── App.js                    # Point d'entrée
├── app.json                  # Configuration Expo
├── src/
│   ├── components/           # Composants réutilisables
│   │   └── index.js
│   ├── constants/            # Thème et constantes
│   │   └── theme.js
│   ├── navigation/           # Navigation React Navigation
│   │   └── AppNavigator.js
│   ├── screens/              # Écrans de l'application
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── ParcellesScreen.js
│   │   ├── CapteursScreen.js
│   │   ├── AnalyseIAScreen.js
│   │   └── ProfileScreen.js
│   └── services/             # Services API
│       └── api.js
└── assets/                   # Images et icônes
```

## 🎨 Design

- **Couleur principale**: #059669 (Emerald)
- **Fonts**: System fonts (iOS: SF Pro, Android: Roboto)
- **Icons**: @expo/vector-icons (Ionicons)

## 📄 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@agricam-ia.com | admin123 |
| Agriculteur | agriculteur@demo.com | farmer123 |

## 👨‍💻 Développeur

**Barra Martial Aristide**  
African AI Solutions  
© 2024
