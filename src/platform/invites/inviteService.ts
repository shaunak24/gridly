import { getSupabaseClient, isSupabaseConfigured } from '../auth/supabaseClient';
import type {
  CreateInviteResponse,
  FetchInviteResponse,
  GameId,
  GameInvitePayload,
  GameInviteRow,
} from './types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

async function getAuthHeader(): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return `Bearer ${supabaseAnonKey}`;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return `Bearer ${session?.access_token ?? supabaseAnonKey}`;
}

export async function createInvite(
  gameId: GameId,
  payload: GameInvitePayload,
): Promise<CreateInviteResponse> {
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      message: 'Sharing requires Supabase to be set up. Add your Supabase environment variables.',
    };
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/create-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: await getAuthHeader(),
      },
      body: JSON.stringify({ gameId, payload }),
    });

    const body = (await response.json()) as CreateInviteResponse;
    if (!response.ok || !body.ok) {
      return {
        ok: false,
        message: body.ok ? 'Could not create invite.' : body.message,
      };
    }

    return body;
  } catch {
    return { ok: false, message: 'Could not create invite. Check your connection and try again.' };
  }
}

const NETWORK_FAILURE_MESSAGE =
  "Couldn't load this puzzle. Check your connection and try again.";
const NOT_FOUND_MESSAGE = 'This puzzle link is invalid or has expired.';

/**
 * A missing invite comes back as `data: null` with no error, so anything that does
 * surface an error is a transport or configuration problem — not a dead link.
 * PostgREST errors carry a `code` (e.g. `PGRST116`); transport failures do not.
 */
function isTransportError(error: { code?: string; message?: string } | null): boolean {
  if (!error) {
    return false;
  }

  if (!error.code) {
    return true;
  }

  const message = (error.message ?? '').toLowerCase();
  return message.includes('network') || message.includes('fetch') || message.includes('timeout');
}

export async function fetchInvite(inviteId: string): Promise<FetchInviteResponse> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      reason: 'unsupported',
      message: 'This puzzle link requires an internet connection and Supabase setup.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('game_invites')
      .select('id, game_id, payload, expires_at')
      .eq('id', inviteId)
      .maybeSingle();

    if (isTransportError(error)) {
      return { ok: false, reason: 'network', message: NETWORK_FAILURE_MESSAGE };
    }

    if (error || !data) {
      return { ok: false, reason: 'not-found', message: NOT_FOUND_MESSAGE };
    }

    return { ok: true, invite: data as GameInviteRow };
  } catch {
    return { ok: false, reason: 'network', message: NETWORK_FAILURE_MESSAGE };
  }
}
