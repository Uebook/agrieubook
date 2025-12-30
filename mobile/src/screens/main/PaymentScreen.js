/**
 * Payment Screen - Payment gateway integration
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';

const PaymentScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Payment" navigation={navigation} />
      <View style={styles.content}>
        {/* Payment integration will be implemented */}
      </View>
    </View>
  );
};

export default PaymentScreen;

