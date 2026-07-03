import { getLocalDateKey } from '../core/dailyWord';
import type { GameMode, PersistedGame } from '../core/persistedGame';
import { loadJson, removeKey, saveJson, storageKeys } from '../services/storage';

export type { PersistedGame } from '../core/persistedGame';
export { toPersistedGame } from '../core/persistedGame';

function storageKeyForMode(mode: GameMode): string {
  return mode === 'daily' ? storageKeys.savedDaily : storageKeys.savedPractice;
}

export async function loadPersistedGame(mode: GameMode): Promise<PersistedGame | null> {
  const saved = await loadJson<PersistedGame>(storageKeyForMode(mode));
  if (!saved || saved.status !== 'playing' || saved.mode !== mode) {
    return null;
  }

  if (mode === 'daily' && saved.dateKey !== getLocalDateKey()) {
    return null;
  }

  return saved;
}

export async function savePersistedGame(game: PersistedGame): Promise<void> {
  await saveJson(storageKeyForMode(game.mode), game);
}

export async function clearPersistedGame(mode: GameMode): Promise<void> {
  await removeKey(storageKeyForMode(mode));
}

export async function hasPersistedGameInProgress(mode: GameMode): Promise<boolean> {
  const saved = await loadPersistedGame(mode);
  return saved !== null;
}
