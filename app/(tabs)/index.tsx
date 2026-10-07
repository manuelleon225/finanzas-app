import { useRouter } from 'expo-router';

import { Card, Fab, Screen, Text } from '@/components/ui';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const { spacing } = useTheme();
  const router = useRouter();

  return (
    <Screen
      overlay={
        <Fab
          onPress={() => router.push('/transaction-form')}
          accessibilityLabel={es.transactionForm.add}
        />
      }
    >
      <Card style={{ marginTop: spacing.lg }}>
        <Text variant="title">{es.tabs.home}</Text>
        <Text variant="body" style={{ marginTop: spacing.sm }}>
          {es.screens.homePlaceholder}
        </Text>
      </Card>
    </Screen>
  );
}
