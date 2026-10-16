import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { Text } from '@/components/ui';
import { formatCOP } from '@/lib/money';
import { useTheme } from '@/theme';

export type GroupedBarGroup = {
  label: string;
  values: number[];
};

export type GroupedBarChartProps = {
  groups: GroupedBarGroup[];
  colors: string[];
  seriesLabels: string[];
  height?: number;
};

export function GroupedBarChart({
  groups,
  colors,
  seriesLabels,
  height = 150,
}: GroupedBarChartProps) {
  const { spacing } = useTheme();
  const [width, setWidth] = useState(0);

  const max = Math.max(1, ...groups.flatMap((group) => group.values));
  const groupWidth = groups.length > 0 ? width / groups.length : 0;
  const barGap = 3;
  const barWidth = Math.max(
    4,
    Math.min(18, (groupWidth * 0.6 - barGap * (colors.length - 1)) / colors.length),
  );

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
      {width > 0 ? (
        <Svg width={width} height={height}>
          {groups.map((group, groupIndex) => {
            const barsWidth = barWidth * colors.length + barGap * (colors.length - 1);
            const startX = groupIndex * groupWidth + (groupWidth - barsWidth) / 2;
            return group.values.map((value, seriesIndex) => {
              const barHeight = (value / max) * (height - 6);
              return (
                <Rect
                  key={`${groupIndex}-${seriesIndex}`}
                  x={startX + seriesIndex * (barWidth + barGap)}
                  y={height - barHeight}
                  width={barWidth}
                  height={Math.max(0, barHeight)}
                  rx={3}
                  fill={colors[seriesIndex]}
                />
              );
            });
          })}
        </Svg>
      ) : null}

      <View style={styles.labelsRow}>
        {groups.map((group) => (
          <Text key={group.label} variant="micro" align="center" style={styles.label}>
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
                .join(' · ')}
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
