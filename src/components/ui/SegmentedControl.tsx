import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

import { Text } from './Text';

const PADDING = 3;

export type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const { colors, radii, componentHeights } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const reduceMotion = useReducedMotion();

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentWidth = containerWidth > 0 ? (containerWidth - PADDING * 2) / options.length : 0;
  const left = useSharedValue(activeIndex * segmentWidth);

  useEffect(() => {
    const target = activeIndex * segmentWidth;
    if (reduceMotion) {
      left.value = target;
    } else {
      left.value = withTiming(target, { duration: 150 });
    }
  }, [activeIndex, segmentWidth, reduceMotion, left]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: left.value }],
  }));

  function onLayout(event: LayoutChangeEvent) {
    setContainerWidth(event.nativeEvent.layout.width);
  }

  return (
    <View
      accessibilityRole="radiogroup"
      onLayout={onLayout}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.pill,
          height: componentHeights.segmented,
          padding: PADDING,
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pill,
          {
            width: segmentWidth,
            height: componentHeights.segmented - PADDING * 2,
            borderRadius: radii.pill,
            backgroundColor: colors.surfaceHigh,
          },
          pillStyle,
        ]}
      />
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active }}
            style={styles.segment}
          >
            <Text variant="caption" color={active ? colors.textPrimary : colors.textSecondary}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  pill: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
