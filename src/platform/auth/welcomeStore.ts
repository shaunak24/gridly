import { create } from 'zustand';

import { loadString, saveString, storageKeys } from '../../shared/services/storage';

interface WelcomeState {
  guestContinued: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  clearGuest: () => Promise<void>;
}

export const useWelcomeStore = create<WelcomeState>((set) => ({
  guestContinued: false,
  hydrated: false,

  hydrate: async () => {
    const value = await loadString(storageKeys.guestContinued);
    set({
      guestContinued: value === 'true',
      hydrated: true,
    });
  },

  continueAsGuest: async () => {
    set({ guestContinued: true });
    await saveString(storageKeys.guestContinued, 'true');
  },

  clearGuest: async () => {
    set({ guestContinued: false });
    await saveString(storageKeys.guestContinued, 'false');
  },
}));
