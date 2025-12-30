/**
 * Reusable Header Component with Back Button
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useSettings } from '../../context/SettingsContext';

const Header = ({ title, navigation, showBack = true, rightComponent }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();

  const dynamicStyles = StyleSheet.create({
    safeArea: {
      backgroundColor: themeColors.primary.main,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: themeColors.primary.main,
      minHeight: 56,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    backIcon: {
      fontSize: 24 * fontSizeMultiplier,
      color: themeColors.text.light,
      fontWeight: 'bold',
    },
    title: {
      fontSize: 20 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.light,
      flex: 1,
    },
    rightSection: {
      marginLeft: 8,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.leftSection}>
          {showBack && navigation && (
            <TouchableOpacity
              style={dynamicStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={dynamicStyles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={dynamicStyles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {rightComponent && <View style={dynamicStyles.rightSection}>{rightComponent}</View>}
      </View>
    </SafeAreaView>
  );
};

export default Header;

