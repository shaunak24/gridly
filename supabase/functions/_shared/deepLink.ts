export function buildAppDeepLink(gameId: string, inviteId: string): string {
  if (gameId === 'word-hunt') {
    return `gridly://games/word-hunt/play?mode=custom&invite=${encodeURIComponent(inviteId)}`;
  }

  return `gridly://games/${gameId}/play?invite=${encodeURIComponent(inviteId)}`;
}
