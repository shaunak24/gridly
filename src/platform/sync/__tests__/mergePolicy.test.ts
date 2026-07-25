import { getReminderIdentifier } from '../../../services/notifications';
import {
  emptyWordHuntStatsByMode,
  migrateLegacyWordHuntStats,
} from '../../../shared/stats/wordHuntModeStats';
import {
  mergeAppSettings,
  mergeGridSnapSettings,
  mergeGuestGridSnapStats,
  mergeGuestWordHuntStats,
  mergeWordHuntSettings,
  pickNewerGridSnapStats,
  pickNewerWordHuntStats,
  toGridSnapStatsCloud,
  toWordHuntStatsCloud,
} from '../mergePolicy';

describe('mergePolicy', () => {
  const timestamp = '2026-07-18T10:00:00.000Z';
  const older = '2026-07-17T10:00:00.000Z';

  it('merges guest word hunt stats into cloud on sign-in per mode', () => {
    const guestByMode = migrateLegacyWordHuntStats({
      gamesPlayed: 2,
      gamesWon: 1,
      currentStreak: 1,
      maxStreak: 2,
      distribution: [1, 0, 0, 0, 0, 0, 1],
    }).byMode;
    const cloudByMode = migrateLegacyWordHuntStats({
      gamesPlayed: 3,
      gamesWon: 2,
      currentStreak: 2,
      maxStreak: 4,
      distribution: [0, 1, 1, 0, 0, 0, 0],
    }).byMode;

    const guest = toWordHuntStatsCloud(guestByMode, '2026-07-17', timestamp);
    const cloud = toWordHuntStatsCloud(cloudByMode, '2026-07-18', older);

    const merged = mergeGuestWordHuntStats(guest, cloud);

    expect(merged.statsByMode.daily.gamesPlayed).toBe(5);
    expect(merged.statsByMode.daily.gamesWon).toBe(3);
    expect(merged.statsByMode.daily.currentStreak).toBe(2);
    expect(merged.statsByMode.daily.maxStreak).toBe(4);
    expect(merged.statsByMode.daily.distribution).toEqual([1, 1, 1, 0, 0, 0, 1]);
    expect(merged.dailyCompletedDate).toBe('2026-07-18');
  });

  it('does not inherit guest daily completion when cloud has no daily record', () => {
    const guest = toWordHuntStatsCloud(
      migrateLegacyWordHuntStats({
        gamesPlayed: 1,
        gamesWon: 1,
        currentStreak: 1,
        maxStreak: 1,
        distribution: [1, 0, 0, 0, 0, 0, 0],
      }).byMode,
      '2026-07-25',
      timestamp,
    );

    const merged = mergeGuestWordHuntStats(guest, null);

    expect(merged.dailyCompletedDate).toBeNull();
  });

  it('merges guest grid snap stats into cloud on sign-in per mode', () => {
    const guest = toGridSnapStatsCloud(
      {
        easy: { gamesPlayed: 1, gamesWon: 1, currentStreak: 1, maxStreak: 1, time: { fastestSec: 30, slowestSec: 30, totalSec: 30, completedCount: 1 } },
        medium: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, time: { fastestSec: null, slowestSec: null, totalSec: 0, completedCount: 0 } },
        hard: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, time: { fastestSec: null, slowestSec: null, totalSec: 0, completedCount: 0 } },
      },
      null,
      timestamp,
    );
    const cloud = toGridSnapStatsCloud(
      {
        easy: { gamesPlayed: 2, gamesWon: 1, currentStreak: 0, maxStreak: 3, time: { fastestSec: 45, slowestSec: 90, totalSec: 135, completedCount: 2 } },
        medium: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, time: { fastestSec: null, slowestSec: null, totalSec: 0, completedCount: 0 } },
        hard: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0, time: { fastestSec: null, slowestSec: null, totalSec: 0, completedCount: 0 } },
      },
      '2026-07-16',
      older,
    );

    const merged = mergeGuestGridSnapStats(guest, cloud);

    expect(merged.statsByMode.easy.gamesPlayed).toBe(3);
    expect(merged.statsByMode.easy.gamesWon).toBe(2);
    expect(merged.statsByMode.easy.maxStreak).toBe(3);
    expect(merged.statsByMode.easy.time.fastestSec).toBe(30);
    expect(merged.statsByMode.easy.time.totalSec).toBe(165);
    expect(merged.dailyCompletedDate).toBe('2026-07-16');
  });

  it('picks newer signed-in stats without summing local and cloud', () => {
    const local = toWordHuntStatsCloud(
      migrateLegacyWordHuntStats({
        gamesPlayed: 200,
        gamesWon: 100,
        currentStreak: 1,
        maxStreak: 2,
        distribution: [0, 0, 0, 0, 0, 0, 200],
      }).byMode,
      null,
      timestamp,
    );
    const cloud = toWordHuntStatsCloud(
      migrateLegacyWordHuntStats({
        gamesPlayed: 40,
        gamesWon: 20,
        currentStreak: 0,
        maxStreak: 2,
        distribution: [0, 0, 0, 0, 16, 24, 0],
      }).byMode,
      null,
      older,
    );

    const picked = pickNewerWordHuntStats(local, cloud);

    expect(picked.statsByMode.daily.gamesPlayed).toBe(200);
    expect(picked.statsByMode.daily.gamesWon).toBe(100);
    expect(picked.statsByMode.daily.distribution).toEqual([0, 0, 0, 0, 0, 0, 200]);
  });

  it('picks latest settings by updatedAt', () => {
    const local = {
      hardMode: true,
      notificationsEnabled: true,
      reminderHour: 9,
      reminderMinute: 0,
      updatedAt: timestamp,
    };
    const cloud = {
      hardMode: false,
      notificationsEnabled: false,
      reminderHour: 8,
      reminderMinute: 30,
      updatedAt: older,
    };

    expect(mergeWordHuntSettings(local, cloud).hardMode).toBe(true);
    expect(mergeGridSnapSettings(
      { difficulty: 'hard' as const, notificationsEnabled: true, reminderHour: 7, reminderMinute: 0, updatedAt: older },
      { difficulty: 'easy' as const, notificationsEnabled: false, reminderHour: 8, reminderMinute: 0, updatedAt: timestamp },
    ).difficulty).toBe('easy');
    expect(mergeAppSettings({ theme: 'dark' as const, updatedAt: timestamp }, { theme: 'light' as const, updatedAt: older }).theme).toBe('dark');
  });

  it('returns empty mode buckets when no local or cloud stats exist', () => {
    const picked = pickNewerWordHuntStats(null, null);
    expect(picked.statsByMode).toEqual(emptyWordHuntStatsByMode());
  });
});

describe('notifications', () => {
  it('uses distinct reminder identifiers per game', () => {
    expect(getReminderIdentifier('word-hunt')).toBe('gridly-word-hunt-reminder');
    expect(getReminderIdentifier('grid-snap')).toBe('gridly-grid-snap-reminder');
  });
});
