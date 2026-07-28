# 📱 GUIDE — Générer l'APK Android (et l'app iOS) d'AGRICAM IA

Ce guide est destiné à la personne disposant du **compte développeur Google** qui va
compiler et publier l'application sur le Play Store.

L'application est déjà **pré-configurée avec Capacitor** (`capacitor.config.json` dans `/frontend`).

---

## ✅ Prérequis sur l'ordinateur local

1. **Node.js 20+** et **Yarn** : https://nodejs.org
2. **Android Studio** (avec SDK Android 34+) : https://developer.android.com/studio
3. **Java JDK 17** (installé avec Android Studio)
4. Le code source du projet (télécharger via « Save to GitHub » depuis Emergent, puis `git clone`)

---

## 🚀 Étape 1 — Préparer le projet

```bash
cd frontend
yarn install --ignore-engines
```

## 🔗 Étape 2 — Pointer vers le backend de PRODUCTION

Ouvrir `frontend/.env` et vérifier que `REACT_APP_BACKEND_URL` pointe vers
l'URL **déployée** (production) de l'application, par exemple :

```
REACT_APP_BACKEND_URL=https://VOTRE-APP.emergent.host
```

⚠️ Ne PAS utiliser l'URL de preview (`.preview.emergentagent.com`) — elle s'endort.

## 🏗️ Étape 3 — Construire le build web

```bash
yarn build
```

## 🤖 Étape 4 — Ajouter la plateforme Android et synchroniser

```bash
npx cap add android      # une seule fois (crée le dossier android/)
npx cap sync android     # à refaire après chaque yarn build
```

## 📦 Étape 5 — Générer l'APK / AAB dans Android Studio

```bash
npx cap open android
```

Dans Android Studio :
1. Attendre la fin de la synchronisation Gradle
2. **Pour tester** : Menu `Build > Build Bundle(s)/APK(s) > Build APK(s)` → APK dans `android/app/build/outputs/apk/debug/`
3. **Pour le Play Store** : Menu `Build > Generate Signed Bundle/APK` → choisir **Android App Bundle (.aab)**
   - Créer une clé de signature (keystore) — **LA CONSERVER PRÉCIEUSEMENT** (obligatoire pour toutes les mises à jour futures)
   - Le fichier `.aab` est celui à téléverser sur la Play Console

## 🏪 Étape 6 — Publier sur le Play Store

1. Aller sur https://play.google.com/console
2. « Créer une application » → nom : **AGRICAM IA**
3. Téléverser le `.aab` dans « Production » (ou « Test interne » d'abord — recommandé pour les 200 fermiers)
4. Remplir : description, captures d'écran (téléphone + tablette), icône 512×512, bannière 1024×500
5. Politique de confidentialité : utiliser l'URL `https://VOTRE-APP.emergent.host/politique-confidentialite`
6. Questionnaire de sécurité des données + classification du contenu
7. Soumettre pour examen (24-72h en général)

**Astuce campagne 200 fermiers** : utilisez la piste « Test interne/fermé » du Play Store
pour distribuer l'APK instantanément par lien, sans attendre la validation complète.

---

## 🍎 iOS (App Store) — nécessite un Mac + compte Apple Developer (99$/an)

```bash
npx cap add ios
npx cap sync ios
npx cap open ios      # ouvre Xcode
```

Dans Xcode : configurer la Team de signature → `Product > Archive` → distribuer via App Store Connect.

---

## 🔄 Mises à jour futures

À chaque modification du code web :
```bash
yarn build && npx cap sync android
```
puis régénérer le bundle signé dans Android Studio avec **le même keystore**.

## ℹ️ Informations de l'application

| Champ | Valeur |
|---|---|
| App ID | `com.africanaisolutions.agricam` |
| Nom | AGRICAM IA |
| Contact | +237 652 686 424 |
| Adresse | Yaoundé, Fouda — face Hôtel Mansel |
| Éditeur | African AI Solutions |

## 🌐 Alternative sans APK : la PWA

L'application est déjà une **PWA installable** : sur Android (Chrome), un fermier peut ouvrir
l'URL de production → menu ⋮ → « Ajouter à l'écran d'accueil ». L'app s'installe comme une
application native (icône, plein écran, hors-ligne partiel). C'est la solution la plus rapide
en attendant la validation Play Store.
