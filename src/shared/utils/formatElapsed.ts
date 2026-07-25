export function formatElapsedSeconds(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatElapsedOrDash(totalSec: number | null): string {
  if (totalSec === null) {
    return '—';
  }
  return formatElapsedSeconds(totalSec);
}
