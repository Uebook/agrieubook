/**
 * Book Upload Screen (FIXED)
 * PDF + Cover Images upload working
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
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import apiClient from '../../services/api';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';

/* =======================
   Helper: extract file URL
======================= */
const extractFileUrl = (res) => {
  if (!res || typeof res !== 'object') return null;
  return (
    res.url ||
    res.path ||
    res.publicUrl ||
    res.data?.url ||
    res.data?.path ||
    res.file?.url ||
    res.file?.path ||
    null
  );
};

const BookUploadScreen = ({ navigation }) => {
  const { userId } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [coverImages, setCoverImages] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =======================
     Pick PDF
  ======================= */
  const pickPdf = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });

      const file = res[0];
      setPdfFile({
        uri: file.fileCopyUri || file.uri,
        name: file.name,
        type: file.type || 'application/pdf',
      });
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        Alert.alert('Error', 'PDF selection failed');
      }
    }
  };

  /* =======================
     Pick Images
  ======================= */
  const pickImages = async () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 5 },
      (res) => {
        if (res.didCancel || !res.assets) return;

        const images = res.assets.map((a, i) => ({
          id: `${Date.now()}_${i}`,
          uri: a.uri,
          name: a.fileName || `cover_${i}.jpg`,
          type: a.type || 'image/jpeg',
        }));

        setCoverImages((prev) => [...prev, ...images]);
      }
    );
  };

  /* =======================
     Upload Book
  ======================= */
  const uploadBook = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Title & description required');
      return;
    }

    setLoading(true);

    try {
      let pdfUrl = null;
      let coverUrls = [];

      /* ---------- Upload PDF ---------- */
      if (pdfFile) {
        const pdfRes = await apiClient.uploadFile(
          pdfFile,
          'books',
          'pdfs',
          userId
        );

        pdfUrl = extractFileUrl(pdfRes);
        if (!pdfUrl) {
          throw new Error('PDF uploaded but no URL returned');
        }
      }

      /* ---------- Upload Images ---------- */
      for (let img of coverImages) {
        const imgRes = await apiClient.uploadFile(
          img,
          'books',
          'covers',
          userId
        );

        const imgUrl = extractFileUrl(imgRes);
        if (imgUrl) coverUrls.push(imgUrl);
      }

      /* ---------- Create Book ---------- */
      await apiClient.createBook({
        title,
        summary: description,
        author_id: userId,
        price: Number(price) || 0,
        pdf_url: pdfUrl,
        cover_image_url: coverUrls[0] || null,
        cover_images: coverUrls,
      });

      Alert.alert('Success', 'Book uploaded successfully');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', e.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <View style={styles.container}>
      <Header title="Upload Book" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Book Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Price (₹)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={pickPdf}>
          <Text style={styles.btnText}>📄 Select PDF</Text>
        </TouchableOpacity>

        {pdfFile && <Text style={styles.fileName}>{pdfFile.name}</Text>}

        <TouchableOpacity style={styles.button} onPress={pickImages}>
          <Text style={styles.btnText}>🖼️ Select Cover Images</Text>
        </TouchableOpacity>

        <View style={styles.imageRow}>
          {coverImages.map((img) => (
            <Image
              key={img.id}
              source={{ uri: img.uri }}
              style={styles.image}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submit, loading && { opacity: 0.6 }]}
          onPress={uploadBook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Upload Book</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default BookUploadScreen;

/* =======================
   Styles
======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  label: { fontWeight: '600', marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginTop: 6,
  },
  textArea: { height: 100 },
  button: {
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { fontWeight: '600' },
  fileName: { marginTop: 8, fontSize: 12 },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  image: {
    width: 80,
    height: 120,
    marginRight: 8,
    borderRadius: 6,
  },
  submit: {
    marginTop: 24,
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700' },
});
