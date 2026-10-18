import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from '@/lib/useReducedMotion';

import { select } from '@/lib/haptics';
import { useTheme } from '@/theme';

import { Text } from './Text';

const PADDING = 3;

export type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

export type SegmentedControlTone = 'default' | 'onBlock';

export type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  tone?: SegmentedControlTone;
  style?: ViewStyle;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  tone = 'default',
  style,
}: SegmentedControlProps<T>) {
  const { colors, radii, componentHeights } = useTheme();
  const onBlock = tone === 'onBlock';
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
          backgroundColor: onBlock ? colors.blockSoft : colors.surface,
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
            backgroundColor: onBlock ? colors.onBrand : colors.surfaceHigh,
          },
          pillStyle,
        ]}
      />
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => {
              select();
              onChange(option.value);
            }}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: active }}
            hitSlop={{ top: 2, bottom: 2 }}
            style={styles.segment}
          >
            <Text
              variant="caption"
              color={
                active
                  ? onBlock
                    ? colors.brand
                    : colors.textPrimary
                  : onBlock
                    ? colors.onBrandMuted
                    : colors.textSecondary
              }
            >
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
