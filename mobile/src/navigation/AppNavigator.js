/**
 * Main App Navigator
 * Handles authentication state and routes between Auth and Main stacks
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../../color';
import { useAuth } from '../context/AuthContext';

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  // Use key prop to force complete remount when auth state changes
  // This ensures navigation state is completely reset
  return (
    <NavigationContainer key={isAuthenticated ? 'main' : 'auth'}>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
});

export default AppNavigator;

