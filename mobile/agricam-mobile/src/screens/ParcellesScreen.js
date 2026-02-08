// AGRICAM IA Mobile - Parcelles Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, LoadingScreen, Button } from '../components';
import { COLORS, SPACING, FONTS, SHADOWS } from '../constants/theme';
import { getParcels } from '../services/api';

const { width } = Dimensions.get('window');

export default function ParcellesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const fetchParcels = async () => {
    try {
      const response = await getParcels();
      setParcels(response.data);
    } catch (error) {
      console.error('Error fetching parcels:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchParcels();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return COLORS.success;
      case 'bon': return COLORS.secondary;
      case 'attention': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'excellent': return ['#059669', '#10b981'];
      case 'bon': return ['#3b82f6', '#60a5fa'];
      case 'attention': return ['#f59e0b', '#fbbf24'];
      default: return [COLORS.primary, COLORS.primaryLight];
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const renderParcelCard = (parcel) => (
    <TouchableOpacity 
      key={parcel.id}
      style={[styles.parcelCard, viewMode === 'list' && styles.parcelCardList]}
      onPress={() => navigation.navigate('ParcelDetail', { parcel })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getStatusGradient(parcel.status)}
        style={styles.parcelGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.parcelHeader}>
          <Text style={styles.parcelName} numberOfLines={1}>{parcel.name}</Text>
          <Badge 
            text={parcel.status?.toUpperCase()} 
            variant={parcel.status === 'excellent' ? 'success' : parcel.status === 'bon' ? 'info' : 'warning'}
          />
        </View>
        
        <View style={styles.parcelInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="leaf-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.infoText}>{parcel.culture_type || 'Non défini'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="resize-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.infoText}>{parcel.surface_hectares} ha</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.infoText} numberOfLines={1}>{parcel.location || 'Non localisé'}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Ionicons name="water-outline" size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{parcel.humidity || 65}%</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="thermometer-outline" size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.statValue}>{parcel.temperature || 28}°C</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Mes Parcelles</Text>
            <Text style={styles.headerSubtitle}>{parcels.length} parcelles enregistrées</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.viewToggle, viewMode === 'grid' && styles.viewToggleActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid-outline" size={20} color={viewMode === 'grid' ? COLORS.primary : COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list-outline" size={20} color={viewMode === 'list' ? COLORS.primary : COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {parcels.length > 0 ? (
          <View style={[styles.parcelsGrid, viewMode === 'list' && styles.parcelsList]}>
            {parcels.map(renderParcelCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Aucune parcelle</Text>
            <Text style={styles.emptyMessage}>Ajoutez votre première parcelle depuis l'application web</Text>
          </View>
        )}
        
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleActive: {
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  parcelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  parcelsList: {
    flexDirection: 'column',
  },
  parcelCard: {
    width: (width - SPACING.lg * 3) / 2,
    marginBottom: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  parcelCardList: {
    width: '100%',
  },
  parcelGradient: {
    padding: SPACING.md,
    minHeight: 180,
  },
  parcelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  parcelName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
    marginRight: 8,
  },
  parcelInfo: {
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FONTS.sizes.sm,
    marginLeft: 8,
    flex: 1,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: SPACING.sm,
    marginTop: 'auto',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
    paddingHorizontal: SPACING.xl,
  },
});
