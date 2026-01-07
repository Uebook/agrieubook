/**
 * Payment Screen - Razorpay payment integration
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

// Razorpay test key
const RAZORPAY_KEY_ID = 'rzp_test_S10gAhQQEnKuYr';

const PaymentScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userId, userData } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { bookId, audioBookId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState(null);
  const [audioBook, setAudioBook] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [razorpayOpened, setRazorpayOpened] = useState(false);
  const razorpayTimeoutRef = useRef(null);

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
        console.log('📦 Creating Razorpay order with:', {
          amount: itemPrice,
          bookId,
          audioBookId,
          userId,
        });

        orderResponse = await apiClient.createRazorpayOrder(
          itemPrice,
          bookId,
          audioBookId,
          userId
        );

        console.log('✅ Order created successfully:', {
          orderId: orderResponse?.orderId,
          amount: orderResponse?.amount,
          key: orderResponse?.key ? orderResponse.key.substring(0, 15) + '...' : 'missing',
        });
      } catch (orderError) {
        console.error('❌ Order creation error:', {
          message: orderError.message,
          status: orderError.status,
          details: orderError.details,
          error: orderError,
        });
        const errorMessage = orderError.message || orderError.details || 'Failed to create payment order';
        throw new Error(`Payment initiation error: ${errorMessage}`);
      }

      if (!orderResponse || !orderResponse.orderId) {
        console.error('❌ Invalid order response:', orderResponse);
        throw new Error('Invalid order response: orderId is missing');
      }

      // Validate required fields
      if (!orderResponse.amount || orderResponse.amount <= 0) {
        throw new Error('Invalid order amount');
      }

      if (!orderResponse.key && !RAZORPAY_KEY_ID) {
        throw new Error('Razorpay key is missing');
      }

      // Step 2: Open Razorpay Checkout - This opens a native Razorpay screen
      const razorpayOptions = {
        description: `Purchase: ${item.title}`,
        image: item.cover_image_url || item.cover_url || 'https://i.imgur.com/3l7C2Jn.png',
        currency: 'INR',
        key: orderResponse.key || RAZORPAY_KEY_ID,
        amount: orderResponse.amount, // Amount in paise (already in paise from API)
        name: 'Agribook',
        order_id: orderResponse.orderId,
        prefill: {
          email: '', // You can prefill user email if available
          contact: '', // You can prefill user contact if available
          name: '', // You can prefill user name if available
        },
        theme: {
          color: themeColors.primary.main || '#10B981',
        },
        notes: {
          bookId: bookId || '',
          audioBookId: audioBookId || '',
          userId: userId || '',
        },
        // Modal options for better UX
        modal: {
          ondismiss: () => {
            console.log('Razorpay checkout dismissed by user');
            setProcessing(false);
          },
        },
      };

      console.log('💳 Opening Razorpay native checkout screen with options:', {
        ...razorpayOptions,
        key: razorpayOptions.key.substring(0, 15) + '...', // Don't log full key
      });

      // Check if RazorpayCheckout is available
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        throw new Error('Razorpay SDK is not properly initialized. Please rebuild the app.');
      }

      console.log('✅ RazorpayCheckout is available, opening checkout...');
      console.log('📱 Platform:', Platform.OS);

      // Open Razorpay Checkout - This will open a native full-screen payment UI
      // Wrap in try-catch to catch any immediate errors
      RazorpayCheckout.open(razorpayOptions)
        .then(async (data) => {
          // Clear timeout
          if (razorpayTimeoutRef.current) {
            clearTimeout(razorpayTimeoutRef.current);
            razorpayTimeoutRef.current = null;
          }

          // Clear pending payment
          await AsyncStorage.removeItem('pending_razorpay_payment');
          setRazorpayOpened(false);

          // Payment success - Razorpay SDK returns payment data
          console.log('✅ Payment success data:', {
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature ? 'present' : 'missing',
          });

          setProcessing(true); // Keep loading while verifying

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

            console.log('✅ Payment verification response:', verifyResponse);

            if (verifyResponse.success) {
              Alert.alert(
                'Payment Successful! 🎉',
                'Your payment was successful and the book has been added to your library.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back and refresh if needed
                      navigation.goBack();
                    }
                  },
                ]
              );
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyError) {
            console.error('❌ Payment verification error:', verifyError);
            Alert.alert(
              'Verification Error',
              'Your payment was successful, but we encountered an issue verifying it. Please contact support with your payment ID: ' + (data.razorpay_payment_id || 'N/A'),
              [{ text: 'OK' }]
            );
          } finally {
            setProcessing(false);
          }
        })
        .catch(async (error) => {
          // Clear timeout
          if (razorpayTimeoutRef.current) {
            clearTimeout(razorpayTimeoutRef.current);
            razorpayTimeoutRef.current = null;
          }

          // Clear pending payment on error (unless it's just a cancellation)
          if (error.code !== 2 && error.description !== 'Payment cancelled') {
            await AsyncStorage.removeItem('pending_razorpay_payment');
          }
          setRazorpayOpened(false);

          // Payment failed or user cancelled
          console.error('❌ Razorpay checkout error:', {
            code: error.code,
            description: error.description,
            message: error.message,
            error: error,
          });

          setProcessing(false);

          // Handle different error types
          if (error.code === 'NETWORK_ERROR') {
            Alert.alert(
              'Network Error',
              'Please check your internet connection and try again.',
              [{ text: 'OK' }]
            );
          } else if (error.code === 'BAD_REQUEST_ERROR') {
            Alert.alert(
              'Payment Error',
              error.description || 'Invalid payment request. Please try again.',
              [{ text: 'OK' }]
            );
          } else if (error.description === 'Payment cancelled' || error.code === 'PAYMENT_CANCELLED' || error.code === 2) {
            // User cancelled - don't show error, just log
            console.log('Payment cancelled by user');
            // Optionally show a message
            // Alert.alert('Payment Cancelled', 'You cancelled the payment.', [{ text: 'OK' }]);
          } else {
            Alert.alert(
              'Payment Failed',
              error.description || error.message || 'Payment could not be completed. Please try again.',
              [{ text: 'OK' }]
            );
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
