import { getForegroundHandlerStatus, onForegroundMessage, removeForegroundMessageHandler, requestPermissionAndGetToken } from './firebase-messaging';

// Re-export the functions to match the reference pattern
export { getForegroundHandlerStatus, onForegroundMessage, removeForegroundMessageHandler, requestPermissionAndGetToken };

// Additional utility functions for the FirebaseTokenManager
export const isSupported = (): boolean => {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

export const hasPermission = async (): Promise<boolean> => {
    if (!isSupported()) return false;

    try {
        // Check current permission without requesting
        if (Notification.permission === 'granted') {
            return true;
        } else if (Notification.permission === 'denied') {
            return false;
        } else {
            // Permission is 'default', we'll request it when user clicks the button
            return false;
        }
    } catch {
        return false;
    }
};

export const getCurrentToken = (): string | null => {
    // This would need to be stored in localStorage or similar
    // For now, return null as we'll get it from the backend
    return null;
};
