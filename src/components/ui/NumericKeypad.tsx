import { Pressable, StyleSheet, View } from 'react-native';

import { es } from '@/i18n/es';
import { select } from '@/lib/haptics';
import { useTheme } from '@/theme';

import { AppIcon } from './AppIcon';
import { Text } from './Text';

const ROWS: (string | 'backspace')[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['000', '0', 'backspace'],
];

export type NumericKeypadProps = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
};

export function NumericKeypad({
  onDigit,
  onBackspace,
  onClear,
  disabled = false,
}: NumericKeypadProps) {
  const { colors, radii, componentHeights, spacing } = useTheme();
  const keyHeight = componentHeights.button;

  function handleKey(value: string) {
    if (disabled) {
      return;
    }

    select();

    if (value === 'backspace') {
      onBackspace();
      return;
    }

    onDigit(value);
  }

  function handleBackspaceLongPress() {
    if (disabled) {
      return;
    }

    select();
    onClear();
  }

  return (
    <View style={[styles.grid, { gap: spacing.sm }]}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: spacing.sm }]}>
          {row.map((value) => {
            const isBackspace = value === 'backspace';
            const accessibilityLabel = isBackspace ? es.keypad.backspace : value;

            return (
              <Pressable
                key={value}
                onPress={() => handleKey(value)}
                onLongPress={isBackspace ? handleBackspaceLongPress : undefined}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                accessibilityHint={isBackspace ? es.keypad.backspaceHint : undefined}
                accessibilityState={{ disabled }}
                style={({ pressed }) => [
                  styles.key,
                  {
                    height: keyHeight,
                    borderRadius: radii.md,
                    backgroundColor: pressed ? colors.surfaceHigh : colors.surfaceRaised,
                  },
                  disabled ? styles.disabled : null,
                ]}
              >
                {isBackspace ? (
                  <AppIcon name="backspace-outline" size={24} color={colors.textPrimary} />
                ) : (
                  <Text variant="subtitle">{value}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  key: {
    flex: 1,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
