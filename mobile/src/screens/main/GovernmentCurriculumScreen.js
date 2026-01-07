/**
 * Government Curriculum Screen
 * Features: State selection, PDF curriculum display with government Yojana banners
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Header from '../../components/common/Header';
import {
  indianStates,
  governmentCurriculums,
  getCurriculumsByState,
} from '../../services/dummyData'; // Still importing for fallback
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const GovernmentCurriculumScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userRole } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const [selectedState, setSelectedState] = useState(null);
  const [showStateModal, setShowStateModal] = useState(false);
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch curriculums from API
  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📚 GovernmentCurriculumScreen: Fetching curriculums...', { selectedState });
        
        const params = {
          status: 'active', // API now defaults to 'active', but we explicitly pass it
          limit: 100,
        };
        if (selectedState) {
          params.state = selectedState;
          console.log('📚 GovernmentCurriculumScreen: Added state filter:', selectedState);
        }
        
        console.log('📚 GovernmentCurriculumScreen: API params:', params);
        const response = await apiClient.getCurriculums(params);
        console.log('📚 GovernmentCurriculumScreen: API response:', {
          curriculumsCount: response.curriculums?.length || 0,
          total: response.pagination?.total || 0,
        });
        
        setCurriculums(response.curriculums || []);
      } catch (err) {
        console.error('❌ GovernmentCurriculumScreen: Error fetching curriculums:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
        });
        setError('Failed to load curriculum data. Please try again.');
        // Don't fallback to dummy data - show empty state instead
        setCurriculums([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculums();
  }, [selectedState]);

  const handleStateSelect = (stateId) => {
    setSelectedState(stateId);
    setShowStateModal(false);
  };

  const handleViewPDF = useCallback((curriculum) => {
    const pdfUrl = curriculum.pdf_url || curriculum.pdfUrl;
    if (!pdfUrl) {
      Alert.alert('Error', 'PDF not available for this curriculum.');
      return;
    }
    // In real app, open PDF viewer or download PDF
    Alert.alert(
      'Open PDF',
      `Would you like to view or download "${curriculum.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View', onPress: () => {
          // Navigate to PDF viewer or open URL
          console.log('View PDF:', pdfUrl);
          // TODO: Implement PDF viewer navigation
        }},
        { text: 'Download', onPress: () => {
          console.log('Download PDF:', pdfUrl);
          // TODO: Implement PDF download
        }},
      ]
    );
  }, []);

  const renderCurriculumItem = useCallback(({ item }) => {
    const bannerUrl = item.banner_url || item.banner;
    const stateName = item.state_name || item.stateName || item.state;
    const publishedDate = item.published_date || item.publishedDate;
    
    return (
      <TouchableOpacity
        style={styles.curriculumCard}
        onPress={() => handleViewPDF(item)}
      >
        {bannerUrl && (
          <Image
            source={{ uri: bannerUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.curriculumContent}>
          <Text style={styles.curriculumTitle}>{item.title}</Text>
          <View style={styles.curriculumMeta}>
            {stateName && (
              <Text style={styles.stateBadge}>{stateName}</Text>
            )}
            {item.language && (
              <Text style={styles.languageBadge}>{item.language}</Text>
            )}
          </View>
          {item.description && (
            <Text style={styles.curriculumDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.curriculumFooter}>
            {publishedDate && (
              <Text style={styles.publishedDate}>
                Published: {new Date(publishedDate).toLocaleDateString()}
              </Text>
            )}
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleViewPDF(item)}
            >
              <Text style={styles.viewButtonText}>View PDF 📄</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleViewPDF, styles]);

  const renderStateItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.stateItem,
        selectedState === item.id && styles.stateItemActive,
      ]}
      onPress={() => handleStateSelect(item.id)}
    >
      <Text
        style={[
          styles.stateItemText,
          selectedState === item.id && styles.stateItemTextActive,
        ]}
      >
        {item.name}
      </Text>
      {selectedState === item.id && (
        <Text style={styles.stateItemCheck}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    headerSection: {
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 24 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    stateSelector: {
      marginBottom: 24,
    },
    stateSelectorLabel: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 12,
    },
    stateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: themeColors.background.secondary,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    stateButtonText: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.primary,
      fontWeight: '500',
    },
    stateButtonPlaceholder: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    stateButtonIcon: {
      fontSize: 20 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: themeColors.background.primary,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 24 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    stateList: {
      maxHeight: 400,
    },
    stateItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      marginBottom: 8,
    },
    stateItemActive: {
      backgroundColor: themeColors.primary.main,
    },
    stateItemText: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.primary,
    },
    stateItemTextActive: {
      color: themeColors.text.light,
      fontWeight: '600',
    },
    stateItemCheck: {
      fontSize: 20 * fontSizeMultiplier,
      color: themeColors.text.light,
    },
    curriculumCard: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    bannerImage: {
      width: '100%',
      height: 150,
      backgroundColor: themeColors.background.tertiary,
    },
    curriculumContent: {
      padding: 16,
    },
    curriculumTitle: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 8,
    },
    curriculumMeta: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    stateBadge: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.primary.main,
      backgroundColor: themeColors.primary.light || themeColors.background.tertiary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      fontWeight: '600',
    },
    languageBadge: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      backgroundColor: themeColors.background.tertiary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    curriculumDescription: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 12,
      lineHeight: 20 * fontSizeMultiplier,
    },
    curriculumFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    publishedDate: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
    viewButton: {
      backgroundColor: themeColors.primary.main,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    viewButtonText: {
      color: themeColors.text.light,
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      fontSize: 64 * fontSizeMultiplier,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Government Curriculum" navigation={navigation} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Government Schemes & Yojanas</Text>
            <Text style={styles.headerSubtitle}>
              Access official PDFs and guidelines for agricultural schemes
            </Text>
          </View>

          <View style={styles.stateSelector}>
            <Text style={styles.stateSelectorLabel}>Select State</Text>
            <TouchableOpacity
              style={styles.stateButton}
              onPress={() => setShowStateModal(true)}
            >
              <Text
                style={
                  selectedState
                    ? styles.stateButtonText
                    : styles.stateButtonPlaceholder
                }
              >
                {selectedState
                  ? indianStates.find((s) => s.id === selectedState)?.name
                  : 'All States'}
              </Text>
              <Text style={styles.stateButtonIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={themeColors.primary.main} />
              <Text style={[styles.emptySubtext, { marginTop: 10 }]}>Loading curriculum...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⚠️</Text>
              <Text style={styles.emptyText}>Error</Text>
              <Text style={styles.emptySubtext}>{error}</Text>
            </View>
          ) : curriculums.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyText}>No curriculum found</Text>
              <Text style={styles.emptySubtext}>
                {selectedState
                  ? 'No curriculum available for the selected state.'
                  : 'No curriculum available.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={curriculums}
              renderItem={renderCurriculumItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showStateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowStateModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.stateList}>
              <TouchableOpacity
                style={[
                  styles.stateItem,
                  selectedState === null && styles.stateItemActive,
                ]}
                onPress={() => handleStateSelect(null)}
              >
                <Text
                  style={[
                    styles.stateItemText,
                    selectedState === null && styles.stateItemTextActive,
                  ]}
                >
                  All States
                </Text>
                {selectedState === null && (
                  <Text style={styles.stateItemCheck}>✓</Text>
                )}
              </TouchableOpacity>
              {indianStates.map((state) => (
                <TouchableOpacity
                  key={state.id}
                  style={[
                    styles.stateItem,
                    selectedState === state.id && styles.stateItemActive,
                  ]}
                  onPress={() => handleStateSelect(state.id)}
                >
                  <Text
                    style={[
                      styles.stateItemText,
                      selectedState === state.id && styles.stateItemTextActive,
                    ]}
                  >
                    {state.name}
                  </Text>
                  {selectedState === state.id && (
                    <Text style={styles.stateItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GovernmentCurriculumScreen;

