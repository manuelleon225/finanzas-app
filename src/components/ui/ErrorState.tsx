import { StyleSheet, View, type ViewStyle } from 'react-native';

import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import { AppIcon } from './AppIcon';
import { Button } from './Button';
import { Text } from './Text';

const TILE_SIZE = 64;
const TILE_RADIUS = 18;
const TILE_ICON = 32;

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
      <View
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          borderRadius: TILE_RADIUS,
          backgroundColor: colors.dangerSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppIcon name="alert-circle" size={TILE_ICON} color={colors.danger} filled />
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
});
