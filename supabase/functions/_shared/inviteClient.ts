export type InviteClientPlatform = 'android' | 'ios' | 'unknown';

export function detectClientPlatform(userAgent: string): InviteClientPlatform {
  if (/Android/i.test(userAgent)) {
    return 'android';
  }
  if (
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && /Mobile/i.test(userAgent))
  ) {
    return 'ios';
  }
  return 'unknown';
}

/** Chat and social crawlers need HTML with Open Graph tags, not an app redirect. */
export function isLinkPreviewCrawler(userAgent: string): boolean {
  if (
    /facebookexternalhit|Facebot|Twitterbot|Slackbot|LinkedInBot|Discordbot|TelegramBot|vkShare|Pinterest|Googlebot|bingbot/i.test(
      userAgent,
    )
  ) {
    return true;
  }

  // WhatsApp's link-preview fetcher, not the in-app WebView (which includes Chrome / wv).
  if (/WhatsApp/i.test(userAgent) && !/Chrome\/|wv\)|Version\/\d+\.\d+ Chrome/i.test(userAgent)) {
    return true;
  }

  return false;
}
