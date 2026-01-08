/**
 * Audio Book / Podcast Player Screen
 * Features: Play audio books, progress tracking, playback controls
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
// Using custom slider as fallback until native module is properly linked
// After rebuilding the app, you can switch back to: import Slider from '@react-native-community/slider';
import Slider from '../../components/common/CustomSlider';
import Header from '../../components/common/Header';
// Removed dummy data import - using API only
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import Sound from 'react-native-sound';

const AudioBookScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userRole, userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { audioId } = route.params || {};
  const [audioBook, setAudioBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthor = userRole === 'author';
  const isMyAudio = isAuthor && userId && audioBook?.author_id === userId;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const soundRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Enable playback in silence mode (iOS)
  useEffect(() => {
    // Set audio category for playback (allows playback in silent mode)
    Sound.setCategory('Playback', true);
    // Enable playback when screen is locked
    Sound.setActive(true);
  }, []);

  // Fetch audio book from API
  useEffect(() => {
    const fetchAudioBook = async () => {
      if (!audioId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getAudioBook(audioId);
        setAudioBook(response.audioBook);
      } catch (error) {
        console.error('Error fetching audio book:', error);
        setAudioBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioBook();
  }, [audioId]);

  // Initialize and load audio when audioBook data is available
  useEffect(() => {
    if (audioBook?.audio_url && audioId) {
      loadAudio();
    }

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        soundRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [audioBook?.audio_url, audioId]);

  // Parse duration string to seconds (e.g., "45:30" -> 2730)
  useEffect(() => {
    if (audioBook?.duration) {
      const [minutes, seconds] = audioBook.duration.split(':').map(Number);
      setDuration(minutes * 60 + seconds);
    }
  }, [audioBook]);

  const loadAudio = async () => {
    if (!audioBook?.audio_url || !audioId) {
      console.warn('Audio file URL or audioId not available');
      return;
    }

    setIsLoadingAudio(true);

    // Release previous sound if exists
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
      soundRef.current = null;
    }

    try {
      // Try to get signed URL from API (for Supabase storage files)
      let audioUrl = audioBook.audio_url;
      
      try {
        const signedUrlResponse = await apiClient.getAudioBookSignedUrl(audioId);
        if (signedUrlResponse?.audioUrl) {
          audioUrl = signedUrlResponse.audioUrl;
          console.log('Using signed URL for audio playback');
        }
      } catch (signedUrlError) {
        console.warn('Could not get signed URL, using original URL:', signedUrlError);
        // Continue with original URL
      }

      console.log('Loading audio from URL:', audioUrl.substring(0, 100) + '...');

      // Create new sound instance
      // For remote URLs, use empty string as second parameter
      // For local files, use Sound.MAIN_BUNDLE or file path
      const sound = new Sound(
        audioUrl,
        '', // Use empty string for remote URLs
        (error) => {
          setIsLoadingAudio(false);
          if (error) {
            console.error('Error loading audio:', error);
            console.error('Error details:', {
              code: error.code,
              message: error.message,
              domain: error.domain,
            });
            console.error('Audio URL:', audioUrl);
            
            // Provide more specific error messages
            let errorMessage = 'Failed to load audio file.\n\nPlease check:\n- Your internet connection\n- The audio file exists\n- The file format is supported (MP3, M4A, WAV)';
            
            if (error.code === 'ENOENT' || error.message?.includes('not found')) {
              errorMessage = 'Audio file not found. Please check if the file was uploaded correctly.';
            } else if (error.code === 'ENETUNREACH' || error.message?.includes('network')) {
              errorMessage = 'Network error. Please check your internet connection.';
            }
            
            Alert.alert('Error', errorMessage);
            return;
          }

          // Get duration from loaded audio
          const audioDuration = sound.getDuration();
          console.log('Audio duration:', audioDuration);
          if (audioDuration > 0) {
            setDuration(audioDuration);
          } else {
            // If duration is 0, try to use the duration from the book data
            if (audioBook?.duration) {
              const [minutes, seconds] = audioBook.duration.split(':').map(Number);
              setDuration(minutes * 60 + seconds);
            }
          }

          soundRef.current = sound;
          console.log('Audio loaded successfully, ready to play');
        }
      );

      // Set callbacks
      sound.setNumberOfLoops(0); // Don't loop
      
      // Set volume (0.0 to 1.0)
      sound.setVolume(1.0);
    } catch (error) {
      setIsLoadingAudio(false);
      console.error('Error in loadAudio:', error);
      Alert.alert('Error', 'Failed to initialize audio player: ' + (error.message || 'Unknown error'));
    }
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!soundRef.current) {
      Alert.alert('Error', 'Audio not loaded yet');
      return;
    }

    if (isPlaying) {
      // Pause
      soundRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      // Play
      try {
        soundRef.current.play((success) => {
          if (success) {
            console.log('Audio playback finished');
            setIsPlaying(false);
            setCurrentTime(0);
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          } else {
            console.error('Audio playback failed');
            Alert.alert('Error', 'Failed to play audio. Please try again.');
            setIsPlaying(false);
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          }
        });
        setIsPlaying(true);

        // Update progress every second
        progressIntervalRef.current = setInterval(() => {
          if (soundRef.current) {
            soundRef.current.getCurrentTime((seconds) => {
              if (seconds !== undefined && !isNaN(seconds)) {
                setCurrentTime(seconds);
              }
            });
            
            // Check if still playing
            soundRef.current.isPlaying((playing) => {
              if (!playing && isPlaying) {
                // Audio stopped unexpectedly
                setIsPlaying(false);
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
              }
            });
          }
        }, 1000);
      } catch (playError) {
        console.error('Error starting playback:', playError);
        Alert.alert('Error', 'Failed to start audio playback: ' + (playError.message || 'Unknown error'));
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (value) => {
    if (soundRef.current) {
      soundRef.current.setCurrentTime(value);
      setCurrentTime(value);
    }
  };

  const handleSkipBackward = () => {
    if (soundRef.current) {
      const newTime = Math.max(0, currentTime - 10); // Skip back 10 seconds
      handleSeek(newTime);
    }
  };

  const handleSkipForward = () => {
    if (soundRef.current) {
      const newTime = Math.min(duration, currentTime + 10); // Skip forward 10 seconds
      handleSeek(newTime);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      alignItems: 'center',
    },
    coverContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    coverImage: {
      width: 300,
      height: 300,
      borderRadius: 16,
      backgroundColor: themeColors.background.secondary,
    },
    title: {
      fontSize: 24 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginTop: 24,
      textAlign: 'center',
    },
    author: {
      fontSize: 18 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 8,
      textAlign: 'center',
    },
    description: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 16,
      lineHeight: 24 * fontSizeMultiplier,
      textAlign: 'center',
    },
    playerContainer: {
      width: '100%',
      marginTop: 32,
      padding: 20,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 16,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    timeText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      gap: 24,
    },
    controlButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: themeColors.primary.main,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    controlIcon: {
      fontSize: 24 * fontSizeMultiplier,
      color: themeColors.text.light,
    },
    infoContainer: {
      width: '100%',
      marginTop: 32,
      padding: 16,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    infoValue: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.primary,
      fontWeight: '600',
    },
    freeBadge: {
      backgroundColor: themeColors.success || '#4CAF50',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 12,
      alignSelf: 'center',
    },
    freeBadgeText: {
      color: themeColors.text.light,
      fontSize: 12 * fontSizeMultiplier,
      fontWeight: '600',
    },
    editSection: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    editButton: {
      backgroundColor: themeColors.primary.main,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
    },
    editButtonText: {
      color: themeColors.text.light,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
      </View>
    );
  }

  if (!audioBook) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <Text style={{ fontSize: 18, color: themeColors.text.secondary }}>Audio book not found</Text>
      </View>
    );
  }

  const coverUrl = audioBook.cover_url || audioBook.cover || 'https://via.placeholder.com/300';
  const authorName = audioBook.author?.name || audioBook.author_name || 'Unknown Author';

  return (
    <View style={styles.container}>
      <Header title="Audio Book" navigation={navigation} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.coverContainer}>
            <Image
              source={{ uri: coverUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
            <Text style={styles.title}>{audioBook.title}</Text>
            <Text style={styles.author}>By {authorName}</Text>
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>🆓 FREE PODCAST</Text>
            </View>
          </View>

          <Text style={styles.description}>{audioBook.description}</Text>

          <View style={styles.playerContainer}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 1}
              value={currentTime}
              onValueChange={handleSeek}
              minimumTrackTintColor={themeColors.primary.main}
              maximumTrackTintColor={themeColors.background.tertiary}
              thumbTintColor={themeColors.primary.main}
              disabled={!soundRef.current || isLoadingAudio}
            />
            <View style={styles.controlsContainer}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleSkipBackward}
                disabled={!soundRef.current || isLoadingAudio}
              >
                <Text style={styles.controlIcon}>⏮</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton]}
                onPress={handlePlayPause}
                disabled={!soundRef.current || isLoadingAudio}
              >
                {isLoadingAudio ? (
                  <ActivityIndicator size="small" color={themeColors.text.light} />
                ) : (
                  <Text style={styles.controlIcon}>
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleSkipForward}
                disabled={!soundRef.current || isLoadingAudio}
              >
                <Text style={styles.controlIcon}>⏭</Text>
              </TouchableOpacity>
            </View>
            {!audioBook?.audio_url && (
              <Text style={[styles.timeText, { marginTop: 12, textAlign: 'center', color: themeColors.error || '#FF0000' }]}>
                ⚠️ Audio file not available
              </Text>
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{audioBook.duration}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Language</Text>
              <Text style={styles.infoValue}>{audioBook.language}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{audioBook.category?.name || 'Uncategorized'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Published</Text>
              <Text style={styles.infoValue}>
                {new Date(audioBook.publishedDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Edit Button for Authors */}
          {isMyAudio && (
            <View style={styles.editSection}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditBook', { audioId: audioBook.id, isAudio: true })}
              >
                <Text style={styles.editButtonText}>✏️ Edit Audio Book</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AudioBookScreen;

