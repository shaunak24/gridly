import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

/**
 * Android hardware back follows app hierarchy. Uses stack pop when possible so the
 * transition matches forward navigation; falls back to replace when there is no history.
 */
export function useHardwareBack(parent: Href) {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace(parent);
        }
        return true;
      });
      return () => subscription.remove();
    }, [parent, router]),
  );
}
