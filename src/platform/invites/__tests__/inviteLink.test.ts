import {
  buildInviteUrl,
  getInviteLinkBase,
} from '../../../../supabase/functions/_shared/inviteLink';

describe('getInviteLinkBase', () => {
  it('derives the base from the Supabase URL', () => {
    expect(getInviteLinkBase('https://abc.supabase.co')).toBe(
      'https://abc.supabase.co/functions/v1/resolve-invite',
    );
  });

  it('strips trailing slashes from the Supabase URL', () => {
    expect(getInviteLinkBase('https://abc.supabase.co/')).toBe(
      'https://abc.supabase.co/functions/v1/resolve-invite',
    );
  });

  it('prefers a configured base and strips its trailing slash', () => {
    expect(getInviteLinkBase('https://abc.supabase.co', 'https://play.gridly.app/i/')).toBe(
      'https://play.gridly.app/i',
    );
  });

  it('ignores a blank configured base', () => {
    expect(getInviteLinkBase('https://abc.supabase.co', '  ')).toBe(
      'https://abc.supabase.co/functions/v1/resolve-invite',
    );
  });
});

describe('buildInviteUrl', () => {
  it('appends the invite id', () => {
    expect(buildInviteUrl('https://abc.supabase.co', 'C4F1VhCHJGdQ')).toBe(
      'https://abc.supabase.co/functions/v1/resolve-invite/C4F1VhCHJGdQ',
    );
  });

  it('url-encodes the invite id', () => {
    expect(buildInviteUrl('https://abc.supabase.co', 'a/b')).toContain('resolve-invite/a%2Fb');
  });
});
