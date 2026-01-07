/**
 * Library / My Books Screen
 * Features: Purchased books, Download for offline, Reading history
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
// Removed dummy data import - using API only
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const LibraryScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userRole, userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'downloaded', 'recent'
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's library from API
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        
        // If user is author, fetch their own books
        if (userRole === 'author' && userId) {
          const response = await apiClient.getBooks({
            author: userId,
            status: 'published',
            limit: 100,
          });
          setMyBooks(response.books || []);
        } else if (userId) {
          // For readers, fetch purchased books from orders API
          console.log('📚 Fetching library for user:', {
            userId,
            userRole,
            userIdType: typeof userId,
            userIdLength: userId?.length,
          });
          
          const ordersResponse = await apiClient.getOrders(userId, { limit: 100 });
          console.log('📦 Orders API response:', {
            hasOrders: !!ordersResponse.orders,
            ordersCount: ordersResponse.orders?.length || 0,
            pagination: ordersResponse.pagination,
          });
          
          const orders = ordersResponse.orders || [];
          
          // Extract unique books from orders
          const purchasedBooks = [];
          const bookIds = new Set();
          
          orders.forEach((order) => {
            if (order.books && order.books.length > 0) {
              order.books.forEach((book) => {
                if (!bookIds.has(book.id)) {
                  bookIds.add(book.id);
                  // Add reading progress and other metadata
                  purchasedBooks.push({
                    id: book.id,
                    title: book.title,
                    cover_image_url: book.cover || book.cover_image_url || 'https://via.placeholder.com/200',
                    cover: book.cover || book.cover_image_url || 'https://via.placeholder.com/200',
                    author: {
                      name: book.author?.name || 'Unknown Author',
                    },
                    author_name: book.author?.name || 'Unknown Author',
                    author_id: book.author?.id,
                    readingProgress: 0, // TODO: Fetch from reading_progress table if exists
                    lastRead: order.date ? new Date(order.date).toLocaleDateString() : 'Recently',
                    isDownloaded: false, // TODO: Track downloaded status
                    purchasedAt: order.date,
                    price: book.price,
                    isFree: book.isFree || false,
                  });
                }
              });
            }
          });
          
          setMyBooks(purchasedBooks);
        } else {
          setMyBooks([]);
        }
      } catch (error) {
        console.error('Error fetching library:', error);
        setMyBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [userRole, userId]);

  const filteredBooks = useMemo(() => {
    if (activeTab === 'downloaded') {
      return myBooks.filter((book) => book.isDownloaded);
    } else if (activeTab === 'recent') {
      return myBooks.filter((book) => book.readingProgress > 0);
    }
    return myBooks;
  }, [activeTab, myBooks]);

  const renderBookItem = ({ item }) => {
    const isMyBook = userRole === 'author' && userId && item.author_id === userId;
    const coverUrl = item.cover_image_url || item.cover || 'https://via.placeholder.com/200';
    const authorName = item.author?.name || item.author_name || item.author?.name || 'Unknown Author';
    
    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => isMyBook ? navigation.navigate('EditBook', { bookId: item.id }) : navigation.navigate('Reader', { bookId: item.id })}
      >
        <Image
          source={{ uri: coverUrl }}
          style={styles.bookCover}
          resizeMode="cover"
        />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.bookAuthor}>{authorName}</Text>
          {isMyBook && (
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️ Tap to Edit</Text>
            </View>
          )}
          {item.readingProgress > 0 && !isMyBook && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${item.readingProgress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{item.readingProgress}%</Text>
            </View>
          )}
          <View style={styles.bookMeta}>
            {!isMyBook && item.lastRead && <Text style={styles.lastRead}>{item.lastRead}</Text>}
            {item.isDownloaded && !isMyBook && (
              <View style={styles.downloadedBadge}>
                <Text style={styles.downloadedText}>📥 Downloaded</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: themeColors.background.secondary,
      padding: 4,
      margin: 16,
      borderRadius: 8,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 6,
    },
    activeTab: {
      backgroundColor: themeColors.primary.main,
    },
    tabText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: '500',
    },
    activeTabText: {
      color: themeColors.text.light,
      fontWeight: 'bold',
    },
    listContent: {
      padding: 16,
    },
    bookCard: {
      flexDirection: 'row',
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    bookCover: {
      width: 80,
      height: 120,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 6,
      marginRight: 12,
    },
    bookInfo: {
      flex: 1,
      justifyContent: 'space-between',
    },
    bookTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    bookAuthor: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 8,
    },
    progressContainer: {
      marginBottom: 8,
    },
    progressBar: {
      height: 4,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 2,
      marginBottom: 4,
    },
    progressFill: {
      height: '100%',
      backgroundColor: themeColors.primary.main,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
    bookMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastRead: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
    downloadedBadge: {
      backgroundColor: themeColors.background.tertiary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    downloadedText: {
      fontSize: 10 * fontSizeMultiplier,
      color: themeColors.primary.main,
    },
    editBadge: {
      marginTop: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: themeColors.primary.main,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    editBadgeText: {
      color: themeColors.text.light,
      fontSize: 10 * fontSizeMultiplier,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}
          >
            All Books
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'downloaded' && styles.activeTab]}
          onPress={() => setActiveTab('downloaded')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'downloaded' && styles.activeTabText,
            ]}
          >
            Downloaded
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => setActiveTab('recent')}
        >
          <Text
            style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}
          >
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Books List */}
      {loading ? (
        <View style={[styles.emptyContainer, { padding: 40 }]}>
          <ActivityIndicator size="large" color={themeColors.primary.main} />
        </View>
      ) : filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No books found</Text>
        </View>
      )}
    </View>
  );
};


export default LibraryScreen;

