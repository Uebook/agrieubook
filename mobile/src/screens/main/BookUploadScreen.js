/**
 * Book Upload Screen
 * For authors to upload their books with progress tracking
 */

import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
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
  InteractionManager,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Header from '../../components/common/Header';
import { useCategories } from '../../context/CategoriesContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import {
  requestPermissionWithFallback,
  PERMISSIONS,
  checkStoragePermission,
  checkCameraPermission,
  needsStoragePermissionForDocuments,
  requestPermissionIfNeeded,
} from '../../utils/permissions';

/* =======================
   Helper: extract file URL
======================= */
const extractFileUrl = (res) => {
  if (!res || typeof res !== 'object' || res === null || res instanceof Error) return null;
  
  try {
    // Use 'in' operator to check for properties, then use bracket notation to safely access
    if ('url' in res) {
      try {
        const urlValue = res['url'];
        if (urlValue && typeof urlValue === 'string') return urlValue;
      } catch (e) {
        // Property exists but can't be accessed
      }
    }
    if ('path' in res) {
      try {
        const pathValue = res['path'];
        if (pathValue && typeof pathValue === 'string') return pathValue;
      } catch (e) {
        // Property exists but can't be accessed
      }
    }
    if ('publicUrl' in res) {
      try {
        const publicUrlValue = res['publicUrl'];
        if (publicUrlValue && typeof publicUrlValue === 'string') return publicUrlValue;
      } catch (e) {
        // Property exists but can't be accessed
      }
    }
    if ('signedUrl' in res) {
      try {
        const signedUrlValue = res['signedUrl'];
        if (signedUrlValue && typeof signedUrlValue === 'string') return signedUrlValue;
      } catch (e) {
        // Property exists but can't be accessed
      }
    }
    if ('data' in res && res['data'] && typeof res['data'] === 'object') {
      const data = res['data'];
      if ('url' in data) {
        try {
          const urlValue = data['url'];
          if (urlValue && typeof urlValue === 'string') return urlValue;
        } catch (e) {}
      }
      if ('path' in data) {
        try {
          const pathValue = data['path'];
          if (pathValue && typeof pathValue === 'string') return pathValue;
        } catch (e) {}
      }
    }
    if ('file' in res && res['file'] && typeof res['file'] === 'object') {
      const file = res['file'];
      if ('url' in file) {
        try {
          const urlValue = file['url'];
          if (urlValue && typeof urlValue === 'string') return urlValue;
        } catch (e) {}
      }
      if ('path' in file) {
        try {
          const pathValue = file['path'];
          if (pathValue && typeof pathValue === 'string') return pathValue;
        } catch (e) {}
      }
    }
  } catch (error) {
    console.error('Error in extractFileUrl:', error);
    return null;
  }
  
  return null;
};

const BookUploadScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const { userId } = useAuth();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const isMountedRef = useRef(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] = useState(false);
  const [coverImageUri, setCoverImageUri] = useState(null); // Single cover image URI
  const [coverImageFile, setCoverImageFile] = useState(null); // Single cover image file for upload
  const [pdfFile, setPdfFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [bookType, setBookType] = useState('book'); // 'book' or 'audio'
  const { categories: categoriesList, loading: loadingCategories } = useCategories();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    language: 'English',
    pages: '',
    isbn: '',
  });

  // Categories are now provided by CategoriesContext

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);


  const handleImagePicker = useCallback(() => {
    // Show options for image selection - same pattern as profile screen
    Alert.alert(
      'Select Cover Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: selectImageFromCamera,
        },
        {
          text: 'Gallery',
          onPress: selectImageFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }, []);

  const selectImageFromCamera = useCallback(async () => {
    const hasPermission = await requestPermissionWithFallback(
      PERMISSIONS.CAMERA,
      'Camera'
    );
    if (!hasPermission) {
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setCoverImageUri(asset.uri || '');
          setCoverImageFile({
            uri: asset.uri || '',
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `cover_${Date.now()}.jpg`,
          });
        }
      }
    );
  }, []);

  const selectImageFromGallery = useCallback(async () => {
    const hasPermission = await requestPermissionWithFallback(
      PERMISSIONS.STORAGE,
      'Storage'
    );
    if (!hasPermission) {
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setCoverImageUri(asset.uri || '');
          setCoverImageFile({
            uri: asset.uri || '',
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `cover_${Date.now()}.jpg`,
          });
        }
      }
    );
  }, []);

  const removeCoverImage = useCallback(() => {
    setCoverImageUri(null);
    setCoverImageFile(null);
  }, []);

  const handleDocumentPicker = async () => {
    try {
      // Wait for interactions to complete to ensure activity is ready
      await new Promise((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          // Add longer delay to ensure activity is fully ready
          setTimeout(resolve, 300);
        });
      });

      if (!isMountedRef.current) {
        return;
      }

      // On Android 13+, document picker doesn't need storage permission
      // It uses the system file picker which doesn't require explicit permission
      if (needsStoragePermissionForDocuments()) {
        const hasPermission = await requestPermissionWithFallback(
          PERMISSIONS.STORAGE,
          'Storage'
        );
        if (!hasPermission) {
          return;
        }
      }

      if (!isMountedRef.current) {
        return;
      }

      // Use pick() which returns an array - handle both single and multiple results
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });

      if (!isMountedRef.current) {
        return;
      }

      // Handle array result from pick()
      const file = Array.isArray(result) ? result[0] : result;
      if (file) {
        setPdfFile({
          uri: file.fileCopyUri || file.uri,
          name: file.name || 'book.pdf',
          type: file.type || 'application/pdf',
          size: file.size,
          file: {
            uri: file.fileCopyUri || file.uri,
            type: file.type || 'application/pdf',
            name: file.name || 'book.pdf',
          },
        });
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker - no error needed
        return;
      } else {
        console.error('Error picking document:', err);
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        
        // Check for specific activity errors
        if (errorMessage.includes('Current activity') || errorMessage.includes('activity')) {
          Alert.alert(
            'Error',
            'Please try again. If the error persists, close and reopen the app.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Error',
            `Failed to select file: ${errorMessage}\n\nPlease try again.`,
            [{ text: 'OK' }]
          );
        }
      }
    }
  };

  const handleAudioPicker = async () => {
    try {
      // Wait for interactions to complete to ensure activity is ready
      await new Promise((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          // Add longer delay to ensure activity is fully ready
          setTimeout(resolve, 300);
        });
      });

      if (!isMountedRef.current) {
        return;
      }

      // On Android 13+, document picker doesn't need storage permission
      if (needsStoragePermissionForDocuments()) {
        const hasPermission = await requestPermissionWithFallback(
          PERMISSIONS.STORAGE,
          'Storage'
        );
        if (!hasPermission) {
          return;
        }
      }

      if (!isMountedRef.current) {
        return;
      }

      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.audio,
          'audio/mpeg',
          'audio/mp3',
          'audio/m4a',
          'audio/wav',
        ],
        copyTo: 'cachesDirectory',
      });

      if (!isMountedRef.current) {
        return;
      }

      // Handle array result from pick()
      const file = Array.isArray(result) ? result[0] : result;
      if (file) {
        setAudioFile({
          uri: file.fileCopyUri || file.uri,
          name: file.name || 'audio.mp3',
          type: file.type || 'audio/mpeg',
          size: file.size,
          file: {
            uri: file.fileCopyUri || file.uri,
            type: file.type || 'audio/mpeg',
            name: file.name || 'audio.mp3',
          },
        });
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker - no error needed
        return;
      } else {
        console.error('Error picking audio:', err);
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        
        // Check for specific activity errors
        if (errorMessage.includes('Current activity') || errorMessage.includes('activity')) {
          Alert.alert(
            'Error',
            'Please try again. If the error persists, close and reopen the app.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Error',
            `Failed to select audio file: ${errorMessage}\n\nPlease try again.`,
            [{ text: 'OK' }]
          );
        }
      }
    }
  };

  const uploadBook = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please login to upload books');
      return;
    }

    // Validate required fields for books
    // Both PDF and cover images are now optional
    // User can upload a book with just the basic information

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (bookType === 'book') {
        // Calculate total steps - Both PDF and cover image are optional
        let pdfUploadStep = pdfFile ? 1 : 0; // PDF is optional
        let imageUploadStep = (coverImageFile && coverImageFile.uri && !coverImageFile.uri.startsWith('http')) ? 1 : 0; // Only upload if new image selected
        let totalSteps = pdfUploadStep + imageUploadStep + 1; // Files + Create record
        // Ensure at least 1 step for book creation
        if (totalSteps === 0) totalSteps = 1;
        let currentStep = 0;

        let pdfUrl = null;
        let coverImageUrl = coverImageUri && coverImageUri.startsWith('http') ? coverImageUri : null; // Use existing URL if it's already uploaded

        // Step 1: Upload cover image if a new one was selected (same pattern as profile screen)
        if (coverImageFile && coverImageFile.uri && !coverImageFile.uri.startsWith('http')) {
          setUploadingCoverImage(true);
          setUploadProgress(Math.round((currentStep / totalSteps) * 100));
          try {
            const uploadResult = await apiClient.uploadFile(
              coverImageFile,
              'books',
              'covers'
              // Removed userId parameter to match profile upload pattern
            );
            // Safely extract URL using bracket notation and 'in' operator
            if (uploadResult && typeof uploadResult === 'object' && !(uploadResult instanceof Error)) {
              const uploadedUrl = ('url' in uploadResult && uploadResult['url']) 
                ? uploadResult['url'] 
                : null;
              if (uploadedUrl) {
                coverImageUrl = uploadedUrl;
                setCoverImageUri(uploadedUrl);
                console.log('✅ Cover image uploaded:', coverImageUrl);
              }
            }
          } catch (uploadError) {
            console.error('Error uploading cover image:', uploadError);
            console.error('Upload error details:', {
              message: uploadError?.message,
              name: uploadError?.name,
              stack: uploadError?.stack,
            });
            // Cover image is optional - don't show error alert, just log and continue
            // The book will be created without cover image
            console.warn('⚠️ Cover image upload failed (optional):', uploadError?.message || 'Unknown error');
            coverImageUrl = null;
          } finally {
            setUploadingCoverImage(false);
            currentStep++;
            setUploadProgress(Math.round((currentStep / totalSteps) * 100));
          }
        }

        // Step 2: Upload PDF file (OPTIONAL)
        if (pdfFile) {
          setUploadProgress(Math.round((currentStep / totalSteps) * 100));
          try {
            const fileToUpload = pdfFile.file || {
              uri: pdfFile.uri,
              type: pdfFile.type || 'application/pdf',
              name: pdfFile.name || 'book.pdf',
            };
            
            // uploadFile will return { success: true, url: string } or throw Error
            const pdfResult = await apiClient.uploadFile(fileToUpload, 'books', 'pdfs');
            // Removed userId parameter to match profile upload pattern
            console.log('✅ PDF upload successful:', pdfResult);
            
            // Extract URL - it's guaranteed to exist if we get here
            pdfUrl = pdfResult.url;
            
            if (!pdfUrl) {
              throw new Error('Upload succeeded but no URL returned');
            }
            
            currentStep++;
            setUploadProgress(Math.round((currentStep / totalSteps) * 100));
          } catch (uploadError) {
            console.warn('⚠️ PDF upload failed (optional):', uploadError);
            // Don't stop the upload process if PDF fails - it's optional
            // Just log the warning and continue
            pdfUrl = null;
          }
        }

        // Step 3: Create book record (Both PDF and cover image are optional)
        setUploadProgress(Math.round((currentStep / totalSteps) * 100));
        const bookPrice = parseFloat(formData.price) || 0;
        const bookData = {
          title: formData.title,
          author_id: userId,
          summary: formData.description,
          price: bookPrice,
          original_price: bookPrice, // Set original_price same as price
          pages: formData.pages ? parseInt(formData.pages) : null,
          language: formData.language,
          category_id: formData.category,
          isbn: formData.isbn || null,
          is_free: false,
          pdf_url: pdfUrl || null, // Optional
          cover_image_url: coverImageUrl || null, // Optional - single cover image
          cover_images: coverImageUrl ? [coverImageUrl] : [], // Optional - array with single image
          published_date: new Date().toISOString(), // Set published date to current date
        };
        await apiClient.createBook(bookData);
        currentStep++;
        setUploadProgress(100);

        // Build success message with info about optional components
        let successMessage = 'Book uploaded successfully!';
        const missingComponents = [];
        if (!coverImageUrl && coverImageFile) {
          missingComponents.push('cover image');
        }
        if (!pdfUrl && pdfFile) {
          missingComponents.push('PDF');
        }
        if (missingComponents.length > 0) {
          successMessage += `\n\nNote: ${missingComponents.join(' and ')} could not be uploaded due to network issues, but the book was created successfully.`;
        }

        Alert.alert(
          'Success',
          successMessage,
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
                setCoverImageUri(null);
                setCoverImageFile(null);
                setPdfFile(null);
                setUploadProgress(0);
                navigation.goBack();
              },
            },
          ]
        );
      } else if (bookType === 'audio') {
        // Calculate total steps for audio book (files are optional)
        let audioUploadStep = audioFile ? 1 : 0;
        let imageUploadStep = (coverImageFile && coverImageFile.uri && !coverImageFile.uri.startsWith('http')) ? 1 : 0; // Only upload if new image selected
        let totalSteps = audioUploadStep + imageUploadStep + 1;
        let currentStep = 0;

        let audioUrl = null;
        let coverImageUrl = coverImageUri && coverImageUri.startsWith('http') ? coverImageUri : null; // Use existing URL if it's already uploaded

        // Step 1: Upload cover image if a new one was selected (same pattern as profile screen)
        if (coverImageFile && coverImageFile.uri && !coverImageFile.uri.startsWith('http')) {
          setUploadingCoverImage(true);
          setUploadProgress(Math.round((currentStep / totalSteps) * 100));
          try {
            const uploadResult = await apiClient.uploadFile(
              coverImageFile,
              'audio-books',
              'covers'
              // Removed userId parameter to match profile upload pattern
            );
            // Safely extract URL using bracket notation and 'in' operator
            if (uploadResult && typeof uploadResult === 'object' && !(uploadResult instanceof Error)) {
              const uploadedUrl = ('url' in uploadResult && uploadResult['url']) 
                ? uploadResult['url'] 
                : null;
              if (uploadedUrl) {
                coverImageUrl = uploadedUrl;
                setCoverImageUri(uploadedUrl);
                console.log('✅ Cover image uploaded:', coverImageUrl);
              }
            }
          } catch (uploadError) {
            console.error('Error uploading cover image:', uploadError);
            // Cover image is optional - don't show error alert, just log and continue
            console.warn('⚠️ Cover image upload failed (optional):', uploadError?.message || 'Unknown error');
            coverImageUrl = null;
          } finally {
            setUploadingCoverImage(false);
            currentStep++;
            setUploadProgress(Math.round((currentStep / totalSteps) * 100));
          }
        }

        // Step 2: Upload audio file (OPTIONAL)
        if (audioFile) {
          setUploadProgress(Math.round((currentStep / totalSteps) * 100));
          try {
            const fileToUpload = audioFile.file || {
              uri: audioFile.uri,
              type: audioFile.type || 'audio/mpeg',
              name: audioFile.name || 'audio.mp3',
            };
            const audioResult = await apiClient.uploadFile(fileToUpload, 'audio-books', 'audio');
            // Removed userId parameter to match profile upload pattern
            audioUrl = audioResult.url;
            if (!audioUrl) {
              throw new Error('Upload succeeded but no URL returned');
            }
            currentStep++;
            setUploadProgress(Math.round((currentStep / totalSteps) * 100));
            console.log('✅ Audio upload successful:', audioUrl);
          } catch (uploadError) {
            console.warn('⚠️ Audio upload failed (optional):', uploadError);
            // Continue without audio
            audioUrl = null;
          }
        }

        // Step 3: Create audio book record (even without files for testing)
        setUploadProgress(Math.round((currentStep / totalSteps) * 100));
        const audioBookData = {
          title: formData.title,
          author_id: userId,
          description: formData.description,
          duration: '00:00', // TODO: Calculate from audio file
          language: formData.language,
          category_id: formData.category,
          is_free: true, // Audio books default to free
          audio_url: audioUrl, // Can be null for testing
          cover_url: coverImageUrl || null, // Can be null for testing
          published_date: new Date().toISOString(), // Set published date to current date
        };
        // Create audio book record via API
        const createdAudioBook = await apiClient.createAudioBook(audioBookData);
        console.log('Audio book created successfully:', createdAudioBook);
        currentStep++;
        setUploadProgress(100);

        // Build success message with info about optional components
        let successMessage = 'Audio book uploaded successfully!';
        const missingComponents = [];
        if (!coverImageUrl && coverImageFile) {
          missingComponents.push('cover image');
        }
        if (!audioUrl && audioFile) {
          missingComponents.push('audio file');
        }
        if (missingComponents.length > 0) {
          successMessage += `\n\nNote: ${missingComponents.join(' and ')} could not be uploaded due to network issues, but the audio book was created successfully.`;
        }

        Alert.alert(
          'Success',
          successMessage,
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
                setCoverImageUri(null);
                setCoverImageFile(null);
                setAudioFile(null);
                setUploadProgress(0);
                navigation.goBack();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload book. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
    if (bookType === 'book') {
      // PDF file is now optional for testing
      // if (!pdfFile) {
      //   Alert.alert('Error', 'Please upload a PDF file');
      //   return;
      // }
      if (!formData.price || parseFloat(formData.price) < 0) {
        Alert.alert('Error', 'Please enter a valid price');
        return;
      }
    } else {
      // Audio file is now optional for testing
      // if (!audioFile) {
      //   Alert.alert('Error', 'Please upload an audio file');
      //   return;
      // }
    }

    // Start upload
    uploadBook();
  };

  // Create stable callback functions for each input field
  const handleTitleChange = useCallback((value) => handleInputChange('title', value), [handleInputChange]);
  const handleDescriptionChange = useCallback((value) => handleInputChange('description', value), [handleInputChange]);
  const handlePriceChange = useCallback((value) => handleInputChange('price', value), [handleInputChange]);
  const handlePagesChange = useCallback((value) => handleInputChange('pages', value), [handleInputChange]);
  const handleIsbnChange = useCallback((value) => handleInputChange('isbn', value), [handleInputChange]);

  // Memoize InputField component to prevent re-creation
  const InputField = useMemo(() => {
    return memo(({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) => {
      const inputStyles = useMemo(() => [styles.input, multiline && styles.textArea], [multiline]);

      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={inputStyles}
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
    });
  }, [styles, themeColors.input.placeholder]);

  // Memoize styles to prevent re-creation on every render
  const styles = useMemo(() => StyleSheet.create({
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
    categoryLoadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
    },
    categoryLoadingText: {
      marginLeft: 8,
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
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
    imageLoadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
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
  }), [themeColors, fontSizeMultiplier]);

  return (
    <View style={styles.container}>
      <Header title="Upload Book" navigation={navigation} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Book Information</Text>

          <InputField
            label="Book Title *"
            value={formData.title}
            onChangeText={handleTitleChange}
            placeholder="Enter book title"
          />

          <InputField
            label="Description *"
            value={formData.description}
            onChangeText={handleDescriptionChange}
            placeholder="Enter book description"
            multiline={true}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            {loadingCategories ? (
              <View style={styles.categoryLoadingContainer}>
                <ActivityIndicator size="small" color={themeColors.primary.main} />
                <Text style={styles.categoryLoadingText}>Loading categories...</Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {(categoriesList || []).map((cat) => (
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
            )}
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <InputField
                label="Price (₹) *"
                value={formData.price}
                onChangeText={handlePriceChange}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <InputField
                label="Pages"
                value={formData.pages}
                onChangeText={handlePagesChange}
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
                onChangeText={handleIsbnChange}
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
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleDocumentPicker}
                >
                  <Text style={styles.uploadButtonText}>📄 Choose PDF File (Optional)</Text>
                  <Text style={styles.uploadHint}>PDF, EPUB, MOBI formats supported</Text>
                </TouchableOpacity>
                {pdfFile && (
                  <View style={styles.audioFileInfo}>
                    <Text style={styles.audioFileName} numberOfLines={1}>
                      📄 {pdfFile.name || 'book.pdf'}
                    </Text>
                    {pdfFile.size && (
                      <Text style={styles.audioFileSize}>
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => setPdfFile(null)}
                      style={styles.removeAudioButton}
                    >
                      <Text style={styles.removeAudioText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Cover Image (Optional)</Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleImagePicker}
                  disabled={uploadingCoverImage || isUploading}
                >
                  <Text style={styles.uploadButtonText}>
                    {uploadingCoverImage ? 'Uploading...' : '🖼️ Add Cover Image'}
                  </Text>
                  <Text style={styles.uploadHint}>JPG, PNG formats supported (Optional)</Text>
                </TouchableOpacity>
                {coverImageUri && (
                  <View style={styles.imagePreviewContainer}>
                    <View style={styles.imagePreviewWrapper}>
                      <Image
                        source={{ uri: coverImageUri }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      {uploadingCoverImage && (
                        <View style={styles.imageLoadingOverlay}>
                          <ActivityIndicator size="small" color={themeColors.text.light} />
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={removeCoverImage}
                        activeOpacity={0.7}
                        disabled={uploadingCoverImage || isUploading}
                      >
                        <Text style={styles.removeImageIcon}>✕</Text>
                      </TouchableOpacity>
                      {coverImageFile && coverImageFile.name && (
                        <Text style={styles.imageName} numberOfLines={1}>
                          {coverImageFile.name}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={styles.uploadSection}>
              <Text style={styles.sectionTitle}>Upload Audio File (Podcast)</Text>
              <Text style={[styles.uploadHint, { marginBottom: 12, color: themeColors.primary.main }]}>
                ⚠️ Audio books are free only. All audio content will be available to all readers.
              </Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleAudioPicker}
              >
                <Text style={styles.uploadButtonText}>🎙️ Choose Audio File</Text>
                <Text style={styles.uploadHint}>MP3, M4A, WAV formats supported</Text>
              </TouchableOpacity>
              {audioFile && (
                <View style={styles.audioFileInfo}>
                  <Text style={styles.audioFileName} numberOfLines={1}>
                    🎙️ {audioFile.name || 'audio.mp3'}
                  </Text>
                  {audioFile.size && (
                    <Text style={styles.audioFileSize}>
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => setAudioFile(null)}
                    style={styles.removeAudioButton}
                  >
                    <Text style={styles.removeAudioText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Cover Image for Podcast (Optional)</Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleImagePicker}
                  disabled={uploadingCoverImage || isUploading}
                >
                  <Text style={styles.uploadButtonText}>
                    {uploadingCoverImage ? 'Uploading...' : '🖼️ Add Cover Image'}
                  </Text>
                  <Text style={styles.uploadHint}>JPG, PNG formats supported (Optional)</Text>
                </TouchableOpacity>
                {coverImageUri && (
                  <View style={styles.imagePreviewContainer}>
                    <View style={styles.imagePreviewWrapper}>
                      <Image
                        source={{ uri: coverImageUri }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      {uploadingCoverImage && (
                        <View style={styles.imageLoadingOverlay}>
                          <ActivityIndicator size="small" color={themeColors.text.light} />
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={removeCoverImage}
                        activeOpacity={0.7}
                        disabled={uploadingCoverImage || isUploading}
                      >
                        <Text style={styles.removeImageIcon}>✕</Text>
                      </TouchableOpacity>
                      {coverImageFile && coverImageFile.name && (
                        <Text style={styles.imageName} numberOfLines={1}>
                          {coverImageFile.name}
                        </Text>
                      )}
                    </View>
                  </View>
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

