import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type SnackbarProps = {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
};

export function Snackbar({ message, onDismiss, durationMs = 3500 }: SnackbarProps) {
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
    <Text
      variant="caption"
      accessibilityLiveRegion="polite"
      style={[
        styles.snackbar,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          color: colors.textPrimary,
        },
      ]}
    >
      {message}
    </Text>
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
    textAlign: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
