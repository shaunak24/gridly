import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

/**
 * Android hardware back follows app hierarchy (parent screen), not browser-style
 * history. Using router.back() stacks poorly when play screens are opened repeatedly
 * (e.g. campaign next level, practice play again).
 */
export function useHardwareBack(parent: Href) {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        router.replace(parent);
        return true;
      });
      return () => subscription.remove();
    }, [parent, router]),
  );
}
