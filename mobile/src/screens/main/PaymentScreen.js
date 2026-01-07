/**
 * Payment Screen - Razorpay payment integration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

// Razorpay test key
const RAZORPAY_KEY_ID = 'rzp_test_1DP5mmOlF5G5ag';

const PaymentScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { bookId, audioBookId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState(null);
  const [audioBook, setAudioBook] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Fetch book or audio book details
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        if (bookId) {
          const response = await apiClient.getBook(bookId);
          setBook(response.book);
        } else if (audioBookId) {
          const response = await apiClient.getAudioBook(audioBookId);
          setAudioBook(response.audioBook);
        }
      } catch (error) {
        console.error('Error fetching item details:', error);
        Alert.alert('Error', 'Failed to load item details');
        navigation.goBack();
      }
    };

    fetchItemDetails();
  }, [bookId, audioBookId]);

  const item = book || audioBook;
  const itemPrice = item?.price || 0;
  const isFree = item?.is_free || itemPrice === 0;

  const handlePayment = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please login to purchase');
      return;
    }

    if (isFree) {
      // Handle free book purchase
      try {
        setProcessing(true);
        await apiClient.verifyRazorpayPayment(
          'free',
          'free',
          'free',
          userId,
          bookId,
          audioBookId,
          0
        );
        Alert.alert('Success', 'Book added to your library!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (error) {
        console.error('Error processing free book:', error);
        Alert.alert('Error', 'Failed to add book to library');
      } finally {
        setProcessing(false);
      }
      return;
    }

    try {
      setProcessing(true);

      console.log('💳 Initiating payment:', {
        amount: itemPrice,
        bookId,
        audioBookId,
        userId,
      });

      // Step 1: Create Razorpay order
      let orderResponse;
      try {
        orderResponse = await apiClient.createRazorpayOrder(
          itemPrice,
          bookId,
          audioBookId,
          userId
        );
        console.log('✅ Order created:', orderResponse);
      } catch (orderError) {
        console.error('❌ Order creation error:', orderError);
        const errorMessage = orderError.message || 'Failed to create payment order';
        throw new Error(`Payment initiation error: ${errorMessage}`);
      }

      if (!orderResponse || !orderResponse.orderId) {
        throw new Error('Invalid order response: orderId is missing');
      }

      // Step 2: Open Razorpay Checkout
      const options = {
        description: `Purchase: ${item.title}`,
        image: item.cover_image_url || item.cover_url,
        currency: 'INR',
        key: orderResponse.key || RAZORPAY_KEY_ID,
        amount: orderResponse.amount, // Amount in paise
        name: 'Agribook',
        order_id: orderResponse.orderId,
        prefill: {
          email: '', // You can prefill user email if available
          contact: '', // You can prefill user contact if available
          name: '', // You can prefill user name if available
        },
        theme: { color: themeColors.primary.main || '#10B981' },
      };

      console.log('💳 Opening Razorpay checkout with options:', options);

      RazorpayCheckout.open(options)
        .then(async (data) => {
          // Payment success
          console.log('✅ Payment success:', data);
          
          try {
            // Verify payment with backend
            const verifyResponse = await apiClient.verifyRazorpayPayment(
              data.razorpay_order_id,
              data.razorpay_payment_id,
              data.razorpay_signature,
              userId,
              bookId,
              audioBookId,
              itemPrice
            );

            if (verifyResponse.success) {
              Alert.alert('Success', 'Payment successful! Book added to your library.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            Alert.alert(
              'Error',
              'Payment was successful but verification failed. Please contact support.',
              [{ text: 'OK' }]
            );
          } finally {
            setProcessing(false);
          }
        })
        .catch((error) => {
          // Payment failed or user cancelled
          console.error('❌ Payment error:', error);
          setProcessing(false);
          
          if (error.code === 'NETWORK_ERROR') {
            Alert.alert('Error', 'Network error. Please check your internet connection.');
          } else if (error.description === 'Payment cancelled') {
            // User cancelled - don't show error
            console.log('Payment cancelled by user');
          } else {
            Alert.alert('Payment Failed', error.description || 'Payment could not be completed. Please try again.');
          }
        });
    } catch (error) {
      console.error('❌ Payment initiation error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        details: error.details,
        stack: error.stack,
      });
      
      let errorMessage = error.message || 'Failed to initiate payment';
      
      // Provide more helpful error messages
      if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.details) {
        errorMessage = `${errorMessage}\n\nDetails: ${error.details}`;
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      }
      
      Alert.alert('Payment Error', errorMessage, [{ text: 'OK' }]);
      setProcessing(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    itemCard: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    itemTitle: {
      fontSize: 20 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 8,
    },
    itemAuthor: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 16,
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: themeColors.border?.light || '#E0E0E0',
    },
    priceLabel: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    price: {
      fontSize: 24 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.primary.main,
    },
    payButton: {
      backgroundColor: themeColors.primary.main,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    payButtonText: {
      color: themeColors.text.light || '#FFFFFF',
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: '600',
    },
    payButtonDisabled: {
      backgroundColor: themeColors.background.tertiary,
      opacity: 0.6,
    },
    infoText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      textAlign: 'center',
      marginTop: 20,
      padding: 16,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
    },
  });

  if (!item) {
    return (
      <View style={styles.container}>
        <Header title="Payment" navigation={navigation} />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={themeColors.primary.main} />
          <Text style={{ marginTop: 16, color: themeColors.text.secondary }}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Payment" navigation={navigation} />
      <ScrollView style={styles.content}>
        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemAuthor}>
            By {item.author?.name || 'Unknown Author'}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total Amount</Text>
            <Text style={styles.price}>
              {isFree ? 'Free' : `₹${itemPrice}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payButton, (processing || loading) && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={processing || loading}
        >
          {processing || loading ? (
            <ActivityIndicator color={themeColors.text.light || '#FFFFFF'} />
          ) : (
            <Text style={styles.payButtonText}>
              {isFree ? 'Get Free' : 'Pay Now'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          {isFree
            ? 'This item is free. Click "Get Free" to add it to your library.'
            : 'Secure payment powered by Razorpay. Your payment information is encrypted and secure.'}
        </Text>
      </ScrollView>
    </View>
  );
};

export default PaymentScreen;
