/**
 * YouTube Channels Screen
 * Display agriculture-related YouTube channels
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import apiClient from '../../services/api';
import { categories } from '../../services/dummyData';

const YouTubeChannelsScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const params = selectedCategory ? { category: selectedCategory } : {};
        const response = await apiClient.getYouTubeChannels(params);
        setChannels(response.channels || []);
      } catch (error) {
        console.error('Error fetching YouTube channels:', error);
        setChannels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, [selectedCategory]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    categoryFilter: {
      maxHeight: 60,
      marginBottom: 8,
    },
    categoryFilterContent: {
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.background.secondary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
    },
    categoryChipActive: {
      backgroundColor: themeColors.primary.main,
      borderColor: themeColors.primary.main,
    },
    categoryChipIcon: {
      fontSize: 16 * fontSizeMultiplier,
      marginRight: 6,
    },
    categoryChipText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      fontWeight: '500',
    },
    categoryChipTextActive: {
      color: themeColors.text.light,
      fontWeight: '600',
    },
    listContent: {
      padding: 20,
      paddingTop: 8,
    },
    channelCard: {
      flexDirection: 'row',
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    channelThumbnail: {
      width: 120,
      height: 120,
      borderRadius: 8,
      backgroundColor: themeColors.background.tertiary,
      marginRight: 12,
    },
    channelInfo: {
      flex: 1,
    },
    channelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    channelName: {
      fontSize: 17 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginRight: 6,
      flex: 1,
    },
    verifiedBadge: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.primary.main,
      fontWeight: 'bold',
    },
    channelDescription: {
      fontSize: 13 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 10,
      lineHeight: 18 * fontSizeMultiplier,
    },
    channelStats: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    statText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
      marginRight: 6,
    },
    channelCategories: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    categoryTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.background.tertiary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 6,
      marginBottom: 4,
    },
    categoryTagText: {
      fontSize: 10 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginLeft: 4,
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
      fontSize: 20 * fontSizeMultiplier,
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

  const handleChannelPress = async (channelUrl) => {
    try {
      const supported = await Linking.canOpenURL(channelUrl);
      if (supported) {
        await Linking.openURL(channelUrl);
      } else {
        console.error('Cannot open URL:', channelUrl);
      }
    } catch (error) {
      console.error('Error opening channel:', error);
    }
  };

  const renderChannelItem = ({ item }) => (
    <TouchableOpacity
      style={styles.channelCard}
      onPress={() => handleChannelPress(item.channel_url)}
    >
      <Image
        source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/120' }}
        style={styles.channelThumbnail}
        resizeMode="cover"
      />
      <View style={styles.channelInfo}>
        <View style={styles.channelHeader}>
          <Text style={styles.channelName}>{item.name}</Text>
          {item.verified && (
            <Text style={styles.verifiedBadge}>✓</Text>
          )}
        </View>
        <Text style={styles.channelDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>
        <View style={styles.channelStats}>
          <Text style={styles.statText}>
            {item.subscriber_count || '0'} subscribers
          </Text>
          <Text style={styles.statText}>•</Text>
          <Text style={styles.statText}>{item.video_count || '0'} videos</Text>
        </View>
        <View style={styles.channelCategories}>
          {(item.category_ids || []).map((catId) => {
            const category = categories.find((cat) => cat.id === catId);
            return category ? (
              <View key={catId} style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{category.icon}</Text>
                <Text style={styles.categoryTagText}>{category.name}</Text>
              </View>
            ) : null;
          })}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="YouTube Channels" navigation={navigation} />

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryChipText,
              !selectedCategory && styles.categoryChipTextActive,
            ]}
          >
            All Channels
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryChipIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Channels List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={themeColors.primary.main} />
        </View>
      ) : channels.length > 0 ? (
        <FlatList
          data={channels}
          renderItem={renderChannelItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📺</Text>
          <Text style={styles.emptyText}>No channels found</Text>
          <Text style={styles.emptySubtext}>
            Try selecting a different category
          </Text>
        </View>
      )}
    </View>
  );
};

export default YouTubeChannelsScreen;

