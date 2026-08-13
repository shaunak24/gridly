import {
  buildFallbackUrl,
  renderLandingPage,
  renderNotFoundPage,
} from '../../../../supabase/functions/_shared/landingPage';

const CANONICAL = 'https://example.supabase.co/functions/v1/resolve-invite/C4F1VhCHJGdQ';

function render(overrides: Partial<Parameters<typeof renderLandingPage>[0]> = {}): string {
  return renderLandingPage({
    inviteId: 'C4F1VhCHJGdQ',
    gameId: 'word-hunt',
    canonicalUrl: CANONICAL,
    ...overrides,
  });
}

function scriptBlocks(html: string): string[] {
  return Array.from(html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g), (match) => match[1]);
}

function attribute(html: string, name: string): string {
  const match = html.match(new RegExp(`${name}="([^"]*)"`));
  if (!match) {
    throw new Error(`attribute ${name} not found`);
  }
  // Browsers decode entities in attribute values; mirror that here.
  return match[1]
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function openGridlyHref(html: string): string {
  const match = html.match(/id="open-gridly" href="([^"]*)"/);
  if (!match) {
    throw new Error('open-gridly href not found');
  }
  return match[1]
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

describe('renderLandingPage', () => {
  it('never emits an html-escaped ampersand inside a script block', () => {
    // Regression guard: entities are NOT decoded inside <script>, so an escaped URL
    // there arrives at the app as `mode=custom&amp;invite=…` and loses the invite.
    for (const block of scriptBlocks(render())) {
      expect(block).not.toContain('&amp;');
      expect(block).not.toContain('gridly://');
      expect(block).not.toContain('intent://');
    }
  });

  it('exposes a deep link whose invite param survives URL parsing', () => {
    const deepLink = attribute(render(), 'data-deeplink');
    const params = new URLSearchParams(deepLink.slice(deepLink.indexOf('?') + 1));

    expect(deepLink.startsWith('gridly://games/word-hunt/play?')).toBe(true);
    expect(params.get('mode')).toBe('custom');
    expect(params.get('invite')).toBe('C4F1VhCHJGdQ');
  });

  it('points the Android intent fallback at the canonical https url with a loop guard', () => {
    const intent = attribute(render(), 'data-intent');

    expect(intent.startsWith('intent://games/word-hunt/play?mode=custom&invite=C4F1VhCHJGdQ')).toBe(
      true,
    );
    expect(intent).toContain('package=com.gridlygames.app');
    expect(intent).toContain('action=android.intent.action.VIEW');
    expect(intent).toContain(
      `S.browser_fallback_url=${encodeURIComponent(`${CANONICAL}?fallback=1`)}`,
    );
  });

  it('matches the visible button href to the deep link by default', () => {
    const html = render();
    expect(html).toContain(`<a class="button" id="open-gridly" href="`);
    expect(openGridlyHref(html)).toBe(attribute(html, 'data-deeplink'));
  });

  it('points the visible button at the Android intent url when clientPlatform is android', () => {
    const html = render({ clientPlatform: 'android' });
    expect(openGridlyHref(html)).toBe(attribute(html, 'data-intent'));
  });

  it('auto-redirects by default and not in the fallback state', () => {
    expect(render()).toContain('data-autoredirect="1"');
    expect(render({ showFallbackState: true })).toContain('data-autoredirect="0"');
  });

  it('reveals the not-installed panel up front in the fallback state', () => {
    expect(render()).toContain('id="not-installed" hidden');
    expect(render({ showFallbackState: true })).toContain('id="not-installed">');
  });

  it('emits share preview metadata', () => {
    const html = render();
    expect(html).toContain('<meta property="og:title" content="Can you guess my Gridly word?" />');
    expect(html).toContain(`<meta property="og:url" content="${CANONICAL}" />`);
    expect(html).toContain('<meta property="og:site_name" content="Gridly" />');
  });

  it('omits og:image unless one is configured', () => {
    expect(render()).not.toContain('og:image');
    expect(render()).toContain('name="twitter:card" content="summary"');

    const withImage = render({ ogImageUrl: 'https://cdn.example.com/gridly.png' });
    expect(withImage).toContain(
      '<meta property="og:image" content="https://cdn.example.com/gridly.png" />',
    );
    expect(withImage).toContain('name="twitter:card" content="summary_large_image"');
  });

  it('only renders store buttons that are configured', () => {
    expect(render()).not.toContain('data-store=');

    const withStores = render({
      storeLinks: { ios: 'https://apps.apple.com/app/id1', android: null },
    });
    expect(withStores).toContain('data-store="ios"');
    expect(withStores).not.toContain('data-store="android"');
  });

  it('falls back to a generic title for other games', () => {
    expect(render({ gameId: 'grid-snap' })).toContain('Open this puzzle in Gridly');
  });
});

describe('buildFallbackUrl', () => {
  it('appends the guard param', () => {
    expect(buildFallbackUrl('https://a.test/i/1')).toBe('https://a.test/i/1?fallback=1');
  });

  it('preserves an existing query string', () => {
    expect(buildFallbackUrl('https://a.test/resolve-invite?id=1')).toBe(
      'https://a.test/resolve-invite?id=1&fallback=1',
    );
  });
});

describe('renderNotFoundPage', () => {
  it('renders a branded expired-link page', () => {
    const html = renderNotFoundPage();
    expect(html).toContain('Puzzle not found');
    expect(html).toContain('invalid or has expired');
    expect(html).not.toContain('gridly://');
  });
});
