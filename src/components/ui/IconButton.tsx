import { Pressable, StyleSheet, View } from 'react-native';

import { tap } from '@/lib/haptics';
import { useTheme } from '@/theme';

import { AppIcon, type IconSize } from './AppIcon';

export type IconButtonProps = {
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  iconSize?: IconSize;
  badge?: boolean;
  disabled?: boolean;
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color,
  iconSize = 24,
  badge = false,
  disabled = false,
}: IconButtonProps) {
  const { colors, componentHeights } = useTheme();
  const size = componentHeights.iconButton;

  function handlePress() {
    tap();
    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: pressed ? colors.surfaceHigh : 'transparent',
        },
        disabled ? styles.disabled : null,
      ]}
    >
      <AppIcon name={icon} size={iconSize} color={color ?? colors.textPrimary} />
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.brand, borderColor: colors.bg }]} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  disabled: {
    opacity: 0.4,
  },
});
