/**
 * Book Upload Screen
 * For authors to upload their books with progress tracking
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import Header from '../../components/common/Header';
import { categories } from '../../services/dummyData';
import { useSettings } from '../../context/SettingsContext';

const BookUploadScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [coverImages, setCoverImages] = useState([]); // Array of { id, uri, name, type }
  const [audioFile, setAudioFile] = useState(null);
  const [bookType, setBookType] = useState('book'); // 'book' or 'audio'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    language: 'English',
    pages: '',
    isbn: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleImagePicker = () => {
    // Show options for image selection
    Alert.alert(
      'Select Cover Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => selectImageFromCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => selectImageFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const selectImageFromCamera = () => {
    // TODO: Implement actual camera functionality
    // For now, simulate image selection
    // In production, use: react-native-image-picker or expo-image-picker
    const newImage = {
      id: Date.now().toString(),
      uri: `https://images.unsplash.com/photo-${Date.now()}?w=400&h=600&fit=crop`,
      type: 'image/jpeg',
      name: `cover_${Date.now()}.jpg`,
    };
    setCoverImages([...coverImages, newImage]);
  };

  const selectImageFromGallery = () => {
    // TODO: Implement actual gallery picker functionality
    // For now, simulate image selection
    // In production, use: react-native-image-picker or expo-image-picker
    const newImage = {
      id: Date.now().toString(),
      uri: `https://images.unsplash.com/photo-${Date.now()}?w=400&h=600&fit=crop`,
      type: 'image/jpeg',
      name: `cover_${Date.now()}.jpg`,
    };
    setCoverImages([...coverImages, newImage]);
  };

  const removeImage = (imageId) => {
    setCoverImages(coverImages.filter((img) => img.id !== imageId));
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          Alert.alert(
            'Success',
            'Book uploaded successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  setFormData({
                    title: '',
                    description: '',
                    category: '',
                    price: '',
                    language: 'English',
                    pages: '',
                    isbn: '',
                  });
                  setUploadProgress(0);
                },
              },
            ]
          );
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handleUpload = () => {
    // Validate form
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter book title');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter book description');
      return;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    // Start upload
    simulateUpload();
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.input.placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

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
    },
    sectionTitle: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginTop: 24,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: themeColors.input.background,
      borderWidth: 1,
      borderColor: themeColors.input.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.input.text,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
      paddingTop: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    halfWidth: {
      flex: 1,
    },
    categoryScroll: {
      marginTop: 8,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.background.secondary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
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
    uploadSection: {
      marginBottom: 24,
    },
    uploadButton: {
      backgroundColor: themeColors.background.secondary,
      borderWidth: 2,
      borderColor: themeColors.border?.light || '#E0E0E0',
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadButtonText: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    uploadHint: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    progressSection: {
      backgroundColor: themeColors.background.secondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    progressTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
    },
    progressPercent: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.primary.main,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: themeColors.background.tertiary,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBar: {
      height: '100%',
      backgroundColor: themeColors.primary.main,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      textAlign: 'center',
    },
    submitButton: {
      backgroundColor: themeColors.button.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: themeColors.button.text,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
    },
    helpText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
      textAlign: 'center',
      lineHeight: 18 * fontSizeMultiplier,
    },
    typeButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    typeButton: {
      flex: 1,
      backgroundColor: themeColors.background.secondary,
      borderWidth: 2,
      borderColor: themeColors.border?.light || '#E0E0E0',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 100,
      position: 'relative',
    },
    typeButtonActive: {
      backgroundColor: themeColors.primary.main,
      borderColor: themeColors.primary.main,
      borderWidth: 2,
    },
    typeButtonIcon: {
      fontSize: 32 * fontSizeMultiplier,
      marginBottom: 8,
    },
    typeButtonTextContainer: {
      alignItems: 'center',
    },
    typeButtonText: {
      fontSize: 15 * fontSizeMultiplier,
      fontWeight: '700',
      color: themeColors.text.primary,
      textAlign: 'center',
    },
    typeButtonTextActive: {
      color: themeColors.text.light,
    },
    typeButtonSubtext: {
      fontSize: 11 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 2,
      textAlign: 'center',
    },
    typeButtonSubtextActive: {
      color: themeColors.text.light,
      opacity: 0.9,
    },
    typeButtonCheck: {
      position: 'absolute',
      top: 8,
      right: 8,
      fontSize: 18 * fontSizeMultiplier,
      color: themeColors.text.light,
      fontWeight: 'bold',
    },
    languageButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    languageButton: {
      flex: 1,
      backgroundColor: themeColors.background.secondary,
      borderWidth: 1,
      borderColor: themeColors.border?.light || '#E0E0E0',
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    languageButtonActive: {
      backgroundColor: themeColors.primary.main,
      borderColor: themeColors.primary.main,
    },
    languageButtonText: {
      fontSize: 14 * fontSizeMultiplier,
      fontWeight: '600',
      color: themeColors.text.primary,
    },
    languageButtonTextActive: {
      color: themeColors.text.light,
    },
    imagePreviewContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
      gap: 12,
    },
    imagePreviewWrapper: {
      position: 'relative',
      width: 110,
      marginBottom: 8,
    },
    imagePreview: {
      width: '100%',
      height: 150,
      borderRadius: 8,
      backgroundColor: themeColors.background.tertiary,
    },
    removeImageButton: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: themeColors.error || '#F44336',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: themeColors.background.primary,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    removeImageIcon: {
      color: themeColors.text.light,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: 'bold',
      lineHeight: 16 * fontSizeMultiplier,
    },
    imageName: {
      fontSize: 10 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 4,
      textAlign: 'center',
    },
    imageCountText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 8,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    audioFileInfo: {
      marginTop: 12,
      padding: 12,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    audioFileName: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.primary,
      fontWeight: '600',
      flex: 1,
    },
    audioFileSize: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginHorizontal: 8,
    },
    removeAudioButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: themeColors.error || '#F44336',
      borderRadius: 6,
    },
    removeAudioText: {
      color: themeColors.text.light,
      fontSize: 12 * fontSizeMultiplier,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Upload Book" navigation={navigation} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Book Information</Text>

          <InputField
            label="Book Title *"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Enter book title"
          />

          <InputField
            label="Description *"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Enter book description"
            multiline={true}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    formData.category === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => handleInputChange('category', cat.id)}
                >
                  <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryChipText,
                      formData.category === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <InputField
                label="Price (₹) *"
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <InputField
                label="Pages"
                value={formData.pages}
                onChangeText={(value) => handleInputChange('pages', value)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Language *</Text>
                <View style={styles.languageButtons}>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      formData.language === 'English' && styles.languageButtonActive,
                    ]}
                    onPress={() => handleInputChange('language', 'English')}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        formData.language === 'English' && styles.languageButtonTextActive,
                      ]}
                    >
                      English
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      formData.language === 'Hindi' && styles.languageButtonActive,
                    ]}
                    onPress={() => handleInputChange('language', 'Hindi')}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        formData.language === 'Hindi' && styles.languageButtonTextActive,
                      ]}
                    >
                      Hindi
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.halfWidth}>
              <InputField
                label="ISBN"
                value={formData.isbn}
                onChangeText={(value) => handleInputChange('isbn', value)}
                placeholder="978-1234567890"
              />
            </View>
          </View>

          {/* Book Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content Type *</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  bookType === 'book' && styles.typeButtonActive,
                ]}
                onPress={() => setBookType('book')}
              >
                <Text style={styles.typeButtonIcon}>📚</Text>
                <Text
                  style={[
                    styles.typeButtonText,
                    bookType === 'book' && styles.typeButtonTextActive,
                  ]}
                >
                  Book
                </Text>
                {bookType === 'book' && (
                  <Text style={styles.typeButtonCheck}>✓</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  bookType === 'audio' && styles.typeButtonActive,
                ]}
                onPress={() => setBookType('audio')}
              >
                <Text style={styles.typeButtonIcon}>🎙️</Text>
                <View style={styles.typeButtonTextContainer}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      bookType === 'audio' && styles.typeButtonTextActive,
                    ]}
                  >
                    Audio Book
                  </Text>
                  <Text
                    style={[
                      styles.typeButtonSubtext,
                      bookType === 'audio' && styles.typeButtonSubtextActive,
                    ]}
                  >
                    Free Podcast
                  </Text>
                </View>
                {bookType === 'audio' && (
                  <Text style={styles.typeButtonCheck}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {bookType === 'book' ? (
            <>
              <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Upload Book File</Text>
                <TouchableOpacity style={styles.uploadButton}>
                  <Text style={styles.uploadButtonText}>📄 Choose File</Text>
                  <Text style={styles.uploadHint}>PDF, EPUB, MOBI formats supported</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Upload Cover Images (Multiple)</Text>
                <Text style={[styles.uploadHint, { marginBottom: 12 }]}>
                  You can upload multiple cover images for your book
                </Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleImagePicker}
                >
                  <Text style={styles.uploadButtonText}>🖼️ Add Cover Image</Text>
                  <Text style={styles.uploadHint}>JPG, PNG formats supported</Text>
                </TouchableOpacity>
                {coverImages.length > 0 && (
                  <View style={styles.imagePreviewContainer}>
                    {coverImages.map((image) => (
                      <View key={image.id} style={styles.imagePreviewWrapper}>
                        <Image
                          source={{ uri: image.uri }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeImage(image.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.removeImageIcon}>✕</Text>
                        </TouchableOpacity>
                        {image.name && (
                          <Text style={styles.imageName} numberOfLines={1}>
                            {image.name}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                {coverImages.length > 0 && (
                  <Text style={styles.imageCountText}>
                    {coverImages.length} image{coverImages.length > 1 ? 's' : ''} selected
                  </Text>
                )}
              </View>
            </>
          ) : (
            <View style={styles.uploadSection}>
              <Text style={styles.sectionTitle}>Upload Audio File (Podcast)</Text>
              <Text style={styles.uploadHint} style={{ marginBottom: 12, color: themeColors.primary.main }}>
                ⚠️ Audio books are free only. All audio content will be available to all readers.
              </Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => {
                  // Simulate audio picker - in real app, use react-native-document-picker
                  setAudioFile({ name: 'podcast.mp3', size: '15.2 MB' });
                }}
              >
                <Text style={styles.uploadButtonText}>🎙️ Choose Audio File</Text>
                <Text style={styles.uploadHint}>MP3, M4A, WAV formats supported</Text>
              </TouchableOpacity>
              {audioFile && (
                <View style={styles.audioFileInfo}>
                  <Text style={styles.audioFileName}>📄 {audioFile.name}</Text>
                  <Text style={styles.audioFileSize}>{audioFile.size}</Text>
                  <TouchableOpacity
                    onPress={() => setAudioFile(null)}
                    style={styles.removeAudioButton}
                  >
                    <Text style={styles.removeAudioText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Cover Image for Podcast</Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleImagePicker}
                >
                  <Text style={styles.uploadButtonText}>🖼️ Add Cover Image</Text>
                  <Text style={styles.uploadHint}>JPG, PNG formats supported</Text>
                </TouchableOpacity>
                {coverImages.length > 0 && (
                  <View style={styles.imagePreviewContainer}>
                    {coverImages.map((image) => (
                      <View key={image.id} style={styles.imagePreviewWrapper}>
                        <Image
                          source={{ uri: image.uri }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeImage(image.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.removeImageIcon}>✕</Text>
                        </TouchableOpacity>
                        {image.name && (
                          <Text style={styles.imageName} numberOfLines={1}>
                            {image.name}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                {coverImages.length > 0 && (
                  <Text style={styles.imageCountText}>
                    {coverImages.length} image{coverImages.length > 1 ? 's' : ''} selected
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Uploading...</Text>
                <Text style={styles.progressPercent}>{uploadProgress}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {uploadProgress < 50
                  ? 'Preparing files...'
                  : uploadProgress < 90
                  ? 'Uploading to server...'
                  : 'Finalizing...'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isUploading && styles.submitButtonDisabled,
            ]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={themeColors.text.light} />
            ) : (
              <Text style={styles.submitButtonText}>Upload Book</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.helpText}>
            * Required fields{'\n'}
            Your book will be reviewed before being published.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};


export default BookUploadScreen;

