/**
 * Authentication Context
 * Manages authentication state across the app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = '@agribook_auth';
const USER_STORAGE_KEY = '@agribook_user';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userInterests, setUserInterests] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null); // Store full user data

  useEffect(() => {
    // Check authentication status on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is logged in
      const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const userDataStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
      
      if (authData && userDataStr) {
        const auth = JSON.parse(authData);
        const user = JSON.parse(userDataStr);
        
        // Restore auth state
        setIsAuthenticated(true);
        setUserRole(auth.role);
        setUserInterests(auth.interests || []);
        setUserId(auth.userId || user.id);
        setUserData(user);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (role, interests = [], id = null, user = null) => {
    try {
      // Save auth data
      const authData = {
        role,
        interests,
        userId: id || user?.id || (role === 'author' ? '1' : null),
        loginTime: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      
      // Save user data if provided
      if (user) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        setUserData(user);
      }
      
      // Update state
      setUserRole(role);
      setUserInterests(interests);
      setUserId(authData.userId);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear storage first
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      
      // Clear state - this will trigger AppNavigator to switch to AuthStack
      setIsAuthenticated(false);
      setUserRole(null);
      setUserInterests([]);
      setUserId(null);
      setUserData(null);
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const updateUserData = async (user) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      setUserData(user);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    userRole,
    userInterests,
    userId,
    userData,
    login,
    logout,
    updateUserData,
    setUserInterests,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

