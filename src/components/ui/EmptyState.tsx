import { StyleSheet, View, type ViewStyle } from 'react-native';

import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import { AppIcon } from './AppIcon';
import { Button } from './Button';
import { EmptyIllustration, type EmptyIllustrationVariant } from './EmptyIllustration';
import { Text } from './Text';

const TILE_SIZE = 64;
const TILE_RADIUS = 18;
const TILE_ICON = 32;

export type EmptyStateProps = {
  icon: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: EmptyIllustrationVariant;
  style?: ViewStyle;
};

export function EmptyState({
  icon,
  title = es.states.emptyTitle,
  description = es.states.emptyDescription,
  actionLabel,
  onAction,
  illustration,
  style,
}: EmptyStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${description}`}
      style={[styles.container, { padding: spacing.xl }, style]}
    >
      {illustration ? (
        <EmptyIllustration variant={illustration} />
      ) : (
        <View
          style={{
            width: TILE_SIZE,
            height: TILE_SIZE,
            borderRadius: TILE_RADIUS,
            backgroundColor: colors.brandSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon name={icon} size={TILE_ICON} color={colors.brandText} filled />
        </View>
      )}
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
});
