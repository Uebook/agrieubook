/**
 * Role Selection Screen
 * User selects their role: Reader/Customer or Author/Publisher
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Colors from '../../../color';

const RoleSelectionScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState(null);

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

  const handleContinue = () => {
    if (!selectedRole) {
      return;
    }
    // Navigate to onboarding
    navigation.navigate('Onboarding', { role: selectedRole });
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

