import { useState } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { Text } from '@/components/ui';
import { formatCOP } from '@/lib/money';
import { select } from '@/lib/haptics';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import { buildLineChartLayout, nearestIndex } from '@/features/analysis/utils/cashFlow';

export type CashFlowChartProps = {
  points: { day: number; balance: number }[];
  month: Date;
  height?: number;
};

export function CashFlowChart({ points, month, height = 140 }: CashFlowChartProps) {
  const { colors, spacing } = useTheme();
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const layout = width > 0 ? buildLineChartLayout({ points, width, height, padding: 12 }) : null;

  const isEmpty = points.length === 0 || points.every((point) => point.balance === 0);

  const monthLabel = new Intl.DateTimeFormat('es-CO', { month: 'short' })
    .format(month)
    .replace('.', '');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 4,
    onPanResponderGrant: (event) => {
      if (!layout) {
        return;
      }
      const x = event.nativeEvent.locationX;
      const index = nearestIndex(x, layout.coordinates);
      setActiveIndex(index);
      select();
    },
    onPanResponderMove: (event) => {
      if (!layout) {
        return;
      }
      const x = event.nativeEvent.locationX;
      const index = nearestIndex(x, layout.coordinates);
      setActiveIndex((current) => {
        if (current !== index) {
          select();
        }
        return index;
      });
    },
    onPanResponderRelease: () => {
      setActiveIndex(null);
    },
    onPanResponderTerminate: () => {
      setActiveIndex(null);
    },
  });

  const displayIndex =
    activeIndex === null ? (points.length > 0 ? points.length - 1 : 0) : activeIndex;
  const displayPoint = points[displayIndex];
  const displayCoordinate = layout?.coordinates[displayIndex];

  const summaryBalance = points.length > 0 ? points[points.length - 1].balance : 0;
  const minBalance = points.length > 0 ? Math.min(...points.map((point) => point.balance)) : 0;
  const maxBalance = points.length > 0 ? Math.max(...points.map((point) => point.balance)) : 0;

  return (
    <View style={{ gap: spacing.sm }}>
      {isEmpty ? (
        <View
          style={{ height, alignItems: 'center', justifyContent: 'center', gap: spacing.xs }}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        >
          <Svg width={width || 1} height={height}>
            <Line
              x1={12}
              y1={height / 2}
              x2={(width || 1) - 12}
              y2={height / 2}
              stroke={colors.border}
              strokeWidth={1}
            />
          </Svg>
          <Text variant="caption" color={colors.textSecondary} align="center">
            {es.analysis.noMonthData}
          </Text>
        </View>
      ) : (
        <View
          style={{ height, position: 'relative' }}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          {layout ? (
            <>
              <Svg width={width} height={height}>
                <Defs>
                  <LinearGradient id="cashFlowArea" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={colors.brand} stopOpacity={0.25} />
                    <Stop offset="1" stopColor={colors.brand} stopOpacity={0} />
                  </LinearGradient>
                </Defs>
                <Path d={layout.areaPath} fill="url(#cashFlowArea)" />
                <Path
                  d={layout.path}
                  fill="none"
                  stroke={colors.brand}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {layout.zeroY !== null ? (
                  <Line
                    x1={12}
                    y1={layout.zeroY}
                    x2={width - 12}
                    y2={layout.zeroY}
                    stroke={colors.border}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                  />
                ) : null}
                {displayCoordinate ? (
                  <Circle
                    cx={displayCoordinate.x}
                    cy={displayCoordinate.y}
                    r={8}
                    fill={colors.brandSoft}
                  />
                ) : null}
                {displayCoordinate ? (
                  <Circle
                    cx={displayCoordinate.x}
                    cy={displayCoordinate.y}
                    r={4}
                    fill={colors.brand}
                  />
                ) : null}
                {points.length > 0 && layout.coordinates[points.length - 1] ? (
                  <>
                    <Circle
                      cx={layout.coordinates[points.length - 1].x}
                      cy={layout.coordinates[points.length - 1].y}
                      r={8}
                      fill={colors.brandSoft}
                    />
                    <Circle
                      cx={layout.coordinates[points.length - 1].x}
                      cy={layout.coordinates[points.length - 1].y}
                      r={4}
                      fill={colors.brand}
                    />
                  </>
                ) : null}
              </Svg>

              {activeIndex !== null && displayCoordinate ? (
                <>
                  <View
                    style={{
                      position: 'absolute',
                      left: displayCoordinate.x,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      backgroundColor: colors.textMuted,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      left: Math.max(0, displayCoordinate.x - 40),
                      top: 0,
                      backgroundColor: colors.surfaceHigh,
                      borderRadius: 8,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text variant="micro" color={colors.textPrimary}>
                      {`${displayPoint.day} ${monthLabel}: ${formatCOP(displayPoint.balance)}`}
                    </Text>
                  </View>
                </>
              ) : null}
            </>
          ) : null}
        </View>
      )}

      <View
        accessible
        accessibilityLabel={`Balance acumulado del mes: ${formatCOP(summaryBalance)}; mínimo ${formatCOP(minBalance)}; máximo ${formatCOP(maxBalance)}`}
      />
    </View>
  );
}
