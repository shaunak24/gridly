import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Haptics are a nice-to-have: web has no support and a device can refuse, so every
 * call is best-effort and never allowed to interrupt gameplay.
 */
const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

function safely(run: () => Promise<unknown>): void {
  if (!enabled) {
    return;
  }
  try {
    void run().catch(() => {});
  } catch {
    // ignore — feedback is optional
  }
}

/** Light tick for picking something up, e.g. grabbing a dot. */
export function selection(): void {
  safely(() => Haptics.selectionAsync());
}

/** Small thump for a meaningful step, e.g. a pair connecting. */
export function impactLight(): void {
  safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Celebration for solving a puzzle. */
export function success(): void {
  safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
