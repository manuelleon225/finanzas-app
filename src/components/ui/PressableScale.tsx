import { useState } from 'react';
import { Animated, Pressable, type PressableProps } from 'react-native';

import { useReducedMotion } from '@/lib/useReducedMotion';
import { useTheme } from '@/theme';

export type PressableScaleProps = PressableProps & {
  scaleTo?: number;
};

export function PressableScale({ scaleTo = 0.97, style, children, ...rest }: PressableScaleProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));

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
