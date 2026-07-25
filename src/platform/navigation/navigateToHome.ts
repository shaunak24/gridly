import type { Router } from 'expo-router';

/** Reset navigation so home is the only screen (avoids back → welcome loading trap). */
export function navigateToHome(router: Router): void {
  if (typeof router.dismissAll === 'function') {
    router.dismissAll();
  }
  router.replace('/home');
}
