// Browser landing page for HTTPS invite links.
//
// IMPORTANT: no dynamic value is ever interpolated into a `<script>` block. HTML
// entities are NOT decoded inside `<script>`, so an html-escaped URL placed there
// keeps a literal `&amp;` and silently loses every query param after the first —
// which is exactly how `?mode=custom&invite=…` used to arrive at the app as
// `mode=custom` + `amp;invite=…`. All URLs travel as `data-*` attributes (which
// browsers DO decode) and the inline script reads them with getAttribute().

import { buildAndroidIntentUrl, buildAppDeepLink } from './deepLink.ts';

// Mirrors src/shared/theme/colors.ts (dark palette).
const COLORS = {
  background: '#1E1B2E',
  card: '#2D2A40',
  border: '#3D3854',
  coral: '#F97316',
  teal: '#14B8A6',
  amber: '#F59E0B',
  tileEmpty: '#2D2A40',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
};

// Same 5x6 mark as src/shared/components/GridLogo.tsx.
const LOGO_HINTS: (string | null)[][] = [
  [null, null, COLORS.teal, null, null],
  [null, COLORS.amber, null, null, null],
  [null, null, COLORS.coral, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
];

export interface StoreLinks {
  ios?: string | null;
  android?: string | null;
}

export interface LandingPageOptions {
  inviteId: string;
  gameId: string;
  /** Canonical https URL for this invite, from _shared/inviteLink.ts. */
  canonicalUrl: string;
  /**
   * True when the browser bounced back here from a failed Android intent.
   * Suppresses the auto-redirect so we do not loop intent -> fallback -> intent.
   */
  showFallbackState?: boolean;
  ogImageUrl?: string | null;
  storeLinks?: StoreLinks;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function inviteTitle(gameId: string): string {
  return gameId === 'word-hunt' ? 'Can you guess my Gridly word?' : 'Open this puzzle in Gridly';
}

function inviteDescription(gameId: string): string {
  return gameId === 'word-hunt'
    ? 'Tap to play this Word Hunt puzzle in Gridly.'
    : 'Tap to play this puzzle in Gridly.';
}

/** Adds `fallback=1` to the canonical URL, preserving any existing query string. */
export function buildFallbackUrl(canonicalUrl: string): string {
  const separator = canonicalUrl.includes('?') ? '&' : '?';
  return `${canonicalUrl}${separator}fallback=1`;
}

function renderLogo(): string {
  const cell = 16;
  const gap = 4;
  const step = cell + gap;
  const rects = LOGO_HINTS.flatMap((row, rowIndex) =>
    row.map(
      (color, colIndex) =>
        `<rect x="${colIndex * step}" y="${rowIndex * step}" width="${cell}" height="${cell}" rx="4" fill="${color ?? COLORS.tileEmpty}" />`,
    ),
  ).join('');

  const width = 5 * step - gap;
  const height = 6 * step - gap;

  return `<svg class="logo" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Gridly">${rects}</svg>`;
}

function renderStyles(): string {
  return `
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: ${COLORS.background};
        color: ${COLORS.textPrimary};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 24px;
        -webkit-font-smoothing: antialiased;
      }
      main { width: 100%; max-width: 380px; text-align: center; }
      .logo { display: block; margin: 0 auto 16px; }
      .wordmark {
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.35em;
        text-indent: 0.35em;
        color: ${COLORS.textSecondary};
        margin: 0 0 20px;
      }
      h1 { font-size: 1.4rem; line-height: 1.3; margin: 0 0 10px; }
      p { color: ${COLORS.textSecondary}; line-height: 1.55; margin: 0 0 12px; font-size: 0.95rem; }
      .button {
        display: block;
        width: 100%;
        margin-top: 20px;
        padding: 0.9rem 1.25rem;
        border: 0;
        border-radius: 10px;
        background: ${COLORS.coral};
        color: ${COLORS.background};
        font-size: 1rem;
        font-weight: 700;
        font-family: inherit;
        text-decoration: none;
        cursor: pointer;
      }
      .button.secondary {
        background: transparent;
        color: ${COLORS.textPrimary};
        border: 1px solid ${COLORS.border};
        margin-top: 10px;
      }
      .panel {
        margin-top: 24px;
        padding: 16px;
        border: 1px solid ${COLORS.border};
        border-radius: 12px;
        background: ${COLORS.card};
      }
      .panel h2 { font-size: 1rem; margin: 0 0 8px; }
      .panel p { margin: 0; font-size: 0.9rem; }
      .link-box {
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: 8px;
        background: ${COLORS.background};
        border: 1px solid ${COLORS.border};
        color: ${COLORS.textSecondary};
        font-size: 0.78rem;
        word-break: break-all;
        user-select: all;
      }
      [hidden] { display: none !important; }`;
}

function renderShell(options: {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImageUrl?: string | null;
  bodyAttributes?: string;
  body: string;
  script?: string;
}): string {
  const { title, description, canonicalUrl, ogImageUrl, bodyAttributes, body, script } = options;
  const meta = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Gridly" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    canonicalUrl ? `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />` : '',
    // Only emit og:image when one is actually configured — an image tag that 404s
    // makes chat previews worse than no image at all.
    ogImageUrl ? `<meta property="og:image" content="${escapeHtml(ogImageUrl)}" />` : '',
    `<meta name="twitter:card" content="${ogImageUrl ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    ogImageUrl ? `<meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="${COLORS.background}" />
    <meta name="description" content="${escapeHtml(description)}" />
    ${meta}
    <title>${escapeHtml(title)} · Gridly</title>
    <style>${renderStyles()}
    </style>
  </head>
  <body${bodyAttributes ? ` ${bodyAttributes}` : ''}>
${body}
${script ?? ''}
  </body>
</html>`;
}

export function renderLandingPage(options: LandingPageOptions): string {
  const { inviteId, gameId, canonicalUrl, showFallbackState = false, ogImageUrl, storeLinks } =
    options;

  const deepLink = buildAppDeepLink(gameId, inviteId);
  const intentUrl = buildAndroidIntentUrl(gameId, inviteId, buildFallbackUrl(canonicalUrl));
  const title = inviteTitle(gameId);
  const description = inviteDescription(gameId);

  const storeButtons = [
    storeLinks?.ios
      ? `<a class="button secondary" data-store="ios" href="${escapeHtml(storeLinks.ios)}" hidden>Get Gridly for iPhone</a>`
      : '',
    storeLinks?.android
      ? `<a class="button secondary" data-store="android" href="${escapeHtml(storeLinks.android)}" hidden>Get Gridly for Android</a>`
      : '',
  ]
    .filter(Boolean)
    .join('\n        ');

  const body = `    <main
      id="invite"
      data-deeplink="${escapeHtml(deepLink)}"
      data-intent="${escapeHtml(intentUrl)}"
      data-canonical="${escapeHtml(canonicalUrl)}"
      data-autoredirect="${showFallbackState ? '0' : '1'}"
    >
      ${renderLogo()}
      <p class="wordmark">GRIDLY</p>
      <h1>${escapeHtml(title)}</h1>
      <p id="status">${showFallbackState ? escapeHtml('Gridly did not open on this device.') : escapeHtml('Opening Gridly…')}</p>

      <a class="button" id="open-gridly" href="${escapeHtml(deepLink)}">Open in Gridly</a>

      <div class="panel" id="not-installed"${showFallbackState ? '' : ' hidden'}>
        <h2>Don't have Gridly yet?</h2>
        <p>Install Gridly on this device, then tap the link again to play this puzzle.</p>
        ${storeButtons}
        <button class="button secondary" id="copy-link" type="button">Copy puzzle link</button>
        <div class="link-box" id="link-text">${escapeHtml(canonicalUrl)}</div>
      </div>

      <div class="panel" id="in-app-browser" hidden>
        <h2>Open this in your browser</h2>
        <p>This chat app can't hand the link to Gridly. Tap the menu (⋯) and choose <strong>Open in browser</strong>, or copy the link below.</p>
        <button class="button secondary" id="copy-link-webview" type="button">Copy puzzle link</button>
        <div class="link-box">${escapeHtml(canonicalUrl)}</div>
      </div>
    </main>`;

  // Static script: reads every dynamic value from data-* attributes above.
  const script = `    <script>
      (function () {
        var root = document.getElementById('invite');
        var button = document.getElementById('open-gridly');
        var status = document.getElementById('status');
        var notInstalled = document.getElementById('not-installed');
        var inAppBrowser = document.getElementById('in-app-browser');
        var ua = navigator.userAgent || '';
        var isAndroid = /Android/i.test(ua);
        var isIos = /iPad|iPhone|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
        // WebViews that swallow custom schemes and Android intent URLs outright.
        var isBlockedWebView = /FBAN|FBAV|FB_IAB|Instagram|Line\\/|MicroMessenger|Snapchat/i.test(ua);
        var target = (isAndroid ? root.getAttribute('data-intent') : root.getAttribute('data-deeplink')) || '';

        button.setAttribute('href', target);

        Array.prototype.forEach.call(document.querySelectorAll('[data-store]'), function (el) {
          var platform = el.getAttribute('data-store');
          if ((platform === 'ios' && isIos) || (platform === 'android' && isAndroid)) {
            el.removeAttribute('hidden');
          }
        });

        function copyLink() {
          var url = root.getAttribute('data-canonical') || '';
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
              status.textContent = 'Link copied.';
            }, function () {});
            return;
          }
          var node = document.getElementById('link-text');
          if (node && window.getSelection && document.createRange) {
            var range = document.createRange();
            range.selectNodeContents(node);
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }

        Array.prototype.forEach.call(
          [document.getElementById('copy-link'), document.getElementById('copy-link-webview')],
          function (el) {
            if (el) {
              el.addEventListener('click', copyLink);
            }
          }
        );

        if (isBlockedWebView) {
          status.textContent = 'Open this link in your browser to play.';
          notInstalled.setAttribute('hidden', '');
          inAppBrowser.removeAttribute('hidden');
          return;
        }

        function revealNotInstalled() {
          if (document.hidden) {
            return;
          }
          status.textContent = 'Gridly did not open on this device.';
          notInstalled.removeAttribute('hidden');
        }

        if (root.getAttribute('data-autoredirect') !== '1') {
          return;
        }

        var timer = setTimeout(revealNotInstalled, 1600);
        function cancel() {
          clearTimeout(timer);
        }
        // The app took over: the page is backgrounded or unloaded. Deliberately not
        // listening to 'blur' — iOS fires it for the "Open in Gridly?" confirm dialog,
        // so a cancelled dialog would leave the user with no explanation.
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) {
            cancel();
          }
        });
        window.addEventListener('pagehide', cancel);

        window.location.href = target;
      })();
    </script>`;

  return renderShell({
    title,
    description,
    canonicalUrl,
    ogImageUrl,
    body,
    script,
  });
}

export function renderNotFoundPage(): string {
  const title = 'Puzzle not found';
  const description = 'This Gridly invite link is invalid or has expired.';

  const body = `    <main>
      ${renderLogo()}
      <p class="wordmark">GRIDLY</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml('This invite link is invalid or has expired. Ask your friend to share a new one.')}</p>
    </main>`;

  return renderShell({ title, description, body });
}
