/**
 * App Status Bar Component
 * Updates StatusBar based on theme settings
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { useSettings } from '../../context/SettingsContext';

const AppStatusBar = () => {
  const { isDark, getThemeColors } = useSettings();
  const themeColors = getThemeColors();

  return (
    <StatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor={themeColors.background.primary}
    />
  );
};

export default AppStatusBar;

