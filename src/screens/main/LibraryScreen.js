/**
 * Library / My Books Screen
 * Features: Purchased books, Download for offline, Reading history
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { myLibraryBooks } from '../../services/dummyData';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const LibraryScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userRole, userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'downloaded', 'recent'

  const myBooks = useMemo(() => {
    let books = myLibraryBooks;
    
    // If user is an author, show only their own books
    if (userRole === 'author' && userId) {
      books = books.filter((book) => book.authorId === userId);
    }
    
    return books;
  }, [userRole, userId]);

  const filteredBooks = useMemo(() => {
    if (activeTab === 'downloaded') {
      return myBooks.filter((book) => book.isDownloaded);
    } else if (activeTab === 'recent') {
      return myBooks.filter((book) => book.readingProgress > 0);
    }
    return myBooks;
  }, [activeTab, myBooks]);

  const renderBookItem = ({ item }) => {
    const isMyBook = userRole === 'author' && userId && item.authorId === userId;
    
    return (
      <TouchableOpacity
        style={styles.bookCard}
        onPress={() => isMyBook ? navigation.navigate('EditBook', { bookId: item.id }) : navigation.navigate('Reader', { bookId: item.id })}
      >
        <Image
          source={{ uri: item.cover }}
          style={styles.bookCover}
          resizeMode="cover"
        />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.bookAuthor}>{item.author.name}</Text>
          {isMyBook && (
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️ Tap to Edit</Text>
            </View>
          )}
          {item.readingProgress > 0 && !isMyBook && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${item.readingProgress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{item.readingProgress}%</Text>
            </View>
          )}
          <View style={styles.bookMeta}>
            {!isMyBook && <Text style={styles.lastRead}>{item.lastRead}</Text>}
            {item.isDownloaded && !isMyBook && (
              <View style={styles.downloadedBadge}>
                <Text style={styles.downloadedText}>📥 Downloaded</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: themeColors.background.secondary,
      padding: 4,
      margin: 16,
      borderRadius: 8,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 6,
    },
    activeTab: {
      backgroundColor: themeColors.primary.main,
    },
    tabText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: '500',
    },
    activeTabText: {
      color: themeColors.text.light,
      fontWeight: 'bold',
    },
    listContent: {
      padding: 16,
    },
    bookCard: {
      flexDirection: 'row',
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    bookCover: {
      width: 80,
      height: 120,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 6,
      marginRight: 12,
    },
    bookInfo: {
      flex: 1,
      justifyContent: 'space-between',
    },
    bookTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    bookAuthor: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 8,
    },
    progressContainer: {
      marginBottom: 8,
    },
    progressBar: {
      height: 4,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 2,
      marginBottom: 4,
    },
    progressFill: {
      height: '100%',
      backgroundColor: themeColors.primary.main,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
    bookMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lastRead: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
    downloadedBadge: {
      backgroundColor: themeColors.background.tertiary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    downloadedText: {
      fontSize: 10 * fontSizeMultiplier,
      color: themeColors.primary.main,
    },
    editBadge: {
      marginTop: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: themeColors.primary.main,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    editBadgeText: {
      color: themeColors.text.light,
      fontSize: 10 * fontSizeMultiplier,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}
          >
            All Books
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'downloaded' && styles.activeTab]}
          onPress={() => setActiveTab('downloaded')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'downloaded' && styles.activeTabText,
            ]}
          >
            Downloaded
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => setActiveTab('recent')}
        >
          <Text
            style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}
          >
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Books List */}
      {filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No books found</Text>
        </View>
      )}
    </View>
  );
};


export default LibraryScreen;

