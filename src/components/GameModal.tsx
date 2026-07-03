import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface GameModalProps {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  onDismiss: () => void;
}

export function GameModal({
  visible,
  title,
  message,
  primaryLabel,
  onPrimary,
  onDismiss,
}: GameModalProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Pressable
            style={[styles.closeButton, { backgroundColor: theme.keyDefault }]}
            onPress={onDismiss}
          >
            <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.coral }]}
            onPress={onPrimary}
          >
            <Text style={[styles.primaryText, { color: theme.textPrimary }]}>{primaryLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 12,
    padding: 24,
    paddingTop: 40,
    gap: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 16, textAlign: 'center' },
  primaryButton: {
    borderRadius: 8,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryText: { fontSize: 16, fontWeight: '700' },
});
