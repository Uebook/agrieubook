/**
 * All Categories Screen - Shows all available categories
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useCategories } from '../../context/CategoriesContext';

const AllCategoriesScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier, t } = useSettings();
  const { categories: categoriesList, loading: categoriesLoading } = useCategories();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    listContent: {
      padding: 16,
    },
    categoryCard: {
      width: '48%',
      backgroundColor: themeColors.background.tertiary || themeColors.background.secondary,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    categoryIcon: {
      fontSize: 48 * fontSizeMultiplier,
      marginBottom: 12,
    },
    categoryText: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      textAlign: 'center',
      marginBottom: 12,
    },
    viewBooksButton: {
      backgroundColor: themeColors.primary.main,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 4,
    },
    viewBooksButtonText: {
      color: themeColors.text.light || '#FFFFFF',
      fontSize: 12 * fontSizeMultiplier,
      fontWeight: '600',
    },
  });

  const renderCategoryItem = ({ item }) => {
    return (
      <View style={styles.categoryCard}>
        <Text style={styles.categoryIcon}>{item.icon || '📚'}</Text>
        <Text style={styles.categoryText}>{item.name}</Text>
        <TouchableOpacity
          style={styles.viewBooksButton}
          onPress={() => navigation.navigate('Category', { category: item.name, categoryId: item.id })}
        >
          <Text style={styles.viewBooksButtonText}>View Books</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('browseCategories') || 'Browse Categories'}
        navigation={navigation}
      />
      {categoriesLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <ActivityIndicator size="large" color={themeColors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={categoriesList}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default AllCategoriesScreen;


