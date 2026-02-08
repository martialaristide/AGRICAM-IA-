// AGRICAM IA Mobile - Capteurs IoT Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, LoadingScreen, StatCard } from '../components';
import { COLORS, SPACING, FONTS, SHADOWS } from '../constants/theme';
import { getSensors, getSensorsStats } from '../services/api';

export default function CapteursScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sensors, setSensors] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    try {
      const [sensorsRes, statsRes] = await Promise.all([
        getSensors(),
        getSensorsStats()
      ]);
      setSensors(sensorsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching sensors:', error);
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

  const getSensorIcon = (type) => {
    switch (type) {
      case 'humidity': return 'water-outline';
      case 'temperature': return 'thermometer-outline';
      case 'ph': return 'flask-outline';
      case 'npk': return 'leaf-outline';
      case 'camera': return 'camera-outline';
      default: return 'hardware-chip-outline';
    }
  };

  const getSensorColor = (type) => {
    switch (type) {
      case 'humidity': return '#0ea5e9';
      case 'temperature': return '#f59e0b';
      case 'ph': return '#8b5cf6';
      case 'npk': return '#22c55e';
      case 'camera': return '#ec4899';
      default: return COLORS.primary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'actif': return COLORS.success;
      case 'inactif': return COLORS.textSecondary;
      case 'erreur': return COLORS.danger;
      default: return COLORS.textSecondary;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#db2777', '#ec4899']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Capteurs IoT</Text>
            <Text style={styles.headerSubtitle}>{sensors.length} capteurs configurés</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#ec4899" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ec4899']} />
        }
      >
        {/* Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <StatCard
                title="Total"
                value={stats.total || sensors.length}
                icon="hardware-chip-outline"
                color="#ec4899"
              />
              <StatCard
                title="Actifs"
                value={stats.active || sensors.filter(s => s.status === 'actif').length}
                icon="checkmark-circle-outline"
                color={COLORS.success}
              />
              <StatCard
                title="Inactifs"
                value={stats.inactive || sensors.filter(s => s.status === 'inactif').length}
                icon="pause-circle-outline"
                color={COLORS.textSecondary}
              />
              <StatCard
                title="Erreurs"
                value={stats.error || sensors.filter(s => s.status === 'erreur').length}
                icon="alert-circle-outline"
                color={COLORS.danger}
              />
            </ScrollView>
          </View>
        )}

        {/* Sensors List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tous les capteurs</Text>
          
          {sensors.length > 0 ? (
            sensors.map((sensor, index) => (
              <TouchableOpacity 
                key={sensor.id || index}
                style={styles.sensorCard}
                activeOpacity={0.8}
              >
                <View style={[styles.sensorIcon, { backgroundColor: getSensorColor(sensor.type) + '20' }]}>
                  <Ionicons name={getSensorIcon(sensor.type)} size={24} color={getSensorColor(sensor.type)} />
                </View>
                
                <View style={styles.sensorInfo}>
                  <View style={styles.sensorHeader}>
                    <Text style={styles.sensorName}>{sensor.name}</Text>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(sensor.status) }]} />
                  </View>
                  <Text style={styles.sensorType}>{sensor.type} • {sensor.parcel_name || 'Non assigné'}</Text>
                  
                  <View style={styles.sensorStats}>
                    <View style={styles.sensorStat}>
                      <Ionicons name="pulse-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.sensorStatValue}>
                        {sensor.last_value || '--'} {sensor.unit || ''}
                      </Text>
                    </View>
                    <View style={styles.sensorStat}>
                      <Ionicons name="battery-half-outline" size={14} color={
                        sensor.battery_level > 50 ? COLORS.success : 
                        sensor.battery_level > 20 ? COLORS.warning : COLORS.danger
                      } />
                      <Text style={styles.sensorStatValue}>{sensor.battery_level || 0}%</Text>
                    </View>
                    {sensor.wifi_connected && (
                      <View style={styles.sensorStat}>
                        <Ionicons name="wifi-outline" size={14} color={COLORS.success} />
                      </View>
                    )}
                  </View>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="hardware-chip-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Aucun capteur</Text>
              <Text style={styles.emptyMessage}>Configurez vos premiers capteurs IoT</Text>
            </View>
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
    paddingBottom: 20,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sensorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  sensorIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sensorName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sensorType: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  sensorStats: {
    flexDirection: 'row',
    gap: 12,
  },
  sensorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sensorStatValue: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyMessage: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
