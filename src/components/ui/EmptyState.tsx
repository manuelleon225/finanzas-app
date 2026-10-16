import { StyleSheet, View, type ViewStyle } from 'react-native';

import { tint, useTheme } from '@/theme';

import { es } from '@/i18n/es';
import { AppIcon } from './AppIcon';
import { Button } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
  style?: ViewStyle;
};

export function EmptyState({
  title = es.states.emptyTitle,
  description = es.states.emptyDescription,
  actionLabel,
  onAction,
  icon = 'sparkles-outline',
  style,
}: EmptyStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${description}`}
      style={[styles.container, { padding: spacing.xl }, style]}
    >
      <View style={[styles.circle, { backgroundColor: tint(colors.brand, 0.16) }]}>
        <AppIcon name={icon} size={24} color={colors.brand} />
      </View>
      <Text variant="subtitle" align="center">
        {title}
      </Text>
      <Text variant="body" color={colors.textSecondary} align="center">
        {description}
      </Text>
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
