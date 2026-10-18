import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export type SheetProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Sheet({ children, style }: SheetProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      testID="sheet"
      style={[
        {
          backgroundColor: colors.bg,
          borderTopLeftRadius: radii.sheet,
          borderTopRightRadius: radii.sheet,
          marginTop: -radii.sheet,
          flex: 1,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View testID="sheet-content" style={{ flex: 1, paddingHorizontal: spacing.screen }}>
        {children}
      </View>
    </View>
  );
}
