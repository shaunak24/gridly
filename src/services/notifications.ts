import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';

const DAILY_REMINDER_ID = 'gridly-daily-reminder';

export type NotificationScheduleResult =
  | { ok: true }
  | { ok: false; reason: 'expo_go' | 'permission_denied' | 'error'; message: string };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Local notifications are not available in Expo Go (SDK 53+). Use a development build. */
export function areNotificationsAvailable(): boolean {
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(
  enabled: boolean,
  hour = 8,
  minute = 0,
): Promise<NotificationScheduleResult> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);

    if (!enabled) {
      return { ok: true };
    }

    if (!areNotificationsAvailable()) {
      return {
        ok: false,
        reason: 'expo_go',
        message:
          'Daily reminders need a development build. Expo Go cannot schedule notifications. Build with `npx expo run:ios` or EAS Build.',
      };
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      return {
        ok: false,
        reason: 'permission_denied',
        message: 'Notification permission was denied. Enable it in system Settings.',
      };
    }

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: 'Gridly',
        body: "Today's puzzle is ready! Open Gridly to play.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: 'error',
      message: 'Could not schedule the daily reminder. Try again in a development build.',
    };
  }
}
