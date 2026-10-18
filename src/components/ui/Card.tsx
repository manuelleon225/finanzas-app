import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: CardProps) {
  const { colors, radii, spacing, mode } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: mode === 'light' ? 1 : 0,
          borderRadius: radii.xl,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
