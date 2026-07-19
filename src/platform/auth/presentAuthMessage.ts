import type { AuthUserMessage } from './authMessages';
import { presentAppMessage } from '../../shared/components/presentAppMessage';

export function presentAuthMessage(message: AuthUserMessage, onDismiss?: () => void): void {
  presentAppMessage({
    title: message.title,
    body: message.body,
    emoji: message.tone === 'error' ? '⚠️' : 'ℹ️',
    onDismiss,
  });
}
