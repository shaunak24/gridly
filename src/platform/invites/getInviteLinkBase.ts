export function getInviteLinkBase(): string | null {
  const configured = process.env.EXPO_PUBLIC_INVITE_LINK_BASE?.replace(/\/$/, '');
  if (configured) {
    return configured;
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl}/functions/v1/resolve-invite`;
}
