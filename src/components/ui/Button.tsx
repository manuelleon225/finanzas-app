import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { tint, useTheme } from '@/theme';

import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export type ButtonProps = {
  title: string;
  onPress?: PressableProps['onPress'];
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: ButtonProps) {
  const { colors, radii, componentHeights, spacing } = useTheme();
  const isDisabled = disabled || loading;

  let backgroundColor = colors.brand;
  let textColor = colors.onBrand;
  let pressedBackground = tint(colors.brand, 0.85);

  if (variant === 'secondary') {
    backgroundColor = colors.surfaceRaised;
    textColor = colors.textPrimary;
    pressedBackground = colors.surfaceHigh;
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    textColor = colors.brand;
    pressedBackground = colors.surfaceHigh;
  } else if (variant === 'destructive') {
    backgroundColor = colors.danger;
    textColor = colors.onBrand;
    pressedBackground = tint(colors.danger, 0.85);
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderRadius: radii.button,
          height: componentHeights.button,
          paddingHorizontal: spacing.lg,
        },
        pressed && !isDisabled ? { backgroundColor: pressedBackground } : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text variant="bodyStrong" color={textColor}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.4,
  },
});
