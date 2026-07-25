import type { Router } from 'expo-router';

/** Reset navigation so home is the only screen (avoids back → welcome loading trap). */
export function navigateToHome(router: Router): void {
  if (typeof router.canDismiss === 'function' && router.canDismiss()) {
    router.dismissAll();
  }
  router.replace('/home');
}
