import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/AppIcon';
import { Text } from '@/components/ui/Text';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export type PendingBannerProps = {
  count: number;
  onPress: () => void;
};

export function PendingBanner({ count, onPress }: PendingBannerProps) {
  const { colors, radii, spacing } = useTheme();

  if (count <= 0) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={es.home.confirmationsTitle}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: pressed ? colors.surfaceHigh : colors.surfaceRaised,
        borderRadius: radii.lg,
        padding: spacing.md,
      })}
    >
      <AppIcon name="time-outline" size={20} color={colors.brandText} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">
          {es.home.pendingConfirmations.replace('{count}', String(count))}
        </Text>
      </View>
      <AppIcon name="chevron-forward-outline" size={20} color={colors.textMuted} />
    </Pressable>
  );
}
