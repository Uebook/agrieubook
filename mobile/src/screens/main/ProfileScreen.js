/**
 * Profile & Settings Screen
 * Features: Edit profile, Orders, Wishlist, Settings, Delete account
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { userProfile, orders } from '../../services/dummyData';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import apiClient from '../../services/api';

const ProfileScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { userRole, userData, logout, userId } = useAuth();
  const isAuthor = userRole === 'author';
  const [user, setUser] = useState(userData || userProfile);
  const [loading, setLoading] = useState(false);

  // Fetch user data from API if userId exists
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId && !userData) {
        try {
          setLoading(true);
          const response = await apiClient.getUser(userId);
          setUser(response.user || userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Use dummy data as fallback
          setUser(userProfile);
        } finally {
          setLoading(false);
        }
      } else if (userData) {
        setUser(userData);
      }
    };
    
    fetchUserData();
  }, [userId, userData]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will automatically switch to AuthStack via AppNavigator
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

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

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.name || 'User')}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || user?.mobile || 'No email'}</Text>
        {user?.mobile && (
          <Text style={[styles.userEmail, { marginTop: 4 }]}>+91 {user.mobile}</Text>
        )}
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
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


export default ProfileScreen;

