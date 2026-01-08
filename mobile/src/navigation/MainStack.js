/**
 * Main App Navigation Stack
 * Handles main app screens after authentication
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import BookDetailScreen from '../screens/main/BookDetailScreen';
import ReaderScreen from '../screens/reader/ReaderScreen';
import SearchScreen from '../screens/main/SearchScreen';
import CategoryScreen from '../screens/main/CategoryScreen';
import AllCategoriesScreen from '../screens/main/AllCategoriesScreen';
import PaymentScreen from '../screens/main/PaymentScreen';
import OrderHistoryScreen from '../screens/main/OrderHistoryScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ReviewsScreen from '../screens/main/ReviewsScreen';
import YouTubeChannelsScreen from '../screens/main/YouTubeChannelsScreen';
import PrivacySettingsScreen from '../screens/main/PrivacySettingsScreen';
import NotificationSettingsScreen from '../screens/main/NotificationSettingsScreen';
import BookUploadScreen from '../screens/main/BookUploadScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import AudioBookScreen from '../screens/main/AudioBookScreen';
import GovernmentCurriculumScreen from '../screens/main/GovernmentCurriculumScreen';
import EditBookScreen from '../screens/main/EditBookScreen';
import MyBooksScreen from '../screens/main/MyBooksScreen';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={BottomTabNavigator} 
      />
      <Stack.Screen 
        name="BookDetail" 
        component={BookDetailScreen}
      />
      <Stack.Screen 
        name="Reader" 
        component={ReaderScreen}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
      />
      <Stack.Screen 
        name="Category" 
        component={CategoryScreen}
      />
      <Stack.Screen 
        name="AllCategories" 
        component={AllCategoriesScreen}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
      />
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen}
      />
      <Stack.Screen 
        name="Wishlist" 
        component={WishlistScreen}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
      />
      <Stack.Screen 
        name="Reviews" 
        component={ReviewsScreen}
      />
      <Stack.Screen 
        name="YouTubeChannels" 
        component={YouTubeChannelsScreen}
      />
      <Stack.Screen 
        name="PrivacySettings" 
        component={PrivacySettingsScreen}
      />
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
      />
      <Stack.Screen 
        name="BookUpload" 
        component={BookUploadScreen}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
      />
      <Stack.Screen 
        name="AudioBook" 
        component={AudioBookScreen}
      />
      <Stack.Screen 
        name="GovernmentCurriculum" 
        component={GovernmentCurriculumScreen}
      />
      <Stack.Screen 
        name="EditBook" 
        component={EditBookScreen}
      />
      <Stack.Screen 
        name="MyBooks" 
        component={MyBooksScreen}
      />
    </Stack.Navigator>
  );
};

export default MainStack;

