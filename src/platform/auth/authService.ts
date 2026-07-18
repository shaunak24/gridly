import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session, User } from '@supabase/supabase-js';

import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

WebBrowser.maybeCompleteAuthSession();

export type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; message: string };

function getRedirectUrl(): string {
  return Linking.createURL('auth/callback');
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: 'Cloud services are not configured yet.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return { ok: false, message: error?.message ?? 'Sign in failed.' };
  }

  return { ok: true, session: data.session };
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: 'Cloud services are not configured yet.' };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data.session) {
    return {
      ok: false,
      message: 'Account created. Check your email to confirm your address, then sign in.',
    };
  }

  return { ok: true, session: data.session };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: 'Cloud services are not configured yet.' };
  }

  const redirectTo = getRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return { ok: false, message: error?.message ?? 'Could not start sign in.' };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    return { ok: false, message: 'Sign in was cancelled.' };
  }

  const sessionResult = await createSessionFromUrl(result.url);
  if (!sessionResult.ok) {
    return sessionResult;
  }

  return sessionResult;
}

export async function createSessionFromUrl(url: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: 'Cloud services are not configured yet.' };
  }

  const params = Linking.parse(url);
  const queryParams = params.queryParams ?? {};
  const code = typeof queryParams.code === 'string' ? queryParams.code : null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.session) {
      return { ok: false, message: error?.message ?? 'Could not complete sign in.' };
    }
    return { ok: true, session: data.session };
  }

  const accessToken = typeof queryParams.access_token === 'string' ? queryParams.access_token : null;
  const refreshToken = typeof queryParams.refresh_token === 'string' ? queryParams.refresh_token : null;

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error || !data.session) {
      return { ok: false, message: error?.message ?? 'Could not complete sign in.' };
    }
    return { ok: true, session: data.session };
  }

  return { ok: false, message: 'Invalid auth callback.' };
}

export function subscribeToAuthChanges(
  onChange: (session: Session | null, user: User | null) => void,
): (() => void) | null {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session, session?.user ?? null);
  });

  return () => {
    data.subscription.unsubscribe();
  };
}

export function isAuthAvailable(): boolean {
  return isSupabaseConfigured;
}
