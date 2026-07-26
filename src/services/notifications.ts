import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';

export type GameReminderId = 'word-hunt' | 'grid-snap' | 'color-flow';

export const GAME_REMINDER_DEFAULTS: Record<GameReminderId, { hour: number; minute: number }> = {
  'word-hunt': { hour: 8, minute: 0 },
  'grid-snap': { hour: 8, minute: 30 },
  'color-flow': { hour: 9, minute: 0 },
};

export function parseNotificationsEnabled(value: string | null): boolean {
  if (value === 'false') {
    return false;
  }
  return true;
}

export function parseReminderHour(value: string | null, defaultHour: number): number {
  if (value === null || value === '') {
    return defaultHour;
  }
  const hour = Number(value);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return defaultHour;
  }
  return hour;
}

export function parseReminderMinute(value: string | null, defaultMinute: number): number {
  if (value === null || value === '') {
    return defaultMinute;
  }
  const minute = Number(value);
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    return defaultMinute;
  }
  return minute;
}

export type NotificationScheduleResult =
  | { ok: true }
  | { ok: false; reason: 'expo_go' | 'permission_denied' | 'error'; message: string };

const REMINDER_IDS: Record<GameReminderId, string> = {
  'word-hunt': 'gridly-word-hunt-reminder',
  'grid-snap': 'gridly-grid-snap-reminder',
  'color-flow': 'gridly-color-flow-reminder',
};

const REMINDER_COPY: Record<GameReminderId, { title: string; body: string }> = {
  'word-hunt': {
    title: 'Gridly — Word Hunt',
    body: "Today's Word Hunt is ready! Open Gridly to play.",
  },
  'grid-snap': {
    title: 'Gridly — Grid Snap',
    body: "Today's Grid Snap puzzle is ready! Open Gridly to play.",
  },
  'color-flow': {
    title: 'Gridly — Color Flow',
    body: "Today's Color Flow puzzle is ready! Open Gridly to play.",
  },
};

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

export function getReminderIdentifier(gameId: GameReminderId): string {
  return REMINDER_IDS[gameId];
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleGameReminder(
  gameId: GameReminderId,
  enabled: boolean,
  hour?: number,
  minute?: number,
): Promise<NotificationScheduleResult> {
  const defaults = GAME_REMINDER_DEFAULTS[gameId];
  const resolvedHour = hour ?? defaults.hour;
  const resolvedMinute = minute ?? defaults.minute;
  const identifier = REMINDER_IDS[gameId];

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);

    if (!enabled) {
      return { ok: true };
    }

    if (!areNotificationsAvailable()) {
      return {
        ok: false,
        reason: 'expo_go',
        message:
          'Daily reminders need a development build. Expo Go cannot schedule notifications. Build with `npm run build:apk`.',
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

    const copy = REMINDER_COPY[gameId];
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: copy.title,
        body: copy.body,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: resolvedHour,
        minute: resolvedMinute,
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

/** @deprecated Use scheduleGameReminder('word-hunt', ...) */
export async function scheduleDailyReminder(
  enabled: boolean,
  hour = 8,
  minute = 0,
): Promise<NotificationScheduleResult> {
  return scheduleGameReminder('word-hunt', enabled, hour, minute);
}
