import { getInviteLinkBase } from './getInviteLinkBase';

export function buildInviteUrl(inviteId: string): string | null {
  const base = getInviteLinkBase();
  if (!base) {
    return null;
  }

  return `${base}/${encodeURIComponent(inviteId)}`;
}
