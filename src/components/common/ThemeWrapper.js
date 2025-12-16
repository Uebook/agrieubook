/**
 * Theme Wrapper Component
 * Applies theme colors and font size to children
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSettings } from '../../context/SettingsContext';

const ThemeWrapper = ({ children, style }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  
  const wrapperStyle = [
    {
      backgroundColor: themeColors.background.primary,
    },
    style,
  ];

  return <View style={wrapperStyle}>{children}</View>;
};

export default ThemeWrapper;

