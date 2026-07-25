import { getReminderIdentifier } from '../../../services/notifications';
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

  it('merges guest word hunt stats into cloud on sign-in', () => {
    const guest = toWordHuntStatsCloud(
      {
        gamesPlayed: 2,
        gamesWon: 1,
        currentStreak: 1,
        maxStreak: 2,
        distribution: [1, 0, 0, 0, 0, 0, 1],
      },
      '2026-07-17',
      timestamp,
    );
    const cloud = toWordHuntStatsCloud(
      {
        gamesPlayed: 3,
        gamesWon: 2,
        currentStreak: 2,
        maxStreak: 4,
        distribution: [0, 1, 1, 0, 0, 0, 0],
      },
      '2026-07-18',
      older,
    );

    const merged = mergeGuestWordHuntStats(guest, cloud);

    expect(merged.gamesPlayed).toBe(5);
    expect(merged.gamesWon).toBe(3);
    expect(merged.currentStreak).toBe(2);
    expect(merged.maxStreak).toBe(4);
    expect(merged.distribution).toEqual([1, 1, 1, 0, 0, 0, 1]);
    expect(merged.dailyCompletedDate).toBe('2026-07-18');
  });

  it('does not inherit guest daily completion when cloud has no daily record', () => {
    const guest = toWordHuntStatsCloud(
      {
        gamesPlayed: 1,
        gamesWon: 1,
        currentStreak: 1,
        maxStreak: 1,
        distribution: [1, 0, 0, 0, 0, 0, 0],
      },
      '2026-07-25',
      timestamp,
    );

    const merged = mergeGuestWordHuntStats(guest, null);

    expect(merged.dailyCompletedDate).toBeNull();
  });

  it('merges guest grid snap stats into cloud on sign-in', () => {
    const guest = toGridSnapStatsCloud(
      { gamesPlayed: 1, gamesWon: 1, currentStreak: 1, maxStreak: 1 },
      null,
      timestamp,
    );
    const cloud = toGridSnapStatsCloud(
      { gamesPlayed: 2, gamesWon: 1, currentStreak: 0, maxStreak: 3 },
      '2026-07-16',
      older,
    );

    const merged = mergeGuestGridSnapStats(guest, cloud);

    expect(merged.gamesPlayed).toBe(3);
    expect(merged.gamesWon).toBe(2);
    expect(merged.maxStreak).toBe(3);
    expect(merged.dailyCompletedDate).toBe('2026-07-16');
  });

  it('picks newer signed-in stats without summing local and cloud', () => {
    const local = toWordHuntStatsCloud(
      {
        gamesPlayed: 200,
        gamesWon: 100,
        currentStreak: 1,
        maxStreak: 2,
        distribution: [0, 0, 0, 0, 0, 0, 200],
      },
      null,
      timestamp,
    );
    const cloud = toWordHuntStatsCloud(
      {
        gamesPlayed: 40,
        gamesWon: 20,
        currentStreak: 0,
        maxStreak: 2,
        distribution: [0, 0, 0, 0, 16, 24, 0],
      },
      null,
      older,
    );

    const picked = pickNewerWordHuntStats(local, cloud);

    expect(picked.gamesPlayed).toBe(200);
    expect(picked.gamesWon).toBe(100);
    expect(picked.distribution).toEqual([0, 0, 0, 0, 0, 0, 200]);
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
});

describe('notifications', () => {
  it('uses distinct reminder identifiers per game', () => {
    expect(getReminderIdentifier('word-hunt')).toBe('gridly-word-hunt-reminder');
    expect(getReminderIdentifier('grid-snap')).toBe('gridly-grid-snap-reminder');
  });
});
