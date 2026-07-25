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
import { authError, authInfo, type AuthUserMessage } from './authMessages';
import { isSupabaseConfigured } from './supabaseClient';
import { mergeLocalToCloud, pushSnapshotWithTimeout, rehydrateLocalStores, loadSignedInUserStores } from '../sync/syncService';

export type { AuthUserMessage } from './authMessages';

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  busy: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthUserMessage | null>;
  signUp: (email: string, password: string) => Promise<AuthUserMessage | null>;
  signInGoogle: () => Promise<AuthUserMessage | null>;
  handleAuthCallback: (url: string) => Promise<AuthUserMessage | null>;
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

    try {
      const session = await getCurrentSession();
      set({
        session,
        user: session?.user ?? null,
        initialized: true,
      });

      if (session?.user) {
        try {
          await loadSignedInUserStores(session.user.id);
        } catch {
          // Offline cold start still shows cached local stats.
        }
      }

      subscribeToAuthChanges(async (nextSession, nextUser) => {
        const wasSignedIn = Boolean(get().user);
        set({ session: nextSession, user: nextUser });

        if (!wasSignedIn && nextUser) {
          try {
            await mergeLocalToCloud(nextUser.id);
          } catch {
            // Keep the signed-in session even if sync fails offline.
          }
        }
      });
    } catch {
      set({ session: null, user: null, initialized: true });
    }
  },

  signIn: async (email, password) => {
    set({ busy: true });
    try {
      const result = await signInWithEmail(email, password);
      if (!result.ok) {
        return authError('Sign in failed', result.message);
      }
      set({ session: result.session, user: result.session.user });
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
        if (result.pendingConfirmation) {
          return authInfo('Check your email', result.message);
        }
        return authError('Sign up failed', result.message);
      }
      set({ session: result.session, user: result.session.user });
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
        return authError('Sign in failed', result.message);
      }
      set({ session: result.session, user: result.session.user });
      return null;
    } finally {
      set({ busy: false });
    }
  },

  handleAuthCallback: async (url) => {
    if (get().user) {
      return null;
    }

    const existingSession = await getCurrentSession();
    if (existingSession) {
      set({ session: existingSession, user: existingSession.user });
      return null;
    }

    const result = await createSessionFromUrl(url);
    if (!result.ok) {
      const retrySession = await getCurrentSession();
      if (retrySession) {
        set({ session: retrySession, user: retrySession.user });
        return null;
      }

      return authError('Sign in failed', result.message);
    }

    set({ session: result.session, user: result.session.user });
    return null;
  },

  signOut: async () => {
    const userId = get().user?.id;
    set({ busy: true });
    try {
      if (userId) {
        void pushSnapshotWithTimeout(userId).catch(() => {
          // Sign-out proceeds even if the cloud push fails or times out.
        });
      }
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
