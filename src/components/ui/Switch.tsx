import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { select } from '@/lib/haptics';
import { durations, useTheme } from '@/theme';

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const KNOB_SIZE = 20;
const KNOB_INSET = 3;
const TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;

export type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function Switch({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
}: SwitchProps) {
  const { colors, radii } = useTheme();
  const reduceMotion = useReducedMotion();
  const offset = useSharedValue(value ? TRAVEL : 0);

  useEffect(() => {
    const target = value ? TRAVEL : 0;
    offset.value = reduceMotion ? target : withTiming(target, { duration: durations.fast });
  }, [value, reduceMotion, offset]);

  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  function toggle() {
    select();
    onValueChange(!value);
  }

  return (
    <Pressable
      onPress={toggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      testID="switch"
      style={[
        styles.track,
        { backgroundColor: value ? colors.brand : colors.surfaceHigh, borderRadius: radii.pill },
        disabled ? styles.disabled : null,
      ]}
    >
      <Animated.View
        testID="switch-knob"
        style={[
          styles.knob,
          { backgroundColor: colors.onBrand, borderRadius: radii.pill },
          knobStyle,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    padding: KNOB_INSET,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
  },
  disabled: {
    opacity: 0.4,
  },
});
