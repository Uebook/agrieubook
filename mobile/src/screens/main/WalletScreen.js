/**
 * Wallet Screen for Authors
 * Shows wallet balance, earnings, withdrawal options, and payment history
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
  Modal,
  TextInput,
} from 'react-native';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const WalletScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, payments, withdrawals
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [bankDetails, setBankDetails] = useState({
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    bank_name: '',
  });
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, [userId]);

  const fetchWalletData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await apiClient.getWallet(userId);
      if (response.success) {
        setWallet(response.wallet);
        setRecentPayments(response.recent_payments || []);
        setPendingWithdrawals(response.pending_withdrawals || []);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amount = parseFloat(withdrawAmount);

    if (amount > wallet.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (paymentMethod === 'bank') {
      if (!bankDetails.bank_account_name || !bankDetails.bank_account_number || !bankDetails.bank_ifsc || !bankDetails.bank_name) {
        Alert.alert('Error', 'Please fill all bank details');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        Alert.alert('Error', 'Please enter UPI ID');
        return;
      }
    }

    try {
      setProcessing(true);
      const paymentDetails = paymentMethod === 'bank' ? bankDetails : { upi_id: upiId };
      
      const response = await apiClient.requestWithdrawal(userId, amount, {
        payment_method: paymentMethod,
        ...paymentDetails,
      });

      if (response.success) {
        Alert.alert('Success', 'Withdrawal request submitted successfully. It will be processed within 3-5 business days.');
        setWithdrawModalVisible(false);
        setWithdrawAmount('');
        setBankDetails({ bank_account_name: '', bank_account_number: '', bank_ifsc: '', bank_name: '' });
        setUpiId('');
        fetchWalletData();
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      Alert.alert('Error', error.message || 'Failed to submit withdrawal request');
    } finally {
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
    balanceCard: {
      backgroundColor: themeColors.primary.main,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
    },
    balanceLabel: {
      fontSize: 14 * fontSizeMultiplier,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 8,
    },
    balanceAmount: {
      fontSize: 36 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 16,
    },
    balanceStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    statItem: {
      flex: 1,
    },
    statLabel: {
      fontSize: 12 * fontSizeMultiplier,
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    withdrawButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    withdrawButtonText: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.primary.main,
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
      borderRadius: 8,
    },
    tabActive: {
      backgroundColor: themeColors.primary.main,
    },
    tabText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: '500',
    },
    tabTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    listItem: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    listItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    listItemTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      flex: 1,
    },
    listItemAmount: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.primary.main,
    },
    listItemDate: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 4,
    },
    listItemDetails: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 4,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    statusPending: {
      backgroundColor: '#FFF3CD',
    },
    statusApproved: {
      backgroundColor: '#D1E7DD',
    },
    statusCompleted: {
      backgroundColor: '#D1E7DD',
    },
    statusRejected: {
      backgroundColor: '#F8D7DA',
    },
    statusText: {
      fontSize: 11 * fontSizeMultiplier,
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    input: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 12,
      padding: 16,
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.primary,
      marginBottom: 16,
    },
    paymentMethodContainer: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    paymentMethodButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
      borderWidth: 2,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    paymentMethodButtonActive: {
      borderColor: themeColors.primary.main,
      backgroundColor: themeColors.primary.light || themeColors.background.secondary,
    },
    modalButton: {
      backgroundColor: themeColors.primary.main,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    modalButtonText: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyStateText: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 16,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="My Wallet" navigation={navigation} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={themeColors.primary.main} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Wallet" navigation={navigation} />
      <ScrollView style={styles.content}>
        {/* Balance Card */}
        {wallet && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₹{wallet.balance.toFixed(2)}</Text>
            <View style={styles.balanceStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Earnings</Text>
                <Text style={styles.statValue}>₹{wallet.total_earnings.toFixed(2)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Withdrawn</Text>
                <Text style={styles.statValue}>₹{wallet.total_withdrawn.toFixed(2)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={() => setWithdrawModalVisible(true)}
              disabled={wallet.balance <= 0}
            >
              <Text style={styles.withdrawButtonText}>
                {wallet.balance <= 0 ? 'No Balance Available' : 'Request Withdrawal'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'payments' && styles.tabActive]}
            onPress={() => setActiveTab('payments')}
          >
            <Text style={[styles.tabText, activeTab === 'payments' && styles.tabTextActive]}>
              Payments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'withdrawals' && styles.tabActive]}
            onPress={() => setActiveTab('withdrawals')}
          >
            <Text style={[styles.tabText, activeTab === 'withdrawals' && styles.tabTextActive]}>
              Withdrawals
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <>
            {pendingWithdrawals.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18 * fontSizeMultiplier, fontWeight: '600', color: themeColors.text.primary, marginBottom: 12 }}>
                  Pending Withdrawals
                </Text>
                {pendingWithdrawals.map((withdrawal) => (
                  <View key={withdrawal.id} style={styles.listItem}>
                    <View style={styles.listItemHeader}>
                      <Text style={styles.listItemTitle}>Withdrawal Request</Text>
                      <Text style={styles.listItemAmount}>₹{parseFloat(withdrawal.amount).toFixed(2)}</Text>
                    </View>
                    <Text style={styles.listItemDate}>
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </Text>
                    <View style={[styles.statusBadge, styles.statusPending]}>
                      <Text style={[styles.statusText, { color: '#856404' }]}>Pending</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            {recentPayments.length > 0 && (
              <View>
                <Text style={{ fontSize: 18 * fontSizeMultiplier, fontWeight: '600', color: themeColors.text.primary, marginBottom: 12 }}>
                  Recent Payments
                </Text>
                {recentPayments.slice(0, 5).map((payment) => (
                  <View key={payment.id} style={styles.listItem}>
                    <View style={styles.listItemHeader}>
                      <Text style={styles.listItemTitle}>
                        {payment.book?.title || payment.audio_book?.title || 'Book Sale'}
                      </Text>
                      <Text style={styles.listItemAmount}>₹{parseFloat(payment.author_earnings).toFixed(2)}</Text>
                    </View>
                    <Text style={styles.listItemDate}>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </Text>
                    <Text style={styles.listItemDetails}>
                      Gross: ₹{parseFloat(payment.gross_amount).toFixed(2)} | 
                      GST: ₹{parseFloat(payment.gst_amount).toFixed(2)} | 
                      Commission: ₹{parseFloat(payment.platform_commission).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === 'payments' && (
          <>
            {recentPayments.length > 0 ? (
              recentPayments.map((payment) => (
                <View key={payment.id} style={styles.listItem}>
                  <View style={styles.listItemHeader}>
                    <Text style={styles.listItemTitle}>
                      {payment.book?.title || payment.audio_book?.title || 'Book Sale'}
                    </Text>
                    <Text style={styles.listItemAmount}>₹{parseFloat(payment.author_earnings).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.listItemDate}>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={styles.listItemDetails}>
                    Gross: ₹{parseFloat(payment.gross_amount).toFixed(2)} | 
                    GST: ₹{parseFloat(payment.gst_amount).toFixed(2)} | 
                    Commission: ₹{parseFloat(payment.platform_commission).toFixed(2)}
                  </Text>
                  {payment.buyer && (
                    <Text style={styles.listItemDetails}>
                      Buyer: {payment.buyer.name}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No payment history yet</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'withdrawals' && (
          <>
            {pendingWithdrawals.length > 0 ? (
              pendingWithdrawals.map((withdrawal) => (
                <View key={withdrawal.id} style={styles.listItem}>
                  <View style={styles.listItemHeader}>
                    <Text style={styles.listItemTitle}>Withdrawal Request</Text>
                    <Text style={styles.listItemAmount}>₹{parseFloat(withdrawal.amount).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.listItemDate}>
                    {new Date(withdrawal.created_at).toLocaleDateString()}
                  </Text>
                  <View style={[styles.statusBadge, styles.statusPending]}>
                    <Text style={[styles.statusText, { color: '#856404' }]}>Pending</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No withdrawal requests yet</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Withdrawal Modal */}
      <Modal
        visible={withdrawModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Withdrawal</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor={themeColors.text.secondary}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
            />

            <View style={styles.paymentMethodContainer}>
              <TouchableOpacity
                style={[styles.paymentMethodButton, paymentMethod === 'bank' && styles.paymentMethodButtonActive]}
                onPress={() => setPaymentMethod('bank')}
              >
                <Text style={[styles.tabText, paymentMethod === 'bank' && styles.tabTextActive]}>Bank</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentMethodButton, paymentMethod === 'upi' && styles.paymentMethodButtonActive]}
                onPress={() => setPaymentMethod('upi')}
              >
                <Text style={[styles.tabText, paymentMethod === 'upi' && styles.tabTextActive]}>UPI</Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === 'bank' ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Account Holder Name"
                  placeholderTextColor={themeColors.text.secondary}
                  value={bankDetails.bank_account_name}
                  onChangeText={(text) => setBankDetails({ ...bankDetails, bank_account_name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Account Number"
                  placeholderTextColor={themeColors.text.secondary}
                  value={bankDetails.bank_account_number}
                  onChangeText={(text) => setBankDetails({ ...bankDetails, bank_account_number: text })}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="IFSC Code"
                  placeholderTextColor={themeColors.text.secondary}
                  value={bankDetails.bank_ifsc}
                  onChangeText={(text) => setBankDetails({ ...bankDetails, bank_ifsc: text.toUpperCase() })}
                  autoCapitalize="characters"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Bank Name"
                  placeholderTextColor={themeColors.text.secondary}
                  value={bankDetails.bank_name}
                  onChangeText={(text) => setBankDetails({ ...bankDetails, bank_name: text })}
                />
              </>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="UPI ID (e.g., yourname@paytm)"
                placeholderTextColor={themeColors.text.secondary}
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
              />
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleWithdraw}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalButtonText}>Submit Request</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setWithdrawModalVisible(false)}
              style={{ marginTop: 12, alignItems: 'center' }}
            >
              <Text style={{ color: themeColors.text.secondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WalletScreen;
