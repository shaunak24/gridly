import { create } from 'zustand';

import {
  scheduleDailyReminder,
  type NotificationScheduleResult,
} from '../../../services/notifications';
import { loadString, saveString, storageKeys } from '../../../shared/services/storage';

const DEFAULT_REMINDER_HOUR = 8;
const DEFAULT_REMINDER_MINUTE = 0;

function parseHour(value: string | null): number {
  const hour = Number(value);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return DEFAULT_REMINDER_HOUR;
  }
  return hour;
}

function parseMinute(value: string | null): number {
  const minute = Number(value);
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    return DEFAULT_REMINDER_MINUTE;
  }
  return minute;
}

interface WordHuntSettingsState {
  hardMode: boolean;
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setHardMode: (enabled: boolean) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<NotificationScheduleResult>;
  setReminderTime: (hour: number, minute: number) => Promise<NotificationScheduleResult>;
}

export const useWordHuntSettingsStore = create<WordHuntSettingsState>((set, get) => ({
  hardMode: false,
  notificationsEnabled: false,
  reminderHour: DEFAULT_REMINDER_HOUR,
  reminderMinute: DEFAULT_REMINDER_MINUTE,
  hydrated: false,

  hydrate: async () => {
    const [hardMode, notifications, reminderHour, reminderMinute] = await Promise.all([
      loadString(storageKeys.hardMode),
      loadString(storageKeys.notifications),
      loadString(storageKeys.reminderHour),
      loadString(storageKeys.reminderMinute),
    ]);

    const notificationsEnabled = notifications === 'true';
    const hour = parseHour(reminderHour);
    const minute = parseMinute(reminderMinute);

    set({
      hardMode: hardMode === 'true',
      notificationsEnabled,
      reminderHour: hour,
      reminderMinute: minute,
      hydrated: true,
    });

    if (notificationsEnabled) {
      await scheduleDailyReminder(true, hour, minute);
    }
  },

  setHardMode: async (enabled) => {
    set({ hardMode: enabled });
    await saveString(storageKeys.hardMode, String(enabled));
  },

  setNotificationsEnabled: async (enabled) => {
    const { reminderHour, reminderMinute } = get();
    const result = await scheduleDailyReminder(enabled, reminderHour, reminderMinute);

    if (result.ok) {
      set({ notificationsEnabled: enabled });
      await saveString(storageKeys.notifications, String(enabled));
    } else if (!enabled) {
      set({ notificationsEnabled: false });
      await saveString(storageKeys.notifications, 'false');
    }

    return result;
  },

  setReminderTime: async (hour, minute) => {
    set({ reminderHour: hour, reminderMinute: minute });
    await saveString(storageKeys.reminderHour, String(hour));
    await saveString(storageKeys.reminderMinute, String(minute));

    const { notificationsEnabled } = get();
    if (!notificationsEnabled) {
      return { ok: true };
    }

    return scheduleDailyReminder(true, hour, minute);
  },
}));
