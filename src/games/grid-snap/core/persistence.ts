import { removeKey, storageKeys } from '../../../shared/services/storage';

export async function clearSavedGridSnapGames(): Promise<void> {
  await Promise.all([
    removeKey(storageKeys.gridSnapSavedDaily),
    removeKey(storageKeys.gridSnapSavedPractice),
  ]);
}
