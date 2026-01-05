/**
 * Order History Screen
 */

import React, { useState, useEffect } from 'react';
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
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const OrderHistoryScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { userId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await apiClient.getOrders(userId);
        setOrders(response.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return themeColors.success || '#4CAF50';
      case 'pending':
        return themeColors.warning || '#FF9800';
      case 'cancelled':
        return themeColors.error || '#F44336';
      default:
        return themeColors.text.secondary;
    }
  };

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
    orderCard: {
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 12,
      padding: 16,
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
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    orderNumber: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    orderDate: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12 * fontSizeMultiplier,
      fontWeight: '600',
    },
    booksContainer: {
      marginBottom: 16,
    },
    bookItem: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    bookCover: {
      width: 60,
      height: 90,
      borderRadius: 6,
      backgroundColor: themeColors.background.secondary,
      marginRight: 12,
    },
    bookInfo: {
      flex: 1,
      justifyContent: 'center',
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
      marginBottom: 4,
    },
    bookPrice: {
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.primary.main,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: themeColors.border?.light || '#E0E0E0',
    },
    paymentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    paymentLabel: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginRight: 4,
    },
    paymentMethod: {
      fontSize: 12 * fontSizeMultiplier,
      fontWeight: '500',
      color: themeColors.text.primary,
    },
    totalContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginRight: 8,
    },
    totalAmount: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.primary.main,
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

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {
        // Navigate to order details if needed
        console.log('Order details:', item.orderNumber);
      }}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.booksContainer}>
        {item.books.map((book, index) => (
          <View key={book.id} style={styles.bookItem}>
            <Image
              source={{ uri: book.cover }}
              style={styles.bookCover}
              resizeMode="cover"
            />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={styles.bookAuthor}>{book.author.name}</Text>
              <Text style={styles.bookPrice}>
                {book.isFree ? 'Free' : `₹${book.price}`}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentLabel}>Payment:</Text>
          <Text style={styles.paymentMethod}>
            {item.paymentMethod || 'UPI'}
          </Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₹{item.total}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Order History" navigation={navigation} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={themeColors.primary.main} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Order History" navigation={navigation} />
      <View style={styles.contentHeader}>
        <Text style={styles.title}>Order History</Text>
        <Text style={styles.subtitle}>{orders.length} orders</Text>
      </View>
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubtext}>
            Your order history will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

export default OrderHistoryScreen;

