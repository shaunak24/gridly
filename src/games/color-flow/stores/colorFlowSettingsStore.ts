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
import { clearSavedColorFlowGames } from '../core/persistence';
import type { FlowDifficulty } from '../core/types';

const REMINDER_DEFAULTS = GAME_REMINDER_DEFAULTS['color-flow'];

interface ColorFlowSettingsState {
  difficulty: FlowDifficulty;
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  ensureHydrated: () => Promise<void>;
  persist: () => Promise<void>;
  setDifficulty: (difficulty: FlowDifficulty) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<NotificationScheduleResult>;
  setReminderTime: (hour: number, minute: number) => Promise<NotificationScheduleResult>;
}

let hydrationPromise: Promise<void> | null = null;

export const useColorFlowSettingsStore = create<ColorFlowSettingsState>((set, get) => ({
  difficulty: 'easy',
  notificationsEnabled: true,
  reminderHour: REMINDER_DEFAULTS.hour,
  reminderMinute: REMINDER_DEFAULTS.minute,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    if (!hydrationPromise) {
      hydrationPromise = (async () => {
        const [storedDifficulty, notifications, reminderHour, reminderMinute] = await Promise.all([
          loadString(storageKeys.colorFlowDifficulty),
          loadString(storageKeys.colorFlowNotifications),
          loadString(storageKeys.colorFlowReminderHour),
          loadString(storageKeys.colorFlowReminderMinute),
        ]);

        const notificationsEnabled = parseNotificationsEnabled(notifications);
        const hour = parseReminderHour(reminderHour, REMINDER_DEFAULTS.hour);
        const minute = parseReminderMinute(reminderMinute, REMINDER_DEFAULTS.minute);

        const seeds: Promise<void>[] = [];
        if (notifications === null) {
          seeds.push(saveString(storageKeys.colorFlowNotifications, 'true'));
        }
        if (reminderHour === null) {
          seeds.push(saveString(storageKeys.colorFlowReminderHour, String(REMINDER_DEFAULTS.hour)));
        }
        if (reminderMinute === null) {
          seeds.push(saveString(storageKeys.colorFlowReminderMinute, String(REMINDER_DEFAULTS.minute)));
        }
        if (seeds.length > 0) {
          await Promise.all(seeds);
        }

        set({
          difficulty:
            storedDifficulty === 'medium' || storedDifficulty === 'hard' || storedDifficulty === 'easy'
              ? storedDifficulty
              : 'easy',
          notificationsEnabled,
          reminderHour: hour,
          reminderMinute: minute,
          hydrated: true,
        });

        if (notificationsEnabled) {
          await scheduleGameReminder('color-flow', true, hour, minute);
        }
      })();
    }

    try {
      await hydrationPromise;
    } finally {
      hydrationPromise = null;
    }
  },

  ensureHydrated: async () => {
    if (get().hydrated) {
      return;
    }
    await get().hydrate();
  },

  persist: async () => {
    const state = get();
    await Promise.all([
      saveString(storageKeys.colorFlowDifficulty, state.difficulty),
      saveString(storageKeys.colorFlowNotifications, String(state.notificationsEnabled)),
      saveString(storageKeys.colorFlowReminderHour, String(state.reminderHour)),
      saveString(storageKeys.colorFlowReminderMinute, String(state.reminderMinute)),
    ]);
  },

  setDifficulty: async (difficulty) => {
    set({ difficulty, hydrated: true });
    await saveString(storageKeys.colorFlowDifficulty, difficulty);
    await clearSavedColorFlowGames();
    void pushIfSignedIn();
  },

  setNotificationsEnabled: async (enabled) => {
    const { reminderHour, reminderMinute } = get();
    const result = await scheduleGameReminder('color-flow', enabled, reminderHour, reminderMinute);

    if (result.ok) {
      set({ notificationsEnabled: enabled });
      await saveString(storageKeys.colorFlowNotifications, String(enabled));
      void pushIfSignedIn();
    } else if (!enabled) {
      set({ notificationsEnabled: false });
      await saveString(storageKeys.colorFlowNotifications, 'false');
      void pushIfSignedIn();
    }

    return result;
  },

  setReminderTime: async (hour, minute) => {
    set({ reminderHour: hour, reminderMinute: minute });
    await saveString(storageKeys.colorFlowReminderHour, String(hour));
    await saveString(storageKeys.colorFlowReminderMinute, String(minute));
    void pushIfSignedIn();

    const { notificationsEnabled } = get();
    if (!notificationsEnabled) {
      return { ok: true };
    }

    return scheduleGameReminder('color-flow', true, hour, minute);
  },
}));
