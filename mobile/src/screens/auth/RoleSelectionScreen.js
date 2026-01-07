/**
 * Role Selection Screen
 * User selects their role: Reader/Customer or Author/Publisher
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import Colors from '../../../color';
import { useAuth } from '../../context/AuthContext';

const RoleSelectionScreen = ({ route, navigation }) => {
  const { login } = useAuth();
  const { mobileNumber, userData, otpVerified, skipSelection, emailLogin } = route.params || {};
  const [selectedRole, setSelectedRole] = useState(userData?.role || null);

  const roles = [
    {
      id: 'reader',
      title: 'Reader / Customer',
      description: 'Browse and read agricultural eBooks',
      icon: '📚',
    },
    {
      id: 'author',
      title: 'Author / Publisher',
      description: 'Publish and sell your eBooks',
      icon: '✍️',
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleAutoLogin = async () => {
    try {
      const role = userData.role;
      const userId = userData.id;
      const interests = userData.interests || [];
      
      await login(role, interests, userId, userData);
      // Navigation will happen automatically via AuthContext
    } catch (error) {
      console.error('Auto-login error:', error);
      // If auto-login fails, show role selection screen
    }
  };

  // Auto-login if user already has a role and skipSelection is true
  useEffect(() => {
    if (skipSelection && userData?.role) {
      handleAutoLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipSelection, userData?.role, userData?.id]);

  const handleContinue = async () => {
    if (!selectedRole) {
      return;
    }
    
    try {
      // Login user with selected role
      const role = selectedRole === 'author' ? 'author' : 'reader';
      
      // CRITICAL: userId must be the database UUID from userData
      // If userData doesn't have an ID, we can't proceed - user needs to login again
      if (!userData?.id) {
        Alert.alert(
          'Error',
          'User ID not found. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
        return;
      }
      
      const userId = userData.id; // Always use the database UUID
      
      console.log('🔐 Logging in user:', {
        userId,
        role,
        hasUserData: !!userData,
        userDataKeys: userData ? Object.keys(userData) : [],
      });
      
      // If user already has interests from registration, use them; otherwise skip onboarding
      const interests = userData?.interests || [];
      
      // Ensure userData has all required fields
      const completeUserData = {
        ...userData,
        id: userId, // Ensure ID is set
        role: role, // Update role
        mobile: userData.mobile || mobileNumber,
        name: userData.name || `User ${mobileNumber?.slice(-4) || ''}`,
        email: userData.email || '',
        interests: interests,
      };
      
      await login(role, interests, userId, completeUserData);
      
      // Skip onboarding if interests are already set (from registration)
      // Otherwise, navigate to onboarding to select interests
      if (interests.length === 0) {
        navigation.navigate('Onboarding', { role: selectedRole });
      }
      // If interests exist, navigation will happen automatically via AuthContext
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you want to use Agri eBook Hub
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.selectedRoleCard,
              ]}
              onPress={() => handleRoleSelect(role.id)}
            >
              <Text style={styles.roleIcon}>{role.icon}</Text>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
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
  rolesContainer: {
    marginBottom: 30,
  },
  roleCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  selectedRoleCard: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.background.tertiary,
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: Colors.button.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: Colors.button.disabled,
  },
  continueButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RoleSelectionScreen;

