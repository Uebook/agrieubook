/**
 * My Books Screen
 * For authors to view all their uploaded books and audio books with edit options
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const MyBooksScreen = ({ navigation, route }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { initialTab } = route.params || {}; // 'books' or 'audio'
  
  const [activeTab, setActiveTab] = useState(initialTab || 'books');
  const [books, setBooks] = useState([]);
  const [audioBooks, setAudioBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    content: {
      flex: 1,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: themeColors.background.secondary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      borderBottomColor: themeColors.primary.main,
    },
    tabText: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.secondary,
    },
    tabTextActive: {
      color: themeColors.primary.main,
    },
    list: {
      flex: 1,
    },
    listContent: {
      padding: 16,
    },
    bookCard: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    bookCardContent: {
      flexDirection: 'row',
      padding: 12,
    },
    bookCover: {
      width: 80,
      height: 120,
      borderRadius: 8,
      backgroundColor: themeColors.background.tertiary,
    },
    bookInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'space-between',
    },
    bookTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    bookMeta: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 4,
    },
    bookStatus: {
      fontSize: 11 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
      marginTop: 4,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    editButton: {
      flex: 1,
      backgroundColor: themeColors.primary.main,
      borderRadius: 6,
      paddingVertical: 8,
      alignItems: 'center',
    },
    editButtonText: {
      color: themeColors.text.light,
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
    },
    viewButton: {
      flex: 1,
      backgroundColor: themeColors.background.tertiary,
      borderRadius: 6,
      paddingVertical: 8,
      alignItems: 'center',
    },
    viewButtonText: {
      color: themeColors.text.primary,
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyStateIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyStateText: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      textAlign: 'center',
      marginTop: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  useEffect(() => {
    fetchData();
  }, [userId, activeTab]);

  const fetchData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      if (activeTab === 'books') {
        const response = await apiClient.getBooks({ authorId: userId, status: 'all', limit: 100 });
        setBooks(response.books || []);
      } else {
        const response = await apiClient.getAudioBooks({ authorId: userId, status: 'all', limit: 100 });
        setAudioBooks(response.audioBooks || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderBookItem = ({ item }) => {
    const coverUrl = item.cover_images?.[0] || item.cover_image_url || item.cover || 'https://via.placeholder.com/80';
    const statusColor = item.status === 'published' 
      ? themeColors.success || '#4CAF50'
      : item.status === 'pending'
      ? themeColors.warning || '#FF9800'
      : themeColors.error || '#F44336';

    return (
      <View style={styles.bookCard}>
        <View style={styles.bookCardContent}>
          <Image
            source={{ uri: coverUrl }}
            style={styles.bookCover}
            resizeMode="cover"
          />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.bookMeta}>
              {item.category?.name || 'Uncategorized'} • {item.language || 'English'}
            </Text>
            {item.pages && (
              <Text style={styles.bookMeta}>
                {item.pages} pages
              </Text>
            )}
            <View style={[styles.bookStatus, { color: statusColor }]}>
              Status: {item.status || 'pending'}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
              >
                <Text style={styles.viewButtonText}>👁️ View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditBook', { bookId: item.id })}
              >
                <Text style={styles.editButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderAudioBookItem = ({ item }) => {
    const coverUrl = item.cover_url || item.cover || 'https://via.placeholder.com/80';
    const statusColor = item.status === 'published' 
      ? themeColors.success || '#4CAF50'
      : item.status === 'pending'
      ? themeColors.warning || '#FF9800'
      : themeColors.error || '#F44336';

    return (
      <View style={styles.bookCard}>
        <View style={styles.bookCardContent}>
          <Image
            source={{ uri: coverUrl }}
            style={styles.bookCover}
            resizeMode="cover"
          />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.bookMeta}>
              {item.category?.name || 'Uncategorized'} • {item.language || 'English'}
            </Text>
            {item.duration && (
              <Text style={styles.bookMeta}>
                Duration: {item.duration}
              </Text>
            )}
            <View style={[styles.bookStatus, { color: statusColor }]}>
              Status: {item.status || 'pending'}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate('AudioBook', { audioId: item.id })}
              >
                <Text style={styles.viewButtonText}>👁️ View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditBook', { audioId: item.id, isAudio: true })}
              >
                <Text style={styles.editButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const currentData = activeTab === 'books' ? books : audioBooks;
  const isEmpty = !loading && currentData.length === 0;

  return (
    <View style={styles.container}>
      <Header title="My Books" navigation={navigation} />
      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'books' && styles.tabActive]}
            onPress={() => setActiveTab('books')}
          >
            <Text style={[styles.tabText, activeTab === 'books' && styles.tabTextActive]}>
              📚 Books ({books.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'audio' && styles.tabActive]}
            onPress={() => setActiveTab('audio')}
          >
            <Text style={[styles.tabText, activeTab === 'audio' && styles.tabTextActive]}>
              🎙️ Audio ({audioBooks.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.primary.main} />
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>
              {activeTab === 'books' ? '📚' : '🎙️'}
            </Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'books' 
                ? 'No books uploaded yet.\nStart uploading your first book!'
                : 'No audio books uploaded yet.\nStart uploading your first audio book!'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={currentData}
            renderItem={activeTab === 'books' ? renderBookItem : renderAudioBookItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[themeColors.primary.main]}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

export default MyBooksScreen;
