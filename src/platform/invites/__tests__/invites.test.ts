import { buildInviteUrl } from '../buildInviteUrl';
import { formatInviteShareMessage } from '../formatInviteShareMessage';
import { getInviteLinkBase } from '../getInviteLinkBase';
import { getWordHuntCustomWord } from '../wordHuntInvite';

describe('invite link helpers', () => {
  const originalInviteBase = process.env.EXPO_PUBLIC_INVITE_LINK_BASE;
  const originalSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_INVITE_LINK_BASE = originalInviteBase;
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  });

  it('uses EXPO_PUBLIC_INVITE_LINK_BASE when set', () => {
    process.env.EXPO_PUBLIC_INVITE_LINK_BASE =
      'https://example.supabase.co/functions/v1/resolve-invite';
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://ignored.supabase.co';

    expect(getInviteLinkBase()).toBe('https://example.supabase.co/functions/v1/resolve-invite');
    expect(buildInviteUrl('abc123')).toBe(
      'https://example.supabase.co/functions/v1/resolve-invite/abc123',
    );
  });

  it('derives invite base from EXPO_PUBLIC_SUPABASE_URL', () => {
    delete process.env.EXPO_PUBLIC_INVITE_LINK_BASE;
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://project.supabase.co/';

    expect(getInviteLinkBase()).toBe('https://project.supabase.co/functions/v1/resolve-invite');
  });

  it('formats share message without embedding the link', () => {
    const message = formatInviteShareMessage();
    expect(message).toBe('Can you guess my Gridly word? 🧩');
    expect(message).not.toContain('https://');
  });

  it('extracts a Word Hunt custom word from invite payload', () => {
    expect(getWordHuntCustomWord({ mode: 'custom', word: 'brave' })).toBe('BRAVE');
    expect(getWordHuntCustomWord({ mode: 'daily' })).toBeNull();
    expect(getWordHuntCustomWord({ mode: 'custom', word: 'bad' })).toBeNull();
  });
});
