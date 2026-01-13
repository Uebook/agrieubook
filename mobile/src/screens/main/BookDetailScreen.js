/**
 * Book Detail Screen
 * Features: Cover image, Summary, Sample reading, Author info, Ratings, Price, Add to wishlist
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
// Removed dummy data import - using API only
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import { Alert } from 'react-native';

const BookDetailScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userRole, userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { bookId } = route.params || {};
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const isAuthor = userRole === 'author';
  const isMyBook = isAuthor && userId && book?.author_id === userId;

  // Define styles BEFORE early returns to avoid "styles is undefined" error
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    coverContainer: {
      position: 'relative',
      alignItems: 'center',
      padding: 20,
      backgroundColor: themeColors.background.secondary,
    },
    bookCover: {
      width: 200,
      height: 300,
      backgroundColor: themeColors.background.tertiary,
      borderRadius: 8,
    },
    wishlistButton: {
      position: 'absolute',
      top: 30,
      right: 30,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: themeColors.background.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    wishlistIcon: {
      fontSize: 24 * fontSizeMultiplier,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 8,
    },
    author: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 16,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    rating: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.primary,
      marginRight: 8,
    },
    reviews: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    price: {
      fontSize: 28 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.primary.main,
    },
    originalPrice: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
      textDecorationLine: 'line-through',
      marginLeft: 8,
    },
    reviewsButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: themeColors.background.secondary,
    },
    reviewsButtonText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.primary.main,
      fontWeight: '500',
    },
    detailsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
      marginBottom: 24,
    },
    detailItem: {
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 12,
    },
    summary: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      lineHeight: 24 * fontSizeMultiplier,
    },
    authorInfo: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      lineHeight: 20 * fontSizeMultiplier,
    },
    sampleText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      lineHeight: 20 * fontSizeMultiplier,
      marginBottom: 12,
    },
    readSampleButton: {
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: themeColors.background.tertiary,
    },
    readSampleText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.primary.main,
      fontWeight: '500',
    },
    actionContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    buyButton: {
      flex: 1,
      backgroundColor: themeColors.button.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
    },
    buyButtonText: {
      color: themeColors.button.text,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
    },
    readButton: {
      flex: 1,
      backgroundColor: themeColors.button.secondary || themeColors.background.secondary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
    },
    readButtonText: {
      color: themeColors.button.text || themeColors.text.primary,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
    },
    editButton: {
      flex: 1,
      backgroundColor: themeColors.primary.main,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
    },
    editButtonText: {
      color: themeColors.button.text,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
    },
    imageIndicators: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 12,
      gap: 6,
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: themeColors.background.tertiary,
    },
    indicatorActive: {
      backgroundColor: themeColors.primary.main,
      width: 24,
    },
  });

  const handleWishlistToggle = async () => {
    // Only allow wishlist for readers viewing other authors' books
    if (!userId || !bookId || isMyBook || userRole !== 'reader') {
      Alert.alert('Error', 'Please login as a reader to add to wishlist');
      return;
    }
    try {
      if (isWishlisted) {
        const response = await apiClient.removeFromWishlist(userId, bookId);
        // API returns { success: true } on success, or { error: ... } on failure
        if (response.error) {
          throw new Error(response.error);
        }
        setIsWishlisted(false);
      } else {
        const response = await apiClient.addToWishlist(userId, bookId);
        // API returns { success: true } on success, or { error: ... } on failure
        // Also handles case where book is already in wishlist (returns 200 with success: true)
        if (response.error) {
          throw new Error(response.error);
        }
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      Alert.alert('Error', error.message || 'Failed to update wishlist');
    }
  };

  // Check if book is in wishlist - only for readers viewing other authors' books
  useEffect(() => {
    const checkWishlist = async () => {
      if (!userId || !bookId || isMyBook || userRole !== 'reader') return;
      try {
        const response = await apiClient.getWishlist(userId);
        const wishlistBookIds = (response.books || []).map((b) => b.id);
        setIsWishlisted(wishlistBookIds.includes(bookId));
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    };
    checkWishlist();
  }, [userId, bookId, isMyBook, userRole]);

  // Check if book is already purchased and check subscription status
  useEffect(() => {
    const checkPurchase = async () => {
      if (!userId || !bookId || isMyBook || userRole !== 'reader') {
        setIsPurchased(false);
        setHasActiveSubscription(false);
        return;
      }
      try {
        setCheckingPurchase(true);

        // Check purchase status
        const response = await apiClient.getOrders(userId, { limit: 100 });
        const orders = response.orders || [];

        // Check if this book is in any order
        const purchased = orders.some((order) => {
          if (order.books && Array.isArray(order.books)) {
            return order.books.some((b) => b.id === bookId);
          }
          return false;
        });

        setIsPurchased(purchased);

        // Check subscription status
        try {
          const subResponse = await apiClient.getUserSubscriptions(userId, 'active');
          const activeSubs = subResponse.subscriptions || [];
          const hasActive = activeSubs.some(
            (sub) => sub.status === 'active' && (!sub.end_date || new Date(sub.end_date) > new Date())
          );
          setHasActiveSubscription(hasActive);
        } catch (subError) {
          console.error('Error checking subscription:', subError);
          setHasActiveSubscription(false);
        }
      } catch (error) {
        console.error('Error checking purchase:', error);
        setIsPurchased(false);
        setHasActiveSubscription(false);
      } finally {
        setCheckingPurchase(false);
      }
    };
    checkPurchase();
  }, [userId, bookId, isMyBook, userRole]);

  // Fetch book from API
  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getBook(bookId);
        setBook(response.book);
      } catch (error) {
        console.error('Error fetching book:', error);
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <Text style={{ fontSize: 18, color: themeColors.text.secondary }}>Book not found</Text>
      </View>
    );
  }

  const coverImages = book.cover_images || (book.cover_image_url ? [book.cover_image_url] : [book.cover || 'https://via.placeholder.com/200']);
  const authorName = book.author?.name || book.author_name || 'Unknown Author';

  return (
    <View style={styles.container}>
      <Header title="Book Details" navigation={navigation} />
      <ScrollView style={styles.scrollView}>
        {/* Cover Images Carousel */}
        <View style={styles.coverContainer}>
          {coverImages.length > 1 ? (
            <>
              <FlatList
                data={coverImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / screenWidth
                  );
                  setCurrentImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={[styles.bookCover, { width: screenWidth - 40 }]}
                    resizeMode="cover"
                  />
                )}
              />
              <View style={styles.imageIndicators}>
                {coverImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentImageIndex && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
            </>
          ) : (
            <Image
              source={{ uri: coverImages[0] }}
              style={styles.bookCover}
              resizeMode="cover"
            />
          )}
          {/* Wishlist button - only for readers viewing other authors' books */}
          {!isMyBook && userRole === 'reader' && (
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleWishlistToggle}
            >
              <Text style={styles.wishlistIcon}>{isWishlisted ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Book Info */}
        <View style={styles.content}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>By {authorName}</Text>

          {/* Rating and Reviews - HIDDEN for readers (requirement: "no review and rating") */}
          {/* Price - Only for authors viewing their own book */}
          {isMyBook && (
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {book.is_free ? 'Free' : `₹${book.price || 0}`}
              </Text>
              {book.original_price && book.original_price > book.price && (
                <Text style={styles.originalPrice}>₹{book.original_price}</Text>
              )}
            </View>
          )}

          {/* Book Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Pages</Text>
              <Text style={styles.detailValue}>{book.pages || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Language</Text>
              <Text style={styles.detailValue}>{book.language || 'English'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{book.category?.name || 'Uncategorized'}</Text>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{book.summary || 'No summary available.'}</Text>
          </View>

          {/* Author Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Author</Text>
            <Text style={styles.authorInfo}>
              {book.author?.bio || `${authorName} is an experienced agricultural expert.`}
            </Text>
          </View>

          {/* Sample Reading - Only for readers viewing other authors' books */}
          {!isMyBook && userRole === 'reader' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sample Reading</Text>
              <Text style={styles.sampleText}>
                {book.sampleText || 'Chapter 1: Introduction... [Sample content]'}
              </Text>
              <TouchableOpacity
                style={styles.readSampleButton}
                onPress={() => navigation.navigate('Reader', { bookId: book.id, sample: true })}
              >
                <Text style={styles.readSampleText}>Read Sample</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          {isMyBook ? (
            // Author viewing their own book - Only Edit button
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditBook', { bookId: book.id })}
              >
                <Text style={styles.editButtonText}>✏️ Edit Book</Text>
              </TouchableOpacity>
            </View>
          ) : userRole === 'reader' ? (
            // Reader viewing other authors' books
            <View style={styles.actionContainer}>
              {checkingPurchase ? (
                <ActivityIndicator size="small" color={themeColors.primary.main} />
              ) : isPurchased || book.is_free || hasActiveSubscription ? (
                // Book is purchased, free, or user has active subscription - Show Read button
                <TouchableOpacity
                  style={styles.readButton}
                  onPress={() => navigation.navigate('Reader', { bookId: book.id })}
                >
                  <Text style={styles.readButtonText}>
                    {hasActiveSubscription && !isPurchased && !book.is_free ? 'Read (Subscription)' : 'Read'}
                  </Text>
                </TouchableOpacity>
              ) : (
                // Book is not purchased and no subscription - Show Buy Now button
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => navigation.navigate('Payment', { bookId: book.id })}
                >
                  <Text style={styles.buyButtonText}>Buy Now</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Other cases (if any) - Buy and Read
            <View style={styles.actionContainer}>
              {!book.is_free && (
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => navigation.navigate('Payment', { bookId: book.id })}
                >
                  <Text style={styles.buyButtonText}>Buy Now</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.readButton}
                onPress={() => navigation.navigate('Reader', { bookId: book.id })}
              >
                <Text style={styles.readButtonText}>Start Reading</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};


export default BookDetailScreen;

