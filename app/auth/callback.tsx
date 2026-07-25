import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { getCurrentSession } from '../../src/platform/auth/authService';
import { useAuthStore } from '../../src/platform/auth/authStore';
import { presentAuthMessage } from '../../src/platform/auth/presentAuthMessage';
import { LaunchLoading } from '../../src/shared/components/LaunchLoading';

async function waitForAuthIdle(timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (!useAuthStore.getState().busy) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const url = Linking.useURL();
  const handleAuthCallback = useAuthStore((state) => state.handleAuthCallback);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) {
      return;
    }

    void (async () => {
      await waitForAuthIdle(5000);

      if (useAuthStore.getState().user) {
        handled.current = true;
        router.replace('/home');
        return;
      }

      const callbackUrl = url ?? (await Linking.getInitialURL());
      if (!callbackUrl?.includes('auth/callback')) {
        const session = await getCurrentSession();
        handled.current = true;
        router.replace(session ? '/home' : '/');
        return;
      }

      handled.current = true;
      const message = await handleAuthCallback(callbackUrl);
      if (message) {
        const session = await getCurrentSession();
        if (session) {
          router.replace('/home');
          return;
        }

        presentAuthMessage(message);
        router.replace('/auth/sign-in');
        return;
      }

      router.replace('/home');
    })();
  }, [handleAuthCallback, router, url]);

  return <LaunchLoading />;
}
