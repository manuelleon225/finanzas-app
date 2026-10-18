import { useEffect, useState } from 'react';
import { Animated, Pressable, type PressableProps, View } from 'react-native';

import { useTheme } from '@/theme';

export type PressableScaleProps = PressableProps & {
  scaleTo?: number;
};

export function PressableScale({ scaleTo = 0.97, style, children, ...rest }: PressableScaleProps) {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let mounted = true;
    // Lazy import to avoid bundling issues; use global AccessibilityInfo via react-native
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.isReduceMotionEnabled().then((value: boolean) => {
      if (mounted) {
        setReduceMotion(value);
      }
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value: boolean) => {
      setReduceMotion(value);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  function animateTo(value: number, duration: number) {
    if (reduceMotion) {
      return;
    }
    Animated.timing(scale, { toValue: value, duration, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        {...rest}
        onPressIn={(event) => {
          animateTo(scaleTo, 100);
          rest.onPressIn?.(event);
        }}
        onPressOut={(event) => {
          animateTo(1, 150);
          rest.onPressOut?.(event);
        }}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
