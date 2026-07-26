import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface ModePickerProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function ModePicker<T extends string>({ options, value, onChange }: ModePickerProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: theme.keyDefault, borderColor: theme.border }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              selected
                ? { backgroundColor: theme.coral, borderColor: theme.coral }
                : { borderColor: 'transparent' },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: selected ? theme.textPrimary : theme.textSecondary,
                  fontWeight: selected ? '700' : '600',
                },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  chip: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
});
