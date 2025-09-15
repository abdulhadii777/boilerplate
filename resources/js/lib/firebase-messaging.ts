import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, MessagePayload, Messaging, onMessage, Unsubscribe } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: 'AIzaSyDTZh6cvEgkvw4MytQwRLzr4ArMytrsx5Y',
    authDomain: 'laravle-12-boiler-plate.firebaseapp.com',
    projectId: 'laravle-12-boiler-plate',
    storageBucket: 'laravle-12-boiler-plate.firebasestorage.app',
    messagingSenderId: '284475299533',
    appId: '1:284475299533:web:706e8af684c7fcb702fb84',
};

// Initialize Firebase app with error handling
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error('Failed to initialize Firebase app:', error);
    throw error;
}

// Initialize messaging with error handling
let messaging: Messaging;
try {
    messaging = getMessaging(app);
} catch (error) {
    console.error('Failed to initialize Firebase messaging:', error);
    throw error;
}

// Export messaging instance
export { messaging };

// Singleton pattern to ensure only one foreground message handler exists
class ForegroundMessageManager {
    private static instance: ForegroundMessageManager;
    private handler: Unsubscribe | null = null;
    private isActive = false;

    private constructor() {}

    public static getInstance(): ForegroundMessageManager {
        if (!ForegroundMessageManager.instance) {
            ForegroundMessageManager.instance = new ForegroundMessageManager();
        }
        return ForegroundMessageManager.instance;
    }

    public setupHandler(): void {
        if (this.isActive) {
            return;
        }

        // Check if messaging is available
        if (!messaging) {
            console.error('Firebase messaging not available');
            return;
        }

        try {
            this.handler = onMessage(messaging, (payload: MessagePayload) => {
                try {
                    // Create a unique identifier for this notification to prevent duplicates
                    const notificationTitle = payload.notification?.title || 'New Notification';
                    const notificationBody = payload.notification?.body;

                    // Use a more stable ID based on content and timestamp
                    const notificationId = `${notificationTitle}-${notificationBody}-${Math.floor(Date.now() / 1000)}`;

                    const notification = new Notification(notificationTitle, {
                        body: notificationBody,
                        icon: payload.notification?.image,
                        tag: notificationId, // Use tag to prevent duplicate notifications
                        requireInteraction: false,
                    });

                    // Auto-close notification after 5 seconds
                    setTimeout(() => {
                        notification.close();
                    }, 5000);
                } catch (notificationError) {
                    console.error('Failed to display foreground notification:', notificationError);
                }
            });

            this.isActive = true;
        } catch (error) {
            console.error('Failed to set up foreground message handler:', error);
        }
    }

    public cleanup(): void {
        if (this.handler && this.isActive) {
            this.handler();
            this.handler = null;
            this.isActive = false;
        }
    }

    public isHandlerActive(): boolean {
        return this.isActive;
    }
}

// Request FCM token
export const requestPermissionAndGetToken = async (): Promise<string | null> => {
    try {
        // Check if Firebase messaging is available
        if (!messaging) {
            console.error('Firebase messaging not initialized');
            return null;
        }

        // Check if service workers are supported
        if (!('serviceWorker' in navigator)) {
            return null;
        }

        // Check if PushManager is supported
        if (!('PushManager' in window)) {
            return null;
        }

        // Check if Notifications are supported
        if (!('Notification' in window)) {
            return null;
        }

        // Request notification permission first
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            return null;
        }

        // Register the service worker with proper error handling
        let registration;
        try {
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/',
            });
        } catch {
            return null;
        }

        // Wait for the service worker to become active and ready
        await navigator.serviceWorker.ready;

        // Verify the registration has pushManager
        if (!registration || !registration.pushManager) {
            return null;
        }

        // Now get the token, passing the fully ready registration
        const token = await getToken(messaging, {
            vapidKey: 'BFh4SY2dNABuun02JX0FW0jpjKu5mKvYm2CRoR3ScMbl5n5WTONIB_crt3rJ4GejnXJYMdzDNmc5gB23KpFSRy4', // get from Firebase Console > Cloud Messaging > Web Push certificates
            serviceWorkerRegistration: registration,
        });

        if (token) {
            return token;
        } else {
            return null;
        }
    } catch {
        return null;
    }
};

// Foreground message handler - now uses singleton pattern
export const onForegroundMessage = (): void => {
    const manager = ForegroundMessageManager.getInstance();
    manager.setupHandler();
};

// Cleanup function to remove foreground message handler
export const removeForegroundMessageHandler = (): void => {
    const manager = ForegroundMessageManager.getInstance();
    manager.cleanup();
};

// Check if foreground message handler is active
export const getForegroundHandlerStatus = (): boolean => {
    const manager = ForegroundMessageManager.getInstance();
    return manager.isHandlerActive();
};
