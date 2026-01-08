/**
 * File Upload Screen
 * Allows users to upload images and documents
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const FileUploadScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const { userId } = useAuth();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Image picker options
  const imagePickerOptions = useMemo(() => ({
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 2000,
    maxHeight: 2000,
    selectionLimit: 5,
  }), []);

  // Handle image selection from gallery
  const handleSelectImage = () => {
    launchImageLibrary(imagePickerOptions, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        uploadFiles(response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || asset.uri.split('/').pop() || 'image.jpg',
        })), 'books', 'covers');
      }
    });
  };

  // Handle camera capture
  const handleTakePhoto = () => {
    launchCamera(imagePickerOptions, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        uploadFiles(response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || asset.uri.split('/').pop() || 'image.jpg',
        })), 'books', 'covers');
      }
    });
  };

  // Handle document selection
  const handleSelectDocument = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images, DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });

      if (results && results.length > 0) {
        uploadFiles(results.map(result => ({
          uri: result.uri,
          type: result.type || 'application/pdf',
          name: result.name || result.uri.split('/').pop() || 'file.pdf',
        })), 'books', 'pdfs');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled
        return;
      }
      Alert.alert('Error', 'Failed to select document: ' + err.message);
    }
  };

  // Upload files
  const uploadFiles = async (files, bucket, folder) => {
    if (!userId) {
      Alert.alert('Error', 'Please login to upload files');
      return;
    }

    if (!files || files.length === 0) {
      Alert.alert('Error', 'No files selected');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls = [];
    const errors = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));

        try {
          const result = await apiClient.uploadFile(file, bucket, folder, userId);
          uploadedUrls.push({
            url: result.url,
            name: file.name,
            type: file.type,
            uploadedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          errors.push({
            name: file.name,
            error: error.message || 'Upload failed',
          });
        }
      }

      if (uploadedUrls.length > 0) {
        setUploadedFiles(prev => [...prev, ...uploadedUrls]);
        Alert.alert(
          'Success',
          `Successfully uploaded ${uploadedUrls.length} file(s)${errors.length > 0 ? `\n${errors.length} file(s) failed` : ''}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Upload Failed',
          `Failed to upload all files:\n${errors.map(e => `• ${e.name}: ${e.error}`).join('\n')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Clear uploaded files list
  const handleClearList = () => {
    Alert.alert(
      'Clear List',
      'Are you sure you want to clear the uploaded files list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setUploadedFiles([]),
        },
      ]
    );
  };

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
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18 * fontSizeMultiplier,
      fontWeight: 'bold',
      color: themeColors.text.primary,
      marginBottom: 16,
    },
    sectionDescription: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginBottom: 20,
      lineHeight: 20,
    },
    buttonGroup: {
      gap: 12,
    },
    uploadButton: {
      backgroundColor: themeColors.primary.main,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    uploadButtonDisabled: {
      opacity: 0.6,
    },
    uploadButtonText: {
      color: themeColors.text.light,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
      marginLeft: 8,
    },
    uploadButtonIcon: {
      fontSize: 24 * fontSizeMultiplier,
    },
    progressContainer: {
      marginTop: 20,
      marginBottom: 20,
    },
    progressBar: {
      height: 8,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: themeColors.primary.main,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 8,
      textAlign: 'center',
    },
    uploadedFilesSection: {
      marginTop: 24,
    },
    uploadedFileItem: {
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    uploadedFileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    uploadedFileIcon: {
      fontSize: 24 * fontSizeMultiplier,
      marginRight: 12,
    },
    uploadedFileName: {
      flex: 1,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '500',
      color: themeColors.text.primary,
    },
    uploadedFileUrl: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      marginTop: 4,
    },
    uploadedFileDate: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.tertiary,
      marginTop: 4,
    },
    clearButton: {
      backgroundColor: themeColors.error || '#F44336',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    clearButtonText: {
      color: themeColors.text.light,
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyStateText: {
      fontSize: 14 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      textAlign: 'center',
    },
  }), [themeColors, fontSizeMultiplier]);

  return (
    <View style={styles.container}>
      <Header title="File Upload" navigation={navigation} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Upload Images Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📷 Upload Images</Text>
            <Text style={styles.sectionDescription}>
              Upload images from your gallery or take a new photo with your camera.
            </Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={handleSelectImage}
                disabled={uploading}
              >
                <Text style={styles.uploadButtonIcon}>🖼️</Text>
                <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={handleTakePhoto}
                disabled={uploading}
              >
                <Text style={styles.uploadButtonIcon}>📸</Text>
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upload Documents Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📄 Upload Documents</Text>
            <Text style={styles.sectionDescription}>
              Upload PDF files, documents, or any other file types.
            </Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={handleSelectDocument}
                disabled={uploading}
              >
                <Text style={styles.uploadButtonIcon}>📁</Text>
                <Text style={styles.uploadButtonText}>Choose Document</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Upload Progress */}
          {uploading && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                Uploading... {uploadProgress}%
              </Text>
            </View>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <View style={styles.uploadedFilesSection}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.sectionTitle}>✅ Uploaded Files ({uploadedFiles.length})</Text>
                <TouchableOpacity onPress={handleClearList}>
                  <Text style={{ color: themeColors.error || '#F44336', fontSize: 14 * fontSizeMultiplier }}>
                    Clear
                  </Text>
                </TouchableOpacity>
              </View>
              {uploadedFiles.map((file, index) => (
                <View key={index} style={styles.uploadedFileItem}>
                  <View style={styles.uploadedFileHeader}>
                    <Text style={styles.uploadedFileIcon}>
                      {file.type?.startsWith('image/') ? '🖼️' : '📄'}
                    </Text>
                    <Text style={styles.uploadedFileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                  </View>
                  <Text style={styles.uploadedFileUrl} numberOfLines={1}>
                    {file.url.substring(0, 60)}...
                  </Text>
                  <Text style={styles.uploadedFileDate}>
                    {new Date(file.uploadedAt).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {uploadedFiles.length === 0 && !uploading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No files uploaded yet.{'\n'}Select files to upload using the options above.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default FileUploadScreen;
