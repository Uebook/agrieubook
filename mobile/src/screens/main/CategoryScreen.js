/**
 * Category Screen - Shows books in a specific category
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import Header from '../../components/common/Header';
import { books, categories, getBooksByCategory } from '../../services/dummyData';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const CategoryScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userRole, userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { category, categoryId } = route.params || { category: 'All', categoryId: null };

  // Get category details
  const categoryData = useMemo(() => {
    if (categoryId) {
      return categories.find((cat) => cat.id === categoryId);
    }
    return null;
  }, [categoryId]);

  // Get books for this category
  const categoryBooks = useMemo(() => {
    let filteredBooks;
    if (categoryId) {
      filteredBooks = getBooksByCategory(categoryId);
    } else {
      filteredBooks = books; // Show all books if no categoryId
    }
    
    // If user is an author, show only their own books
    if (userRole === 'author' && userId) {
      filteredBooks = filteredBooks.filter((book) => book.authorId === userId);
    }
    
    return filteredBooks;
  }, [categoryId, userRole, userId]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    categoryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 16,
      backgroundColor: themeColors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    categoryIcon: {
      fontSize: 48 * fontSizeMultiplier,
      marginRight: 16,
    },
    categoryDetails: {
      flex: 1,
    },
    categoryName: {
      fontSize: 20 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    bookCount: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    listContent: {
      padding: 16,
    },
    row: {
      justifyContent: 'space-between',
    },
    bookCard: {
      width: '48%',
      marginBottom: 16,
    },
    bookCover: {
      width: '100%',
      height: 200,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      marginBottom: 8,
    },
    bookInfo: {
      flex: 1,
    },
    bookTitle: {
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    bookAuthor: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 8,
    },
    bookMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rating: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    price: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.primary.main,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
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

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
    >
      <Image
        source={{ uri: item.cover }}
        style={styles.bookCover}
        resizeMode="cover"
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor}>{item.author.name}</Text>
        <View style={styles.bookMeta}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.price}>
            {item.isFree ? 'Free' : `₹${item.price}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title={categoryData ? `${categoryData.name} Books` : `${category} Books`}
        navigation={navigation}
      />

      {/* Category Info */}
      {categoryData && (
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryIcon}>{categoryData.icon}</Text>
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{categoryData.name}</Text>
            <Text style={styles.bookCount}>
              {categoryBooks.length} {categoryBooks.length === 1 ? 'book' : 'books'} available
            </Text>
          </View>
        </View>
      )}

      {/* Books List */}
      {categoryBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>No books found</Text>
          <Text style={styles.emptySubtext}>
            There are no books available in this category yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={categoryBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};


export default CategoryScreen;

