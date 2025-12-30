/**
 * Profile & Settings Screen
 * Features: Edit profile, Orders, Wishlist, Settings, Delete account
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { userProfile, orders } from '../../services/dummyData';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const ProfileScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const user = userProfile;
  const { userRole } = useAuth();
  const isAuthor = userRole === 'author';

  const menuItems = [
    {
      id: 'upload',
      title: 'Upload Book',
      icon: '📤',
      onPress: () => navigation.navigate('BookUpload'),
    },
    {
      id: 'orders',
      title: `My Orders (${orders.length})`,
      icon: '📦',
      onPress: () => navigation.navigate('OrderHistory'),
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      icon: '❤️',
      onPress: () => navigation.navigate('Wishlist'),
    },
    {
      id: 'reviews',
      title: 'Reviews & Ratings',
      icon: '⭐',
      onPress: () => navigation.navigate('Reviews'),
    },
    {
      id: 'youtube',
      title: 'YouTube Channels',
      icon: '📺',
      onPress: () => navigation.navigate('YouTubeChannels'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      onPress: () => navigation.navigate('Settings'),
    },
    // TODO: Add privacy and notification settings later
    // {
    //   id: 'privacy',
    //   title: 'Privacy Settings',
    //   icon: '🔒',
    //   onPress: () => navigation.navigate('PrivacySettings'),
    // },
    // {
    //   id: 'notifications',
    //   title: 'Notification Settings',
    //   icon: '🔔',
    //   onPress: () => navigation.navigate('NotificationSettings'),
    // },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    profileHeader: {
      alignItems: 'center',
      padding: 24,
      backgroundColor: themeColors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: themeColors.primary.main,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarText: {
      fontSize: 32 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.light,
    },
    userName: {
      fontSize: 24 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 16,
    },
    editButton: {
      backgroundColor: themeColors.background.secondary,
      paddingHorizontal: 24,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    editButtonText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.primary,
      fontWeight: '500',
    },
    menuSection: {
      marginTop: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    menuIcon: {
      fontSize: 24 * fontSizeMultiplier,
      marginRight: 16,
    },
    menuTitle: {
      flex: 1,
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.primary,
    },
    menuArrow: {
      fontSize: 24 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
    accountSection: {
      marginTop: 24,
      padding: 16,
    },
    dangerButton: {
      backgroundColor: themeColors.error || '#F44336',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    dangerButtonText: {
      color: themeColors.text.light,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
    },
    logoutButton: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    logoutButtonText: {
      color: themeColors.text.primary,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account Actions */}
      <View style={styles.accountSection}>
        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


export default ProfileScreen;

