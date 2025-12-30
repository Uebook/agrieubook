/**
 * Privacy Settings Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { userSettings } from '../../services/dummyData';
import Header from '../../components/common/Header';
import { useSettings } from '../../context/SettingsContext';

const PrivacySettingsScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const [settings, setSettings] = useState(userSettings.privacy);

  const updateSetting = (key, value) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const SettingItem = ({ title, subtitle, value, onValueChange }) => (
    <TouchableOpacity style={styles.settingItem} disabled>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: themeColors.background.tertiary,
          true: themeColors.primary.main,
        }}
        thumbColor={themeColors.text.light}
      />
    </TouchableOpacity>
  );

  const ProfileVisibilityItem = () => {
    const visibilityOptions = ['public', 'private', 'friends'];
    const visibilityLabels = {
      public: 'Public',
      private: 'Private',
      friends: 'Friends Only',
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Visibility</Text>
        <View style={styles.sectionContent}>
          {visibilityOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionItem,
                settings.profileVisibility === option && styles.optionItemActive,
              ]}
              onPress={() => updateSetting('profileVisibility', option)}
            >
              <Text
                style={[
                  styles.optionText,
                  settings.profileVisibility === option &&
                    styles.optionTextActive,
                ]}
              >
                {visibilityLabels[option]}
              </Text>
              {settings.profileVisibility === option && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 14 * fontSizeMultiplier,
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
    settingContent: {
      flex: 1,
      marginRight: 12,
    },
    settingTitle: {
      fontSize: 16 * fontSizeMultiplier,
      fontWeight: '500',
      color: themeColors.text.primary,
      marginBottom: 4,
    },
    settingSubtitle: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border?.light || '#E0E0E0',
    },
    optionItemActive: {
      backgroundColor: themeColors.primary.main + '10',
    },
    optionText: {
      fontSize: 16 * fontSizeMultiplier,
      color: themeColors.text.primary,
    },
    optionTextActive: {
      fontWeight: '600',
      color: themeColors.primary.main,
    },
    checkmark: {
      fontSize: 18 * fontSizeMultiplier,
      color: themeColors.primary.main,
      fontWeight: 'bold',
    },
    infoSection: {
      margin: 20,
      marginTop: 32,
      padding: 16,
      backgroundColor: themeColors.background.secondary,
      borderRadius: 8,
    },
    infoText: {
      fontSize: 12 * fontSizeMultiplier,
      color: themeColors.text.secondary,
      lineHeight: 18 * fontSizeMultiplier,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Privacy Settings" navigation={navigation} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProfileVisibilityItem />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Show Email"
              subtitle="Display email in profile"
              value={settings.showEmail}
              onValueChange={(value) => updateSetting('showEmail', value)}
            />
            <SettingItem
              title="Show Mobile Number"
              subtitle="Display mobile in profile"
              value={settings.showMobile}
              onValueChange={(value) => updateSetting('showMobile', value)}
            />
            <SettingItem
              title="Show Reading Progress"
              subtitle="Share your reading progress"
              value={settings.showReadingProgress}
              onValueChange={(value) =>
                updateSetting('showReadingProgress', value)
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Allow Messages"
              subtitle="Let others send you messages"
              value={settings.allowMessages}
              onValueChange={(value) => updateSetting('allowMessages', value)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Data Sharing"
              subtitle="Share data for app improvement"
              value={settings.dataSharing}
              onValueChange={(value) => updateSetting('dataSharing', value)}
            />
            <SettingItem
              title="Analytics Tracking"
              subtitle="Help improve app experience"
              value={settings.analyticsTracking}
              onValueChange={(value) =>
                updateSetting('analyticsTracking', value)
              }
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Your privacy is important to us. These settings control how your
            information is shared and used within the app.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};


export default PrivacySettingsScreen;

