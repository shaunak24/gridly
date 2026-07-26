import { emptyGridSnapStatsByMode } from '../../../shared/stats/gridSnapModeStats';
import { emptyWordHuntStatsByMode } from '../../../shared/stats/wordHuntModeStats';
import { hasGuestStatsProgress } from '../statsStorage';

jest.mock('../../auth/authStore', () => ({
  useAuthStore: { getState: () => ({ user: null }) },
}));

jest.mock('../../../shared/services/storage', () => ({
  storageKeys: {
    stats: 'stats',
    gridSnapStats: 'gridSnapStats',
    statsGuest: 'statsGuest',
    gridSnapStatsGuest: 'gridSnapStatsGuest',
    statsUserPrefix: 'statsUser:',
    gridSnapStatsUserPrefix: 'gridSnapStatsUser:',
  },
  loadJson: jest.fn(),
  saveJson: jest.fn(),
  removeKey: jest.fn(),
}));

import { loadJson } from '../../../shared/services/storage';

const loadJsonMock = loadJson as jest.Mock;

describe('hasGuestStatsProgress', () => {
  beforeEach(() => {
    loadJsonMock.mockReset();
  });

  it('returns false when guest stats are empty', async () => {
    loadJsonMock.mockResolvedValue(null);

    await expect(hasGuestStatsProgress()).resolves.toBe(false);
  });

  it('returns true when guest word hunt has played games', async () => {
    loadJsonMock.mockImplementation(async (key: string) => {
      if (key === 'statsGuest') {
        return {
          byMode: {
            ...emptyWordHuntStatsByMode(),
            daily: { ...emptyWordHuntStatsByMode().daily, gamesPlayed: 2 },
          },
        };
      }
      return null;
    });

    await expect(hasGuestStatsProgress()).resolves.toBe(true);
  });

  it('returns true when guest grid snap has played games', async () => {
    loadJsonMock.mockImplementation(async (key: string) => {
      if (key === 'gridSnapStatsGuest') {
        return {
          byMode: {
            ...emptyGridSnapStatsByMode(),
            medium: { ...emptyGridSnapStatsByMode().medium, gamesPlayed: 1 },
          },
        };
      }
      return null;
    });

    await expect(hasGuestStatsProgress()).resolves.toBe(true);
  });
});
