import { View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export type ProfileCardProps = {
  name: string;
};

export function ProfileCard({ name }: ProfileCardProps) {
  const { colors, spacing } = useTheme();

  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Avatar name={name} size={44} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {name || '…'}
        </Text>
        <Text variant="caption" color={colors.textSecondary}>
          {es.more.personalAccount}
        </Text>
      </View>
    </Card>
  );
}
