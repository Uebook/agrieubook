/**
 * Firebase Cloud Messaging Service
 * Handles FCM token registration and notification handling
 */

import { Platform, PermissionsAndroid } from 'react-native';
import apiClient from './api';

// Conditional import - Firebase will be available after npm install
let messaging = null;
try {
    messaging = require('@react-native-firebase/messaging').default;
} catch (error) {
    console.warn('⚠️ Firebase messaging not installed. Run: npm install @react-native-firebase/app @react-native-firebase/messaging');
}

class FirebaseService {
    constructor() {
        this.fcmToken = null;
        this.onTokenRefreshListener = null;
        this.onMessageListener = null;
        this.onNotificationOpenedListener = null;
    }

    /**
     * Request notification permissions (Android 13+)
     */
    async requestPermission() {
        if (!messaging) {
            console.warn('⚠️ Firebase not installed. Cannot request permissions.');
            return false;
        }

        if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    );
                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                } catch (err) {
                    console.warn('Error requesting notification permission:', err);
                    return false;
                }
            }
            // Android 12 and below don't need runtime permission
            return true;
        }
        // iOS permission is handled automatically
        const authStatus = await messaging().requestPermission();
        return (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
    }

    /**
     * Get FCM token
     */
    async getToken() {
        if (!messaging) {
            console.warn('⚠️ Firebase not installed. Cannot get FCM token.');
            return null;
        }

        try {
            const token = await messaging().getToken();
            this.fcmToken = token;
            console.log('📱 FCM Token:', token);
            return token;
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
    }

    /**
     * Register FCM token with backend
     */
    async registerToken(userId) {
        try {
            if (!userId) {
                console.warn('⚠️ Cannot register FCM token: userId is missing');
                return false;
            }

            console.log('📱 Attempting to get FCM token for user:', userId);
            const token = await this.getToken();
            if (!token) {
                console.warn('⚠️ Cannot register FCM token: token is null');
                console.warn('⚠️ Make sure Firebase packages are installed: npm install @react-native-firebase/app @react-native-firebase/messaging');
                return false;
            }

            console.log('📱 FCM Token obtained, registering with backend...');
            console.log('📱 Token (first 20 chars):', token.substring(0, 20) + '...');

            // Save token to backend
            const result = await apiClient.updateFCMToken(userId, token);
            console.log('📱 Backend response:', result);

            if (result && result.success) {
                console.log('✅ FCM token registered successfully');
                return true;
            } else {
                console.warn('❌ Failed to register FCM token on backend');
                console.warn('❌ Response:', result);
                if (result && result.error) {
                    console.error('❌ Error details:', result.error);
                    console.error('❌ Error details:', result.details);
                }
                return false;
            }
        } catch (error) {
            console.error('❌ Error registering FCM token:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);
            return false;
        }
    }

    /**
     * Initialize Firebase messaging
     */
    async initialize(userId) {
        try {
            // Request permission
            const hasPermission = await this.requestPermission();
            if (!hasPermission) {
                console.warn('Notification permission denied');
                return false;
            }

            // Get and register token
            await this.registerToken(userId);

            if (!messaging) {
                console.warn('⚠️ Firebase not installed. Push notifications will not work.');
                console.warn('⚠️ Run: npm install @react-native-firebase/app @react-native-firebase/messaging');
                return false;
            }

            // Set up token refresh listener
            this.onTokenRefreshListener = messaging().onTokenRefresh(async (token) => {
                console.log('🔄 FCM Token refreshed:', token);
                this.fcmToken = token;
                if (userId) {
                    await this.registerToken(userId);
                }
            });

            // Handle foreground messages
            this.onMessageListener = messaging().onMessage(async (remoteMessage) => {
                console.log('📨 Foreground message received:', remoteMessage);
                // You can show a local notification here if needed
                // For now, the app will handle it through the notification system
            });

            // Handle notification opened from background/quit state
            this.onNotificationOpenedListener = messaging().onNotificationOpenedApp(
                (remoteMessage) => {
                    console.log('📬 Notification opened from background:', remoteMessage);
                    // Handle navigation if needed
                    this.handleNotificationNavigation(remoteMessage);
                }
            );

            // Check if app was opened from a notification (quit state)
            messaging()
                .getInitialNotification()
                .then((remoteMessage) => {
                    if (remoteMessage) {
                        console.log('📬 App opened from notification (quit state):', remoteMessage);
                        this.handleNotificationNavigation(remoteMessage);
                    }
                });

            console.log('✅ Firebase messaging initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Firebase messaging:', error);
            return false;
        }
    }

    /**
     * Handle notification navigation
     */
    handleNotificationNavigation(remoteMessage) {
        // Extract navigation data from notification
        const data = remoteMessage.data;
        if (data && data.screen) {
            // You can use navigation service here to navigate
            // For now, we'll just log it
            console.log('Navigate to:', data.screen, data.params);
        }
    }

    /**
     * Cleanup listeners
     */
    cleanup() {
        if (this.onTokenRefreshListener) {
            this.onTokenRefreshListener();
        }
        if (this.onMessageListener) {
            this.onMessageListener();
        }
        if (this.onNotificationOpenedListener) {
            this.onNotificationOpenedListener();
        }
    }

    /**
     * Get current FCM token
     */
    getCurrentToken() {
        return this.fcmToken;
    }
}

const firebaseService = new FirebaseService();
export default firebaseService;
