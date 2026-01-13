import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'https://admin-orcin-omega.vercel.app';

const EditProfileScreen = ({ navigation, route }) => {
  // Get user from auth context or route params
  const { userData: authUser } = useAuth();
  const routeUser = route?.params?.user || {};
  const user = authUser || routeUser;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    bio: user?.bio || '',
  });

  const [avatarUri, setAvatarUri] = useState(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  // useEffect(() => {
  //   fetch('https://admin-orcin-omega.vercel.app')
  //     .then(() => console.log('✅ Network OK'))
  //     .catch(e => console.log('❌ Network FAILED', e));
  // }, []);
  const pickImage = async (camera = false) => {
    try {
      const img = camera
        ? await ImagePicker.openCamera({ width: 1200, height: 1200, cropping: true, compressImageQuality: 0.6, })
        : await ImagePicker.openPicker({ width: 1200, height: 1200, cropping: true, compressImageQuality: 0.6, });

      setAvatarUri(img.path);

      setAvatarFile({
        path: img.path,
        mime: img.mime,
        name: img.filename || `avatar_${Date.now()}.jpg`,
      });
    } catch (e) { }
  };

  const changePhoto = () => {
    Alert.alert('Change Photo', 'Select option', [
      { text: 'Camera', onPress: () => pickImage(true) },
      { text: 'Gallery', onPress: () => pickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const updateProfile = async () => {
    try {
      const formData = new FormData();

      formData.append('user_id', user.id);
      formData.append('name', form.name);

      if (avatarFile?.path) {
        const uri =
          Platform.OS === 'android'
            ? `file://${avatarFile.path}`
            : avatarFile.path;

        formData.append('profile_picture', {
          uri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        });
      }

      const res = await axios.post(
        'https://admin-orcin-omega.vercel.app/api/profile/update',
        formData,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      console.log('SUCCESS:', res.data);
    } catch (err) {
      console.log('NETWORK ERROR FULL:', {
        message: err.message,
        isAxios: err.isAxiosError,
        code: err.code,
        response: err.response,
        request: err.request,
      });
    }
  };



  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>

          <TouchableOpacity style={styles.avatarWrap} onPress={changePhoto}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarText}>+</Text>
            )}

            {uploading && (
              <View style={styles.overlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.changeText}>Change Photo</Text>

          <Input
            label="Full Name"
            value={form.name}
            onChange={v => setForm({ ...form, name: v })}
          />

          <Input
            label="Email"
            value={form.email}
            keyboardType="email-address"
            onChange={v => setForm({ ...form, email: v })}
          />

          <Input
            label="Mobile"
            value={form.mobile}
            keyboardType="phone-pad"
            onChange={v => setForm({ ...form, mobile: v })}
          />

          <Input
            label="Bio"
            value={form.bio}
            multiline
            onChange={v => setForm({ ...form, bio: v })}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={updateProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};

const Input = ({ label, value, onChange, multiline, keyboardType }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      keyboardType={keyboardType}
      style={[styles.input, multiline && styles.textArea]}
      placeholder={`Enter ${label}`}
    />
  </View>
);

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 3,
  },
  avatarWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 36,
    color: '#6B7280',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#4F46E5',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 6,
    color: '#374151',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
