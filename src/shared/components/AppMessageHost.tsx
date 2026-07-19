import { GameModal } from './GameModal';
import { useAppMessageStore } from '../stores/appMessageStore';

export function AppMessageHost() {
  const message = useAppMessageStore((state) => state.message);
  const dismiss = useAppMessageStore((state) => state.dismiss);
  const confirm = useAppMessageStore((state) => state.confirm);
  const hasPrimaryAction = Boolean(message?.primaryLabel && message.onPrimary);

  return (
    <GameModal
      visible={message !== null}
      emoji={message?.emoji}
      title={message?.title ?? ''}
      message={message?.body ?? ''}
      primaryLabel={message?.primaryLabel}
      onPrimary={hasPrimaryAction ? confirm : undefined}
      secondaryLabel={hasPrimaryAction ? (message?.secondaryLabel ?? 'Cancel') : undefined}
      onSecondary={hasPrimaryAction ? dismiss : undefined}
      onDismiss={dismiss}
    />
  );
}
