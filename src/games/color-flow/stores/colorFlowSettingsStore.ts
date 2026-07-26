import { create } from 'zustand';

import {
  scheduleGameReminder,
  type NotificationScheduleResult,
} from '../../../services/notifications';
import { pushIfSignedIn } from '../../../platform/sync/pushIfSignedIn';
import { loadString, saveString, storageKeys } from '../../../shared/services/storage';
import { clearSavedColorFlowGames } from '../core/persistence';
import type { FlowDifficulty } from '../core/types';

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
  reminderHour: DEFAULT_REMINDER_HOUR,
  reminderMinute: DEFAULT_REMINDER_MINUTE,
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
        const hour = parseHour(reminderHour);
        const minute = parseMinute(reminderMinute);

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
