import { buildAndroidIntentUrl } from '../buildAndroidIntentUrl';

describe('buildAndroidIntentUrl', () => {
  it('builds an Android intent URL for Word Hunt invites', () => {
    const intentUrl = buildAndroidIntentUrl(
      'word-hunt',
      'abc123',
      'https://example.supabase.co/functions/v1/resolve-invite/abc123',
    );

    expect(intentUrl).toContain('intent://games/word-hunt/play?mode=custom&invite=abc123');
    expect(intentUrl).toContain('scheme=gridly');
    expect(intentUrl).toContain('package=com.gridly.app');
    expect(intentUrl).toContain(
      'S.browser_fallback_url=' +
        encodeURIComponent('https://example.supabase.co/functions/v1/resolve-invite/abc123'),
    );
    expect(intentUrl.endsWith(';end')).toBe(true);
  });
});
