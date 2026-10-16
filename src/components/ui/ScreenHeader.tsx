import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  actions?: ReactNode;
  style?: ViewStyle;
};

export function ScreenHeader({ title, subtitle, left, actions, style }: ScreenHeaderProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.row, { gap: spacing.md }, style]}>
      {left}
      <View style={styles.titleBlock}>
        {title ? <Text variant="title">{title}</Text> : null}
        {subtitle ? (
          <Text variant="caption" color={colors.textSecondary}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions ? <View style={[styles.actions, { gap: spacing.xs }]}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
