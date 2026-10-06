import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  overlay?: ReactNode;
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  style,
  contentContainerStyle,
  overlay,
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const padding = padded ? spacing.lg : 0;

  if (scroll) {
    return (
      <SafeAreaView
        style={[styles.flex, { backgroundColor: colors.background }]}
        edges={['top', 'left', 'right']}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[{ padding }, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {overlay}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: colors.background, padding }, style]}
      edges={['top', 'left', 'right']}
    >
      {children}
      {overlay}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
