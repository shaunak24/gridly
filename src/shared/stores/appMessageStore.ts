import { create } from 'zustand';

export type AppMessage = {
  title: string;
  body: string;
  emoji?: string;
  onDismiss?: () => void;
};

interface AppMessageState {
  message: AppMessage | null;
  show: (message: AppMessage) => void;
  dismiss: () => void;
}

export const useAppMessageStore = create<AppMessageState>((set, get) => ({
  message: null,
  show: (message) => set({ message }),
  dismiss: () => {
    const onDismiss = get().message?.onDismiss;
    set({ message: null });
    onDismiss?.();
  },
}));
