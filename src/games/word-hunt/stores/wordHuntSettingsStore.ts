import { create } from 'zustand';

import {
  GAME_REMINDER_DEFAULTS,
  parseNotificationsEnabled,
  parseReminderHour,
  parseReminderMinute,
  scheduleGameReminder,
  type NotificationScheduleResult,
} from '../../../services/notifications';
import { pushIfSignedIn } from '../../../platform/sync/pushIfSignedIn';
import { loadString, saveString, storageKeys } from '../../../shared/services/storage';

const REMINDER_DEFAULTS = GAME_REMINDER_DEFAULTS['word-hunt'];

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
  reminderHour: REMINDER_DEFAULTS.hour,
  reminderMinute: REMINDER_DEFAULTS.minute,
  hydrated: false,

  hydrate: async () => {
    const [hardMode, notifications, reminderHour, reminderMinute] = await Promise.all([
      loadString(storageKeys.hardMode),
      loadString(storageKeys.notifications),
      loadString(storageKeys.reminderHour),
      loadString(storageKeys.reminderMinute),
    ]);

    const notificationsEnabled = parseNotificationsEnabled(notifications);
    const hour = parseReminderHour(reminderHour, REMINDER_DEFAULTS.hour);
    const minute = parseReminderMinute(reminderMinute, REMINDER_DEFAULTS.minute);

    const seeds: Promise<void>[] = [];
    if (notifications === null) {
      seeds.push(saveString(storageKeys.notifications, 'true'));
    }
    if (reminderHour === null) {
      seeds.push(saveString(storageKeys.reminderHour, String(REMINDER_DEFAULTS.hour)));
    }
    if (reminderMinute === null) {
      seeds.push(saveString(storageKeys.reminderMinute, String(REMINDER_DEFAULTS.minute)));
    }
    if (seeds.length > 0) {
      await Promise.all(seeds);
    }

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
