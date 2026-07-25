import { useAuthStore } from '../../auth/authStore';
import {
  loadDailyCompletedDate,
  loadGuestDailyCompletedDate,
  saveDailyCompletedDate,
} from '../dailyCompletion';

const mockStorage = new Map<string, string>();

jest.mock('../../../shared/services/storage', () => ({
  loadString: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  saveString: jest.fn(async (key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  removeKey: jest.fn(async (key: string) => {
    mockStorage.delete(key);
  }),
  storageKeys: {
    dailyCompleted: '@gridly/word-hunt/dailyCompleted',
    dailyCompletedGuest: '@gridly/word-hunt/dailyCompleted/guest',
    dailyCompletedUserPrefix: '@gridly/word-hunt/dailyCompleted/user/',
    gridSnapDailyCompleted: '@gridly/grid-snap/dailyCompleted',
    gridSnapDailyCompletedGuest: '@gridly/grid-snap/dailyCompleted/guest',
    gridSnapDailyCompletedUserPrefix: '@gridly/grid-snap/dailyCompleted/user/',
  },
}));

jest.mock('../../auth/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

const mockedGetState = useAuthStore.getState as jest.Mock;

describe('dailyCompletion', () => {
  beforeEach(() => {
    mockStorage.clear();
    mockedGetState.mockReturnValue({ user: null });
  });

  it('stores guest and user daily completion separately', async () => {
    await saveDailyCompletedDate('word-hunt', '2026-07-25');
    expect(await loadGuestDailyCompletedDate('word-hunt')).toBe('2026-07-25');

    mockedGetState.mockReturnValue({ user: { id: 'user-a' } });
    expect(await loadDailyCompletedDate('word-hunt')).toBeNull();

    await saveDailyCompletedDate('word-hunt', '2026-07-24');
    expect(await loadDailyCompletedDate('word-hunt')).toBe('2026-07-24');

    mockedGetState.mockReturnValue({ user: null });
    expect(await loadGuestDailyCompletedDate('word-hunt')).toBe('2026-07-25');
  });

  it('migrates legacy daily completion keys to guest scope', async () => {
    mockStorage.set('@gridly/word-hunt/dailyCompleted', '2026-07-20');

    expect(await loadGuestDailyCompletedDate('word-hunt')).toBe('2026-07-20');
    expect(mockStorage.has('@gridly/word-hunt/dailyCompleted')).toBe(false);
  });
});
