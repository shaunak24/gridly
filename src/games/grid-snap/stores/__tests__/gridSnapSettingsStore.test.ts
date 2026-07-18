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
  scheduleGameReminder: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock('../../../../platform/sync/syncService', () => ({
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
      reminderMinute: 0,
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
