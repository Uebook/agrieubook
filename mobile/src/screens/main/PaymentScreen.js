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
const RAZORPAY_KEY_ID = 'rzp_test_S10srfDgCfFXIL';

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

      console.log('💳 Initiating payment directly with Razorpay:', {
        amount: itemPrice,
        bookId,
        audioBookId,
        userId,
      });

      // Open Razorpay Checkout directly - No order creation API call needed
      // Razorpay will create the order internally
      const paymentAmount = Math.round(itemPrice * 100); // Convert to paise
      const email = userData?.email || '';

      const options = {
        description: 'Order Payment',
        image: item.cover_image_url || item.cover_url || 'https://i.imgur.com/3l7C2Jn.png',
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
        amount: paymentAmount, // Amount in paise
        name: 'Agriebook',
        prefill: {
          email: email || userData?.email || 'customer@example.com',
          contact: userData?.phone || userData?.mobile || '9999999999',
          name: userData?.name || 'Customer',
        },
        theme: { color: themeColors.primary.main || '#00A86B' },
        // Add timeout for payment
        timeout: 600, // 10 minutes in seconds
        notes: {
          bookId: bookId || '',
          audioBookId: audioBookId || '',
          userId: userId || '',
        },
      };

      console.log('💳 Opening Razorpay native checkout screen with options:', {
        ...options,
        key: options.key.substring(0, 15) + '...', // Don't log full key
      });

      // Check if RazorpayCheckout is available
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        throw new Error('Razorpay SDK is not properly initialized. Please rebuild the app.');
      }

      console.log('✅ RazorpayCheckout is available, opening checkout...');
      console.log('📱 Platform:', Platform.OS);
      console.log('📋 Options:', JSON.stringify({
        ...options,
        key: options.key.substring(0, 15) + '...',
      }, null, 2));

      // Mark payment as pending
      try {
        await AsyncStorage.setItem('pending_razorpay_payment', JSON.stringify({
          orderId: orderResponse.orderId,
          bookId,
          audioBookId,
          userId,
          amount: itemPrice,
          timestamp: Date.now(),
        }));
        setRazorpayOpened(true);
      } catch (storageError) {
        console.warn('⚠️ Failed to save pending payment:', storageError);
        // Continue anyway
      }

      // Set timeout for payment (10 minutes)
      razorpayTimeoutRef.current = setTimeout(async () => {
        const stillPending = await AsyncStorage.getItem('pending_razorpay_payment');
        if (stillPending) {
          // Payment still pending after timeout
          setRazorpayOpened(false);
          Alert.alert(
            'Payment Status',
            'Your payment is being processed. If you completed the payment, your booking will be created. Please check your orders.',
            [
              { text: 'Check Orders', onPress: () => navigation.navigate('Library') },
              { text: 'OK' }
            ]
          );
        }
      }, 10 * 60 * 1000); // 10 minutes

      // Open Razorpay Checkout - This will open a native full-screen payment UI
      console.log('🚀 Calling RazorpayCheckout.open()...');

      try {
        RazorpayCheckout.open(options)
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
            console.log('✅ Payment success data (full):', JSON.stringify(data, null, 2));
            console.log('✅ Payment success data (summary):', {
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_order_id: data.razorpay_order_id,
              razorpay_signature: data.razorpay_signature ? 'present' : 'missing',
              hasOrderId: !!data.razorpay_order_id,
              hasPaymentId: !!data.razorpay_payment_id,
              hasSignature: !!data.razorpay_signature,
            });

            // Validate required data
            if (!data.razorpay_payment_id) {
              throw new Error('Payment ID is missing from Razorpay response');
            }

            setProcessing(true); // Keep loading while creating purchase

            try {
              // Create purchase record directly - no verification needed
              console.log('📦 Creating purchase record:', {
                paymentId: data.razorpay_payment_id,
                userId,
                bookId,
                audioBookId,
                amount: itemPrice,
              });

              // Use purchaseBook API to create the purchase record directly
              const purchaseResponse = await apiClient.purchaseBook(
                userId,
                bookId,
                'razorpay',
                data.razorpay_payment_id,
                audioBookId,
                itemPrice
              );

              console.log('✅ Purchase created successfully:', purchaseResponse);

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
            } catch (purchaseError) {
              console.error('❌ Purchase creation error:', purchaseError);
              Alert.alert(
                'Purchase Error',
                'Your payment was successful, but we encountered an issue creating your purchase. Please contact support with your payment ID: ' + (data.razorpay_payment_id || 'N/A'),
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
          })
          .catch((openError) => {
            // This catches errors from RazorpayCheckout.open() itself
            console.error('❌ RazorpayCheckout.open() failed:', openError);
            setProcessing(false);
            setRazorpayOpened(false);

            // Clear timeout
            if (razorpayTimeoutRef.current) {
              clearTimeout(razorpayTimeoutRef.current);
              razorpayTimeoutRef.current = null;
            }

            // Clear pending payment
            AsyncStorage.removeItem('pending_razorpay_payment').catch(() => { });

            Alert.alert(
              'Payment Error',
              `Failed to open payment gateway: ${openError.message || 'Unknown error'}\n\nPlease try again or contact support.`,
              [{ text: 'OK' }]
            );
          });
      } catch (openError) {
        // Catch synchronous errors when calling open()
        console.error('❌ Error calling RazorpayCheckout.open():', openError);
        setProcessing(false);
        setRazorpayOpened(false);

        // Clear timeout
        if (razorpayTimeoutRef.current) {
          clearTimeout(razorpayTimeoutRef.current);
          razorpayTimeoutRef.current = null;
        }

        Alert.alert(
          'Payment Error',
          `Failed to initialize payment: ${openError.message || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
      }
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
