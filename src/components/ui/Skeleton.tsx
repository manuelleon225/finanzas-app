import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  type DimensionValue,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

export type SkeletonVariant = 'line' | 'circle' | 'card';
export type SkeletonTone = 'default' | 'onBlock';

export type SkeletonProps = {
  variant?: SkeletonVariant;
  tone?: SkeletonTone;
  width?: DimensionValue;
  height?: number;
  style?: ViewStyle;
};

export function Skeleton({
  variant = 'line',
  tone = 'default',
  width = '100%',
  height,
  style,
}: SkeletonProps) {
  const { colors, radii } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [opacity] = useState(() => new Animated.Value(0.5));

  const isCircle = variant === 'circle';
  const resolvedHeight = height ?? (isCircle ? 40 : variant === 'card' ? 96 : 12);
  const baseColor = tone === 'onBlock' ? colors.blockTrack : colors.surfaceRaised;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, opacity]);

  const shape: ViewStyle = isCircle
    ? { width: resolvedHeight, height: resolvedHeight, borderRadius: resolvedHeight / 2 }
    : { width, height: resolvedHeight, borderRadius: variant === 'line' ? radii.pill : radii.lg };

  return (
    <Animated.View style={[styles.base, { backgroundColor: baseColor, opacity }, shape, style]} />
  );
}

const styles = StyleSheet.create({
  base: {},
});
