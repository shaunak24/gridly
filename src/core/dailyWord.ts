export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const DAILY_SEED = 'gridly-daily-v1';
const EPOCH = new Date(2024, 0, 1);

export function getDailyPuzzleNumber(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const epoch = new Date(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate());
  const diffMs = start.getTime() - epoch.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export function getDailyWord(date: Date, answers: readonly string[]): string {
  if (answers.length === 0) {
    throw new Error('Answer word list is empty');
  }

  const dateKey = getLocalDateKey(date);
  const index = hashString(`${DAILY_SEED}:${dateKey}`) % answers.length;
  return answers[index];
}
