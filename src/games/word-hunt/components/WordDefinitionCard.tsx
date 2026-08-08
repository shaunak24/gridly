import { StyleSheet, Text, View } from 'react-native';

import type { WordDefinition } from '../services/wordDefinition';
import { useTheme } from '../../../shared/theme/useTheme';

interface WordDefinitionCardProps {
  word: string;
  definition: WordDefinition;
  variant?: 'bar' | 'modal';
}

export function WordDefinitionCard({ word, definition, variant = 'bar' }: WordDefinitionCardProps) {
  const theme = useTheme();
  const letters = word.toUpperCase().split('');
  const isModal = variant === 'modal';

  return (
    <View
      style={[
        styles.card,
        isModal ? styles.cardModal : styles.cardBar,
        { backgroundColor: theme.tileEmpty, borderColor: theme.border },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Definition of ${word}`}
    >
      <View style={[styles.accent, { backgroundColor: theme.teal }]} />

      <View style={styles.inner}>
        <View style={styles.wordRow}>
          {letters.map((letter, index) => (
            <View
              key={`${letter}-${index}`}
              style={[
                styles.letterCell,
                isModal ? styles.letterCellModal : styles.letterCellBar,
                { borderColor: theme.border, backgroundColor: theme.card },
              ]}
            >
              <Text style={[styles.letterText, { color: theme.textPrimary }]}>{letter}</Text>
            </View>
          ))}
        </View>

        {definition.partOfSpeech ? (
          <View style={[styles.posPill, { backgroundColor: theme.coral }]}>
            <Text style={[styles.posText, { color: theme.textPrimary }]}>
              {definition.partOfSpeech}
            </Text>
          </View>
        ) : null}

        <Text style={[styles.definition, { color: theme.textSecondary }]}>
          <Text style={[styles.openQuote, { color: theme.teal }]}>“</Text>
          {definition.text}
          <Text style={[styles.closeQuote, { color: theme.teal }]}>”</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  cardBar: {
    marginTop: 4,
  },
  cardModal: {
    marginTop: 4,
    width: '100%',
  },
  accent: {
    width: 4,
  },
  inner: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    alignItems: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  letterCell: {
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterCellBar: {
    width: 28,
    height: 32,
  },
  letterCellModal: {
    width: 32,
    height: 36,
  },
  letterText: {
    fontSize: 16,
    fontWeight: '800',
  },
  posPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  posText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  definition: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  openQuote: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  closeQuote: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
});
