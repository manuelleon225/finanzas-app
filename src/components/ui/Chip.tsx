import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  tone?: 'brand' | 'extra';
  style?: ViewStyle;
};

export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  tone = 'brand',
  style,
}: ChipProps) {
  const { colors, radii, spacing, componentHeights } = useTheme();

  const selectedBg = tone === 'extra' ? colors.extraSoft : colors.brandSoft;
  const selectedText = tone === 'extra' ? colors.extra : colors.brand;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      hitSlop={Math.max(0, Math.floor((44 - componentHeights.chip) / 2))}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? selectedBg : colors.surfaceRaised,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
          height: componentHeights.chip,
        },
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Text variant="caption" color={selected ? selectedText : colors.textPrimary}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
