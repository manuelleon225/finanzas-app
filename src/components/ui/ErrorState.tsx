import { StyleSheet, View, type ViewStyle } from 'react-native';

import { tint, useTheme } from '@/theme';
import { es } from '@/i18n/es';

import { AppIcon } from './AppIcon';
import { Button } from './Button';
import { Text } from './Text';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  style?: ViewStyle;
};

export function ErrorState({
  title = es.states.errorTitle,
  message = es.common.error,
  retryLabel = es.common.retry,
  onRetry,
  style,
}: ErrorStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`${title}. ${message}`}
      style={[styles.container, { padding: spacing.xl }, style]}
    >
      <View style={[styles.circle, { backgroundColor: tint(colors.danger, 0.16) }]}>
        <AppIcon name="alert-circle-outline" size={24} color={colors.danger} />
      </View>
      <Text variant="subtitle" align="center">
        {title}
      </Text>
      <Text variant="body" color={colors.textSecondary} align="center">
        {message}
      </Text>
      {onRetry ? <Button title={retryLabel} onPress={onRetry} /> : null}
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
