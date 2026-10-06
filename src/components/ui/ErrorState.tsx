import { StyleSheet, View, type ViewStyle } from 'react-native';

import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

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
      <Text variant="subtitle" align="center">
        {title}
      </Text>
      <Text variant="body" color={colors.textSecondary} align="center">
        {message}
      </Text>
      {onRetry ? (
        <Button title={retryLabel} onPress={onRetry} style={{ marginTop: spacing.sm }} />
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
