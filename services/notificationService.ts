import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface GatePassTimeAlert {
  id: string;
  gatePassId: string;
  notificationId: string;
  alertTime: Date;
  type: 'warning' | 'critical' | 'overdue';
}

class NotificationService {
  expoPushToken: string | null = null;
  private timeAlerts: GatePassTimeAlert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('gatepass_alerts', {
        name: 'Gate Pass Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('time_warnings', {
        name: 'Time Warnings',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 150, 150, 150],
        lightColor: '#FF9500',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || 'your-project-id',
      })).data;
      
      console.log('Push token:', token);
      this.expoPushToken = token;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    // Start monitoring for time-based alerts
    this.startTimeMonitoring();

    return token;
  }

  async sendLocalNotification(title: string, body: string, data?: any, channelId?: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // null means immediately
    });
  }

  async scheduleNotification(title: string, body: string, seconds: number, data?: any, channelId?: string) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        categoryIdentifier: channelId,
      },
      trigger: {
        seconds,
      },
    });
    return notificationId;
  }

  // Schedule time-based alerts for gate passes
  async scheduleGatePassTimeAlerts(gatePassId: string, expectedReturnTime: Date, destination: string) {
    const now = new Date();
    const returnTime = new Date(expectedReturnTime);
    const timeUntilReturn = returnTime.getTime() - now.getTime();

    // Clear any existing alerts for this gate pass
    await this.clearGatePassAlerts(gatePassId);

    // Schedule 5-minute warning
    if (timeUntilReturn > 5 * 60 * 1000) {
      const warning5MinId = await this.scheduleNotification(
        '⏰ Time Running Out!',
        `Your gate pass expires in 5 minutes. Please start returning from ${destination}.`,
        (timeUntilReturn - 5 * 60 * 1000) / 1000,
        { 
          type: 'time_warning',
          gatePassId,
          minutesLeft: 5,
          destination
        },
        'time_warnings'
      );

      this.timeAlerts.push({
        id: `${gatePassId}_5min`,
        gatePassId,
        notificationId: warning5MinId,
        alertTime: new Date(returnTime.getTime() - 5 * 60 * 1000),
        type: 'warning'
      });
    }

    // Schedule 1-minute critical warning
    if (timeUntilReturn > 1 * 60 * 1000) {
      const warning1MinId = await this.scheduleNotification(
        '🚨 URGENT: Return NOW!',
        `Your gate pass expires in 1 minute! Return immediately from ${destination}.`,
        (timeUntilReturn - 1 * 60 * 1000) / 1000,
        { 
          type: 'critical_warning',
          gatePassId,
          minutesLeft: 1,
          destination
        },
        'gatepass_alerts'
      );

      this.timeAlerts.push({
        id: `${gatePassId}_1min`,
        gatePassId,
        notificationId: warning1MinId,
        alertTime: new Date(returnTime.getTime() - 1 * 60 * 1000),
        type: 'critical'
      });
    }

    // Schedule overdue notification
    const overdueId = await this.scheduleNotification(
      '❌ Gate Pass OVERDUE!',
      `Your gate pass has expired! Please return immediately. Security has been notified.`,
      timeUntilReturn / 1000,
      { 
        type: 'overdue',
        gatePassId,
        destination
      },
      'gatepass_alerts'
    );

    this.timeAlerts.push({
      id: `${gatePassId}_overdue`,
      gatePassId,
      notificationId: overdueId,
      alertTime: returnTime,
      type: 'overdue'
    });

    console.log(`🔔 Scheduled time alerts for gate pass ${gatePassId}:`, {
      warning5Min: timeUntilReturn > 5 * 60 * 1000,
      warning1Min: timeUntilReturn > 1 * 60 * 1000,
      overdue: true
    });
  }

  // Clear alerts for a specific gate pass
  async clearGatePassAlerts(gatePassId: string) {
    const alertsToRemove = this.timeAlerts.filter(alert => alert.gatePassId === gatePassId);
    
    for (const alert of alertsToRemove) {
      await Notifications.cancelScheduledNotificationAsync(alert.notificationId);
    }

    this.timeAlerts = this.timeAlerts.filter(alert => alert.gatePassId !== gatePassId);
    console.log(`🗑️ Cleared ${alertsToRemove.length} alerts for gate pass ${gatePassId}`);
  }

  // Monitor for immediate notifications (for very short time periods)
  private startTimeMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      // This could be used for additional real-time monitoring if needed
      // Currently, scheduled notifications handle most cases
    }, 30 * 1000); // Check every 30 seconds
  }

  // Send immediate proximity warnings
  async sendProximityWarning(destination: string, minutesLeft: number) {
    const title = minutesLeft <= 1 ? '🚨 URGENT: Return NOW!' : '⏰ Time Running Out!';
    const body = minutesLeft <= 1 
      ? `Your gate pass expires in ${minutesLeft} minute! Return immediately from ${destination}.`
      : `Your gate pass expires in ${minutesLeft} minutes. Please start returning from ${destination}.`;

    await this.sendLocalNotification(
      title,
      body,
      { 
        type: 'proximity_warning',
        minutesLeft,
        destination
      },
      minutesLeft <= 1 ? 'gatepass_alerts' : 'time_warnings'
    );
  }

  // Send overdue notification
  async sendOverdueNotification(destination: string) {
    await this.sendLocalNotification(
      '❌ Gate Pass OVERDUE!',
      `Your gate pass has expired! Please return immediately from ${destination}. Security has been notified.`,
      { 
        type: 'overdue',
        destination
      },
      'gatepass_alerts'
    );
  }

  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    this.timeAlerts = [];
  }

  // Get active alerts for debugging
  getActiveAlerts() {
    return this.timeAlerts;
  }

  // Stop monitoring when app is closed
  stopTimeMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  getPushToken() {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
