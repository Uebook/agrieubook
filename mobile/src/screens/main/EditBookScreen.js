/**
 * Edit Book Screen
 * For authors to edit their uploaded books and audio books
 */

import React, { useState, useEffect } from 'react';
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
import { categories, getBookById, getAudioBooks } from '../../services/dummyData';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const EditBookScreen = ({ route, navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { bookId, audioId, isAudio } = route.params || {};
  const [isSaving, setIsSaving] = useState(false);
  const [coverImages, setCoverImages] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    language: 'English',
    pages: '',
    isbn: '',
  });

  const [loading, setLoading] = useState(true);

  // Load book/audio data from API
  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        
        if (isAudio && audioId) {
          const response = await apiClient.getAudioBook(audioId);
          const audio = response.audioBook;
          
          if (audio && audio.author_id === userId) {
            setFormData({
              title: audio.title,
              description: audio.description || '',
              category: audio.category_id,
              price: '0', // Audio books are free
              language: audio.language || 'English',
              pages: '',
              isbn: '',
            });
            if (audio.cover_url) {
              setCoverImages([{ id: '1', uri: audio.cover_url, name: 'cover.jpg' }]);
            }
          }
        } else if (bookId) {
          const response = await apiClient.getBook(bookId);
          const book = response.book;
          
          if (book && book.author_id === userId) {
            setFormData({
              title: book.title,
              description: book.summary || '',
              category: book.category_id,
              price: book.price?.toString() || '0',
              language: book.language || 'English',
              pages: book.pages?.toString() || '',
              isbn: book.isbn || '',
            });
            const images = book.cover_images || (book.cover_image_url ? [book.cover_image_url] : []);
            setCoverImages(images.map((img, idx) => ({ id: idx.toString(), uri: img, name: `cover_${idx}.jpg` })));
          }
        }
      } catch (error) {
        console.error('Error fetching book data:', error);
        // Fallback to dummy data
        if (isAudio && audioId) {
          const audioBooks = getAudioBooks();
          const audio = audioBooks.find((a) => a.id === audioId);
          if (audio && audio.authorId === userId) {
            setFormData({
              title: audio.title,
              description: audio.description,
              category: audio.categoryId,
              price: '0',
              language: audio.language,
              pages: '',
              isbn: '',
            });
            setCoverImages([{ id: '1', uri: audio.cover, name: 'cover.jpg' }]);
          }
        } else if (bookId) {
          const book = getBookById(bookId);
          if (book && book.authorId === userId) {
            setFormData({
              title: book.title,
              description: book.summary,
              category: book.categoryId,
              price: book.price.toString(),
              language: book.language,
              pages: book.pages.toString(),
              isbn: book.isbn || '',
            });
            const images = book.coverImages || [book.cover];
            setCoverImages(images.map((img, idx) => ({ id: idx.toString(), uri: img, name: `cover_${idx}.jpg` })));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [bookId, audioId, isAudio, userId]);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleImagePicker = () => {
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
    const newImage = {
      id: Date.now().toString(),
      uri: `https://images.unsplash.com/photo-${Date.now()}?w=400&h=600&fit=crop`,
      type: 'image/jpeg',
      name: `cover_${Date.now()}.jpg`,
    };
    setCoverImages([...coverImages, newImage]);
  };

  const selectImageFromGallery = () => {
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

  const handleSave = async () => {
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

    setIsSaving(true);

    try {
      if (isAudio && audioId) {
        // Update audio book
        const audioBookData = {
          title: formData.title,
          description: formData.description,
          category_id: formData.category,
          language: formData.language,
        };

        // Upload new cover images if any
        const coverImageUrls = [];
        for (const image of coverImages) {
          if (image.uri && !image.uri.startsWith('http')) {
            // New image, upload it
            const uploadResult = await apiClient.uploadFile(
              { uri: image.uri, type: image.type || 'image/jpeg', name: image.name || 'cover.jpg' },
              'audio-books',
              'covers'
            );
            coverImageUrls.push(uploadResult.url);
          } else {
            // Existing image URL
            coverImageUrls.push(image.uri);
          }
        }

        if (coverImageUrls.length > 0) {
          audioBookData.cover_url = coverImageUrls[0];
        }

        await apiClient.updateAudioBook(audioId, audioBookData);
      } else if (bookId) {
        // Update book
        const bookData = {
          title: formData.title,
          summary: formData.description,
          category_id: formData.category,
          price: parseFloat(formData.price) || 0,
          pages: formData.pages ? parseInt(formData.pages) : null,
          language: formData.language,
          isbn: formData.isbn || null,
        };

        // Upload new cover images if any
        const coverImageUrls = [];
        for (const image of coverImages) {
          if (image.uri && !image.uri.startsWith('http')) {
            // New image, upload it
            const uploadResult = await apiClient.uploadFile(
              { uri: image.uri, type: image.type || 'image/jpeg', name: image.name || 'cover.jpg' },
              'books',
              'covers'
            );
            coverImageUrls.push(uploadResult.url);
          } else {
            // Existing image URL
            coverImageUrls.push(image.uri);
          }
        }

        if (coverImageUrls.length > 0) {
          bookData.cover_image_url = coverImageUrls[0];
          bookData.cover_images = coverImageUrls;
        }

        await apiClient.updateBook(bookId, bookData);
      }

      Alert.alert(
        'Success',
        `${isAudio ? 'Audio book' : 'Book'} updated successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating book:', error);
      Alert.alert('Error', error.message || 'Failed to update book. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, editable = true }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={themeColors.input.placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        editable={editable}
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
    inputDisabled: {
      backgroundColor: themeColors.background.secondary,
      color: themeColors.text.secondary,
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
    saveButton: {
      backgroundColor: themeColors.button.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 16,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
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
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={isAudio ? "Edit Audio Book" : "Edit Book"} navigation={navigation} />
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
                editable={!isAudio}
              />
              {isAudio && (
                <Text style={styles.uploadHint}>Audio books are free only</Text>
              )}
            </View>
            {!isAudio && (
              <View style={styles.halfWidth}>
                <InputField
                  label="Pages"
                  value={formData.pages}
                  onChangeText={(value) => handleInputChange('pages', value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            )}
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
            {!isAudio && (
              <View style={styles.halfWidth}>
                <InputField
                  label="ISBN"
                  value={formData.isbn}
                  onChangeText={(value) => handleInputChange('isbn', value)}
                  placeholder="978-1234567890"
                />
              </View>
            )}
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Cover Images (Multiple)</Text>
            <Text style={[styles.uploadHint, { marginBottom: 12 }]}>
              You can upload multiple cover images
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

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={themeColors.text.light} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.helpText}>
            * Required fields{'\n'}
            Changes will be reviewed before being published.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditBookScreen;

