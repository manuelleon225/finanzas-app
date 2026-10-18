import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

const TOP_PADDING = 12;
const BOTTOM_PADDING = 44;

// Sistema de coordenadas del fondo del bloque (viewBox 0 0 100 100). Con
// `preserveAspectRatio="none"` estas unidades se estiran a todo el contenedor,
// de modo que el ancho/alto reales no dependen de `Dimensions`.
const VIEW_BOX = '0 0 100 100';

export type BlockHeaderProps = {
  children?: ReactNode;
  style?: ViewStyle;
};

export function BlockHeader({ children, style }: BlockHeaderProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View testID="block-header" style={[styles.block, style]}>
      <Svg
        testID="block-background"
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox={VIEW_BOX}
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="blockGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.brand} />
            <Stop offset="1" stopColor={colors.brandDeep} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#blockGradient)" />
        <Circle testID="block-decor-circle-1" cx="88" cy="8" r="24" fill={colors.blockDecor} />
        <Circle testID="block-decor-circle-2" cx="100" cy="30" r="30" fill={colors.blockDecor} />
      </Svg>

      <View
        testID="block-content"
        style={{
          paddingTop: insets.top + TOP_PADDING,
          paddingBottom: BOTTOM_PADDING,
          paddingHorizontal: spacing.screen,
        }}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
});
