import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '@/lib/useReducedMotion';
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
  durationMs = 4000,
  actionLabel,
  onAction,
}: SnackbarProps) {
  const { colors, radii, spacing } = useTheme();
  const [visible, setVisible] = useState(!!message);
  const reduceMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(message ? 1 : 0));
  const [translateY] = useState(() => new Animated.Value(message ? 0 : 16));

  useEffect(() => {
    if (message) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      if (reduceMotion) {
        opacity.setValue(1);
        translateY.setValue(0);
      } else {
        opacity.setValue(0);
        translateY.setValue(16);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]).start();
      }
      const timer = setTimeout(onDismiss, durationMs);
      return () => clearTimeout(timer);
    }

    if (visible) {
      if (reduceMotion) {
        setVisible(false);
        opacity.setValue(0);
        translateY.setValue(16);
      } else {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 16, duration: 150, useNativeDriver: true }),
        ]).start(() => setVisible(false));
      }
    }
    return undefined;
  }, [message, reduceMotion, durationMs, onDismiss, visible, opacity, translateY]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.snackbar,
        {
          backgroundColor: colors.surfaceHigh,
          borderRadius: radii.md,
          padding: spacing.md,
          gap: spacing.sm,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text variant="caption" color={colors.textPrimary} style={{ flex: 1 }}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text variant="caption" color={colors.brand}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 1100,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
