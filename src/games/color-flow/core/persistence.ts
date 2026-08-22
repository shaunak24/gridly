import { removeKey, storageKeys } from '../../../shared/services/storage';

export async function clearSavedColorFlowGames(): Promise<void> {
  await Promise.all([
    removeKey(storageKeys.colorFlowSavedDaily),
    removeKey(storageKeys.colorFlowSavedPractice),
    removeKey(storageKeys.colorFlowSavedCampaign),
  ]);
}
