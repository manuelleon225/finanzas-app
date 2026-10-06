import { StyleSheet, View, type ViewStyle } from 'react-native';

import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export function EmptyState({
  title = es.states.emptyTitle,
  description = es.states.emptyDescription,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${description}`}
      style={[styles.container, { padding: spacing.xl }, style]}
    >
      <Text variant="subtitle" align="center">
        {title}
      </Text>
      <Text variant="body" color={colors.textSecondary} align="center">
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
