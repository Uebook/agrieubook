/**
 * Settings Context
 * Manages app-wide settings: theme, language, font size
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import Colors from '../../color';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('light'); // 'light', 'dark', 'auto'
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('medium'); // 'small', 'medium', 'large'

  // Calculate actual theme based on preference
  const actualTheme = theme === 'auto' ? systemColorScheme || 'light' : theme;
  const isDark = actualTheme === 'dark';

  // Get font size multiplier
  const fontSizeMultiplier = {
    small: 0.9,
    medium: 1.0,
    large: 1.15,
  };

  // Get current font size multiplier
  const getFontSizeMultiplier = () => fontSizeMultiplier[fontSize] || 1.0;

  // Get theme colors
  const getThemeColors = () => {
    if (isDark) {
      return {
        background: {
          primary: '#1A1A1A',
          secondary: '#2A2A2A',
          tertiary: '#3A3A3A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#CCCCCC',
          tertiary: '#999999',
          light: '#FFFFFF',
        },
        border: {
          light: '#333333',
          dark: '#444444',
        },
        card: {
          background: '#2A2A2A',
          border: '#333333',
        },
        input: {
          background: '#2A2A2A',
          border: '#333333',
          text: '#FFFFFF',
          placeholder: '#666666',
        },
        button: {
          primary: Colors.primary?.main || '#4CAF50',
          text: '#FFFFFF',
        },
        primary: {
          main: Colors.primary?.main || '#4CAF50',
        },
        error: Colors.error || '#F44336',
      };
    }
    return Colors;
  };

  // Translations
  const translations = {
    English: {
      home: 'Home',
      search: 'Search',
      library: 'Library',
      profile: 'Profile',
      settings: 'Settings',
      notifications: 'Notifications',
      trending: 'Trending Now',
      continueReading: 'Continue Reading',
      browseCategories: 'Browse Categories',
      seeAll: 'See All',
      goodMorning: 'Good Morning',
      goodAfternoon: 'Good Afternoon',
      goodEvening: 'Good Evening',
    },
    Hindi: {
      home: 'होम',
      search: 'खोज',
      library: 'लाइब्रेरी',
      profile: 'प्रोफ़ाइल',
      settings: 'सेटिंग्स',
      notifications: 'सूचनाएं',
      trending: 'ट्रेंडिंग',
      continueReading: 'पढ़ना जारी रखें',
      browseCategories: 'श्रेणियां ब्राउज़ करें',
      seeAll: 'सभी देखें',
      goodMorning: 'सुप्रभात',
      goodAfternoon: 'नमस्कार',
      goodEvening: 'सुसंध्या',
    },
    Marathi: {
      home: 'होम',
      search: 'शोध',
      library: 'लायब्ररी',
      profile: 'प्रोफाइल',
      settings: 'सेटिंग्ज',
      notifications: 'सूचना',
      trending: 'ट्रेंडिंग',
      continueReading: 'वाचन सुरू ठेवा',
      browseCategories: 'श्रेणी ब्राउझ करा',
      seeAll: 'सर्व पहा',
      goodMorning: 'सुप्रभात',
      goodAfternoon: 'नमस्कार',
      goodEvening: 'संध्याकाळ',
    },
    Tamil: {
      home: 'வீடு',
      search: 'தேடல்',
      library: 'நூலகம்',
      profile: 'சுயவிவரம்',
      settings: 'அமைப்புகள்',
      notifications: 'அறிவிப்புகள்',
      trending: 'பிரபலமான',
      continueReading: 'வாசிப்பைத் தொடரவும்',
      browseCategories: 'வகைகளை உலாவு',
      seeAll: 'அனைத்தையும் பார்',
      goodMorning: 'காலை வணக்கம்',
      goodAfternoon: 'மதிய வணக்கம்',
      goodEvening: 'மாலை வணக்கம்',
    },
    Telugu: {
      home: 'హోమ్',
      search: 'శోధన',
      library: 'లైబ్రరీ',
      profile: 'ప్రొఫైల్',
      settings: 'సెట్టింగ్‌లు',
      notifications: 'నోటిఫికేషన్‌లు',
      trending: 'ట్రెండింగ్',
      continueReading: 'చదవడం కొనసాగించండి',
      browseCategories: 'వర్గాలను బ్రౌజ్ చేయండి',
      seeAll: 'అన్నీ చూడండి',
      goodMorning: 'శుభోదయం',
      goodAfternoon: 'శుభ మధ్యాహ్నం',
      goodEvening: 'శుభ సాయంత్రం',
    },
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['English'][key] || key;
  };

  const value = {
    theme,
    setTheme,
    language,
    setLanguage,
    fontSize,
    setFontSize,
    actualTheme,
    isDark,
    getFontSizeMultiplier,
    getThemeColors,
    t,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

