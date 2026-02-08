// AGRICAM IA Mobile - Login Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Button } from '../components';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { login } from '../services/api';
import { TextInput } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      if (response.access_token) {
        navigation.replace('Main');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>🌱</Text>
            </View>
            <Text style={styles.appName}>AGRICAM IA</Text>
            <Text style={styles.tagline}>Agriculture de précision intelligente</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Bienvenue</Text>
            <Text style={styles.subtitle}>Connectez-vous pour accéder à vos parcelles</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry
              />
            </View>

            <Button
              title="Se connecter"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            {/* Demo Credentials */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Comptes de démonstration :</Text>
              <Text style={styles.demoText}>Admin: admin@agricam-ia.com / admin123</Text>
              <Text style={styles.demoText}>Farmer: agriculteur@demo.com / farmer123</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Développé par African AI Solutions</Text>
            <Text style={styles.footerText}>© 2024 Barra Martial Aristide</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: '#991b1b',
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  demoSection: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  demoTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  demoText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: FONTS.sizes.xs,
    color: 'rgba(255,255,255,0.6)',
  },
});
