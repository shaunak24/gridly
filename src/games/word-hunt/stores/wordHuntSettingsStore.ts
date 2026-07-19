import { create } from 'zustand';

import {
  scheduleGameReminder,
  type NotificationScheduleResult,
} from '../../../services/notifications';
import { pushIfSignedIn } from '../../../platform/sync/pushIfSignedIn';
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

function parseNotificationsEnabled(value: string | null): boolean {
  if (value === 'false') {
    return false;
  }
  return true;
}

interface WordHuntSettingsState {
  hardMode: boolean;
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  setHardMode: (enabled: boolean) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<NotificationScheduleResult>;
  setReminderTime: (hour: number, minute: number) => Promise<NotificationScheduleResult>;
}

export const useWordHuntSettingsStore = create<WordHuntSettingsState>((set, get) => ({
  hardMode: false,
  notificationsEnabled: true,
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

    const notificationsEnabled = parseNotificationsEnabled(notifications);
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
      await scheduleGameReminder('word-hunt', true, hour, minute);
    }
  },

  persist: async () => {
    const state = get();
    await Promise.all([
      saveString(storageKeys.hardMode, String(state.hardMode)),
      saveString(storageKeys.notifications, String(state.notificationsEnabled)),
      saveString(storageKeys.reminderHour, String(state.reminderHour)),
      saveString(storageKeys.reminderMinute, String(state.reminderMinute)),
    ]);
  },

  setHardMode: async (enabled) => {
    set({ hardMode: enabled });
    await saveString(storageKeys.hardMode, String(enabled));
    void pushIfSignedIn();
  },

  setNotificationsEnabled: async (enabled) => {
    const { reminderHour, reminderMinute } = get();
    const result = await scheduleGameReminder('word-hunt', enabled, reminderHour, reminderMinute);

    if (result.ok) {
      set({ notificationsEnabled: enabled });
      await saveString(storageKeys.notifications, String(enabled));
      void pushIfSignedIn();
    } else if (!enabled) {
      set({ notificationsEnabled: false });
      await saveString(storageKeys.notifications, 'false');
      void pushIfSignedIn();
    }

    return result;
  },

  setReminderTime: async (hour, minute) => {
    set({ reminderHour: hour, reminderMinute: minute });
    await saveString(storageKeys.reminderHour, String(hour));
    await saveString(storageKeys.reminderMinute, String(minute));
    void pushIfSignedIn();

    const { notificationsEnabled } = get();
    if (!notificationsEnabled) {
      return { ok: true };
    }

    return scheduleGameReminder('word-hunt', true, hour, minute);
  },
}));
