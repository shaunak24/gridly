import type { AppMessage } from '../stores/appMessageStore';
import { useAppMessageStore } from '../stores/appMessageStore';

export type { AppMessage };

export function presentAppMessage(message: AppMessage): void {
  useAppMessageStore.getState().show(message);
}
