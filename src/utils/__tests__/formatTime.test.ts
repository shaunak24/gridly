import { formatReminderTime } from '../formatTime';

describe('formatReminderTime', () => {
  it('formats midnight as 12:00 AM', () => {
    expect(formatReminderTime(0, 0)).toBe('12:00 AM');
  });

  it('formats 8 AM default', () => {
    expect(formatReminderTime(8, 0)).toBe('8:00 AM');
  });

  it('formats noon', () => {
    expect(formatReminderTime(12, 0)).toBe('12:00 PM');
  });

  it('formats minutes with leading zero', () => {
    expect(formatReminderTime(9, 5)).toBe('9:05 AM');
  });
});
