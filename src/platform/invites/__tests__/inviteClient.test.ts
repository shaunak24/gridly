import {
  detectClientPlatform,
  isLinkPreviewCrawler,
} from '../../../../supabase/functions/_shared/inviteClient';

const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const WHATSAPP_WEBVIEW = `${ANDROID_CHROME} [FB_IAB/FB4A;FBAV/400.0.0.0.0;]`;
const WHATSAPP_PREVIEW = 'WhatsApp/2.23.20.0';

describe('inviteClient', () => {
  it('detects Android and iOS', () => {
    expect(detectClientPlatform(ANDROID_CHROME)).toBe('android');
    expect(detectClientPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe(
      'ios',
    );
    expect(detectClientPlatform('Mozilla/5.0 (Windows NT 10.0)')).toBe('unknown');
  });

  it('treats WhatsApp in-app WebView as a phone browser, not a preview crawler', () => {
    expect(isLinkPreviewCrawler(WHATSAPP_WEBVIEW)).toBe(false);
    expect(detectClientPlatform(WHATSAPP_WEBVIEW)).toBe('android');
  });

  it('treats WhatsApp preview fetcher as a crawler', () => {
    expect(isLinkPreviewCrawler(WHATSAPP_PREVIEW)).toBe(true);
  });
});
