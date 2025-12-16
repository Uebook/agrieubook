/**
 * Search Screen with auto-suggestions and search results
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Header from '../../components/common/Header';
import { searchBooks, books, categories } from '../../services/dummyData';
import { useSettings } from '../../context/SettingsContext';

const SearchScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { query: initialQuery } = route.params || {};
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [recentSearches, setRecentSearches] = useState([]);

  // Popular suggestions based on categories
  const suggestions = useMemo(() => {
    return categories.slice(0, 6).map((cat) => cat.name);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length === 0) {
      return [];
    }
    return searchBooks(searchQuery);
  }, [searchQuery]);

  // Popular books to show when no search query
  const popularBooks = useMemo(() => {
    return books.slice(0, 6);
  }, []);

  // Handle search
  const handleSearch = (query) => {
    if (query.trim().length > 0) {
      // Add to recent searches
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item !== query);
        return [query, ...filtered].slice(0, 5);
      });
    }
  };

  // Auto-search when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    searchContainer: {
      padding: 16,
      paddingBottom: 12,
    },
    searchInput: {
      backgroundColor: themeColors.input.background,
      borderWidth: 1,
      borderColor: themeColors.input.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.input.text,
    },
    suggestionsScroll: {
      flex: 1,
    },
    section: {
      padding: 16,
      paddingTop: 8,
    },
    sectionTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 12,
    },
    suggestionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    suggestionChip: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    suggestionChipText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: '500',
    },
    recentSearchesContainer: {
      gap: 8,
    },
    recentSearchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    recentSearchIcon: {
      fontSize: 16 * fontSizeMultiplier,
      marginRight: 12,
    },
    recentSearchText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.primary,
      flex: 1,
    },
    resultsHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    resultsCount: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: '500',
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

  const renderSuggestionChip = (suggestion) => (
    <TouchableOpacity
      key={suggestion}
      style={styles.suggestionChip}
      onPress={() => setSearchQuery(suggestion)}
    >
      <Text style={styles.suggestionChipText}>{suggestion}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Search Books" navigation={navigation} />
      
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books, authors, topics..."
          placeholderTextColor={themeColors.input.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          autoFocus
        />
      </View>

      {/* Search Results or Suggestions */}
      {searchQuery.trim().length > 0 ? (
        // Show Search Results
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
            </Text>
          </View>
          {searchResults.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>
                Try searching with different keywords
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderBookItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        // Show Suggestions and Popular Books
        <ScrollView
          style={styles.suggestionsScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <View style={styles.recentSearchesContainer}>
                {recentSearches.map((search) => (
                  <TouchableOpacity
                    key={search}
                    style={styles.recentSearchItem}
                    onPress={() => setSearchQuery(search)}
                  >
                    <Text style={styles.recentSearchIcon}>🕐</Text>
                    <Text style={styles.recentSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Popular Suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <View style={styles.suggestionsGrid}>
              {suggestions.map(renderSuggestionChip)}
            </View>
          </View>

          {/* Popular Books */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Books</Text>
            <FlatList
              data={popularBooks}
              renderItem={renderBookItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default SearchScreen;

