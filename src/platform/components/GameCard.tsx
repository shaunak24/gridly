import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../shared/theme/useTheme';
import type { GameDefinition } from '../gameRegistry';

interface GameCardProps {
  game: GameDefinition;
  onPress: () => void;
  badge?: string;
}

export function GameCard({ game, onPress, badge }: GameCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${game.title}. ${game.tagline}`}
    >
      <View style={styles.cardRow}>
        <game.Icon size={52} />
        <View style={styles.cardBody}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{game.title}</Text>
            {badge ? (
              <View style={[styles.badge, { backgroundColor: theme.coral }]}>
                <Text style={[styles.badgeText, { color: theme.textPrimary }]}>{badge}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>{game.tagline}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    minHeight: 88,
    justifyContent: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  pressed: { opacity: 0.88 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  tagline: {
    fontSize: 15,
    lineHeight: 20,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
