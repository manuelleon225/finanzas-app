import { useColorScheme } from 'react-native';

import { colors } from './colors';
import { radii } from './radii';
import { spacing } from './spacing';
import { fontSizes, fontWeights, lineHeights } from './typography';

export function useTheme() {
  const scheme = useColorScheme();

  return {
    colors: scheme === 'dark' ? colors.dark : colors.light,
    spacing,
    radii,
    fontSizes,
    fontWeights,
    lineHeights,
  };
}

export type Theme = ReturnType<typeof useTheme>;
