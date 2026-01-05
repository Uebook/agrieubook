/**
 * Wishlist Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const WishlistScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { userId } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await apiClient.getWishlist(userId);
        setWishlist(response.books || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [userId]);

  const removeFromWishlist = async (bookId) => {
    if (!userId) return;
    try {
      await apiClient.removeFromWishlist(userId, bookId);
      setWishlist(wishlist.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      Alert.alert('Error', 'Failed to remove from wishlist');
    }
  };

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
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
            <Text style={styles.reviews}>({item.reviews})</Text>
          </View>
          <Text style={styles.price}>
            {item.isFree ? 'Free' : `₹${item.price}`}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => navigation.navigate('Payment', { bookId: item.id })}
          >
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromWishlist(item.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    contentHeader: {
      padding: 20,
      paddingBottom: 12,
    },
    title: {
      fontSize: 28 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    listContent: {
      padding: 20,
      paddingTop: 8,
    },
    bookCard: {
      flexDirection: 'row',
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    bookCover: {
      width: 100,
      height: 150,
      borderRadius: 8,
      backgroundColor: themeColors.background.secondary,
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
    bookMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rating: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.primary,
      marginRight: 4,
    },
    reviews: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    price: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.primary.main,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    buyButton: {
      flex: 1,
      backgroundColor: themeColors.button.primary,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
    },
    buyButtonText: {
      color: themeColors.button.text,
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
    },
    removeButton: {
      flex: 1,
      backgroundColor: themeColors.background.tertiary,
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    removeButtonText: {
      color: themeColors.text.secondary,
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
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
      marginBottom: 24,
    },
    browseButton: {
      backgroundColor: themeColors.button.primary,
      borderRadius: 8,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    browseButtonText: {
      color: themeColors.button.text,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="My Wishlist" navigation={navigation} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={themeColors.primary.main} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Wishlist" navigation={navigation} />
      <View style={styles.contentHeader}>
        <Text style={styles.title}>My Wishlist</Text>
        <Text style={styles.subtitle}>
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
      {wishlist.length > 0 ? (
        <FlatList
          data={wishlist}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtext}>
            Add books you want to read later
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('BookStore')}
          >
            <Text style={styles.browseButtonText}>Browse Books</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


export default WishlistScreen;

