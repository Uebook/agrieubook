/**
 * Firebase Admin SDK Initialization
 * Handles Firebase Admin setup for sending push notifications
 */

// Dynamic import to prevent build errors if firebase-admin is not installed
// Use any type to avoid TypeScript module resolution at build time
let admin: any = null;

// Lazy load firebase-admin at runtime
function getAdminModule(): any {
  if (admin) return admin;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    admin = require('firebase-admin');
    return admin;
  } catch (error) {
    throw new Error('firebase-admin is not installed. Please install it: npm install firebase-admin');
  }
}

let firebaseAdmin: any = null;

/**
 * Initialize Firebase Admin SDK
 * Should be called once at application startup
 */
export function initializeFirebaseAdmin(): any {
  const firebaseAdminModule = getAdminModule();

  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    // Check if already initialized
    if (firebaseAdminModule.apps.length > 0) {
      firebaseAdmin = firebaseAdminModule.apps[0];
      return firebaseAdmin;
    }

    // Get service account credentials
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!serviceAccountKey && !serviceAccountPath) {
      throw new Error(
        'Firebase Admin credentials not found. Please set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH environment variable.'
      );
    }

    let credential: any;

    if (serviceAccountKey) {
      // Parse JSON string from environment variable
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        credential = firebaseAdminModule.credential.cert(serviceAccount);
      } catch (error) {
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON string.');
      }
    } else if (serviceAccountPath) {
      // Use file path (for local development)
      const serviceAccount = require(serviceAccountPath);
      credential = firebaseAdminModule.credential.cert(serviceAccount);
    } else {
      throw new Error('Firebase Admin credentials not configured.');
    }

    // Initialize Firebase Admin
    firebaseAdmin = firebaseAdminModule.initializeApp({
      credential,
    });

    console.log('✅ Firebase Admin initialized successfully');
    return firebaseAdmin;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

/**
 * Get Firebase Admin instance
 * Initializes if not already initialized
 */
export function getFirebaseAdmin(): any {
  if (!firebaseAdmin) {
    return initializeFirebaseAdmin();
  }
  return firebaseAdmin;
}

/**
 * Send push notification to FCM tokens
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<{ successCount: number; failureCount: number }> {
  try {
    const firebaseAdminModule = getAdminModule();
    const firebaseApp = getFirebaseAdmin();

    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    // Prepare data payload (all values must be strings)
    const dataPayload: Record<string, string> = data
      ? Object.entries(data).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      : {};

    // Prepare notification payload
    const message: any = {
      notification: {
        title,
        body,
      },
      data: dataPayload,
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default',
          ...(data?.imageUrl && { imageUrl: data.imageUrl }),
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            ...(data?.imageUrl && { mutableContent: true }),
          },
        },
        ...(data?.imageUrl && {
          fcmOptions: {
            imageUrl: data.imageUrl,
          },
        }),
      },
      tokens,
    };

    // Send to multiple tokens
    const response = await firebaseAdminModule.messaging().sendEachForMulticast(message);

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Error sending Firebase notifications:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
}
