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
import { getBooksByCategory } from '../../services/dummyData';
import { useSettings } from '../../context/SettingsContext';
import { useCategories } from '../../context/CategoriesContext';
import apiClient from '../../services/api';

const AllCategoriesScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier, t } = useSettings();
  const { categories: categoriesList, loading: categoriesLoading } = useCategories();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const [categoryBookCounts, setCategoryBookCounts] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch book counts for each category
  useEffect(() => {
    if (!categoriesList || categoriesList.length === 0) return;
    
    const fetchCategoryCounts = async () => {
      try {
        setLoading(true);
        const counts = {};
        
        // Fetch book count for each category
        for (const category of categoriesList) {
          try {
            const response = await apiClient.getBooks({
              category: category.id,
              status: 'published',
              limit: 1,
            });
            // Get total count from pagination if available
            counts[category.id] = response.pagination?.total || response.books?.length || 0;
          } catch (error) {
            console.error(`Error fetching count for category ${category.id}:`, error);
            counts[category.id] = getBooksByCategory(category.id).length;
          }
        }
        
        setCategoryBookCounts(counts);
      } catch (error) {
        console.error('Error fetching category counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, [categoriesList]);

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
      marginBottom: 8,
    },
    categoryCount: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
  });

  const renderCategoryItem = ({ item }) => {
    const bookCount = categoryBookCounts[item.id] !== undefined 
      ? categoryBookCounts[item.id] 
      : getBooksByCategory(item.id).length;
    
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => navigation.navigate('Category', { category: item.name, categoryId: item.id })}
      >
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text style={styles.categoryText}>{item.name}</Text>
        <Text style={styles.categoryCount}>
          {bookCount} {bookCount === 1 ? 'book' : 'books'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('browseCategories') || 'Browse Categories'}
        navigation={navigation}
      />
      {loading || categoriesLoading ? (
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


