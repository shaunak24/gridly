export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mixHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x7feb352d);
    hash ^= hash >>> 15;
  }
  return Math.abs(hash);
}

export function getDailyImageSeed(date: Date = new Date()): string {
  const dateKey = getLocalDateKey(date);
  return `gridly-daily-${dateKey}-${mixHash(`gridly-snap-v1:${dateKey}`)}`;
}

export function getPracticeImageSeed(): string {
  return `gridly-practice-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}
