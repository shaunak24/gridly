/**
 * @jest-environment jsdom
 */
// Executes the landing page's inline script in a real DOM. The v4.2 bug lived in the
// gap between "the HTML looks right" and "the browser navigates to the right URL",
// so the assertion that matters is the value handed to window.location.
import { renderLandingPage } from '../../../../supabase/functions/_shared/landingPage';

const CANONICAL = 'https://example.supabase.co/functions/v1/resolve-invite/C4F1VhCHJGdQ';
const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const INSTAGRAM_UA = `${ANDROID_UA} Instagram 300.0.0.0.0`;

function loadPage(
  userAgent: string,
  options: Partial<Parameters<typeof renderLandingPage>[0]> = {},
): { navigatedTo: string | null } {
  const html = renderLandingPage({
    inviteId: 'C4F1VhCHJGdQ',
    gameId: 'word-hunt',
    canonicalUrl: CANONICAL,
    ...options,
  });

  Object.defineProperty(window.navigator, 'userAgent', { value: userAgent, configurable: true });

  let navigatedTo: string | null = null;
  delete (window as unknown as Record<string, unknown>).location;
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      set href(value: string) {
        navigatedTo = value;
      },
      get href() {
        return navigatedTo ?? '';
      },
    },
  });

  const body = html.slice(html.indexOf('<body>') + '<body>'.length, html.indexOf('</body>'));
  document.body.innerHTML = body.replace(/<script[\s\S]*?<\/script>/g, '');

  const source = /<script>([\s\S]*?)<\/script>/.exec(body)?.[1] ?? '';
  // eslint-disable-next-line no-new-func
  new Function(source)();

  return { navigatedTo };
}

describe('landing page script', () => {
  it('navigates iOS to a deep link that still carries the invite id', () => {
    const { navigatedTo } = loadPage(IOS_UA);

    expect(navigatedTo).not.toBeNull();
    expect(navigatedTo).not.toContain('&amp;');

    const url = navigatedTo as unknown as string;
    const params = new URLSearchParams(url.slice(url.indexOf('?') + 1));
    expect(params.get('mode')).toBe('custom');
    expect(params.get('invite')).toBe('C4F1VhCHJGdQ');
  });

  it('navigates Android to the intent url with an https fallback', () => {
    const { navigatedTo } = loadPage(ANDROID_UA);
    const url = navigatedTo as unknown as string;

    expect(url.startsWith('intent://games/word-hunt/play?mode=custom&invite=C4F1VhCHJGdQ')).toBe(
      true,
    );
    expect(url).toContain(
      `S.browser_fallback_url=${encodeURIComponent(`${CANONICAL}?fallback=1`)}`,
    );
  });

  it('points the visible button at the platform-appropriate target', () => {
    loadPage(ANDROID_UA);
    expect(document.getElementById('open-gridly')?.getAttribute('href')).toContain('intent://');

    loadPage(IOS_UA);
    expect(document.getElementById('open-gridly')?.getAttribute('href')).toContain('gridly://');
  });

  it('does not redirect in the fallback state, and shows the not-installed panel', () => {
    const { navigatedTo } = loadPage(ANDROID_UA, { showFallbackState: true });

    expect(navigatedTo).toBeNull();
    expect(document.getElementById('not-installed')?.hasAttribute('hidden')).toBe(false);
  });

  it('does not redirect inside a blocked in-app browser', () => {
    const { navigatedTo } = loadPage(INSTAGRAM_UA);

    expect(navigatedTo).toBeNull();
    expect(document.getElementById('in-app-browser')?.hasAttribute('hidden')).toBe(false);
    expect(document.getElementById('not-installed')?.hasAttribute('hidden')).toBe(true);
  });

  it('reveals the not-installed panel when the app never takes over', () => {
    jest.useFakeTimers();
    try {
      loadPage(IOS_UA);
      expect(document.getElementById('not-installed')?.hasAttribute('hidden')).toBe(true);

      jest.advanceTimersByTime(2000);
      expect(document.getElementById('not-installed')?.hasAttribute('hidden')).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps the panel hidden when the page is backgrounded by the app opening', () => {
    jest.useFakeTimers();
    try {
      loadPage(IOS_UA);
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      jest.advanceTimersByTime(2000);
      expect(document.getElementById('not-installed')?.hasAttribute('hidden')).toBe(true);
    } finally {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      jest.useRealTimers();
    }
  });

  it('only shows the store button for the current platform', () => {
    const storeLinks = {
      ios: 'https://apps.apple.com/app/id1',
      android: 'https://play.google.com/store/apps/details?id=com.gridly.app',
    };

    loadPage(ANDROID_UA, { showFallbackState: true, storeLinks });
    expect(document.querySelector('[data-store="android"]')?.hasAttribute('hidden')).toBe(false);
    expect(document.querySelector('[data-store="ios"]')?.hasAttribute('hidden')).toBe(true);
  });
});
