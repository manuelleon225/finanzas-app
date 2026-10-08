import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { colors } from './colors';
import { componentHeights, durations } from './metrics';
import { radii } from './radii';
import { spacing } from './spacing';
import { fontSizes, fontWeights, lineHeights } from './typography';
import { useThemeModeStore } from './useThemeModeStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const mode = useThemeModeStore((state) => state.mode);

  return useMemo(() => {
    const effective = mode === 'system' ? (systemScheme ?? 'dark') : mode;

    return {
      colors: colors[effective === 'light' ? 'light' : 'dark'],
      spacing,
      radii,
      fontSizes,
      fontWeights,
      lineHeights,
      durations,
      componentHeights,
    };
  }, [mode, systemScheme]);
}

export type Theme = ReturnType<typeof useTheme>;
