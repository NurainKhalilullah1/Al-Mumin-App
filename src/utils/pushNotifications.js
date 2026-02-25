import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './db';

// Call this function when the user logs in
export const initializePushNotifications = async (userId) => {
    if (!Capacitor.isNativePlatform()) {
        console.log("Push notifications are only available on native platforms.");
        return;
    }

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission
    // Android will just grant without prompting
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
        console.log("User denied push notification permissions.");
        return;
    }

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);

        // Save token to Supabase users table (assuming we add an fcm_token column)
        if (userId) {
            try {
                const { error } = await supabase.from('staff').update({ fcm_token: token.value }).eq('id', userId);
                // also try updating students if we don't know the exact role or we handle logic elsewhere
                const { error: err2 } = await supabase.from('students').update({ fcm_token: token.value }).eq('id', userId);
            } catch (err) {
                console.error("Failed to save FCM token", err);
            }
        }
    });

    PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
    });
};
