import { create } from 'zustand';

import {
  scheduleGameReminder,
  type NotificationScheduleResult,
} from '../../../services/notifications';
import { pushIfSignedIn } from '../../../platform/sync/pushIfSignedIn';
import { loadString, saveString, storageKeys } from '../../../shared/services/storage';
import { clearSavedGridSnapGames } from '../core/persistence';
import type { SnapDifficulty } from '../core/types';

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

interface GridSnapSettingsState {
  difficulty: SnapDifficulty;
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  ensureHydrated: () => Promise<void>;
  persist: () => Promise<void>;
  setDifficulty: (difficulty: SnapDifficulty) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<NotificationScheduleResult>;
  setReminderTime: (hour: number, minute: number) => Promise<NotificationScheduleResult>;
}

let hydrationPromise: Promise<void> | null = null;

export const useGridSnapSettingsStore = create<GridSnapSettingsState>((set, get) => ({
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
          loadString(storageKeys.gridSnapDifficulty),
          loadString(storageKeys.gridSnapNotifications),
          loadString(storageKeys.gridSnapReminderHour),
          loadString(storageKeys.gridSnapReminderMinute),
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
          await scheduleGameReminder('grid-snap', true, hour, minute);
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
      saveString(storageKeys.gridSnapDifficulty, state.difficulty),
      saveString(storageKeys.gridSnapNotifications, String(state.notificationsEnabled)),
      saveString(storageKeys.gridSnapReminderHour, String(state.reminderHour)),
      saveString(storageKeys.gridSnapReminderMinute, String(state.reminderMinute)),
    ]);
  },

  setDifficulty: async (difficulty) => {
    set({ difficulty, hydrated: true });
    await saveString(storageKeys.gridSnapDifficulty, difficulty);
    await clearSavedGridSnapGames();
    void pushIfSignedIn();
  },

  setNotificationsEnabled: async (enabled) => {
    const { reminderHour, reminderMinute } = get();
    const result = await scheduleGameReminder('grid-snap', enabled, reminderHour, reminderMinute);

    if (result.ok) {
      set({ notificationsEnabled: enabled });
      await saveString(storageKeys.gridSnapNotifications, String(enabled));
      void pushIfSignedIn();
    } else if (!enabled) {
      set({ notificationsEnabled: false });
      await saveString(storageKeys.gridSnapNotifications, 'false');
      void pushIfSignedIn();
    }

    return result;
  },

  setReminderTime: async (hour, minute) => {
    set({ reminderHour: hour, reminderMinute: minute });
    await saveString(storageKeys.gridSnapReminderHour, String(hour));
    await saveString(storageKeys.gridSnapReminderMinute, String(minute));
    void pushIfSignedIn();

    const { notificationsEnabled } = get();
    if (!notificationsEnabled) {
      return { ok: true };
    }

    return scheduleGameReminder('grid-snap', true, hour, minute);
  },
}));
