/**
 * useThemeStyles Hook
 * Provides theme-aware styles and font size multipliers
 */

import { StyleSheet } from 'react-native';
import { useSettings } from '../context/SettingsContext';

export const useThemeStyles = () => {
  const { getThemeColors, getFontSizeMultiplier, t } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();

  const createDynamicStyles = (baseStyles) => {
    const dynamicStyles = {};
    
    Object.keys(baseStyles).forEach((key) => {
      const style = baseStyles[key];
      const dynamicStyle = {};
      
      // Apply font size multiplier to fontSize properties
      if (style.fontSize) {
        dynamicStyle.fontSize = style.fontSize * fontSizeMultiplier;
      }
      
      // Apply theme colors
      if (style.color && typeof style.color === 'string') {
        if (style.color.includes('text.primary')) {
          dynamicStyle.color = themeColors.text.primary;
        } else if (style.color.includes('text.secondary')) {
          dynamicStyle.color = themeColors.text.secondary;
        } else if (style.color.includes('text.tertiary')) {
          dynamicStyle.color = themeColors.text.tertiary;
        } else if (style.color.includes('text.light')) {
          dynamicStyle.color = themeColors.text.light;
        } else if (style.color.includes('primary.main')) {
          dynamicStyle.color = themeColors.primary.main;
        } else if (style.color.includes('error')) {
          dynamicStyle.color = themeColors.error;
        }
      }
      
      if (style.backgroundColor && typeof style.backgroundColor === 'string') {
        if (style.backgroundColor.includes('background.primary')) {
          dynamicStyle.backgroundColor = themeColors.background.primary;
        } else if (style.backgroundColor.includes('background.secondary')) {
          dynamicStyle.backgroundColor = themeColors.background.secondary;
        } else if (style.backgroundColor.includes('background.tertiary')) {
          dynamicStyle.backgroundColor = themeColors.background.tertiary;
        } else if (style.backgroundColor.includes('card.background')) {
          dynamicStyle.backgroundColor = themeColors.card?.background || themeColors.background.secondary;
        }
      }
      
      if (style.borderColor && typeof style.borderColor === 'string') {
        if (style.borderColor.includes('border.light')) {
          dynamicStyle.borderColor = themeColors.border?.light || '#E0E0E0';
        } else if (style.borderColor.includes('border.dark')) {
          dynamicStyle.borderColor = themeColors.border?.dark || '#CCCCCC';
        } else if (style.borderColor.includes('card.border')) {
          dynamicStyle.borderColor = themeColors.card?.border || themeColors.border?.light || '#E0E0E0';
        }
      }
      
      // Merge with original style
      dynamicStyles[key] = { ...style, ...dynamicStyle };
    });
    
    return StyleSheet.create(dynamicStyles);
  };

  return {
    themeColors,
    fontSizeMultiplier,
    createDynamicStyles,
    t,
    isDark: themeColors.isDark,
  };
};

