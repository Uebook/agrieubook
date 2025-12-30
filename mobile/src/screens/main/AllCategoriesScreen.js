/**
 * All Categories Screen - Shows all available categories
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Header from '../../components/common/Header';
import { categories, getBooksByCategory } from '../../services/dummyData';
import { useSettings } from '../../context/SettingsContext';

const AllCategoriesScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier, t } = useSettings();
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
      marginBottom: 8,
    },
    categoryCount: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
  });

  const renderCategoryItem = ({ item }) => {
    const bookCount = getBooksByCategory(item.id).length;
    
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
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AllCategoriesScreen;


