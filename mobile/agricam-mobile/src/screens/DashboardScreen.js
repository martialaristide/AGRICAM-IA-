// AGRICAM IA Mobile - Dashboard Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, StatCard, ListItem, LoadingScreen, Badge } from '../components';
import { COLORS, SPACING, FONTS, SHADOWS } from '../constants/theme';
import { getDashboardStats, getParcels, getAlerts, getUser } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [user, setUser] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, parcelsRes, alertsRes, userData] = await Promise.all([
        getDashboardStats(),
        getParcels(),
        getAlerts(),
        getUser()
      ]);
      
      setStats(statsRes.data);
      setParcels(parcelsRes.data.slice(0, 3));
      setAlerts(alertsRes.data.slice(0, 5));
      setUser(userData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Bonjour, {user?.full_name || 'Agriculteur'} 👋</Text>
            <Text style={styles.headerSubtitle}>Bienvenue sur AGRICAM IA</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => navigation.navigate('Alerts')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            {alerts.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{alerts.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <StatCard
              title="Parcelles"
              value={stats?.total_parcels || 0}
              icon="leaf-outline"
              color={COLORS.primary}
            />
            <StatCard
              title="Capteurs"
              value={stats?.total_sensors || 0}
              icon="wifi-outline"
              color={COLORS.secondary}
            />
            <StatCard
              title="Alertes"
              value={stats?.total_alerts || 0}
              icon="alert-circle-outline"
              color={COLORS.warning}
            />
            <StatCard
              title="Analyses"
              value={stats?.total_recommendations || 0}
              icon="analytics-outline"
              color="#8b5cf6"
            />
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Parcelles')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <Ionicons name="map-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Parcelles</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Capteurs')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#ec489920' }]}>
                <Ionicons name="hardware-chip-outline" size={24} color="#ec4899" />
              </View>
              <Text style={styles.actionText}>Capteurs</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('AnalyseIA')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#8b5cf620' }]}>
                <Ionicons name="scan-outline" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.actionText}>Analyse IA</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Irrigation')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#0ea5e920' }]}>
                <Ionicons name="water-outline" size={24} color="#0ea5e9" />
              </View>
              <Text style={styles.actionText}>Irrigation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Parcels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes parcelles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Parcelles')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {parcels.length > 0 ? (
            parcels.map((parcel, index) => (
              <ListItem
                key={parcel.id || index}
                title={parcel.name}
                subtitle={`${parcel.culture_type} • ${parcel.surface_hectares} ha`}
                icon="leaf"
                iconColor={
                  parcel.status === 'excellent' ? COLORS.success :
                  parcel.status === 'bon' ? COLORS.secondary :
                  COLORS.warning
                }
                rightComponent={
                  <Badge 
                    text={parcel.status?.toUpperCase()} 
                    variant={
                      parcel.status === 'excellent' ? 'success' :
                      parcel.status === 'bon' ? 'info' : 'warning'
                    }
                  />
                }
                onPress={() => navigation.navigate('ParcelDetail', { parcel })}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucune parcelle enregistrée</Text>
            </Card>
          )}
        </View>

        {/* Recent Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alertes récentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {alerts.length > 0 ? (
            alerts.slice(0, 3).map((alert, index) => (
              <ListItem
                key={alert.id || index}
                title={alert.title}
                subtitle={alert.message?.substring(0, 50) + '...'}
                icon={
                  alert.priority === 'critique' ? 'warning' :
                  alert.priority === 'warning' ? 'alert-circle' : 'information-circle'
                }
                iconColor={
                  alert.priority === 'critique' ? COLORS.danger :
                  alert.priority === 'warning' ? COLORS.warning : COLORS.secondary
                }
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={32} color={COLORS.success} />
              <Text style={styles.emptyText}>Aucune alerte active</Text>
            </Card>
          )}
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
    paddingBottom: 24,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...SHADOWS.small,
  },
  actionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});
