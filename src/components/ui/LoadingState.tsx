import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';

import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import { Text } from './Text';

export type LoadingStateProps = {
  message?: string;
  style?: ViewStyle;
};

export function LoadingState({ message = es.common.loading, style }: LoadingStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      style={[styles.container, { padding: spacing.xl }, style]}
    >
      <ActivityIndicator color={colors.primary} />
      <Text variant="caption" style={{ marginTop: spacing.sm }}>
        {message}
      </Text>
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
