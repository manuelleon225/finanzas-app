import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { formatCOP } from '@/lib/money';
import { useTheme } from '@/theme';

import { Text, type TextProps, type TextVariant } from './Text';

export type AnimatedNumberProps = {
  value: number;
  variant?: TextVariant;
  color?: string;
  durationMs?: number;
  accessibilityLabel?: string;
  style?: TextProps['style'];
};

export function AnimatedNumber({
  value,
  variant = 'display',
  color,
  durationMs = 450,
  accessibilityLabel,
  style,
}: AnimatedNumberProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const animatedValue = useSharedValue(value);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (reduceMotion) {
      animatedValue.value = value;
      return;
    }

    animatedValue.value = withTiming(value, {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, reduceMotion, durationMs, animatedValue]);

  useAnimatedReaction(
    () => Math.round(animatedValue.value),
    (current, previous) => {
      if (previous !== null && current !== previous) {
        runOnJS(setDisplayValue)(current);
      }
    },
  );

  const formatted = formatCOP(displayValue);

  return (
    <Text
      variant={variant}
      color={color ?? colors.textPrimary}
      accessibilityLabel={accessibilityLabel ?? formatted}
      style={[styles.tabular, style]}
    >
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
