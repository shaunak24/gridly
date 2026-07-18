import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import {
  createSessionFromUrl,
  getCurrentSession,
  signInWithEmail,
  signInWithGoogle,
  signOut as authSignOut,
  signUpWithEmail,
  subscribeToAuthChanges,
} from './authService';
import { isSupabaseConfigured } from './supabaseClient';
import { mergeLocalToCloud, rehydrateLocalStores } from '../sync/syncService';

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  busy: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signInGoogle: () => Promise<string | null>;
  handleAuthCallback: (url: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  initialized: false,
  busy: false,

  init: async () => {
    if (!isSupabaseConfigured) {
      set({ initialized: true });
      return;
    }

    const session = await getCurrentSession();
    set({
      session,
      user: session?.user ?? null,
      initialized: true,
    });

    subscribeToAuthChanges(async (nextSession, nextUser) => {
      const wasSignedIn = Boolean(get().user);
      set({ session: nextSession, user: nextUser });

      if (!wasSignedIn && nextUser) {
        await mergeLocalToCloud(nextUser.id);
      }
    });
  },

  signIn: async (email, password) => {
    set({ busy: true });
    try {
      const result = await signInWithEmail(email, password);
      if (!result.ok) {
        return result.message;
      }
      set({ session: result.session, user: result.session.user });
      await mergeLocalToCloud(result.session.user.id);
      return null;
    } finally {
      set({ busy: false });
    }
  },

  signUp: async (email, password) => {
    set({ busy: true });
    try {
      const result = await signUpWithEmail(email, password);
      if (!result.ok) {
        return result.message;
      }
      set({ session: result.session, user: result.session.user });
      await mergeLocalToCloud(result.session.user.id);
      return null;
    } finally {
      set({ busy: false });
    }
  },

  signInGoogle: async () => {
    set({ busy: true });
    try {
      const result = await signInWithGoogle();
      if (!result.ok) {
        return result.message;
      }
      set({ session: result.session, user: result.session.user });
      await mergeLocalToCloud(result.session.user.id);
      return null;
    } finally {
      set({ busy: false });
    }
  },

  handleAuthCallback: async (url) => {
    const result = await createSessionFromUrl(url);
    if (!result.ok) {
      return result.message;
    }
    set({ session: result.session, user: result.session.user });
    await mergeLocalToCloud(result.session.user.id);
    return null;
  },

  signOut: async () => {
    set({ busy: true });
    try {
      await authSignOut();
      set({ session: null, user: null });
      await rehydrateLocalStores();
    } finally {
      set({ busy: false });
    }
  },
}));

export function useIsSignedIn(): boolean {
  return useAuthStore((state) => Boolean(state.user));
}
