/**
 * Reviews & Ratings Screen
 * Fetches reviews from API and allows readers to submit reviews
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
// Removed dummy data import - using API only
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const ReviewsScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userRole, userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { bookId } = route.params || {};
  const isReader = userRole === 'reader';
  
  const [bookReviews, setBookReviews] = useState([]);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
  });
  const [userReview, setUserReview] = useState(null); // User's existing review

  // Fetch book and reviews from API
  useEffect(() => {
    const fetchData = async () => {
      if (!bookId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [bookResponse, reviewsResponse] = await Promise.all([
          apiClient.getBook(bookId),
          apiClient.getReviews(bookId),
        ]);

        setBook(bookResponse.book);
        setBookReviews(reviewsResponse.reviews || []);

        // Check if user has already reviewed this book
        if (userId && isReader) {
          const userReviewData = reviewsResponse.reviews?.find(
            (r) => r.userId === userId
          );
          setUserReview(userReviewData || null);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setBook(null);
        setBookReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId, userId, isReader]);

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

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const renderStars = useCallback((rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  }, []);

  const handleOpenReviewModal = useCallback(() => {
    if (userReview) {
      // Pre-fill form with existing review
      setReviewForm({
        rating: userReview.rating,
        comment: userReview.comment || '',
      });
    } else {
      setReviewForm({ rating: 0, comment: '' });
    }
    setShowReviewModal(true);
  }, [userReview]);

  const handleSubmitReview = useCallback(async () => {
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      Alert.alert('Error', 'Please select a rating (1-5 stars)');
      return;
    }

    if (!userId || !bookId) {
      Alert.alert('Error', 'Please login to submit a review');
      return;
    }

    setSubmittingReview(true);

    try {
      if (userReview) {
        // Update existing review
        await apiClient.updateReview(userReview.id, reviewForm.rating, reviewForm.comment);
        Alert.alert('Success', 'Review updated successfully!');
      } else {
        // Create new review
        await apiClient.createReview(bookId, userId, reviewForm.rating, reviewForm.comment);
        Alert.alert('Success', 'Review submitted successfully!');
      }

      setShowReviewModal(false);
      setReviewForm({ rating: 0, comment: '' });

      // Refresh reviews
      const reviewsResponse = await apiClient.getReviews(bookId);
      setBookReviews(reviewsResponse.reviews || []);
      
      // Update user review
      const updatedUserReview = reviewsResponse.reviews?.find(
        (r) => r.userId === userId
      );
      setUserReview(updatedUserReview || null);
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  }, [reviewForm, userId, bookId, userReview]);

  const handleDeleteReview = useCallback(async () => {
    if (!userReview) return;

    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete your review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.deleteReview(userReview.id);
              Alert.alert('Success', 'Review deleted successfully!');
              
              // Refresh reviews
              const reviewsResponse = await apiClient.getReviews(bookId);
              setBookReviews(reviewsResponse.reviews || []);
              setUserReview(null);
            } catch (error) {
              console.error('Error deleting review:', error);
              Alert.alert('Error', 'Failed to delete review. Please try again.');
            }
          },
        },
      ]
    );
  }, [userReview, bookId]);

  const styles = useMemo(() => StyleSheet.create({
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
    writeReviewButton: {
      backgroundColor: themeColors.primary.main,
      margin: 20,
      marginBottom: 12,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    writeReviewButtonText: {
      color: themeColors.text.light,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
    },
    summaryCard: {
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      margin: 20,
      marginBottom: 12,
      marginTop: 0,
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    // Modal styles
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: themeColors.background.primary,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 20,
    },
    ratingInputContainer: {
      marginBottom: 20,
    },
    ratingInputLabel: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 12,
    },
    starContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    starButton: {
      fontSize: 32 * fontSizeMultiplier,
    },
    commentInput: {
      backgroundColor: themeColors.input.background,
      borderWidth: 1,
      borderColor: themeColors.input.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.input.text,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: themeColors.background.secondary,
    },
    submitButton: {
      backgroundColor: themeColors.primary.main,
    },
    modalButtonText: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: themeColors.text.primary,
    },
    submitButtonText: {
      color: themeColors.text.light,
    },
  }), [themeColors, fontSizeMultiplier]);

  const renderReviewItem = useCallback(({ item }) => {
    const isUserReview = userId && item.userId === userId;
    
    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.userName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{item.userName || 'Anonymous'}</Text>
                {item.verified && (
                  <Text style={styles.verifiedBadge}>✓ Verified</Text>
                )}
              </View>
              <Text style={styles.reviewDate}>{formatDate(item.date || item.created_at)}</Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStars}>
              {renderStars(item.rating)}
            </Text>
            <Text style={styles.ratingNumber}>{item.rating}.0</Text>
          </View>
        </View>
        {item.comment && (
          <Text style={styles.reviewComment}>{item.comment}</Text>
        )}
        <View style={styles.reviewActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>👍 {item.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>👎 {item.dislikes || 0}</Text>
          </TouchableOpacity>
          {isUserReview && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteReview}
            >
              <Text style={[styles.actionText, { color: themeColors.error || '#F44336' }]}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [userId, styles, formatDate, renderStars, handleDeleteReview, themeColors.error]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Reviews & Ratings" navigation={navigation} />
      {book && (
        <View style={styles.bookHeader}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>By {book.author?.name || book.author_name || 'Unknown Author'}</Text>
        </View>
      )}

      {/* Write Review Button - Only for readers */}
      {isReader && userId && (
        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={handleOpenReviewModal}
        >
          <Text style={styles.writeReviewButtonText}>
            {userReview ? '✏️ Edit Your Review' : '⭐ Write a Review'}
          </Text>
        </TouchableOpacity>
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
      {error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>Error</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
        </View>
      ) : bookReviews.length > 0 ? (
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
            {isReader ? 'Be the first to review this book!' : 'No reviews available for this book.'}
          </Text>
        </View>
      )}

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {userReview ? 'Edit Your Review' : 'Write a Review'}
            </Text>

            <View style={styles.ratingInputContainer}>
              <Text style={styles.ratingInputLabel}>Rating *</Text>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setReviewForm({ ...reviewForm, rating: star })}
                  >
                    <Text style={styles.starButton}>
                      {star <= reviewForm.rating ? '⭐' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Write your review (optional)"
              placeholderTextColor={themeColors.input.placeholder}
              value={reviewForm.comment}
              onChangeText={(text) => setReviewForm({ ...reviewForm, comment: text })}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowReviewModal(false)}
                disabled={submittingReview}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReview}
                disabled={submittingReview || !reviewForm.rating}
              >
                {submittingReview ? (
                  <ActivityIndicator color={themeColors.text.light} />
                ) : (
                  <Text style={[styles.modalButtonText, styles.submitButtonText]}>
                    {userReview ? 'Update' : 'Submit'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ReviewsScreen;
