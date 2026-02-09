# 📱 Guide de Build et Publication - AGRICAM IA

## 🔨 Build APK Android

### Prérequis
1. Compte Expo gratuit : https://expo.dev/signup
2. Node.js 18+ installé

### Étapes de Build

```bash
# 1. Aller dans le dossier mobile
cd /app/mobile/agricam-mobile

# 2. Se connecter à Expo
npx eas login
# Entrez votre email et mot de passe Expo

# 3. Lancer le build APK
npx eas build --platform android --profile preview

# 4. Attendre ~15-20 minutes
# 5. Télécharger l'APK depuis le lien fourni
```

### Build de Production (pour Google Play)
```bash
npx eas build --platform android --profile production
```

---

## 📤 Publication Google Play Store

### Prérequis
- Compte Google Play Developer ($25 une fois)
- https://play.google.com/console

### Étapes
1. **Créer l'application** dans la Console Google Play
2. **Configurer les informations** :
   - Nom : AGRICAM IA
   - Description courte : Agriculture de précision intelligente
   - Catégorie : Productivité / Agriculture
3. **Ajouter les captures d'écran** (min 2)
4. **Uploader l'APK/AAB**
5. **Soumettre pour révision** (1-3 jours)

---

## 🍎 Publication App Store (iOS)

### Prérequis
- Compte Apple Developer ($99/an)
- Mac avec Xcode
- https://developer.apple.com

### Étapes
```bash
# Build iOS (sur Mac uniquement)
npx eas build --platform ios --profile production
```

1. **Créer l'app** dans App Store Connect
2. **Configurer les métadonnées**
3. **Uploader via Transporter** ou EAS Submit
4. **Soumettre pour révision** (1-7 jours)

---

## 🔑 Configuration Mobile Money

### Ajouter vos clés dans `/app/backend/.env` :

```env
# CinetPay (https://cinetpay.com)
CINETPAY_API_KEY=votre_api_key
CINETPAY_SITE_ID=votre_site_id
CINETPAY_SECRET_KEY=votre_secret_key

# OU PayDunya (https://paydunya.com)
PAYDUNYA_MASTER_KEY=votre_master_key
PAYDUNYA_PRIVATE_KEY=votre_private_key
PAYDUNYA_TOKEN=votre_token
```

### Redémarrer le backend après modification :
```bash
sudo supervisorctl restart backend
```

---

## 📞 Support

Pour toute question :
- **Expo** : https://docs.expo.dev
- **Google Play** : https://support.google.com/googleplay/android-developer
- **App Store** : https://developer.apple.com/support

---

**© 2024 African AI Solutions - Barra Martial Aristide**
