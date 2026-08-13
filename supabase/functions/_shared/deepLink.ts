const ANDROID_PACKAGE = 'com.gridlygames.app';

export function buildAppDeepLink(gameId: string, inviteId: string): string {
  if (gameId === 'word-hunt') {
    return `gridly://games/word-hunt/play?mode=custom&invite=${encodeURIComponent(inviteId)}`;
  }

  return `gridly://games/${gameId}/play?invite=${encodeURIComponent(inviteId)}`;
}

export function buildAndroidIntentUrl(
  gameId: string,
  inviteId: string,
  browserFallbackUrl: string,
): string {
  const deepLink = buildAppDeepLink(gameId, inviteId);
  const pathAndQuery = deepLink.replace(/^gridly:(\/\/)?/i, '');
  const encodedFallback = encodeURIComponent(browserFallbackUrl);

  return (
    `intent://${pathAndQuery}#Intent;` +
    `scheme=gridly;` +
    `package=${ANDROID_PACKAGE};` +
    `action=android.intent.action.VIEW;` +
    `category=android.intent.category.BROWSABLE;` +
    `category=android.intent.category.DEFAULT;` +
    `S.browser_fallback_url=${encodedFallback};` +
    `end`
  );
}
