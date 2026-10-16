import { StyleSheet, View, type DimensionValue } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type StackedSegment = {
  value: number;
  color: string;
  label?: string;
};

export type StackedLayoutItem = {
  color: string;
  label?: string;
  widthPercent: DimensionValue;
};

export function stackedLayout(segments: StackedSegment[]): {
  total: number;
  items: StackedLayoutItem[];
} {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  if (total <= 0) {
    return { total, items: [] };
  }

  return {
    total,
    items: segments.map((segment) => ({
      color: segment.color,
      label: segment.label,
      widthPercent: `${(segment.value / total) * 100}%` as DimensionValue,
    })),
  };
}

export type StackedBarProps = {
  segments: StackedSegment[];
  height?: number;
  legend?: boolean;
};

export function StackedBar({ segments, height = 8, legend = false }: StackedBarProps) {
  const { colors, radii, spacing } = useTheme();
  const { total, items } = stackedLayout(segments);
  const summary = items
    .map((segment) => segment.label)
    .filter((label): label is string => Boolean(label))
    .join(', ');

  return (
    <View style={{ gap: spacing.sm }}>
      <View
        accessible={summary.length > 0}
        accessibilityLabel={summary.length > 0 ? summary : undefined}
        style={[
          styles.bar,
          {
            height,
            backgroundColor: colors.surfaceRaised,
            borderRadius: radii.pill,
          },
        ]}
      >
        {items.map((segment, index) => (
          <View
            key={`${index}-${segment.color}`}
            style={{
              width: segment.widthPercent,
              backgroundColor: segment.color,
              borderRadius: radii.pill,
            }}
          />
        ))}
      </View>
      {legend && total > 0 ? (
        <View style={styles.legend}>
          {items.map((segment, index) => (
            <View key={`${index}-${segment.color}`} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: segment.color }]} />
              <Text variant="micro">{segment.label ?? ''}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 2,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
});
