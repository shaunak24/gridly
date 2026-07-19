import { GameModal } from './GameModal';
import { useAppMessageStore } from '../stores/appMessageStore';

export function AppMessageHost() {
  const message = useAppMessageStore((state) => state.message);
  const dismiss = useAppMessageStore((state) => state.dismiss);

  return (
    <GameModal
      visible={message !== null}
      emoji={message?.emoji}
      title={message?.title ?? ''}
      message={message?.body ?? ''}
      onDismiss={dismiss}
    />
  );
}
