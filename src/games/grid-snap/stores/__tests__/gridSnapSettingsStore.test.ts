import { loadString, removeKey, saveString, storageKeys } from '../../../../shared/services/storage';
import { useGridSnapSettingsStore } from '../gridSnapSettingsStore';

jest.mock('../../../../shared/services/storage', () => ({
  loadString: jest.fn(),
  saveString: jest.fn(),
  removeKey: jest.fn(),
  loadJson: jest.fn(),
  saveJson: jest.fn(),
  migrateStorageKeys: jest.fn(),
  storageKeys: {
    gridSnapDifficulty: '@gridly/grid-snap/difficulty',
    gridSnapNotifications: '@gridly/grid-snap/notifications',
    gridSnapReminderHour: '@gridly/grid-snap/reminderHour',
    gridSnapReminderMinute: '@gridly/grid-snap/reminderMinute',
    gridSnapSavedDaily: '@gridly/grid-snap/savedDaily',
    gridSnapSavedPractice: '@gridly/grid-snap/savedPractice',
    storageMigrated: '@gridly/app/storageMigrated',
  },
}));

jest.mock('../../../../services/notifications', () => ({
  GAME_REMINDER_DEFAULTS: {
    'word-hunt': { hour: 8, minute: 0 },
    'grid-snap': { hour: 8, minute: 30 },
    'color-flow': { hour: 9, minute: 0 },
  },
  parseNotificationsEnabled: (value: string | null) => value !== 'false',
  parseReminderHour: (value: string | null, defaultHour: number) => {
    if (value === null || value === '') {
      return defaultHour;
    }
    const hour = Number(value);
    return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : defaultHour;
  },
  parseReminderMinute: (value: string | null, defaultMinute: number) => {
    if (value === null || value === '') {
      return defaultMinute;
    }
    const minute = Number(value);
    return Number.isInteger(minute) && minute >= 0 && minute <= 59 ? minute : defaultMinute;
  },
  scheduleGameReminder: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock('../../../../platform/sync/pushIfSignedIn', () => ({
  pushIfSignedIn: jest.fn(),
}));

const loadStringMock = loadString as jest.MockedFunction<typeof loadString>;
const saveStringMock = saveString as jest.MockedFunction<typeof saveString>;
const removeKeyMock = removeKey as jest.MockedFunction<typeof removeKey>;

describe('gridSnapSettingsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGridSnapSettingsStore.setState({
      difficulty: 'easy',
      notificationsEnabled: true,
      reminderHour: 8,
      reminderMinute: 30,
      hydrated: false,
    });
  });

  it('hydrates difficulty from storage before starting a new game', async () => {
    loadStringMock.mockImplementation(async (key: string) => {
      if (key.includes('difficulty')) {
        return 'hard';
      }
      return null;
    });

    await useGridSnapSettingsStore.getState().ensureHydrated();

    expect(useGridSnapSettingsStore.getState().difficulty).toBe('hard');
    expect(useGridSnapSettingsStore.getState().reminderHour).toBe(8);
    expect(useGridSnapSettingsStore.getState().reminderMinute).toBe(30);
    expect(useGridSnapSettingsStore.getState().hydrated).toBe(true);
  });

  it('persists difficulty and clears in-progress saves when changed', async () => {
    await useGridSnapSettingsStore.getState().setDifficulty('medium');

    expect(saveStringMock).toHaveBeenCalledWith(storageKeys.gridSnapDifficulty, 'medium');
    expect(removeKeyMock).toHaveBeenCalledWith(storageKeys.gridSnapSavedDaily);
    expect(removeKeyMock).toHaveBeenCalledWith(storageKeys.gridSnapSavedPractice);
    expect(useGridSnapSettingsStore.getState().difficulty).toBe('medium');
  });
});
