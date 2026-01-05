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
import { getBookById, wishlistBooks } from '../../services/dummyData';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const BookDetailScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userRole, userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { bookId } = route.params || {};
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  const isAuthor = userRole === 'author';
  const isMyBook = isAuthor && userId && book?.author_id === userId;

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
        // Check if book is in wishlist (TODO: implement wishlist API)
        setIsWishlisted(wishlistBooks.some((b) => b.id === bookId));
      } catch (error) {
        console.error('Error fetching book:', error);
        // Fallback to dummy data
        const dummyBook = getBookById(bookId) || getBookById('1');
        setBook(dummyBook);
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
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => setIsWishlisted(!isWishlisted)}
        >
          <Text style={styles.wishlistIcon}>{isWishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Book Info */}
      <View style={styles.content}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>By {authorName}</Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {book.rating || '0.0'}</Text>
          <Text style={styles.reviews}>({book.reviews_count || 0} reviews)</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {book.is_free ? 'Free' : `₹${book.price || 0}`}
          </Text>
          {book.original_price && book.original_price > book.price && (
            <Text style={styles.originalPrice}>₹{book.original_price}</Text>
          )}
          <TouchableOpacity
            style={styles.reviewsButton}
            onPress={() => navigation.navigate('Reviews', { bookId: book.id })}
          >
            <Text style={styles.reviewsButtonText}>View Reviews</Text>
          </TouchableOpacity>
        </View>

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

        {/* Sample Reading */}
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

        {/* Action Buttons */}
        {isMyBook ? (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditBook', { bookId: book.id })}
            >
              <Text style={styles.editButtonText}>✏️ Edit Book</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => navigation.navigate('Payment', { bookId: book.id })}
            >
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
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

