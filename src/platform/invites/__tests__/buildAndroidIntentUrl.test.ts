// Covers the edge-function deep-link builders directly. There used to be a
// byte-identical copy under src/platform/invites/ purely so Jest could reach it;
// the copy is gone so the server code and the tested code cannot drift apart.
import {
  buildAndroidIntentUrl,
  buildAppDeepLink,
} from '../../../../supabase/functions/_shared/deepLink';

describe('buildAppDeepLink', () => {
  it('builds a custom-mode deep link for Word Hunt invites', () => {
    expect(buildAppDeepLink('word-hunt', 'abc123')).toBe(
      'gridly://games/word-hunt/play?mode=custom&invite=abc123',
    );
  });

  it('builds a generic deep link for other games', () => {
    expect(buildAppDeepLink('grid-snap', 'abc123')).toBe(
      'gridly://games/grid-snap/play?invite=abc123',
    );
  });

  it('url-encodes the invite id', () => {
    expect(buildAppDeepLink('word-hunt', 'a+b/c')).toContain('invite=a%2Bb%2Fc');
  });
});

describe('buildAndroidIntentUrl', () => {
  it('builds an Android intent URL for Word Hunt invites', () => {
    const intentUrl = buildAndroidIntentUrl(
      'word-hunt',
      'abc123',
      'https://example.supabase.co/functions/v1/resolve-invite/abc123?fallback=1',
    );

    expect(intentUrl).toContain('intent://games/word-hunt/play?mode=custom&invite=abc123');
    expect(intentUrl).toContain('scheme=gridly');
    expect(intentUrl).toContain('package=com.gridly.app');
    expect(intentUrl).toContain('action=android.intent.action.VIEW');
    expect(intentUrl).toContain('category=android.intent.category.BROWSABLE');
    expect(intentUrl).toContain('category=android.intent.category.DEFAULT');
    expect(intentUrl).toContain(
      'S.browser_fallback_url=' +
        encodeURIComponent(
          'https://example.supabase.co/functions/v1/resolve-invite/abc123?fallback=1',
        ),
    );
    expect(intentUrl.endsWith(';end')).toBe(true);
  });
});
