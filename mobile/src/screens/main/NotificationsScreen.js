/**
 * Notifications Screen
 * Displays all user notifications
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const NotificationsScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { userId } = useAuth();
  const [notificationsList, setNotificationsList] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [loading, setLoading] = useState(true);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notificationsList.filter((notif) => !notif.isRead);
    } else if (filter === 'read') {
      return notificationsList.filter((notif) => notif.isRead);
    }
    return notificationsList;
  }, [notificationsList, filter]);

  const unreadCount = useMemo(() => {
    return notificationsList.filter((notif) => !notif.isRead).length;
  }, [notificationsList]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await apiClient.getNotifications(userId, filter);
        setNotificationsList(response.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationsList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userId, filter]);

  const markAsRead = async (id) => {
    try {
      await apiClient.markNotificationAsRead(id);
      setNotificationsList((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    try {
      await apiClient.markAllNotificationsAsRead(userId);
      setNotificationsList((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (notification.action) {
      if (notification.action.type === 'navigate') {
        navigation.navigate(notification.action.screen, notification.action.params);
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    header: {
      padding: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    headerTitle: {
      fontSize: 24 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 8,
    },
    filterContainer: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    filterContent: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      gap: 8,
    },
    markAllContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    markAllButton: {
      alignSelf: 'flex-end',
    },
    markAllText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.primary.main,
      fontWeight: '600',
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: themeColors.background.secondary,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    filterChipActive: {
      backgroundColor: themeColors.primary.main,
      borderColor: themeColors.primary.main,
    },
    filterChipText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: '500',
    },
    filterChipTextActive: {
      color: themeColors.text.light,
      fontWeight: '600',
    },
    listContent: {
      padding: 16,
    },
    notificationItem: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    notificationItemUnread: {
      borderLeftWidth: 4,
      borderLeftColor: themeColors.primary.main,
      backgroundColor: themeColors.background.secondary,
    },
    notificationIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: themeColors.background.tertiary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    notificationIcon: {
      fontSize: 24 * fontSizeMultiplier,
    },
    notificationContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    notificationTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      flex: 1,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: themeColors.primary.main,
      marginLeft: 8,
    },
    notificationMessage: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 4,
      lineHeight: 20 * fontSizeMultiplier,
    },
    notificationTime: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
    markReadButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: themeColors.primary.main + '20',
      marginLeft: 8,
    },
    markReadText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.primary.main,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      fontSize: 64 * fontSizeMultiplier,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      textAlign: 'center',
    },
  });

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.notificationItemUnread,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIconContainer}>
        <Text style={styles.notificationIcon}>{item.icon}</Text>
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.timestamp}</Text>
      </View>
      {!item.isRead && (
        <TouchableOpacity
          style={styles.markReadButton}
          onPress={() => markAsRead(item.id)}
        >
          <Text style={styles.markReadText}>Mark read</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Notifications" navigation={navigation} />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={themeColors.primary.main} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Notifications" navigation={navigation} />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'all' && styles.filterChipTextActive,
              ]}
            >
              All ({notificationsList.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === 'unread' && styles.filterChipActive,
            ]}
            onPress={() => setFilter('unread')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'unread' && styles.filterChipTextActive,
              ]}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === 'read' && styles.filterChipActive,
            ]}
            onPress={() => setFilter('read')}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === 'read' && styles.filterChipTextActive,
              ]}
            >
              Read ({notificationsList.length - unreadCount})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Mark All as Read Button */}
      {unreadCount > 0 && filter === 'all' && (
        <View style={styles.markAllContainer}>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>
            {filter === 'unread'
              ? 'No unread notifications'
              : filter === 'read'
              ? 'No read notifications'
              : 'No notifications'}
          </Text>
          <Text style={styles.emptySubtext}>
            {filter === 'unread'
              ? 'You\'re all caught up!'
              : 'You\'ll see notifications here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};


export default NotificationsScreen;

