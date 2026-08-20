import { useEffect } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { TestModeSolvedGridPreview } from './TestModeSolvedGridPreview';
import { IMAGE_PEEK_DURATION_MS } from '../core/peekHint';
import { useTheme } from '../../../shared/theme/useTheme';

interface TestGridSize {
  rows: number;
  cols: number;
}

interface ImagePeekOverlayProps {
  visible: boolean;
  imageUrl?: string | null;
  testGrid?: TestGridSize;
  onDismiss: () => void;
  durationMs?: number;
}

export function ImagePeekOverlay({
  visible,
  imageUrl,
  testGrid,
  onDismiss,
  durationMs = IMAGE_PEEK_DURATION_MS,
}: ImagePeekOverlayProps) {
  const theme = useTheme();
  const isTestPreview = Boolean(testGrid);
  const subtitle = isTestPreview
    ? 'Study the solved layout — tiles read 1, 2, 3… left to right'
    : 'Study the full picture — it closes in a few seconds';

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [visible, durationMs, onDismiss]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss} accessibilityRole="button">
        <Pressable style={styles.content} onPress={(event) => event.stopPropagation()}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Peek image</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          <View style={[styles.imageFrame, { borderColor: theme.border, backgroundColor: theme.card }]}>
            {testGrid ? (
              <TestModeSolvedGridPreview rows={testGrid.rows} cols={testGrid.cols} />
            ) : imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
            ) : null}
          </View>
          <Pressable
            style={[styles.dismissButton, { backgroundColor: theme.coral }]}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Close peek image"
          >
            <Text style={[styles.dismissText, { color: theme.textPrimary }]}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dismissButton: {
    marginTop: 4,
    minHeight: 44,
    minWidth: 120,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
