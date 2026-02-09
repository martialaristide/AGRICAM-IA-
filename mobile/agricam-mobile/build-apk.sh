#!/bin/bash
# ============================================
# AGRICAM IA - Script de Build APK
# ============================================
# Développé par Barra Martial Aristide
# African AI Solutions © 2024
# ============================================

echo "🌱 AGRICAM IA - Build APK Android"
echo "=================================="

# Vérifier si EAS CLI est installé
if ! command -v eas &> /dev/null; then
    echo "📦 Installation de EAS CLI..."
    npm install -g eas-cli
fi

# Se connecter à Expo (si pas déjà connecté)
echo ""
echo "📱 Connexion à Expo..."
echo "Si vous n'avez pas de compte, créez-en un sur https://expo.dev"
eas login

# Vérifier la connexion
eas whoami

# Lancer le build
echo ""
echo "🔨 Lancement du build APK..."
echo "Cela peut prendre 15-20 minutes..."
eas build --platform android --profile preview

echo ""
echo "✅ Build terminé!"
echo "📥 Téléchargez l'APK depuis le lien fourni ci-dessus"
