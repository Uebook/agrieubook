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
          // For readers, fetch purchased books and subscription-accessible content
          console.log('📚 Fetching library for user:', {
            userId,
            userRole,
            userIdType: typeof userId,
            userIdLength: userId?.length,
          });

          try {
            // Fetch purchased books from orders
            const ordersResponse = await apiClient.getOrders(userId, { limit: 100 });
            console.log('📦 Orders API response:', {
              hasOrders: !!ordersResponse.orders,
              ordersCount: ordersResponse.orders?.length || 0,
              pagination: ordersResponse.pagination,
              fullResponse: JSON.stringify(ordersResponse, null, 2),
            });

            const orders = ordersResponse.orders || [];

            // Extract unique books from orders (paid author books)
            const purchasedBooks = [];
            const bookIds = new Set();
            
            // Check subscription status for free/platform content
            let hasActiveSubscription = false;
            try {
              const subResponse = await apiClient.getUserSubscriptions(userId, 'active');
              const activeSubs = subResponse.subscriptions || [];
              hasActiveSubscription = activeSubs.some(
                (sub) => sub.status === 'active' && (!sub.end_date || new Date(sub.end_date) > new Date())
              );
            } catch (subError) {
              console.error('Error checking subscription:', subError);
            }

            if (orders.length === 0) {
              console.log('⚠️ No orders found for user:', userId);
            }

            orders.forEach((order) => {
              console.log('📖 Processing order:', {
                orderId: order.id,
                hasBooks: !!order.books,
                booksCount: order.books?.length || 0,
                books: order.books,
              });

              if (order.books && Array.isArray(order.books) && order.books.length > 0) {
                order.books.forEach((book) => {
                  if (book && book.id && !bookIds.has(book.id)) {
                    bookIds.add(book.id);
                    // Add reading progress and other metadata
                    purchasedBooks.push({
                      id: book.id,
                      title: book.title || 'Untitled Book',
                      cover_image_url: book.cover || book.cover_image_url || 'https://via.placeholder.com/200',
                      cover: book.cover || book.cover_image_url || 'https://via.placeholder.com/200',
                      author: {
                        id: book.author?.id,
                        name: book.author?.name || 'Unknown Author',
                      },
                      author_name: book.author?.name || 'Unknown Author',
                      author_id: book.author?.id,
                      readingProgress: 0, // TODO: Fetch from reading_progress table if exists
                      lastRead: order.date ? new Date(order.date).toLocaleDateString() : 'Recently',
                      isDownloaded: false, // TODO: Track downloaded status
                      purchasedAt: order.date,
                      price: book.price || 0,
                      isFree: book.isFree || false,
                    });
                    console.log('✅ Added book to library:', book.title);
                  }
                });
              } else {
                console.log('⚠️ Order has no books array or empty:', order.id);
              }
            });

            console.log('📚 Total purchased books found:', purchasedBooks.length);
            setMyBooks(purchasedBooks);
          } catch (ordersError) {
            console.error('❌ Error fetching orders:', ordersError);
            // Try fallback: use getPurchases if available
            try {
              console.log('🔄 Trying getPurchases as fallback...');
              const purchasesResponse = await apiClient.getPurchases(userId);
              console.log('📦 Purchases API response:', purchasesResponse);

              const purchases = purchasesResponse.purchases || [];
              const purchasedBooks = [];
              const bookIds = new Set();

              purchases.forEach((purchase) => {
                const book = purchase.book || purchase.audio_book;
                if (book && book.id && !bookIds.has(book.id)) {
                  bookIds.add(book.id);
                  purchasedBooks.push({
                    id: book.id,
                    title: book.title || 'Untitled Book',
                    cover_image_url: book.cover_image_url || book.cover_url || 'https://via.placeholder.com/200',
                    cover: book.cover_image_url || book.cover_url || 'https://via.placeholder.com/200',
                    author: {
                      id: purchase.book?.author_id || purchase.audio_book?.author_id,
                      name: 'Unknown Author',
                    },
                    author_name: 'Unknown Author',
                    author_id: purchase.book?.author_id || purchase.audio_book?.author_id,
                    readingProgress: 0,
                    lastRead: purchase.purchased_at ? new Date(purchase.purchased_at).toLocaleDateString() : 'Recently',
                    isDownloaded: false,
                    purchasedAt: purchase.purchased_at,
                    price: purchase.amount || 0,
                    isFree: purchase.amount === 0,
                  });
                }
              });

              console.log('📚 Total purchased books from fallback:', purchasedBooks.length);
              setMyBooks(purchasedBooks);
            } catch (purchasesError) {
              console.error('❌ Error fetching purchases (fallback):', purchasesError);
              setMyBooks([]);
            }
          }
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
      // Since downloads are disabled, show all purchased books in "Downloaded" tab
      // (all purchased books are available to read)
      return myBooks;
    } else if (activeTab === 'recent') {
      // Show books sorted by most recently purchased/accessed
      // Sort by purchasedAt date (most recent first)
      return [...myBooks].sort((a, b) => {
        const dateA = a.purchasedAt ? new Date(a.purchasedAt).getTime() : 0;
        const dateB = b.purchasedAt ? new Date(b.purchasedAt).getTime() : 0;
        return dateB - dateA; // Most recent first
      });
    }
    return myBooks;
  }, [activeTab, myBooks]);

  const renderBookItem = ({ item }) => {
    const isMyBook = userRole === 'author' && userId && item.author_id === userId;
    const coverUrl = item.cover_image_url || item.cover || 'https://via.placeholder.com/200';
    const authorName = item.author?.name || item.author_name || item.author?.name || 'Unknown Author';

    const handleBookPress = () => {
      if (isMyBook) {
        // Author viewing their own book - navigate to edit
        navigation.navigate('EditBook', { bookId: item.id });
      } else {
        // Reader viewing purchased book - open in ReaderScreen (view PDF, not download)
        navigation.navigate('Reader', {
          bookId: item.id,
          sample: false, // Not a sample, it's a purchased book
        });
      }
    };

    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={handleBookPress}
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
            Available
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
          refreshing={loading}
          onRefresh={() => {
            const fetchLibrary = async () => {
              try {
                setLoading(true);

                if (userRole === 'author' && userId) {
                  const response = await apiClient.getBooks({
                    author: userId,
                    status: 'published',
                    limit: 100,
                  });
                  setMyBooks(response.books || []);
                } else if (userId) {
                  const ordersResponse = await apiClient.getOrders(userId, { limit: 100 });
                  const orders = ordersResponse.orders || [];
                  const purchasedBooks = [];
                  const bookIds = new Set();

                  orders.forEach((order) => {
                    if (order.books && Array.isArray(order.books) && order.books.length > 0) {
                      order.books.forEach((book) => {
                        if (book && book.id && !bookIds.has(book.id)) {
                          bookIds.add(book.id);
                          purchasedBooks.push({
                            id: book.id,
                            title: book.title || 'Untitled Book',
                            cover_image_url: book.cover || book.cover_image_url || 'https://via.placeholder.com/200',
                            cover: book.cover || book.cover_image_url || 'https://via.placeholder.com/200',
                            author: {
                              id: book.author?.id,
                              name: book.author?.name || 'Unknown Author',
                            },
                            author_name: book.author?.name || 'Unknown Author',
                            author_id: book.author?.id,
                            readingProgress: 0,
                            lastRead: order.date ? new Date(order.date).toLocaleDateString() : 'Recently',
                            isDownloaded: false,
                            purchasedAt: order.date,
                            price: book.price || 0,
                            isFree: book.isFree || false,
                          });
                        }
                      });
                    }
                  });

                  setMyBooks(purchasedBooks);
                }
              } catch (error) {
                console.error('Error refreshing library:', error);
              } finally {
                setLoading(false);
              }
            };
            fetchLibrary();
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {userRole === 'author'
              ? 'No books found. Start by uploading your first book!'
              : activeTab === 'downloaded'
                ? 'No books available. Purchase books from the store to see them here.'
                : activeTab === 'recent'
                  ? 'No recent reading activity. Start reading a book to see it here.'
                  : 'No purchased books found. Purchase books from the store to see them here.'}
          </Text>
        </View>
      )}
    </View>
  );
};


export default LibraryScreen;

