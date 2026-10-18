import { useEffect, type ReactNode } from 'react';
import { type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/useReducedMotion';

import { durations } from '@/theme';

const OFFSET = 8;

export type AnimatedEntranceProps = {
  children: ReactNode;
  delayMs?: number;
  style?: ViewStyle;
};

/**
 * Entrada suave (fade + desplazamiento de 8 px, 220 ms). Con "reducir movimiento"
 * del sistema activo, la animación se desactiva por completo.
 */
export function AnimatedEntrance({ children, delayMs = 0, style }: AnimatedEntranceProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }

    progress.value = withDelay(
      delayMs,
      withTiming(1, { duration: durations.standard, easing: Easing.out(Easing.ease) }),
    );
  }, [delayMs, reduceMotion, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * OFFSET }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
