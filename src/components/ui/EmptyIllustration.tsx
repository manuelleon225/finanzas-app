import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { getTileColors, useTheme } from '@/theme';

export type EmptyIllustrationVariant = 'list' | 'chart' | 'target' | 'wallet';

export type EmptyIllustrationProps = {
  variant: EmptyIllustrationVariant;
};

export function EmptyIllustration({ variant }: EmptyIllustrationProps) {
  const { colors, mode } = useTheme();
  const orange = getTileColors('orange', mode).icon;
  const blue = getTileColors('blue', mode).icon;
  const green = getTileColors('green', mode).icon;

  return (
    <View
      testID="empty-illustration"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.container}
    >
      <Svg testID={`empty-illustration-${variant}`} width={120} height={96} viewBox="0 0 120 96">
        <Circle testID="empty-illustration-base" cx={60} cy={48} r={44} fill={colors.brandSoft} />

        {variant === 'list' ? (
          <>
            <Rect
              x={30}
              y={22}
              width={60}
              height={52}
              rx={10}
              fill={colors.surface}
              stroke={colors.border}
              strokeWidth={1}
            />
            {[0, 1, 2].map((i) => {
              const tileColor = i === 0 ? orange : i === 1 ? blue : green;
              return (
                <React.Fragment key={i}>
                  <Rect x={38} y={30 + 14 * i} width={10} height={10} rx={3} fill={tileColor} />
                  <Rect
                    x={54}
                    y={32 + 14 * i}
                    width={26}
                    height={3}
                    rx={1.5}
                    fill={colors.textMuted}
                  />
                  <Rect
                    x={54}
                    y={37.5 + 14 * i}
                    width={16}
                    height={2.5}
                    rx={1.25}
                    fill={colors.border}
                  />
                </React.Fragment>
              );
            })}
          </>
        ) : null}

        {variant === 'chart' ? (
          <>
            <Rect
              x={30}
              y={22}
              width={60}
              height={52}
              rx={10}
              fill={colors.surface}
              stroke={colors.border}
              strokeWidth={1}
            />
            <Rect x={40} y={50} width={8} height={16} rx={2} fill={blue} />
            <Rect x={56} y={40} width={8} height={26} rx={2} fill={colors.brand} />
            <Rect x={72} y={30} width={8} height={36} rx={2} fill={colors.extraFill} />
            <Line x1={36} y1={68} x2={84} y2={68} stroke={colors.border} strokeWidth={1} />
          </>
        ) : null}

        {variant === 'target' ? (
          <>
            <Circle
              cx={60}
              cy={48}
              r={26}
              fill={colors.surface}
              stroke={colors.border}
              strokeWidth={1}
            />
            <Circle cx={60} cy={48} r={17} fill="none" stroke={colors.brand} strokeWidth={3} />
            <Circle cx={60} cy={48} r={9} fill="none" stroke={colors.brand} strokeWidth={3} />
            <Circle cx={60} cy={48} r={3} fill={colors.brand} />
          </>
        ) : null}

        {variant === 'wallet' ? (
          <>
            <Rect
              x={28}
              y={30}
              width={64}
              height={42}
              rx={10}
              fill={colors.surface}
              stroke={colors.border}
              strokeWidth={1}
            />
            <Rect x={28} y={38} width={64} height={9} fill={colors.brandSoft} />
            <Circle cx={80} cy={60} r={5} fill={colors.brand} />
          </>
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
