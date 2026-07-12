import { getLocalDateKey } from '../core/dailyWord';
import type { PersistedGame } from '../core/persistedGame';
import type { GameMode } from '../core/types';
import { loadJson, removeKey, saveJson, storageKeys } from '../../../shared/services/storage';

export type { PersistedGame } from '../core/persistedGame';
export { toPersistedGame } from '../core/persistedGame';

function storageKeyForMode(mode: GameMode): string | null {
  if (mode === 'daily') {
    return storageKeys.savedDaily;
  }
  if (mode === 'practice') {
    return storageKeys.savedPractice;
  }
  return null;
}

export async function loadPersistedGame(mode: GameMode): Promise<PersistedGame | null> {
  const key = storageKeyForMode(mode);
  if (!key) {
    return null;
  }

  const saved = await loadJson<PersistedGame>(key);
  if (!saved || saved.status !== 'playing' || saved.mode !== mode) {
    return null;
  }

  if (mode === 'daily' && saved.dateKey !== getLocalDateKey()) {
    return null;
  }

  return saved;
}

export async function savePersistedGame(game: PersistedGame): Promise<void> {
  const key = storageKeyForMode(game.mode);
  if (!key) {
    return;
  }
  await saveJson(key, game);
}

export async function clearPersistedGame(mode: GameMode): Promise<void> {
  const key = storageKeyForMode(mode);
  if (!key) {
    return;
  }
  await removeKey(key);
}

export async function hasPersistedGameInProgress(mode: GameMode): Promise<boolean> {
  const saved = await loadPersistedGame(mode);
  return saved !== null;
}
