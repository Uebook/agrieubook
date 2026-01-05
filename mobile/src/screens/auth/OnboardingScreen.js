/**
 * Onboarding Screen
 * User selects preferred categories during onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Colors from '../../../color';
import { useAuth } from '../../context/AuthContext';
import { categories as categoryData } from '../../services/dummyData';

const OnboardingScreen = ({ route, navigation }) => {
  const { role } = route.params || {};
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { login, userData } = useAuth();

  const categories = categoryData.map((cat) => cat.name);

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleFinish = () => {
    if (selectedCategories.length === 0) {
      return;
    }
    // Save preferences and update user interests
    // Update interests in context
    login(role, selectedCategories);
    
    // TODO: Update interests in API/database if user is logged in
    // if (userData?.id) {
    //   await apiClient.updateUser(userData.id, { interests: selectedCategories });
    // }
    
    // Navigation will happen automatically via AuthContext state change
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Interests</Text>
          <Text style={styles.subtitle}>
            Choose your preferred categories to get personalized recommendations
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategories.includes(category) && styles.selectedChip,
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategories.includes(category) && styles.selectedText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.finishButton,
            selectedCategories.length === 0 && styles.finishButtonDisabled,
          ]}
          onPress={handleFinish}
          disabled={selectedCategories.length === 0}
        >
          <Text style={styles.finishButtonText}>
            {selectedCategories.length > 0
              ? `Continue (${selectedCategories.length} selected)`
              : 'Select at least one category'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  categoryChip: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    margin: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  selectedChip: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  categoryText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  selectedText: {
    color: Colors.text.light,
  },
  finishButton: {
    backgroundColor: Colors.button.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  finishButtonDisabled: {
    backgroundColor: Colors.button.disabled,
  },
  finishButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;

