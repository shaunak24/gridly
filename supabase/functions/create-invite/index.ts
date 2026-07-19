import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { generateInviteId } from '../_shared/inviteId.ts';
import { validateWordHuntPayload } from '../_shared/validateWordHuntPayload.ts';

const INVITE_TTL_DAYS = 90;

interface CreateInviteRequest {
  gameId?: string;
  payload?: unknown;
}

function getInviteLinkBase(supabaseUrl: string): string {
  const configured = Deno.env.get('INVITE_LINK_BASE')?.replace(/\/$/, '');
  if (configured) {
    return configured;
  }

  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/resolve-invite`;
}

function validatePayload(gameId: string, payload: unknown): Record<string, unknown> | null {
  if (gameId === 'word-hunt') {
    const validated = validateWordHuntPayload(payload);
    return validated;
  }

  return null;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, message: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return jsonResponse({ ok: false, message: 'Server is not configured.' }, 500);
  }

  let body: CreateInviteRequest;
  try {
    body = (await request.json()) as CreateInviteRequest;
  } catch {
    return jsonResponse({ ok: false, message: 'Invalid request body.' }, 400);
  }

  const gameId = body.gameId?.trim();
  if (!gameId) {
    return jsonResponse({ ok: false, message: 'gameId is required.' }, 400);
  }

  const validatedPayload = validatePayload(gameId, body.payload);
  if (!validatedPayload) {
    return jsonResponse({ ok: false, message: 'Invalid invite payload.' }, 400);
  }

  const authHeader = request.headers.get('Authorization') ?? `Bearer ${anonKey}`;
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const inviteId = generateInviteId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await adminClient.from('game_invites').insert({
    id: inviteId,
    game_id: gameId,
    payload: validatedPayload,
    created_by: user?.id ?? null,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    return jsonResponse({ ok: false, message: 'Could not create invite.' }, 500);
  }

  const url = `${getInviteLinkBase(supabaseUrl)}/${inviteId}`;
  return jsonResponse({ ok: true, id: inviteId, url });
});
