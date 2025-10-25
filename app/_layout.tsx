import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Initialize notifications
    notificationService.registerForPushNotifications();

    // Listen for notifications
    const notificationListener = notificationService.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    const responseListener = notificationService.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="ceo" />
        <Stack.Screen name="security" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
