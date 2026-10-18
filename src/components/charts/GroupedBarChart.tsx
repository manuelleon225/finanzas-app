import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReducedMotion } from '@/lib/useReducedMotion';

import { Text } from '@/components/ui';
import { formatCOP, formatPesos } from '@/lib/money';
import { select } from '@/lib/haptics';
import { useTheme } from '@/theme';

import { buildBarChartLayout } from './layout';

export type GroupedBarGroup = {
  label: string;
  values: number[];
};

export type GroupedBarChartProps = {
  groups: GroupedBarGroup[];
  colors: string[];
  seriesLabels: string[];
  height?: number;
  selectedIndex?: number;
  onSelectIndex?: (index: number) => void;
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

function Bar({
  targetHeight,
  height,
  x,
  color,
  opacity,
  progress,
  groupIndex,
  groupCount,
}: {
  targetHeight: number;
  height: number;
  x: number;
  color: string;
  opacity: number;
  progress: ReturnType<typeof useSharedValue<number>>;
  groupIndex: number;
  groupCount: number;
}) {
  const totalDuration = 320 + 40 * Math.max(0, groupCount - 1);
  const animatedProps = useAnimatedProps(() => {
    const start = (groupIndex * 40) / totalDuration;
    const end = (groupIndex * 40 + 320) / totalDuration;
    const span = Math.max(0.0001, end - start);
    const local = Math.min(1, Math.max(0, (progress.value - start) / span));
    const h = targetHeight * local;
    return {
      height: Math.max(0, h),
      y: height - h,
    };
  });

  return (
    <AnimatedRect
      x={x}
      width={10}
      rx={4}
      fill={color}
      opacity={opacity}
      animatedProps={animatedProps}
    />
  );
}

export function GroupedBarChart({
  groups,
  colors,
  seriesLabels,
  height = 180,
  selectedIndex,
  onSelectIndex,
}: GroupedBarChartProps) {
  const { spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);

  const layout =
    width > 0
      ? buildBarChartLayout({ data: groups, width, height, barWidth: 10, innerGap: 4 })
      : null;

  const totalDuration = 320 + 40 * Math.max(0, groups.length - 1);
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!layout) {
      return;
    }
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, { duration: totalDuration });
  }, [groups, layout, reduceMotion, progress, totalDuration]);

  const summary = groups
    .map(
      (group) =>
        `${group.label}: ${group.values
          .map((value, index) => `${seriesLabels[index]} ${formatCOP(value)}`)
          .join(', ')}`,
    )
    .join('. ');

  return (
    <View
      accessible
      accessibilityLabel={summary}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ gap: spacing.sm }}
    >
      <View style={{ height, position: 'relative' }}>
        {layout ? (
          <>
            <Svg width={width} height={height}>
              {layout.groups.map((group, groupIndex) => {
                const opacity =
                  selectedIndex === undefined || selectedIndex === groupIndex ? 1 : 0.45;
                return group.bars.map((bar, barIndex) => (
                  <Bar
                    key={`${groupIndex}-${barIndex}`}
                    targetHeight={bar.height}
                    height={height}
                    x={bar.x}
                    color={colors[barIndex % colors.length]}
                    opacity={opacity}
                    progress={progress}
                    groupIndex={groupIndex}
                    groupCount={groups.length}
                  />
                ));
              })}
            </Svg>
            {layout.groups.map((group, groupIndex) => (
              <Pressable
                key={`touch-${groupIndex}`}
                accessibilityRole="button"
                accessibilityLabel={`${groups[groupIndex].label}: ingresos ${formatPesos(groups[groupIndex].values[0] ?? 0)}, gastos ${formatPesos(groups[groupIndex].values[1] ?? 0)}`}
                onPress={() => {
                  select();
                  onSelectIndex?.(groupIndex);
                }}
                style={{
                  position: 'absolute',
                  left: group.touchRect.x,
                  top: group.touchRect.y,
                  width: group.touchRect.width,
                  height: group.touchRect.height,
                }}
              />
            ))}
          </>
        ) : null}
      </View>

      <View style={styles.labelsRow}>
        {groups.map((group, index) => (
          <Text
            key={group.label}
            variant="micro"
            align="center"
            style={[styles.label, selectedIndex === index ? { fontWeight: '700' } : null]}
          >
            {group.label}
          </Text>
        ))}
      </View>

      <View style={styles.legendRow}>
        {seriesLabels.map((label, index) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors[index] }]} />
            <Text variant="micro">{label}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 2 }}>
        {groups.map((group) => (
          <View key={group.label} style={styles.tableRow}>
            <Text variant="micro" style={{ flex: 1 }}>
              {group.label}
            </Text>
            <Text variant="micro">
              {group.values
                .map((value, index) => `${seriesLabels[index]}: ${formatCOP(value)}`)
                .join('  ·  ')}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelsRow: {
    flexDirection: 'row',
  },
  label: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
