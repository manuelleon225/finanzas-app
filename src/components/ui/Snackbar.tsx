import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type SnackbarProps = {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
};

export function Snackbar({
  message,
  onDismiss,
  durationMs = 3500,
  actionLabel,
  onAction,
}: SnackbarProps) {
  const { colors, radii, spacing } = useTheme();

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, onDismiss, durationMs]);

  if (!message) {
    return null;
  }

  return (
    <View
      style={[
        styles.snackbar,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          gap: spacing.sm,
        },
      ]}
    >
      <Text variant="caption" style={{ flex: 1 }}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text variant="caption" color={colors.primary}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 1100,
    elevation: 1100,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
