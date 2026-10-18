import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { MoneyText, Text } from '@/components/ui';
import { formatCOP } from '@/lib/money';
import { useTheme } from '@/theme';

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

export type DonutChartProps = {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: number;
  size?: number;
  thickness?: number;
  legend?: boolean;
};

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  size = 180,
  thickness = 22,
  legend = true,
}: DonutChartProps) {
  const { colors, spacing } = useTheme();
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const summary = [
    `${centerLabel}: ${formatCOP(centerValue)}`,
    ...segments.map(
      (segment) => `${segment.label} ${Math.round((segment.value / (total || 1)) * 100)}%`,
    ),
  ].join('. ');

  let offset = 0;

  return (
    <View accessible accessibilityLabel={summary} style={{ gap: spacing.md }}>
      <View style={{ width: size, height: size, alignSelf: 'center' }}>
        <Svg width={size} height={size}>
          <G rotation={-90} originX={size / 2} originY={size / 2}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.surfaceRaised}
              strokeWidth={thickness}
              fill="none"
            />
            {total > 0
              ? segments.map((segment, index) => {
                  const length = (segment.value / total) * circumference;
                  const dashOffset = -offset;
                  offset += length;
                  return (
                    <Circle
                      key={index}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={segment.color}
                      strokeWidth={thickness}
                      fill="none"
                      strokeDasharray={`${length} ${circumference - length}`}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })
              : null}
          </G>
        </Svg>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.center}>
            <Text variant="caption">{centerLabel}</Text>
            <MoneyText amount={centerValue} kind="neutral" size="bodyStrong" />
          </View>
        </View>
      </View>

      {legend ? (
        <View style={{ gap: spacing.sm }}>
          {segments.map((segment, index) => (
            <View key={index} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: segment.color }]} />
              <Text variant="caption" style={{ flex: 1 }}>
                {segment.label}
              </Text>
              <Text variant="caption">{Math.round((segment.value / (total || 1)) * 100)}%</Text>
              <MoneyText amount={segment.value} kind="neutral" size="caption" />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
