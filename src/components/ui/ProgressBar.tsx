import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

export function clampProgress(value: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

export type ProgressBarProps = {
  value: number;
  color?: string;
  style?: ViewStyle;
};

export function ProgressBar({ value, color, style }: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [progress] = useState(() => new Animated.Value(clampProgress(value)));
  const clamped = clampProgress(value);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

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
      style={[
        styles.track,
        { backgroundColor: colors.surfaceRaised, borderRadius: radii.pill },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color ?? colors.brand, borderRadius: radii.pill, width },
        ]}
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
