import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@/lib/useReducedMotion';
import { tint, useTheme } from '@/theme';

export function clampProgress(value: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

export type ProgressBarTone = 'default' | 'onBlock';
export type ProgressBarStatus = 'ok' | 'near' | 'over';

export type ProgressBarProps = {
  value: number;
  color?: string;
  tone?: ProgressBarTone;
  status?: ProgressBarStatus;
  style?: ViewStyle;
};

export function ProgressBar({ value, color, tone = 'default', status, style }: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(clampProgress(value)));
  const clamped = clampProgress(value);
  const onBlock = tone === 'onBlock';

  const fillColor = onBlock
    ? colors.onBrand
    : status === 'near'
      ? tint(colors.expense, 0.65)
      : status === 'over'
        ? colors.expense
        : status === 'ok'
          ? colors.brand
          : (color ?? colors.brand);

  const trackColor = onBlock ? colors.blockTrack : colors.surfaceHigh;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(clamped);
      return;
    }
    Animated.timing(progress, {
      toValue: clamped,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [clamped, reduceMotion, progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { backgroundColor: trackColor, borderRadius: radii.pill }, style]}
    >
      <Animated.View
        testID="progress-fill"
        style={[styles.fill, { backgroundColor: fillColor, borderRadius: radii.pill, width }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
