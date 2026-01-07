/**
 * Categories Context
 * Provides categories data from API to all components
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api';

const CategoriesContext = createContext({
  categories: [],
  loading: false,
  error: null,
  refreshCategories: () => {},
});

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoriesProvider');
  }
  return context;
};

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching categories from API...');
      const response = await apiClient.getCategories();
      console.log('📦 Categories API response:', response);
      
      if (response?.categories && response.categories.length > 0) {
        // Map API categories to match expected format
        const mappedCategories = response.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || '📚',
          description: cat.description,
        }));
        console.log(`✅ Loaded ${mappedCategories.length} categories from API`);
        setCategories(mappedCategories);
      } else {
        console.warn('⚠️ No categories found in API response');
        setCategories([]);
      }
    } catch (err) {
      console.error('❌ Error fetching categories from API:', err);
      setError(err.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        error,
        refreshCategories: fetchCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

