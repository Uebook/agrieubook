/**
 * Settings Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import Colors from '../../../color';
import { userSettings } from '../../services/dummyData';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const { theme, setTheme, language, setLanguage, fontSize, setFontSize, getThemeColors } = useSettings();
  const [settings, setSettings] = useState(userSettings);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);

  const updateNotificationSetting = (key, value) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const updatePreferenceSetting = (key, value) => {
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value,
      },
    });
  };

  const updateAccountSetting = (key, value) => {
    setSettings({
      ...settings,
      account: {
        ...settings.account,
        [key]: value,
      },
    });
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    updatePreferenceSetting('language', lang);
    setShowLanguageModal(false);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    updatePreferenceSetting('theme', newTheme);
    setShowThemeModal(false);
  };

  const handleFontSizeChange = (newFontSize) => {
    setFontSize(newFontSize);
    updatePreferenceSetting('fontSize', newFontSize);
    setShowFontSizeModal(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            // Navigation will be handled by AppNavigator based on auth state
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deleted',
              'Your account has been deleted successfully.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    logout();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const SettingItem = ({
    title,
    subtitle,
    value,
    onValueChange,
    type = 'switch',
    onPress,
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: Colors.background.tertiary,
            true: Colors.primary.main,
          }}
          thumbColor={Colors.text.light}
        />
      )}
      {type === 'arrow' && <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const themeColors = getThemeColors();
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: themeColors.text.secondary,
      textTransform: 'uppercase',
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    sectionContent: {
      backgroundColor: themeColors.card?.background || themeColors.background.secondary,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: themeColors.card?.border || themeColors.border?.light || '#E0E0E0',
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    settingSubtitle: {
      fontSize: 12,
      color: themeColors.text.secondary,
    },
    arrow: {
      fontSize: 24,
      color: themeColors.text.secondary,
    },
    modalContent: {
      backgroundColor: themeColors.background.primary,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: themeColors.text.primary,
    },
    modalClose: {
      fontSize: 24,
      color: themeColors.text.secondary,
      fontWeight: 'bold',
    },
    optionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    optionItemActive: {
      backgroundColor: themeColors.background.secondary,
    },
    optionText: {
      fontSize: 16,
      color: themeColors.text.primary,
    },
    optionTextActive: {
      color: themeColors.primary.main,
      fontWeight: '600',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Header title="Settings" navigation={navigation} />
      <ScrollView style={dynamicStyles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Account Settings */}
      <SettingSection title="Account">
        <SettingItem
          title="Edit Profile"
          subtitle="Update your profile information"
          type="arrow"
          onPress={() => navigation.navigate('EditProfile')}
        />
      </SettingSection>

      {/* Notification Settings */}
      <SettingSection title="Notifications">
        <SettingItem
          title="Notification Preferences"
          subtitle="Manage all notification settings"
          type="arrow"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Quick Settings</Text>
          <SettingItem
            title="Push Notifications"
          subtitle="Receive push notifications"
          value={settings.notifications.pushNotifications}
          onValueChange={(value) =>
            updateNotificationSetting('pushNotifications', value)
          }
        />
        <SettingItem
          title="Email Notifications"
          subtitle="Receive notifications via email"
          value={settings.notifications.emailNotifications}
          onValueChange={(value) =>
            updateNotificationSetting('emailNotifications', value)
          }
        />
        <SettingItem
          title="SMS Notifications"
          subtitle="Receive notifications via SMS"
          value={settings.notifications.smsNotifications}
          onValueChange={(value) =>
            updateNotificationSetting('smsNotifications', value)
          }
        />
        </View>
      </SettingSection>

      {/* App Preferences */}
      <SettingSection title="App Preferences">
        <SettingItem
          title="Language"
          subtitle={language}
          type="arrow"
          onPress={() => setShowLanguageModal(true)}
        />
        <SettingItem
          title="Theme"
          subtitle={`Currently: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
          type="arrow"
          onPress={() => setShowThemeModal(true)}
        />
        <SettingItem
          title="Font Size"
          subtitle={`Currently: ${fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}`}
          type="arrow"
          onPress={() => setShowFontSizeModal(true)}
        />
        <SettingItem
          title="Auto Download"
          subtitle="Automatically download purchased books"
          value={settings.preferences.autoDownload}
          onValueChange={(value) =>
            updatePreferenceSetting('autoDownload', value)
          }
        />
        <SettingItem
          title="WiFi Only Download"
          subtitle="Download only on WiFi"
          value={settings.preferences.wifiOnlyDownload}
          onValueChange={(value) =>
            updatePreferenceSetting('wifiOnlyDownload', value)
          }
        />
      </SettingSection>

      {/* Other Settings */}
      <SettingSection title="Other">
        <SettingItem
          title="About"
          subtitle="App version and info"
          type="arrow"
          onPress={() => {
            Alert.alert(
              'About Agribook',
              'Version: 1.0.0\n\nAgribook is your comprehensive platform for agricultural knowledge, books, and resources.\n\n© 2024 Agribook. All rights reserved.',
              [{ text: 'OK' }]
            );
          }}
        />
        <SettingItem
          title="Help & Support"
          subtitle="Get help and contact support"
          type="arrow"
          onPress={() => {
            Alert.alert(
              'Help & Support',
              'Need help? Contact us:\n\nEmail: support@agribook.com\nPhone: +1 (555) 123-4567\n\nWe\'re here to help you!',
              [{ text: 'OK' }]
            );
          }}
        />
        <SettingItem
          title="Terms & Conditions"
          subtitle="Read terms and conditions"
          type="arrow"
          onPress={() => {
            Alert.alert(
              'Terms & Conditions',
              'By using Agribook, you agree to:\n\n1. Use the platform for lawful purposes only\n2. Respect intellectual property rights\n3. Maintain account security\n4. Follow community guidelines\n\nFor full terms, visit: agribook.com/terms',
              [{ text: 'OK' }]
            );
          }}
        />
        <SettingItem
          title="Privacy Policy"
          subtitle="Read privacy policy"
          type="arrow"
          onPress={() => {
            Alert.alert(
              'Privacy Policy',
              'We value your privacy:\n\n• We collect only necessary data\n• Your information is secure\n• We don\'t share your data with third parties\n• You can delete your account anytime\n\nFor full policy, visit: agribook.com/privacy',
              [{ text: 'OK' }]
            );
          }}
        />
      </SettingSection>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <Text style={styles.dangerSectionTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={dynamicStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Gujarati', 'Bengali'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    dynamicStyles.optionItem,
                    language === lang && dynamicStyles.optionItemActive,
                  ]}
                  onPress={() => handleLanguageChange(lang)}
                >
                  <Text
                    style={[
                      dynamicStyles.optionText,
                      language === lang && dynamicStyles.optionTextActive,
                    ]}
                  >
                    {lang}
                  </Text>
                  {language === lang && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Select Theme</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <Text style={dynamicStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'Auto', value: 'auto' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    dynamicStyles.optionItem,
                    theme === item.value && dynamicStyles.optionItemActive,
                  ]}
                  onPress={() => handleThemeChange(item.value)}
                >
                  <Text
                    style={[
                      dynamicStyles.optionText,
                      theme === item.value && dynamicStyles.optionTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {theme === item.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Font Size Selection Modal */}
      <Modal
        visible={showFontSizeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFontSizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Select Font Size</Text>
              <TouchableOpacity onPress={() => setShowFontSizeModal(false)}>
                <Text style={dynamicStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[
                { label: 'Small', value: 'small', size: 14 },
                { label: 'Medium', value: 'medium', size: 16 },
                { label: 'Large', value: 'large', size: 18 },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    dynamicStyles.optionItem,
                    fontSize === item.value && dynamicStyles.optionItemActive,
                  ]}
                  onPress={() => handleFontSizeChange(item.value)}
                >
                  <Text
                    style={[
                      dynamicStyles.optionText,
                      { fontSize: item.size },
                      fontSize === item.value && dynamicStyles.optionTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {fontSize === item.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: Colors.card?.background || Colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.card?.border || Colors.border?.light || '#E0E0E0',
  },
  subsection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border?.light || '#E0E0E0',
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border?.light || '#E0E0E0',
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  arrow: {
    fontSize: 24,
    color: Colors.text.secondary,
  },
  dangerSection: {
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  dangerSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error || '#F44336',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  dangerButton: {
    backgroundColor: Colors.error || '#F44336',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButtonText: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
  },
  logoutButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border?.light || '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.text.secondary,
    fontWeight: 'bold',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border?.light || '#E0E0E0',
  },
  optionItemActive: {
    backgroundColor: Colors.background.secondary,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  optionTextActive: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: Colors.primary.main,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;

