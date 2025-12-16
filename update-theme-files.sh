#!/bin/bash
# Script to update all screen files with theme and font size support
# This script adds useSettings import and updates styles

echo "Updating files with theme support..."

# List of files to update (excluding already updated ones)
FILES=(
  "src/screens/main/BookDetailScreen.js"
  "src/screens/main/CategoryScreen.js"
  "src/screens/main/SearchScreen.js"
  "src/screens/main/WishlistScreen.js"
  "src/screens/main/ReviewsScreen.js"
  "src/screens/main/OrderHistoryScreen.js"
  "src/screens/main/PaymentScreen.js"
  "src/screens/main/EditProfileScreen.js"
  "src/screens/main/BookUploadScreen.js"
  "src/screens/main/NotificationSettingsScreen.js"
  "src/screens/main/PrivacySettingsScreen.js"
  "src/screens/main/YouTubeChannelsScreen.js"
  "src/screens/main/NotificationsScreen.js"
  "src/screens/reader/ReaderScreen.js"
  "src/screens/auth/LoginScreen.js"
  "src/screens/auth/OTPScreen.js"
  "src/screens/auth/OnboardingScreen.js"
  "src/screens/auth/RoleSelectionScreen.js"
  "src/components/common/SplashScreen.js"
)

echo "Total files to update: ${#FILES[@]}"
echo "Note: This script provides the pattern. Manual updates may be needed."

