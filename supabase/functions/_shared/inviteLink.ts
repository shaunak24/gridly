// Canonical HTTPS invite URL. Single source of truth for create-invite (the link
// we hand to the share sheet) and resolve-invite (the Android browser fallback).
//
// Deliberately pure — callers pass the INVITE_LINK_BASE secret in — so this can be
// unit tested outside Deno. Never derive the base from `request.url`: inside the
// Supabase edge runtime that is `http://<ref>.supabase.co/<function>/…`, missing
// both the `https` scheme and the `/functions/v1` prefix.

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getInviteLinkBase(supabaseUrl: string, configuredBase?: string | null): string {
  const configured = configuredBase?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }

  return `${stripTrailingSlash(supabaseUrl)}/functions/v1/resolve-invite`;
}

export function buildInviteUrl(
  supabaseUrl: string,
  inviteId: string,
  configuredBase?: string | null,
): string {
  return `${getInviteLinkBase(supabaseUrl, configuredBase)}/${encodeURIComponent(inviteId)}`;
}
