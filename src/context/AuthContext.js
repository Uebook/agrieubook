/**
 * Authentication Context
 * Manages authentication state across the app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userInterests, setUserInterests] = useState([]);
  const [userId, setUserId] = useState(null); // Store user ID for author filtering

  useEffect(() => {
    // Check authentication status
    // TODO: Implement actual auth check (AsyncStorage, API, etc.)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    // Simulate auth check
    // TODO: Replace with actual authentication check
    setTimeout(() => {
      setIsAuthenticated(false); // Set to false initially for login flow
      setIsLoading(false);
    }, 1000);
  };

  const login = (role, interests = [], id = null) => {
    setUserRole(role);
    setUserInterests(interests);
    setUserId(id || (role === 'author' ? '1' : null)); // Default author ID for demo
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserInterests([]);
    setUserId(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    userRole,
    userInterests,
    userId,
    login,
    logout,
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

