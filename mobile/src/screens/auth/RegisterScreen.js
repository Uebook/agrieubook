/**
 * Register Screen
 * Create new account with email, mobile, password, and role selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Colors from '../../../color';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { categories as categoryData } from '../../services/dummyData';
import { useSettings } from '../../context/SettingsContext';

const RegisterScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { getThemeColors } = useSettings();
  const themeColors = getThemeColors();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: 'reader', // 'reader' or 'author'
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const categories = categoryData;

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (formData.name.trim().length < 3) {
      Alert.alert('Error', 'Name must be at least 3 characters');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number (10 digits)');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one interested category');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Register user via API
      const response = await apiClient.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        role: formData.role,
        interests: selectedCategories, // Send selected category IDs
      });

      if (response.success) {
        // Auto-login after registration with selected categories
        await login(
          formData.role,
          selectedCategories, // Pass selected categories
          response.user.id,
          response.user
        );

        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigation will automatically switch to MainStack via AppNavigator
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>Create Account</Text>
              <Text style={styles.subtitle}>Join Agri eBook Hub</Text>
            </View>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.label}>I want to</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'reader' && styles.roleButtonActive,
                  ]}
                  onPress={() => handleInputChange('role', 'reader')}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === 'reader' && styles.roleButtonTextActive,
                    ]}
                  >
                    📚 Read Books
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.role === 'author' && styles.roleButtonActive,
                  ]}
                  onPress={() => handleInputChange('role', 'author')}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      formData.role === 'author' && styles.roleButtonTextActive,
                    ]}
                  >
                    ✍️ Publish Books
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={themeColors.input.placeholder}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor={themeColors.input.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
              />

              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor={themeColors.input.placeholder}
                keyboardType="phone-pad"
                value={formData.mobile}
                onChangeText={(value) => handleInputChange('mobile', value)}
                maxLength={10}
              />

              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password (min 6 characters)"
                  placeholderTextColor={themeColors.input.placeholder}
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor={themeColors.input.placeholder}
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Interested Categories Selection */}
              <View style={styles.categoriesContainer}>
                <Text style={styles.label}>Select Your Interests *</Text>
                <Text style={styles.categoriesSubtext}>
                  Choose categories you're interested in (at least one required)
                </Text>
                <View style={styles.categoriesGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        selectedCategories.includes(category.id) && styles.selectedChip,
                      ]}
                      onPress={() => toggleCategory(category.id)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selectedCategories.includes(category.id) && styles.selectedChipText,
                        ]}
                      >
                        {category.icon} {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {selectedCategories.length > 0 && (
                  <Text style={styles.selectedCount}>
                    {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.button.text} />
                ) : (
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginLinkText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main + '20',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  roleButtonTextActive: {
    color: Colors.primary.main,
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.input.background,
    borderWidth: 1,
    borderColor: Colors.input.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.input.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.input.background,
    borderWidth: 1,
    borderColor: Colors.input.border,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.input.text,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  primaryButton: {
    backgroundColor: Colors.button.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    marginTop: 24,
    marginBottom: 8,
  },
  categoriesSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectedChipText: {
    color: Colors.text.light,
    fontWeight: 'bold',
  },
  selectedCount: {
    fontSize: 12,
    color: Colors.primary.main,
    marginTop: 8,
    fontWeight: '500',
  },
});

export default RegisterScreen;

