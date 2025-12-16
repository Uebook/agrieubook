/**
 * Reviews & Ratings Screen
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { reviews, getBookById } from '../../services/dummyData';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';

const ReviewsScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { bookId } = route.params || {};
  const book = bookId ? getBookById(bookId) : null;

  const bookReviews = useMemo(() => {
    if (bookId) {
      return reviews.filter((review) => review.bookId === bookId);
    }
    return reviews;
  }, [bookId]);

  const averageRating = useMemo(() => {
    if (bookReviews.length === 0) return 0;
    const sum = bookReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / bookReviews.length).toFixed(1);
  }, [bookReviews]);

  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    bookReviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
  }, [bookReviews]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    bookHeader: {
      padding: 20,
      paddingBottom: 12,
      backgroundColor: themeColors.background.secondary,
    },
    bookTitle: {
      fontSize: 20 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    bookAuthor: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    summaryCard: {
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      margin: 20,
      marginBottom: 12,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    ratingSummary: {
      flexDirection: 'row',
    },
    averageRatingContainer: {
      alignItems: 'center',
      marginRight: 24,
      paddingRight: 24,
      borderRightWidth: 1,
      borderRightColor: themeColors.border?.light || '#E0E0E0',
    },
    averageRating: {
      fontSize: 36 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    averageRatingStars: {
      fontSize: 16 * fontSizeMultiplier,
      marginBottom: 8,
    },
    totalReviews: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    ratingBreakdown: {
      flex: 1,
      justifyContent: 'space-between',
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    ratingLabel: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      width: 40,
    },
    ratingBarContainer: {
      flex: 1,
      height: 8,
      backgroundColor: themeColors.background.tertiary,
      borderRadius: 4,
      marginHorizontal: 12,
      overflow: 'hidden',
    },
    ratingBar: {
      height: '100%',
      backgroundColor: themeColors.primary.main,
      borderRadius: 4,
    },
    ratingCount: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      width: 30,
      textAlign: 'right',
    },
    reviewsHeader: {
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    reviewsTitle: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
    },
    reviewsList: {
      padding: 20,
      paddingTop: 8,
    },
    reviewCard: {
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    userInfo: {
      flexDirection: 'row',
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: themeColors.primary.main,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    avatarText: {
      color: themeColors.text.light,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
    },
    userNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    userName: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginRight: 8,
    },
    verifiedBadge: {
      fontSize: 10 * fontSizeMultiplier,
      color: themeColors.success || '#4CAF50',
      fontWeight: '600',
    },
    reviewDate: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    ratingContainer: {
      alignItems: 'flex-end',
    },
    ratingStars: {
      fontSize: 14 * fontSizeMultiplier,
      marginBottom: 4,
    },
    ratingNumber: {
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
    },
    reviewComment: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.primary,
      lineHeight: 20 * fontSizeMultiplier,
      marginBottom: 12,
    },
    reviewActions: {
      flexDirection: 'row',
      gap: 16,
    },
    actionButton: {
      paddingVertical: 4,
    },
    actionText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
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
      fontSize: 20 * fontSizeMultiplier,
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

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{item.userName}</Text>
              {item.verified && (
                <Text style={styles.verifiedBadge}>✓ Verified</Text>
              )}
            </View>
            <Text style={styles.reviewDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingStars}>
            {renderStars(item.rating)}
          </Text>
          <Text style={styles.ratingNumber}>{item.rating}.0</Text>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>👍 {item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>👎 {item.dislikes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Reviews & Ratings" navigation={navigation} />
      {book && (
        <View style={styles.bookHeader}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>By {book.author.name}</Text>
        </View>
      )}

      {/* Rating Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.ratingSummary}>
          <View style={styles.averageRatingContainer}>
            <Text style={styles.averageRating}>{averageRating}</Text>
            <Text style={styles.averageRatingStars}>
              {renderStars(Math.round(parseFloat(averageRating)))}
            </Text>
            <Text style={styles.totalReviews}>
              {bookReviews.length} {bookReviews.length === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
          <View style={styles.ratingBreakdown}>
            {[5, 4, 3, 2, 1].map((star) => (
              <View key={star} style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>{star} ⭐</Text>
                <View style={styles.ratingBarContainer}>
                  <View
                    style={[
                      styles.ratingBar,
                      {
                        width: `${
                          bookReviews.length > 0
                            ? (ratingDistribution[star] / bookReviews.length) * 100
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.ratingCount}>
                  {ratingDistribution[star]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsHeader}>
        <Text style={styles.reviewsTitle}>
          All Reviews ({bookReviews.length})
        </Text>
      </View>
      {bookReviews.length > 0 ? (
        <FlatList
          data={bookReviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.reviewsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>No reviews yet</Text>
          <Text style={styles.emptySubtext}>
            Be the first to review this book!
          </Text>
        </View>
      )}
    </View>
  );
};

export default ReviewsScreen;

