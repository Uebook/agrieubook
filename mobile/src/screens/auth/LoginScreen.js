/**
 * Login Screen
 * Supports: Mobile OTP, Email, Google/Apple Login
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
} from 'react-native';
import Colors from '../../../color';
import apiClient from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

const LoginScreen = ({ navigation }) => {
  const { getThemeColors } = useSettings();
  const themeColors = getThemeColors();
  const [loginMethod, setLoginMethod] = useState('mobile'); // 'mobile', 'email', 'social'
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMobileLogin = async () => {
    if (mobileNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }
    
    setLoading(true);
    try {
      // Send OTP via API
      const response = await apiClient.sendOTP(mobileNumber);
      
      if (response.success) {
        // Navigate to OTP screen
        navigation.navigate('OTP', { mobileNumber });
        
        // Show OTP in development mode
        if (response.otp) {
          Alert.alert('Development Mode', `OTP: ${response.otp}\n\n(This is only shown in development)`);
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Please enter a password (minimum 6 characters)');
      return;
    }
    
    setLoading(true);
    try {
      // Login via API
      const response = await apiClient.login(email, password);
      
      if (response.success) {
        // Navigate to role selection with user data
        navigation.navigate('RoleSelection', {
          userData: response.user,
          emailLogin: true,
        });
      } else {
        Alert.alert('Error', response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // TODO: Implement social login (Google/Apple)
    Alert.alert('Info', `${provider} login coming soon`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>Agri eBook Hub</Text>
            <Text style={styles.subtitle}>Your agricultural knowledge companion</Text>
          </View>

          {/* Login Methods Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, loginMethod === 'mobile' && styles.activeTab]}
              onPress={() => setLoginMethod('mobile')}
            >
              <Text style={[styles.tabText, loginMethod === 'mobile' && styles.activeTabText]}>
                Mobile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, loginMethod === 'email' && styles.activeTab]}
              onPress={() => setLoginMethod('email')}
            >
              <Text style={[styles.tabText, loginMethod === 'email' && styles.activeTabText]}>
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mobile Login Form */}
          {loginMethod === 'mobile' && (
            <View style={styles.form}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor={themeColors.input.placeholder}
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                maxLength={10}
              />
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleMobileLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.button.text} />
                ) : (
                  <Text style={styles.primaryButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Email Login Form */}
          {loginMethod === 'email' && (
            <View style={styles.form}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor={themeColors.input.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={themeColors.input.placeholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.button.text} />
                ) : (
                  <Text style={styles.primaryButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Google')}
            >
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('Apple')}
              >
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Register Link */}
          <View style={styles.registerLinkContainer}>
            <Text style={styles.registerLinkText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Colors.primary.main,
  },
  tabText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.text.light,
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
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
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.button.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  socialContainer: {
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.light,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.text.tertiary,
    fontSize: 14,
  },
  socialButton: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  socialButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerLinkText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;

