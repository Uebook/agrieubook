/**
 * Bottom Tab Navigation
 * Main navigation tabs for the app
 */

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import HomeScreen from '../screens/main/HomeScreen';
import BookStoreScreen from '../screens/main/BookStoreScreen';
import LibraryScreen from '../screens/main/LibraryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { getThemeColors, getFontSizeMultiplier, t } = useSettings();
  const { userRole } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const isAuthor = userRole === 'author';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: themeColors.primary.main,
        tabBarInactiveTintColor: themeColors.text.tertiary,
        tabBarStyle: {
          backgroundColor: themeColors.background.primary,
          borderTopColor: themeColors.border?.light || '#E0E0E0',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12 * fontSizeMultiplier,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: t('home'),
          tabBarLabel: t('home'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 * fontSizeMultiplier }}>🏠</Text>,
        }}
      />
      <Tab.Screen 
        name="BookStore" 
        component={BookStoreScreen}
        options={{
          title: t('search'),
          tabBarLabel: t('search'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 * fontSizeMultiplier }}>📚</Text>,
        }}
      />
      {!isAuthor && (
        <Tab.Screen 
          name="Library" 
          component={LibraryScreen}
          options={{
            title: t('library'),
            tabBarLabel: t('library'),
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 * fontSizeMultiplier }}>📖</Text>,
          }}
        />
      )}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: t('profile'),
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 * fontSizeMultiplier }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

