/**
 * Notification Settings Screen
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

const NotificationSettingsScreen = ({ navigation }) => {
  const { getThemeColors, getFontSizeMultiplier } = useSettings();
  const themeColors = getThemeColors();
  const fontSizeMultiplier = getFontSizeMultiplier();
  const [settings, setSettings] = useState(userSettings.notifications);

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
      <Header title="Notification Settings" navigation={navigation} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Methods</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="Push Notifications"
              subtitle="Receive push notifications"
              value={settings.pushNotifications}
              onValueChange={(value) =>
                updateSetting('pushNotifications', value)
              }
            />
            <SettingItem
              title="Email Notifications"
              subtitle="Receive notifications via email"
              value={settings.emailNotifications}
              onValueChange={(value) =>
                updateSetting('emailNotifications', value)
              }
            />
            <SettingItem
              title="SMS Notifications"
              subtitle="Receive notifications via SMS"
              value={settings.smsNotifications}
              onValueChange={(value) =>
                updateSetting('smsNotifications', value)
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              title="New Book Releases"
              subtitle="Get notified about new books"
              value={settings.newBookReleases}
              onValueChange={(value) =>
                updateSetting('newBookReleases', value)
              }
            />
            <SettingItem
              title="Price Drops"
              subtitle="Alert when books go on sale"
              value={settings.priceDrops}
              onValueChange={(value) => updateSetting('priceDrops', value)}
            />
            <SettingItem
              title="Order Updates"
              subtitle="Updates on your orders"
              value={settings.orderUpdates}
              onValueChange={(value) => updateSetting('orderUpdates', value)}
            />
            <SettingItem
              title="Reading Reminders"
              subtitle="Remind me to continue reading"
              value={settings.readingReminders}
              onValueChange={(value) =>
                updateSetting('readingReminders', value)
              }
            />
            <SettingItem
              title="Recommendations"
              subtitle="Personalized book recommendations"
              value={settings.recommendations}
              onValueChange={(value) =>
                updateSetting('recommendations', value)
              }
            />
            <SettingItem
              title="Reviews & Ratings"
              subtitle="Updates on reviews"
              value={settings.reviewsAndRatings}
              onValueChange={(value) =>
                updateSetting('reviewsAndRatings', value)
              }
            />
            <SettingItem
              title="Promotional Offers"
              subtitle="Special offers and discounts"
              value={settings.promotionalOffers}
              onValueChange={(value) =>
                updateSetting('promotionalOffers', value)
              }
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Manage how you receive notifications. You can customize which types of
            notifications you want to receive and through which channels.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};


export default NotificationSettingsScreen;

