import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session, User } from '@supabase/supabase-js';

import { mapAuthError } from './authErrors';
import { validateAuthEmail, validateAuthPassword } from './authValidation';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

WebBrowser.maybeCompleteAuthSession();

export type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; message: string; pendingConfirmation?: boolean };

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
  const emailError = validateAuthEmail(email);
  if (emailError) {
    return { ok: false, message: emailError };
  }

  const passwordError = validateAuthPassword(password);
  if (passwordError) {
    return { ok: false, message: passwordError };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: 'Cloud services are not configured yet.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.session) {
    return { ok: false, message: mapAuthError(error) };
  }

  return { ok: true, session: data.session };
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const emailError = validateAuthEmail(email);
  if (emailError) {
    return { ok: false, message: emailError };
  }

  const passwordError = validateAuthPassword(password);
  if (passwordError) {
    return { ok: false, message: passwordError };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: 'Cloud services are not configured yet.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: getRedirectUrl(),
    },
  });
  if (error) {
    return { ok: false, message: mapAuthError(error) };
  }

  if (data.user && data.user.identities?.length === 0) {
    return {
      ok: false,
      message: 'An account with this email already exists. Try signing in.',
    };
  }

  if (!data.session) {
    return {
      ok: false,
      pendingConfirmation: true,
      message:
        'We sent a confirmation link to your email. Open it on this device, then sign in. Check spam if it does not arrive within a few minutes.',
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
    return { ok: false, message: mapAuthError(error) ?? 'Could not start Google sign in.' };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    const session = await getCurrentSession();
    if (session) {
      return { ok: true, session };
    }

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
      return { ok: false, message: mapAuthError(error) };
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
      return { ok: false, message: mapAuthError(error) };
    }
    return { ok: true, session: data.session };
  }

  return { ok: false, message: 'Could not complete sign in. Try again.' };
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
