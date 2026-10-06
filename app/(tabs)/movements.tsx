import { Card, Screen, Text } from '@/components/ui';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function MovementsScreen() {
  const { spacing } = useTheme();

  return (
    <Screen>
      <Card style={{ marginTop: spacing.lg }}>
        <Text variant="title">{es.tabs.movements}</Text>
        <Text variant="body" style={{ marginTop: spacing.sm }}>
          {es.screens.movementsPlaceholder}
        </Text>
      </Card>
    </Screen>
  );
}
