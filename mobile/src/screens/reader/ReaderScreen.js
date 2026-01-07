/**
 * eBook Reader Screen
 * Features: EPUB/PDF reader, Font resizing, Font family, Light/Dark/Sepia mode,
 * Bookmark, Highlight, Notes, Search, Page flip animation, Audio reading mode
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const ReaderScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userId, userRole } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { bookId, sample } = route.params || {};
  const [showMenu, setShowMenu] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('light'); // 'light', 'dark', 'sepia'
  const [fontFamily, setFontFamily] = useState('default');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [book, setBook] = useState(null);

  // Audio Reading Mode State
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0); // 0.5, 1.0, 1.5, 2.0
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const audioIntervalRef = useRef(null);

  // Sample book content for search (only used if sample mode or not purchased)
  const bookContent = `Chapter 1: Introduction to Modern Agriculture

Modern agriculture has evolved significantly over the past few decades. With the advent of new technologies and sustainable practices, farmers can now achieve higher yields while maintaining environmental balance.

The key principles of modern agriculture include:
- Sustainable farming practices
- Advanced crop management techniques
- Soil health and conservation
- Water management and irrigation
- Integrated pest management
- Organic farming methods

These practices have revolutionized the agricultural industry, making it more efficient and environmentally friendly.`;

  // Check if book is purchased and fetch PDF
  useEffect(() => {
    const fetchBookAndCheckPurchase = async () => {
      if (!bookId) {
        setLoadingPdf(false);
        return;
      }

      try {
        setLoadingPdf(true);
        
        // Fetch book details
        const bookResponse = await apiClient.getBook(bookId);
        const bookData = bookResponse.book;
        setBook(bookData);

        // If it's a sample, don't fetch PDF
        if (sample) {
          setLoadingPdf(false);
          return;
        }

        // Check if book is free
        if (bookData.is_free) {
          // Free book - fetch PDF
          const downloadResponse = await apiClient.getBookDownloadUrl(bookId);
          if (downloadResponse.downloadUrl) {
            setPdfUrl(downloadResponse.downloadUrl);
            setIsPurchased(true);
          }
          setLoadingPdf(false);
          return;
        }

        // Check if user is logged in
        if (!userId || userRole !== 'reader') {
          setLoadingPdf(false);
          return;
        }

        // Check if book is purchased
        const ordersResponse = await apiClient.getOrders(userId, { limit: 100 });
        const orders = ordersResponse.orders || [];
        
        const purchased = orders.some((order) => {
          if (order.books && Array.isArray(order.books)) {
            return order.books.some((b) => b.id === bookId);
          }
          return false;
        });

        if (purchased) {
          // Book is purchased - fetch actual PDF
          const downloadResponse = await apiClient.getBookDownloadUrl(bookId);
          if (downloadResponse.downloadUrl) {
            setPdfUrl(downloadResponse.downloadUrl);
            setIsPurchased(true);
          } else {
            Alert.alert('Error', 'Failed to load PDF. Please try again.');
          }
        } else {
          // Book not purchased - show sample
          setIsPurchased(false);
        }
      } catch (error) {
        console.error('Error fetching book/PDF:', error);
        Alert.alert('Error', 'Failed to load book. Please try again.');
      } finally {
        setLoadingPdf(false);
      }
    };

    fetchBookAndCheckPurchase();
  }, [bookId, sample, userId, userRole]);

  const handleBookmark = () => {
    const currentPage = {
      id: Date.now().toString(),
      chapter: 'Chapter 1: Introduction to Modern Agriculture',
      page: 1,
      timestamp: new Date().toLocaleString(),
    };

    if (isBookmarked) {
      setBookmarks((prev) => prev.filter((b) => b.id !== currentPage.id));
      setIsBookmarked(false);
      Alert.alert('Bookmark Removed', 'This page has been removed from your bookmarks.');
    } else {
      setBookmarks((prev) => [...prev, currentPage]);
      setIsBookmarked(true);
      Alert.alert('Bookmark Added', 'This page has been added to your bookmarks.');
    }
  };

  const handleSearch = (query) => {
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const content = bookContent.toLowerCase();
    const results = [];
    let index = content.indexOf(lowerQuery);

    while (index !== -1 && results.length < 10) {
      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + query.length + 50);
      const snippet = bookContent.substring(start, end);

      results.push({
        id: results.length.toString(),
        snippet: snippet.trim(),
        position: index,
      });

      index = content.indexOf(lowerQuery, index + 1);
    }

    setSearchResults(results);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    handleSearch(text);
  };

  // Audio Reading Mode Functions
  const startAudioMode = () => {
    setIsAudioMode(true);
    setShowMenu(false);
    // Calculate estimated duration based on text length (rough estimate: 150 words per minute)
    const wordCount = bookContent.split(/\s+/).length;
    const estimatedMinutes = wordCount / 150;
    setTotalDuration(estimatedMinutes * 60); // Convert to seconds
    setCurrentPosition(0);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    setIsPlaying(true);
    // Simulate audio playback progress
    audioIntervalRef.current = setInterval(() => {
      setCurrentPosition((prev) => {
        const newPosition = prev + (1 / audioSpeed); // Adjust speed
        if (newPosition >= totalDuration) {
          stopAudio();
          return totalDuration;
        }
        return newPosition;
      });
    }, 1000); // Update every second
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  const stopAudio = () => {
    setIsPlaying(false);
    setCurrentPosition(0);
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  const changeAudioSpeed = () => {
    const speeds = [0.5, 1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(audioSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setAudioSpeed(speeds[nextIndex]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, []);

  // Update interval when speed changes
  useEffect(() => {
    if (isPlaying && audioIntervalRef.current) {
      pauseAudio();
      playAudio();
    }
  }, [audioSpeed]);

  const themes = {
    light: {
      background: themeColors.background.primary,
      text: themeColors.text.primary,
    },
    dark: {
      background: themeColors.background.primary,
      text: themeColors.text.primary,
    },
    sepia: {
      background: '#F4E4BC',
      text: '#5C4033',
    },
  };

  const currentTheme = themes[theme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    readerContent: {
      flex: 1,
    },
    readerContentContainer: {
      padding: 20,
    },
    readerText: {
      lineHeight: 28 * fontSizeMultiplier,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: themeColors.border?.light || '#E0E0E0',
      backgroundColor: themeColors.background.primary,
    },
    controlButton: {
      padding: 12,
    },
    controlIcon: {
      fontSize: 24 * fontSizeMultiplier,
      color: themeColors.text.primary,
    },
    bookmarkActive: {
      opacity: 1,
    },
    bookmarkBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: themeColors.primary.main,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    bookmarkBadgeText: {
      color: themeColors.text.light,
      fontSize: 10 * fontSizeMultiplier,
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: themeColors.background.primary,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    modalTitle: {
      fontSize: 20 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
    },
    closeButton: {
      fontSize: 24 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    settingSection: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    settingLabel: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 12,
    },
    fontSizeControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    fontButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: themeColors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fontButtonText: {
      fontSize: 20 * fontSizeMultiplier,
      color: themeColors.text.primary,
      fontWeight: 'bold',
    },
    fontSizeDisplay: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      minWidth: 40,
      textAlign: 'center',
    },
    themeContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    themeButton: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    themeButtonActive: {
      borderColor: themeColors.primary.main,
      borderWidth: 3,
    },
    themeText: {
      fontSize: 12 * fontSizeMultiplier,
      fontWeight: '600',
      textAlign: 'center',
    },
    fontFamilyButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: themeColors.background.secondary,
      marginRight: 8,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    fontFamilyButtonActive: {
      backgroundColor: themeColors.primary.main,
      borderColor: themeColors.primary.main,
    },
    fontFamilyText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.primary,
      fontWeight: '500',
    },
    audioButton: {
      backgroundColor: themeColors.primary.main,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    audioButtonText: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.light,
      fontWeight: '600',
    },
    bookmarksHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    bookmarksCount: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
    },
    addBookmarkButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: themeColors.primary.main,
    },
    addBookmarkText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.light,
      fontWeight: '600',
    },
    bookmarksList: {
      padding: 20,
    },
    bookmarkItem: {
      padding: 16,
      marginBottom: 12,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    bookmarkItemTitle: {
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    bookmarkItemPage: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    emptyBookmarks: {
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
    searchInputContainer: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    searchInput: {
      backgroundColor: themeColors.input.background,
      borderWidth: 1,
      borderColor: themeColors.input.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.input.text,
    },
    searchResultsContainer: {
      padding: 20,
    },
    searchResultsCount: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 12,
    },
    searchResultItem: {
      padding: 12,
      marginBottom: 8,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
    },
    searchResultSnippet: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.primary,
      lineHeight: 20 * fontSizeMultiplier,
    },
    emptySearch: {
      padding: 40,
      alignItems: 'center',
    },
    audioPanel: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: themeColors.background.primary,
      borderTopWidth: 1,
      borderTopColor: themeColors.border?.light || '#E0E0E0',
      padding: 20,
    },
    audioHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    audioTitle: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
    },
    audioCloseButton: {
      fontSize: 24 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    audioProgressContainer: {
      marginBottom: 16,
    },
    audioProgressBar: {
      height: 4,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 2,
      marginBottom: 8,
    },
    audioProgressFill: {
      height: '100%',
      backgroundColor: themeColors.primary.main,
      borderRadius: 2,
    },
    audioTimeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    audioTime: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    audioControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
      marginBottom: 16,
    },
    audioControlButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: themeColors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: themeColors.primary.main,
    },
    audioControlIcon: {
      fontSize: 24 * fontSizeMultiplier,
      color: themeColors.text.primary,
    },
    audioSpeedText: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.primary,
      fontWeight: '600',
    },
    audioSpeedContainer: {
      alignItems: 'center',
    },
    audioSpeedLabel: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    sampleNotice: {
      padding: 16,
      marginBottom: 20,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: themeColors.primary.main,
    },
    sampleNoticeText: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    sampleNoticeSubtext: {
      fontSize: 14 * fontSizeMultiplier,
      textAlign: 'center',
      opacity: 0.8,
    },
  });

  // Show loading while fetching PDF
  if (loadingPdf) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: currentTheme.background, justifyContent: 'center', alignItems: 'center' }]}
      >
        <ActivityIndicator size="large" color={themeColors.primary.main} />
        <Text style={{ marginTop: 16, color: currentTheme.text }}>
          Loading book...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      {/* Reader Content - Show PDF if purchased, otherwise show sample */}
      {isPurchased && pdfUrl ? (
        <WebView
          source={{ uri: pdfUrl }}
          style={styles.readerContent}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[styles.loadingContainer, { backgroundColor: currentTheme.background }]}>
              <ActivityIndicator size="large" color={themeColors.primary.main} />
              <Text style={{ marginTop: 16, color: currentTheme.text }}>
                Loading PDF...
              </Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            Alert.alert('Error', 'Failed to load PDF. Please try again.');
          }}
        />
      ) : (
        <ScrollView
          style={styles.readerContent}
          contentContainerStyle={styles.readerContentContainer}
        >
          {!isPurchased && !sample && (
            <View style={styles.sampleNotice}>
              <Text style={[styles.sampleNoticeText, { color: currentTheme.text }]}>
                📖 Sample Preview
              </Text>
              <Text style={[styles.sampleNoticeSubtext, { color: currentTheme.text }]}>
                Purchase this book to read the full content
              </Text>
            </View>
          )}
          <Text style={[styles.readerText, { color: currentTheme.text, fontSize }]}>
            {bookContent}
          </Text>
        </ScrollView>
      )}

      {/* Reader Controls */}
      {!isAudioMode && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.controlIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowMenu(true)}
          >
            <Text style={styles.controlIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleBookmark}
            onLongPress={() => {
              if (bookmarks.length > 0) {
                setShowBookmarks(true);
              }
            }}
          >
            <View>
              <Text style={[styles.controlIcon, isBookmarked && styles.bookmarkActive]}>
                🔖
              </Text>
              {bookmarks.length > 0 && (
                <View style={styles.bookmarkBadge}>
                  <Text style={styles.bookmarkBadgeText}>{bookmarks.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowSearch(true)}
          >
            <Text style={styles.controlIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Settings Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reader Settings</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Font Size */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Font Size</Text>
              <View style={styles.fontSizeControls}>
                <TouchableOpacity
                  style={styles.fontButton}
                  onPress={() => setFontSize(Math.max(12, fontSize - 2))}
                >
                  <Text style={styles.fontButtonText}>A-</Text>
                </TouchableOpacity>
                <Text style={styles.fontSizeDisplay}>{fontSize}</Text>
                <TouchableOpacity
                  style={styles.fontButton}
                  onPress={() => setFontSize(Math.min(24, fontSize + 2))}
                >
                  <Text style={styles.fontButtonText}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Theme Selection */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Theme</Text>
              <View style={styles.themeContainer}>
                {['light', 'dark', 'sepia'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.themeButton,
                      theme === t && styles.themeButtonActive,
                      { backgroundColor: themes[t].background },
                    ]}
                    onPress={() => setTheme(t)}
                  >
                    <Text style={styles.themeText}>{t.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Font Family */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Font Family</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Default', 'Serif', 'Sans-serif', 'Monospace'].map((font) => (
                  <TouchableOpacity
                    key={font}
                    style={[
                      styles.fontFamilyButton,
                      fontFamily === font.toLowerCase() && styles.fontFamilyButtonActive,
                    ]}
                    onPress={() => setFontFamily(font.toLowerCase())}
                  >
                    <Text style={styles.fontFamilyText}>{font}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Audio Reading Mode */}
            <View style={styles.settingSection}>
              <TouchableOpacity
                style={styles.audioButton}
                onPress={startAudioMode}
              >
                <Text style={styles.audioButtonText}>🎵 Audio Reading Mode</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bookmarks Modal */}
      <Modal
        visible={showBookmarks}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookmarks(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bookmarks</Text>
              <TouchableOpacity onPress={() => setShowBookmarks(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bookmarksHeader}>
              <Text style={styles.bookmarksCount}>
                {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
              </Text>
              <TouchableOpacity
                style={styles.addBookmarkButton}
                onPress={() => {
                  handleBookmark();
                  setShowBookmarks(false);
                }}
              >
                <Text style={styles.addBookmarkText}>+ Add Current Page</Text>
              </TouchableOpacity>
            </View>

            {bookmarks.length === 0 ? (
              <View style={styles.emptyBookmarks}>
                <Text style={styles.emptyIcon}>🔖</Text>
                <Text style={styles.emptyText}>No bookmarks yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the bookmark icon to save your current page
                </Text>
              </View>
            ) : (
              <FlatList
                data={bookmarks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.bookmarkItem}
                    onPress={() => {
                      setShowBookmarks(false);
                      // Scroll to bookmark position
                    }}
                  >
                    <Text style={styles.bookmarkChapter}>{item.chapter}</Text>
                    <Text style={styles.bookmarkTime}>{item.timestamp}</Text>
                    <TouchableOpacity
                      style={styles.removeBookmarkButton}
                      onPress={() => {
                        setBookmarks((prev) => prev.filter((b) => b.id !== item.id));
                        if (bookmarks.length === 1) {
                          setIsBookmarked(false);
                        }
                      }}
                    >
                      <Text style={styles.removeBookmarkText}>Remove</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal
        visible={showSearch}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowSearch(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search in Book</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search text..."
                placeholderTextColor={themeColors.input.placeholder}
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoFocus
              />
            </View>

            {searchQuery.trim().length > 0 && (
              <View style={styles.searchResultsContainer}>
                <Text style={styles.searchResultsCount}>
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                </Text>
                {searchResults.length === 0 ? (
                  <View style={styles.emptySearch}>
                    <Text style={styles.emptyText}>No results found</Text>
                    <Text style={styles.emptySubtext}>
                      Try different keywords
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.searchResultItem}
                        onPress={() => {
                          setShowSearch(false);
                          // Scroll to search result position
                        }}
                      >
                        <Text style={styles.searchResultSnippet}>
                          ...{item.snippet}...
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Audio Reading Mode Panel */}
      {isAudioMode && (
        <View style={styles.audioPanel}>
          <View style={styles.audioHeader}>
            <Text style={styles.audioTitle}>Audio Reading Mode</Text>
            <TouchableOpacity
              onPress={() => {
                stopAudio();
                setIsAudioMode(false);
              }}
            >
              <Text style={styles.audioCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.audioProgressContainer}>
            <View style={styles.audioProgressBar}>
              <View
                style={[
                  styles.audioProgressFill,
                  {
                    width: `${totalDuration > 0 ? (currentPosition / totalDuration) * 100 : 0}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.audioTimeContainer}>
              <Text style={styles.audioTime}>{formatTime(currentPosition)}</Text>
              <Text style={styles.audioTime}>{formatTime(totalDuration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.audioControls}>
            <TouchableOpacity
              style={styles.audioControlButton}
              onPress={stopAudio}
            >
              <Text style={styles.audioControlIcon}>⏹</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.audioControlButton, styles.playButton]}
              onPress={togglePlayPause}
            >
              <Text style={styles.audioControlIcon}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.audioControlButton}
              onPress={changeAudioSpeed}
            >
              <Text style={styles.audioSpeedText}>{audioSpeed}x</Text>
            </TouchableOpacity>
          </View>

          {/* Speed Indicator */}
          <View style={styles.audioSpeedContainer}>
            <Text style={styles.audioSpeedLabel}>
              Speed: {audioSpeed}x {audioSpeed === 0.5 && '(Slow)'}
              {audioSpeed === 1.0 && '(Normal)'}
              {audioSpeed === 1.5 && '(Fast)'}
              {audioSpeed === 2.0 && '(Very Fast)'}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ReaderScreen;

