import { useCallback, useEffect, useState } from 'react';

import { IS_TEST_MODE, TEST_IMAGE_SENTINEL } from '../../games/grid-snap/core/testMode';

export function isGridSnapTestImageUri(uri: string): boolean {
  return IS_TEST_MODE && uri === TEST_IMAGE_SENTINEL;
}

/**
 * Tracks when a remote image URI is safe to show in tile views.
 * Uses onLoad from a hidden Image — Image.prefetch often fails on RN while onLoad succeeds.
 */
export function useImageReady(uri: string | null | undefined): {
  ready: boolean;
  onLoad: () => void;
  onError: () => void;
  skipPreload: boolean;
} {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!uri) {
      setReady(false);
      return;
    }

    if (isGridSnapTestImageUri(uri)) {
      setReady(true);
      return;
    }

    setReady(false);
  }, [uri]);

  const onLoad = useCallback(() => {
    setReady(true);
  }, []);

  const onError = useCallback(() => {
    setReady(false);
  }, []);

  const skipPreload = Boolean(uri && isGridSnapTestImageUri(uri));

  return { ready, onLoad, onError, skipPreload };
}
