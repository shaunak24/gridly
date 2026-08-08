import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/** Persist in-progress game state when leaving the play screen (timer pause). */
export function useFlushGameSessionOnBlur(flush: () => void | Promise<void>) {
  useFocusEffect(
    useCallback(() => {
      return () => {
        void flush();
      };
    }, [flush]),
  );
}
