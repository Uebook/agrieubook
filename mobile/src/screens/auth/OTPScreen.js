/**
 * OTP Verification Screen
 * Verifies OTP sent to mobile number
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Colors from '../../../color';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';

const OTPScreen = ({ route, navigation }) => {
  const { mobileNumber } = route.params || {};
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }
    
    setVerifying(true);
    
    try {
      // Verify OTP with backend API
      const response = await apiClient.verifyOTP(mobileNumber, otpString);
      
      if (response.success) {
        // If user already has a role (from registration), login directly
        // Otherwise, navigate to role selection
        if (response.user?.role) {
          // User already has a role, skip role selection
          navigation.navigate('RoleSelection', {
            mobileNumber,
            userData: response.user,
            otpVerified: true,
            skipSelection: true, // Flag to skip role selection
          });
        } else {
          // New user or user without role, show role selection
          navigation.navigate('RoleSelection', {
            mobileNumber,
            userData: response.user,
            otpVerified: true,
          });
        }
      } else {
        Alert.alert('Error', response.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', error.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await apiClient.sendOTP(mobileNumber);
      if (response.success) {
        setTimer(60);
        Alert.alert('Success', 'OTP resent successfully');
        
        // Show OTP in development mode
        if (response.otp) {
          Alert.alert('Development Mode', `New OTP: ${response.otp}\n\n(This is only shown in development)`);
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.mobileNumber}>+91 {mobileNumber}</Text>
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              placeholder=""
              placeholderTextColor={Colors.input.placeholder}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, verifying && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={verifying}
        >
          {verifying ? (
            <ActivityIndicator color={Colors.button.text} />
          ) : (
            <Text style={styles.verifyButtonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive OTP?</Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  mobileNumber: {
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
  },
  verifyButton: {
    backgroundColor: Colors.button.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: Colors.text.secondary,
    marginRight: 8,
  },
  timerText: {
    color: Colors.text.tertiary,
  },
  resendLink: {
    color: Colors.primary.main,
    fontWeight: 'bold',
  },
});

export default OTPScreen;

