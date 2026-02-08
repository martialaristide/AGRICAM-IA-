// AGRICAM IA Mobile - Profile/Settings Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, ListItem } from '../components';
import { COLORS, SPACING, FONTS, SHADOWS } from '../constants/theme';
import { getUser, logout } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return { label: 'Administrateur', color: '#8b5cf6' };
      case 'farmer': return { label: 'Agriculteur', color: COLORS.primary };
      default: return { label: role, color: COLORS.textSecondary };
    }
  };

  const menuItems = [
    {
      title: 'Mon exploitation',
      icon: 'business-outline',
      iconColor: COLORS.primary,
      onPress: () => {},
    },
    {
      title: 'Abonnement',
      icon: 'card-outline',
      iconColor: '#f59e0b',
      onPress: () => {},
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline',
      iconColor: '#ec4899',
      rightComponent: (
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ true: COLORS.primary }}
          thumbColor={COLORS.white}
        />
      ),
    },
    {
      title: 'Langue',
      icon: 'language-outline',
      iconColor: '#3b82f6',
      subtitle: 'Français',
      onPress: () => {},
    },
    {
      title: 'Aide & Support',
      icon: 'help-circle-outline',
      iconColor: '#22c55e',
      onPress: () => {},
    },
    {
      title: 'Conditions d\'utilisation',
      icon: 'document-text-outline',
      iconColor: COLORS.textSecondary,
      onPress: () => {},
    },
    {
      title: 'Politique de confidentialité',
      icon: 'shield-checkmark-outline',
      iconColor: COLORS.textSecondary,
      onPress: () => {},
    },
  ];

  const roleInfo = user?.role ? getRoleBadge(user.role) : { label: '', color: COLORS.textSecondary };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + '30' }]}>
            <Text style={[styles.roleText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <View style={styles.section}>
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Parcelles</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Capteurs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Analyses</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              iconColor={item.iconColor}
              onPress={item.onPress}
              rightComponent={item.rightComponent}
            />
          ))}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>AGRICAM IA</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCredit}>Développé par African AI Solutions</Text>
          <Text style={styles.appCredit}>© 2024 Barra Martial Aristide</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userEmail: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: SPACING.sm,
  },
  roleText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsCard: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
    ...SHADOWS.small,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  appName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  appVersion: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  appCredit: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
