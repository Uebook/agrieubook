/**
 * Book Store / Marketplace Screen
 * Features: Search, Filters, Sorting, Book listings
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useCategories } from '../../context/CategoriesContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const BookStoreScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userRole, userId } = useAuth();
  const { categories: categoriesList } = useCategories();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [filters, setFilters] = useState({
    category: null,
    author: null,
    priceMin: '',
    priceMax: '',
    rating: null,
    language: null,
  });
  const [allBooks, setAllBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch authors from API
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await apiClient.getAuthors({ limit: 100 });
        setAuthors(response.authors || []);
      } catch (error) {
        console.error('Error fetching authors:', error);
        setAuthors([]);
      }
    };
    fetchAuthors();
  }, []);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const params = {
          status: 'published',
          limit: 100,
          ...(filters.category && { category: filters.category }),
          ...(filters.author && { author: filters.author }),
          ...(filters.language && { language: filters.language }),
          ...(searchQuery && { search: searchQuery }),
        };
        const response = await apiClient.getBooks(params);
        setAllBooks(response.books || []);
      } catch (error) {
        console.error('Error fetching books:', error);
        setAllBooks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, [searchQuery, filters.category, filters.author, filters.language]);

  const books = useMemo(() => {
    let filtered = allBooks;
    
    // If user is an author, show only their own books
    if (userRole === 'author' && userId) {
      filtered = filtered.filter((book) => book.author_id === userId);
    }
    
    // Apply search filter (if not already filtered by API)
    if (searchQuery && !searchQuery.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price filters
    if (filters.priceMin && filters.priceMin.trim() !== '') {
      filtered = filtered.filter((book) => (book.price || 0) >= parseFloat(filters.priceMin));
    }
    if (filters.priceMax && filters.priceMax.trim() !== '') {
      filtered = filtered.filter((book) => (book.price || 0) <= parseFloat(filters.priceMax));
    }
    
    // Apply sorting
    if (sortBy === 'price_low') {
      filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_high') {
      filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'latest') {
      filtered = [...filtered].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    
    return filtered;
  }, [searchQuery, sortBy, filters, userRole, userId, allBooks]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.author) count++;
    if (filters.priceMin && filters.priceMin.trim() !== '') count++;
    if (filters.priceMax && filters.priceMax.trim() !== '') count++;
    if (filters.rating) count++;
    if (filters.language) count++;
    return count;
  }, [filters]);

  const sortOptions = [
    { label: 'Popularity', value: 'popularity' },
    { label: 'Latest', value: 'latest' },
    { label: 'Price: Low to High', value: 'price_low' },
    { label: 'Price: High to Low', value: 'price_high' },
    { label: 'Sort by Views', value: 'views' },
  ];

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  // Create styles with theme colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    searchContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      backgroundColor: themeColors.input.background,
      borderWidth: 1,
      borderColor: themeColors.input.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.input.text,
    },
    filterButton: {
      backgroundColor: themeColors.primary.main,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      justifyContent: 'center',
    },
    filterButtonText: {
      color: themeColors.button.text,
      fontWeight: '600',
      fontSize: 14 * fontSizeMultiplier,
    },
    sortSection: {
      backgroundColor: themeColors.background.primary,
      paddingVertical: 8,
    },
    sortContainer: {
      maxHeight: 50,
    },
    sortContent: {
      paddingHorizontal: 16,
    },
    sortChip: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    sortChipActive: {
      backgroundColor: themeColors.primary.main,
      borderColor: themeColors.primary.main,
    },
    sortChipText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    sortChipTextActive: {
      color: themeColors.text.light,
      fontWeight: '600',
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
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalOverlayTouchable: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
      backgroundColor: themeColors.background.primary,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '85%',
      minHeight: '60%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    modalHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: themeColors.border?.light || '#E0E0E0',
      borderRadius: 2,
      position: 'absolute',
      top: -12,
      left: '50%',
      marginLeft: -20,
    },
    modalTitle: {
      fontSize: 20 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
    },
    filterBadge: {
      backgroundColor: themeColors.primary.main,
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    filterBadgeText: {
      color: themeColors.text.light,
      fontSize: 12 * fontSizeMultiplier,
      fontWeight: 'bold',
    },
    modalClose: {
      fontSize: 24 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: 'bold',
    },
    filterContent: {
      padding: 20,
      paddingTop: 16,
    },
    filterSection: {
      marginBottom: 24,
    },
    filterLabel: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 12,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.background.secondary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 8,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    filterChipActive: {
      backgroundColor: themeColors.primary.main,
      borderColor: themeColors.primary.main,
    },
    filterChipIcon: {
      fontSize: 16 * fontSizeMultiplier,
      marginRight: 6,
    },
    filterChipText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: '500',
    },
    filterChipTextActive: {
      color: themeColors.text.light,
      fontWeight: '600',
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    priceInput: {
      flex: 1,
      backgroundColor: themeColors.input.background,
      borderWidth: 1,
      borderColor: themeColors.input.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.input.text,
    },
    priceSeparator: {
      fontSize: 18 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    ratingRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    ratingChip: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    ratingChipActive: {
      backgroundColor: themeColors.primary.main,
      borderColor: themeColors.primary.main,
    },
    ratingChipText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: '500',
    },
    ratingChipTextActive: {
      color: themeColors.text.light,
      fontWeight: '600',
    },
    languageRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
      marginBottom: 20,
    },
    resetButton: {
      flex: 1,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    resetButtonText: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.primary,
      fontWeight: '600',
    },
    applyButton: {
      flex: 1,
      backgroundColor: themeColors.button.primary,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.button.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
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

  const renderBookItem = ({ item }) => {
    const coverUrl = item.cover_image_url || item.cover || 'https://via.placeholder.com/200';
    const authorName = item.author?.name || item.author_name || 'Unknown Author';
    const price = item.is_free ? 'Free' : `₹${item.price || 0}`;
    
    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
      >
        <Image
          source={{ uri: coverUrl }}
          style={styles.bookCover}
          resizeMode="cover"
        />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.bookAuthor}>{authorName}</Text>
          <View style={styles.bookMeta}>
            <Text style={styles.rating}>⭐ {item.rating || '0.0'}</Text>
            <Text style={styles.price}>{price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books..."
          placeholderTextColor={themeColors.input.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => navigation.navigate('Search', { query: searchQuery })}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>
            Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.sortSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortContainer}
          contentContainerStyle={styles.sortContent}
        >
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortChip,
                sortBy === option.value && styles.sortChipActive,
              ]}
              onPress={() => handleSortChange(option.value)}
            >
              <Text
                style={[
                  styles.sortChipText,
                  sortBy === option.value && styles.sortChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Modal - Bottom Sheet */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowFilters(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Filters</Text>
                {activeFiltersCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.filterContent}
              showsVerticalScrollIndicator={true}
            >
              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      !filters.category && styles.filterChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, category: null })}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        !filters.category && styles.filterChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {(categoriesList || []).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.filterChip,
                        filters.category === cat.id && styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, category: cat.id })
                      }
                    >
                      <Text style={styles.filterChipIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.category === cat.id &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Author Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Author</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      !filters.author && styles.filterChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, author: null })}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        !filters.author && styles.filterChipTextActive,
                      ]}
                    >
                      All Authors
                    </Text>
                  </TouchableOpacity>
                  {authors.map((author) => (
                    <TouchableOpacity
                      key={author.id}
                      style={[
                        styles.filterChip,
                        filters.author === author.id && styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setFilters({ ...filters, author: author.id })
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.author === author.id &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {author.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Price Range</Text>
                <View style={styles.priceRow}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min"
                    placeholderTextColor={themeColors.input.placeholder}
                    value={filters.priceMin}
                    onChangeText={(value) =>
                      setFilters({ ...filters, priceMin: value })
                    }
                    keyboardType="numeric"
                  />
                  <Text style={styles.priceSeparator}>-</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max"
                    placeholderTextColor={themeColors.input.placeholder}
                    value={filters.priceMax}
                    onChangeText={(value) =>
                      setFilters({ ...filters, priceMax: value })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Rating Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Minimum Rating</Text>
                <View style={styles.ratingRow}>
                  {[4, 3, 2, 1].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingChip,
                        filters.rating === rating && styles.ratingChipActive,
                      ]}
                      onPress={() =>
                        setFilters({
                          ...filters,
                          rating: filters.rating === rating ? null : rating,
                        })
                      }
                    >
                      <Text style={styles.ratingChipText}>
                        {rating}+ ⭐
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[
                      styles.ratingChip,
                      !filters.rating && styles.ratingChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, rating: null })}
                  >
                    <Text
                      style={[
                        styles.ratingChipText,
                        !filters.rating && styles.ratingChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Language Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Language</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      !filters.language && styles.filterChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, language: null })}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        !filters.language && styles.filterChipTextActive,
                      ]}
                    >
                      All Languages
                    </Text>
                  </TouchableOpacity>
                  {['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu'].map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      style={[
                        styles.filterChip,
                        filters.language === lang && styles.filterChipActive,
                      ]}
                      onPress={() =>
                        setFilters({
                          ...filters,
                          language: filters.language === lang ? null : lang,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.language === lang &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {lang}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Action Buttons */}
              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setFilters({
                      category: null,
                      author: null,
                      priceMin: '',
                      priceMax: '',
                      rating: null,
                      language: null,
                    });
                  }}
                >
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Books List */}
      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No books found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your filters or search query
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            loading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={themeColors.primary.main} />
              </View>
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: themeColors.text.secondary }}>No books found</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

export default BookStoreScreen;

