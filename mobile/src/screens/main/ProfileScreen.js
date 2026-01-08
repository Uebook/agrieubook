/**
 * Profile & Settings Screen
 * Features: Edit profile, Orders, Wishlist, Settings, Delete account
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { userProfile } from '../../services/dummyData';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import apiClient from '../../services/api';

const ProfileScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { userRole, userData, logout, userId } = useAuth();
  const [user, setUser] = useState(userData || userProfile);
  const [loading, setLoading] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  
  // Determine if user is author - check both userRole from context and user.role from API
  // Use useMemo to recalculate when user or userRole changes
  const isAuthor = useMemo(() => {
    const roleFromContext = userRole === 'author';
    const roleFromUser = user?.role === 'author' || user?.user_role === 'author';
    return roleFromContext || roleFromUser;
  }, [userRole, user]);

  // Fetch user data and order count from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId && !userData) {
        try {
          setLoading(true);
          const response = await apiClient.getUser(userId);
          const fetchedUser = response.user || userData;
          setUser(fetchedUser);
          // Update userRole if it's different in the fetched user data
          if (fetchedUser && (fetchedUser.role || fetchedUser.user_role) && !userRole) {
            console.log('User role from API:', fetchedUser.role || fetchedUser.user_role);
          }
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

    const fetchOrderCount = async () => {
      if (userId) {
        try {
          const response = await apiClient.getOrders(userId, { limit: 1 });
          setOrderCount(response.pagination?.total || 0);
        } catch (error) {
          console.error('Error fetching order count:', error);
          setOrderCount(0);
        }
      }
    };
    
    fetchUserData();
    fetchOrderCount();
  }, [userId, userData]);

  const handleLogout = useCallback(() => {
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
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Call API to delete user account
              await apiClient.deleteUser(userId);
              // Logout after successful deletion
              await logout();
              Alert.alert('Success', 'Your account has been deleted successfully.');
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', error.message || 'Failed to delete account. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [userId, logout]);

  // Stable navigation callbacks
  const navigateToBookUpload = useCallback(() => navigation.navigate('BookUpload'), [navigation]);
  const navigateToOrderHistory = useCallback(() => navigation.navigate('OrderHistory'), [navigation]);
  const navigateToWishlist = useCallback(() => navigation.navigate('Wishlist'), [navigation]);
  const navigateToReviews = useCallback(() => navigation.navigate('Reviews'), [navigation]);
  const navigateToYouTubeChannels = useCallback(() => navigation.navigate('YouTubeChannels'), [navigation]);
  const navigateToSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);
  const navigateToEditProfile = useCallback(() => navigation.navigate('EditProfile'), [navigation]);

  // Memoize menuItems to prevent re-creation on every render
  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    const items = [];
    
    // Debug: Log role information
    console.log('ProfileScreen - Role check:', {
      userRole,
      userRoleFromContext: userRole,
      userRoleFromUser: user?.role || user?.user_role,
      isAuthor,
    });
    
    // Authors can upload books
    if (isAuthor) {
      items.push({
        id: 'upload',
        title: 'Upload Book',
        icon: '📤',
        onPress: navigateToBookUpload,
      });
    }
    
    // Only readers can see orders (authors don't have orders)
    if (!isAuthor) {
      items.push({
        id: 'orders',
        title: `My Orders (${orderCount})`,
        icon: '📦',
        onPress: navigateToOrderHistory,
      });
    }
    
    // Only readers can use wishlist
    if (!isAuthor) {
      items.push({
        id: 'wishlist',
        title: 'Wishlist',
        icon: '❤️',
        onPress: navigateToWishlist,
      });
    }
    
    // Only readers can see reviews & ratings
    if (!isAuthor) {
      items.push({
        id: 'reviews',
        title: 'Reviews & Ratings',
        icon: '⭐',
        onPress: navigateToReviews,
      });
    }
    
    // Both roles can see YouTube channels
    items.push({
      id: 'youtube',
      title: 'YouTube Channels',
      icon: '📺',
      onPress: navigateToYouTubeChannels,
    });
    
    // Both roles can access settings
    items.push({
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      onPress: navigateToSettings,
    });
    
    return items;
  }, [isAuthor, orderCount, userRole, user, navigateToBookUpload, navigateToOrderHistory, navigateToWishlist, navigateToReviews, navigateToYouTubeChannels, navigateToSettings]);

  // Memoize styles to prevent re-creation on every render
  const styles = useMemo(() => StyleSheet.create({
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
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
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
    dangerButtonDisabled: {
      opacity: 0.6,
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
    logoutButtonDisabled: {
      opacity: 0.6,
    },
    logoutButtonText: {
      color: themeColors.text.primary,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
    },
  }), [themeColors, fontSizeMultiplier]);

  // Memoize getInitials function
  const getInitials = useCallback((name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

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
                {user?.avatar_url ? (
                  <Image
                    source={{ uri: user.avatar_url }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.avatarText}>{getInitials(user?.name || 'User')}</Text>
                )}
              </View>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || user?.mobile || 'No email'}</Text>
        {user?.mobile && (
          <Text style={[styles.userEmail, { marginTop: 4 }]}>+91 {user.mobile}</Text>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={navigateToEditProfile}
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
        <TouchableOpacity 
          style={[styles.dangerButton, loading && styles.dangerButtonDisabled]} 
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.logoutButton, loading && styles.logoutButtonDisabled]} 
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


export default ProfileScreen;

