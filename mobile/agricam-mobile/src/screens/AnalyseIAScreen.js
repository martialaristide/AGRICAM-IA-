// AGRICAM IA Mobile - Analyse IA Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Card, Button } from '../components';
import { COLORS, SPACING, FONTS, SHADOWS } from '../constants/theme';
import { uploadImageForAnalysis } from '../services/api';

export default function AnalyseIAScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async (source) => {
    let permissionResult;
    
    if (source === 'camera') {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult.granted) {
      Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la caméra ou à la galerie');
      return;
    }

    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Erreur', 'Veuillez sélectionner une image');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await uploadImageForAnalysis(selectedImage);
      setResult(response.data);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Erreur', 'Échec de l\'analyse. Veuillez réessayer.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getHealthColor = (health) => {
    if (health >= 80) return COLORS.success;
    if (health >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Analyse IA</Text>
            <Text style={styles.headerSubtitle}>Détection maladies et santé cultures</Text>
          </View>
          <View style={styles.aiIcon}>
            <Ionicons name="scan-outline" size={24} color="#8b5cf6" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sélectionner une image</Text>
          
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity 
                style={styles.removeImageBtn}
                onPress={() => { setSelectedImage(null); setResult(null); }}
              >
                <Ionicons name="close-circle" size={28} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => pickImage('camera')}
              >
                <View style={[styles.uploadIcon, { backgroundColor: '#8b5cf620' }]}>
                  <Ionicons name="camera-outline" size={32} color="#8b5cf6" />
                </View>
                <Text style={styles.uploadText}>Prendre une photo</Text>
                <Text style={styles.uploadSubtext}>Utilisez l'appareil photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => pickImage('gallery')}
              >
                <View style={[styles.uploadIcon, { backgroundColor: '#ec489920' }]}>
                  <Ionicons name="images-outline" size={32} color="#ec4899" />
                </View>
                <Text style={styles.uploadText}>Galerie</Text>
                <Text style={styles.uploadSubtext}>Choisir une image</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Analyze Button */}
        {selectedImage && !result && (
          <View style={styles.section}>
            <Button
              title={analyzing ? "Analyse en cours..." : "Analyser avec l'IA"}
              onPress={analyzeImage}
              loading={analyzing}
              icon="sparkles-outline"
              style={styles.analyzeButton}
            />
          </View>
        )}

        {/* Results */}
        {result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résultats de l'analyse</Text>
            
            {/* Health Score */}
            <Card style={styles.resultCard}>
              <View style={styles.healthHeader}>
                <Text style={styles.healthLabel}>Santé de la plante</Text>
                <Text style={[styles.healthScore, { color: getHealthColor(result.health_score || 75) }]}>
                  {result.health_score || 75}%
                </Text>
              </View>
              <View style={styles.healthBar}>
                <View 
                  style={[
                    styles.healthFill, 
                    { 
                      width: `${result.health_score || 75}%`,
                      backgroundColor: getHealthColor(result.health_score || 75)
                    }
                  ]} 
                />
              </View>
            </Card>

            {/* Diagnosis */}
            <Card style={styles.resultCard}>
              <View style={styles.diagnosisHeader}>
                <Ionicons name="medical-outline" size={24} color="#8b5cf6" />
                <Text style={styles.diagnosisTitle}>Diagnostic</Text>
              </View>
              <Text style={styles.diagnosisText}>
                {result.diagnosis || "Plante en bonne santé. Aucune maladie détectée."}
              </Text>
              
              {result.diseases && result.diseases.length > 0 && (
                <View style={styles.diseasesList}>
                  {result.diseases.map((disease, index) => (
                    <View key={index} style={styles.diseaseItem}>
                      <Ionicons name="alert-circle" size={16} color={COLORS.warning} />
                      <Text style={styles.diseaseText}>{disease}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            {/* Recommendations */}
            <Card style={styles.resultCard}>
              <View style={styles.diagnosisHeader}>
                <Ionicons name="bulb-outline" size={24} color={COLORS.warning} />
                <Text style={styles.diagnosisTitle}>Recommandations</Text>
              </View>
              {(result.recommendations || ["Continuer l'irrigation régulière", "Surveiller les feuilles"]).map((rec, index) => (
                <View key={index} style={styles.recItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </Card>

            {/* New Analysis */}
            <Button
              title="Nouvelle analyse"
              onPress={() => { setSelectedImage(null); setResult(null); }}
              variant="outline"
              icon="refresh-outline"
              style={{ marginTop: SPACING.md }}
            />
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
  aiIcon: {
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
  uploadOptions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  uploadOption: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  uploadText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  uploadSubtext: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  selectedImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
  },
  analyzeButton: {
    backgroundColor: '#8b5cf6',
  },
  resultCard: {
    marginBottom: SPACING.md,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  healthLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  healthScore: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
  },
  healthBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    borderRadius: 4,
  },
  diagnosisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  diagnosisTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  diagnosisText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  diseasesList: {
    marginTop: SPACING.md,
  },
  diseaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  diseaseText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    marginLeft: 8,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
});
