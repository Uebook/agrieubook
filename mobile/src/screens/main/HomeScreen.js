/**
 * Home Screen
 * Features: Personalized recommendations, Recently opened, Continue Reading, Trending books
 */

import React, { useMemo, useState, useEffect } from 'react';
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
import Colors from '../../../color';
// Removed dummy data imports - using API only
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useCategories } from '../../context/CategoriesContext';
import apiClient from '../../services/api';

const HomeScreen = ({ navigation }) => {
  const { userRole, userId, userData } = useAuth();
  const { t, getThemeColors, getFontSizeMultiplier } = useSettings();
  const { categories } = useCategories();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const isAuthor = userRole === 'author';
  const [allBooks, setAllBooks] = useState([]);
  const [allAudioBooks, setAllAudioBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [userRating, setUserRating] = useState(0);
  
  // Ensure userData is safely accessed
  const safeUserData = userData || {};

  // Fetch books, audio books, notifications, and user data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // For authors: fetch only their own books
        // For readers: fetch all published books
        const params = isAuthor && userId 
          ? { author: userId, limit: 100 } // Get all books by this author
          : { status: 'published', limit: 50 };
        
        const promises = [
          apiClient.getBooks(params),
          apiClient.getAudioBooks(isAuthor && userId ? { author: userId, limit: 100 } : { limit: 50 }),
        ];

        // Fetch notifications if user is logged in
        if (userId) {
          promises.push(apiClient.getNotifications(userId, 'all'));
          // Fetch user data to get rating
          promises.push(apiClient.getUser(userId));
        }
        
        const results = await Promise.all(promises);
        
        setAllBooks(results[0].books || []);
        setAllAudioBooks(results[1].audioBooks || []);
        
        if (userId && results[2]) {
          setNotifications(results[2].notifications || []);
        }
        if (userId && results[3] && results[3].user) {
          // Calculate or get user rating (you might need to add rating to user model)
          setUserRating(results[3].user.rating || 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setAllBooks([]);
        setAllAudioBooks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthor, userId]);

  // For authors: show only their own books, for readers: show normal content
  const myBooks = useMemo(() => {
    if (isAuthor && userId) {
      return allBooks.filter((book) => book.author_id === userId);
    }
    return [];
  }, [isAuthor, userId, allBooks]);

  const myAudioBooks = useMemo(() => {
    if (isAuthor && userId) {
      return allAudioBooks.filter((audio) => audio.author_id === userId);
    }
    return [];
  }, [isAuthor, userId, allAudioBooks]);

  // Fetch continue reading books (purchased books with reading progress)
  const [continueReading, setContinueReading] = useState([]);
  
  useEffect(() => {
    const fetchContinueReading = async () => {
      if (isAuthor || !userId) {
        setContinueReading([]);
        return;
      }
      
      try {
        // Fetch user's purchased books
        const ordersResponse = await apiClient.getOrders(userId, { limit: 50 });
        const orders = ordersResponse.orders || [];
        
        // Extract books from orders and format for continue reading
        const continueBooks = [];
        const bookIds = new Set();
        
        orders.forEach((order) => {
          if (order.books && order.books.length > 0) {
            order.books.forEach((book) => {
              if (!bookIds.has(book.id)) {
                bookIds.add(book.id);
                continueBooks.push({
                  id: book.id,
                  title: book.title,
                  cover: book.cover || book.cover_image_url || 'https://via.placeholder.com/200',
                  cover_image_url: book.cover || book.cover_image_url || 'https://via.placeholder.com/200',
                  author: {
                    name: book.author?.name || 'Unknown Author',
                  },
                  author_name: book.author?.name || 'Unknown Author',
                  readingProgress: 0, // TODO: Fetch actual reading progress from API
                  lastRead: order.date ? new Date(order.date).toLocaleDateString() : 'Recently',
                });
              }
            });
          }
        });
        
        // Sort by most recent purchase and limit to 5
        setContinueReading(continueBooks.slice(0, 5));
      } catch (error) {
        console.error('Error fetching continue reading:', error);
        setContinueReading([]);
      }
    };
    
    fetchContinueReading();
  }, [userId, isAuthor]);
  
  // Trending: Show 3 published books from database
  const trending = isAuthor ? [] : allBooks.slice(0, 3);
  // Recommended: Show up to 5 published books from database
  const recommendations = isAuthor ? [] : allBooks.slice(0, 5);
  const audioPodcasts = isAuthor ? [] : allAudioBooks;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('goodMorning');
    } else if (hour < 17) {
      return t('goodAfternoon');
    } else {
      return t('goodEvening');
    }
  };

  const getUserName = () => {
    // Get first name from userData or fallback
    try {
      if (safeUserData && safeUserData.name && typeof safeUserData.name === 'string') {
        return safeUserData.name.split(' ')[0];
      }
    } catch (error) {
      console.error('Error getting user name:', error);
    }
    return 'User';
  };

  const getUnreadNotificationCount = () => {
    return notifications.filter((notif) => !notif.isRead).length;
  };

  // Define styles BEFORE render functions to prevent "styles is undefined" error
  // Use useMemo to prevent recreation on every render
  const styles = useMemo(() => StyleSheet.create({
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    greetingContainer: {
      flex: 1,
    },
    userNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: 8,
    },
    ratingStar: {
      fontSize: 14 * fontSizeMultiplier,
    },
    ratingText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: '600',
    },
    notificationButton: {
      position: 'relative',
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: themeColors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    notificationIcon: {
      fontSize: 20,
    },
    notificationBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: themeColors.error || '#F44336',
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: themeColors.background.primary,
    },
    notificationBadgeText: {
      color: themeColors.text.light,
      fontSize: 10,
      fontWeight: 'bold',
    },
    searchBar: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    searchPlaceholder: {
      color: themeColors.input.placeholder,
      fontSize: 16 * fontSizeMultiplier,
    },
    section: {
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 20 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
    },
    seeAll: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.primary.main,
      fontWeight: '500',
    },
    continueCard: {
      width: 150,
      marginRight: 12,
    },
    bookCard: {
      width: 120,
      marginRight: 12,
    },
    bookCover: {
      width: '100%',
      height: 180,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      marginBottom: 8,
    },
    continueBookCover: {
      width: '100%',
      height: 200,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      marginBottom: 8,
    },
    continueTitle: {
      fontSize: 12 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
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
      fontSize: 10 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    categoryCard: {
      width: '48%',
      backgroundColor: themeColors.background.tertiary,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
    },
    categoryIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    categoryText: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '500',
      color: themeColors.primary.main,
    },
    youtubeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    youtubeIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    youtubeContent: {
      flex: 1,
    },
    youtubeTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    youtubeSubtitle: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    youtubeArrow: {
      fontSize: 24,
      color: themeColors.text.secondary,
      marginLeft: 8,
    },
    authorSection: {
      paddingHorizontal: 20,
      marginTop: 8,
      marginBottom: 8,
    },
    uploadQuickButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.primary.main,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: themeColors.primary.main,
    },
    uploadQuickIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    uploadQuickContent: {
      flex: 1,
    },
    uploadQuickTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.light,
      marginBottom: 4,
    },
    uploadQuickSubtitle: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.light,
      opacity: 0.9,
    },
    uploadQuickArrow: {
      fontSize: 24,
      color: themeColors.text.light,
      marginLeft: 8,
    },
    podcastCard: {
      flexDirection: 'row',
      width: 300,
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 12,
      padding: 12,
      marginRight: 12,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    podcastCover: {
      width: 80,
      height: 80,
      borderRadius: 8,
      backgroundColor: themeColors.background.tertiary,
    },
    podcastInfo: {
      flex: 1,
      marginLeft: 12,
    },
    podcastTitle: {
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    podcastAuthor: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 8,
    },
    podcastMeta: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    podcastDuration: {
      fontSize: 11 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    podcastLanguage: {
      fontSize: 11 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    freeBadge: {
      alignSelf: 'flex-start',
      backgroundColor: themeColors.success || '#4CAF50',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    freeBadgeText: {
      color: themeColors.text.light,
      fontSize: 10 * fontSizeMultiplier,
      fontWeight: '600',
    },
    curriculumCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    curriculumIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    curriculumContent: {
      flex: 1,
    },
    curriculumTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    curriculumSubtitle: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    curriculumArrow: {
      fontSize: 24,
      color: themeColors.text.secondary,
      marginLeft: 8,
    },
    editButton: {
      marginTop: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: themeColors.primary.main,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    editButtonText: {
      color: themeColors.text.light,
      fontSize: 12 * fontSizeMultiplier,
      fontWeight: '600',
    },
    editButtonSmall: {
      marginTop: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: themeColors.primary.main,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    editButtonTextSmall: {
      color: themeColors.text.light,
      fontSize: 10 * fontSizeMultiplier,
      fontWeight: '600',
    },
    emptyStateContainer: {
      alignItems: 'center',
      padding: 40,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 12,
    },
    emptyStateIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      textAlign: 'center',
    },
  }), [themeColors, fontSizeMultiplier]);

  const renderBookItem = ({ item }) => {
    const coverUrl = item.cover_image_url || item.cover || 'https://via.placeholder.com/200';
    const authorName = item.author?.name || item.author_name || 'Unknown Author';
    
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
        <Text style={dynamicStyles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={dynamicStyles.bookAuthor}>{authorName}</Text>
      </TouchableOpacity>
    );
  };

  const renderAuthorBookItem = ({ item }) => {
    const coverUrl = item.cover_image_url || item.cover || 'https://via.placeholder.com/200';
    const authorName = item.author?.name || item.author_name || 'Unknown Author';
    
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
        <Text style={dynamicStyles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={dynamicStyles.bookAuthor}>{authorName}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditBook', { bookId: item.id })}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    header: {
      padding: 20,
      backgroundColor: themeColors.background.primary,
    },
    greeting: {
      fontSize: 20 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 4,
    },
    userName: {
      fontSize: 24 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
    },
    userNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.background.secondary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    ratingStar: {
      fontSize: 14 * fontSizeMultiplier,
      marginRight: 2,
    },
    ratingText: {
      fontSize: 12 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
    },
    sectionTitle: {
      fontSize: 20 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
    },
    seeAll: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.primary.main,
      fontWeight: '500',
    },
    bookTitle: {
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginTop: 8,
    },
    bookAuthor: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 4,
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      {/* Header with Search */}
      <View style={dynamicStyles.header}>
        <View style={styles.headerTop}>
          <View style={styles.greetingContainer}>
            <Text style={dynamicStyles.greeting}>{getGreeting()},</Text>
            <View style={styles.userNameContainer}>
              <Text style={dynamicStyles.userName}>{getUserName()} 👋</Text>
              {userRating > 0 && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingStar}>⭐</Text>
                  <Text style={styles.ratingText}>{userRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {getUnreadNotificationCount() > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {getUnreadNotificationCount() > 9 ? '9+' : getUnreadNotificationCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.searchPlaceholder}>Search books...</Text>
        </TouchableOpacity>
      </View>

      {/* Author Quick Upload Button */}
      {isAuthor && (
        <View style={styles.authorSection}>
          <TouchableOpacity
            style={styles.uploadQuickButton}
            onPress={() => navigation.navigate('BookUpload')}
          >
            <Text style={styles.uploadQuickIcon}>📤</Text>
            <View style={styles.uploadQuickContent}>
              <Text style={styles.uploadQuickTitle}>Upload Your Book</Text>
              <Text style={styles.uploadQuickSubtitle}>
                Share your agricultural knowledge
              </Text>
            </View>
            <Text style={styles.uploadQuickArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Author's Own Books Section */}
      {isAuthor && (
        <>
          {myBooks.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Uploaded Books</Text>
                <TouchableOpacity onPress={() => navigation.navigate('BookStore')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={myBooks}
                renderItem={renderAuthorBookItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>📚</Text>
                <Text style={styles.emptyStateTitle}>No Books Uploaded Yet</Text>
                <Text style={styles.emptyStateText}>
                  Start sharing your knowledge by uploading your first book!
                </Text>
              </View>
            </View>
          )}

          {myAudioBooks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Audio Books</Text>
                <TouchableOpacity onPress={() => navigation.navigate('BookStore')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={myAudioBooks}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.podcastCard}
                    onPress={() => navigation.navigate('AudioBook', { audioId: item.id })}
                  >
                    <Image
                      source={{ uri: item.cover }}
                      style={styles.podcastCover}
                      resizeMode="cover"
                    />
                    <View style={styles.podcastInfo}>
                      <Text style={styles.podcastTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <TouchableOpacity
                        style={styles.editButtonSmall}
                        onPress={() => navigation.navigate('EditBook', { audioId: item.id, isAudio: true })}
                      >
                        <Text style={styles.editButtonTextSmall}>✏️ Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </>
      )}

      {/* Continue Reading Section (Readers only) */}
      {!isAuthor && continueReading.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Reading</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Library')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {continueReading.map((book) => {
              const coverUrl = book.cover || book.cover_image_url || 'https://via.placeholder.com/200';
              const progress = book.readingProgress || 0;
              return (
                <TouchableOpacity
                  key={book.id}
                  style={styles.continueCard}
                  onPress={() => navigation.navigate('Reader', { bookId: book.id })}
                >
                  <Image
                    source={{ uri: coverUrl }}
                    style={styles.continueBookCover}
                    resizeMode="cover"
                  />
                  <Text style={styles.continueTitle} numberOfLines={1}>
                    {book.title}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{progress}%</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Personalized Recommendations (Readers only) */}
      {!isAuthor && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <FlatList
            data={recommendations}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Trending Books (Readers only) */}
      {!isAuthor && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>{t('trending')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BookStore')}>
              <Text style={dynamicStyles.seeAll}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={trending}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Categories Quick Access (Readers only) */}
      {!isAuthor && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>{t('browseCategories')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllCategories')}>
              <Text style={dynamicStyles.seeAll}>{t('seeAll') || 'View All'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {(categories || []).slice(0, 4).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Category', { category: cat.name, categoryId: cat.id })}
              >
                <Text style={styles.categoryIcon}>{cat.icon || '📚'}</Text>
                <Text style={styles.categoryText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Free Audio Podcasts Section (Readers only) */}
      {userRole !== 'author' && audioPodcasts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Free Audio Podcasts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BookStore')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={audioPodcasts.slice(0, 5)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.podcastCard}
                onPress={() => navigation.navigate('AudioBook', { audioId: item.id })}
              >
                <Image
                  source={{ uri: item.cover }}
                  style={styles.podcastCover}
                  resizeMode="cover"
                />
                <View style={styles.podcastInfo}>
                  <Text style={styles.podcastTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.podcastAuthor}>{item.author.name}</Text>
                  <View style={styles.podcastMeta}>
                    <Text style={styles.podcastDuration}>🎙️ {item.duration}</Text>
                    <Text style={styles.podcastLanguage}>{item.language}</Text>
                  </View>
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>🆓 FREE</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Government Curriculum Section (Readers only) */}
      {!isAuthor && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Government Curriculum</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GovernmentCurriculum')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.curriculumCard}
            onPress={() => navigation.navigate('GovernmentCurriculum')}
          >
            <Text style={styles.curriculumIcon}>📄</Text>
            <View style={styles.curriculumContent}>
              <Text style={styles.curriculumTitle}>Government Schemes & Yojanas</Text>
              <Text style={styles.curriculumSubtitle}>
                Access official PDFs and guidelines for agricultural schemes by state
              </Text>
            </View>
            <Text style={styles.curriculumArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* YouTube Channels (Readers only) */}
      {!isAuthor && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>YouTube Channels</Text>
            <TouchableOpacity onPress={() => navigation.navigate('YouTubeChannels')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.youtubeCard}
            onPress={() => navigation.navigate('YouTubeChannels')}
          >
            <Text style={styles.youtubeIcon}>📺</Text>
            <View style={styles.youtubeContent}>
              <Text style={styles.youtubeTitle}>Learn from Experts</Text>
              <Text style={styles.youtubeSubtitle}>
                Watch tutorials and tips from top agriculture channels
              </Text>
            </View>
            <Text style={styles.youtubeArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default HomeScreen;

