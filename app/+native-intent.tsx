/**
 * Normalizes system deep links before Expo Router maps them to routes.
 * @see https://docs.expo.dev/router/advanced/native-intent/
 */
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  if (!path) {
    return path;
  }

  try {
    // Legacy v4.2 landing pages HTML-escaped query strings inside <script>.
    if (path.includes('amp;invite=')) {
      return path.replaceAll('amp;invite=', 'invite=').replaceAll('&amp;', '&');
    }

    return path;
  } catch {
    return path;
  }
}
