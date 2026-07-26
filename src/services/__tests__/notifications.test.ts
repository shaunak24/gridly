import {
  GAME_REMINDER_DEFAULTS,
  parseNotificationsEnabled,
  parseReminderHour,
  parseReminderMinute,
} from '../notifications';

describe('reminder settings parsing', () => {
  it('defaults null reminder hour to the configured default', () => {
    expect(parseReminderHour(null, GAME_REMINDER_DEFAULTS['word-hunt'].hour)).toBe(8);
    expect(parseReminderHour(null, GAME_REMINDER_DEFAULTS['grid-snap'].hour)).toBe(8);
    expect(parseReminderHour(null, GAME_REMINDER_DEFAULTS['color-flow'].hour)).toBe(9);
  });

  it('defaults empty reminder values to the configured default', () => {
    expect(parseReminderHour('', 8)).toBe(8);
    expect(parseReminderMinute('', 30)).toBe(30);
  });

  it('parses valid stored reminder values', () => {
    expect(parseReminderHour('9', 8)).toBe(9);
    expect(parseReminderMinute('30', 0)).toBe(30);
  });

  it('defaults notifications to enabled unless explicitly false', () => {
    expect(parseNotificationsEnabled(null)).toBe(true);
    expect(parseNotificationsEnabled('true')).toBe(true);
    expect(parseNotificationsEnabled('false')).toBe(false);
  });
});
