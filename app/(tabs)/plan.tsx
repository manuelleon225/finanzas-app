import { startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon, Card, ListRow, ProgressBar, Screen, ScreenHeader, Text } from '@/components/ui';
import { useBudgetProgress } from '@/features/budgets/hooks/useBudgets';
import { es } from '@/i18n/es';
import { formatCOP } from '@/lib/money';
import { useTheme } from '@/theme';

export default function PlanScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { progress } = useBudgetProgress(startOfMonth(new Date()));
  const chevron = <AppIcon name="chevron-forward-outline" size={20} color={colors.textMuted} />;

  const hasBudgets = progress.items.length > 0;
  const summary = es.budgets.spentOf
    .replace('{spent}', formatCOP(progress.totals.spent))
    .replace('{budget}', formatCOP(progress.totals.budgeted));

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <ScreenHeader title={es.plan.title} />

        <Card>
          <Pressable
            onPress={() => router.push('/budgets')}
            accessibilityRole="button"
            accessibilityLabel={es.plan.budgets}
            style={{ gap: spacing.sm }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text variant="subtitle">{es.plan.budgets}</Text>
              {chevron}
            </View>
            {hasBudgets ? (
              <>
                <Text variant="caption">{summary}</Text>
                <ProgressBar
                  value={progress.totals.ratio}
                  color={progress.totals.ratio > 1 ? colors.expense : colors.brand}
                />
              </>
            ) : (
              <Text variant="caption">{es.budgets.planEmpty}</Text>
            )}
          </Pressable>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <ListRow
            icon="repeat-outline"
            iconColor={colors.brand}
            title={es.plan.recurring}
            subtitle={es.plan.recurringDescription}
            trailing={chevron}
            onPress={() => router.push('/recurring')}
          />
          <ListRow
            icon="stats-chart-outline"
            iconColor={colors.brand}
            title={es.plan.analysis}
            subtitle={es.plan.analysisDescription}
            trailing={chevron}
            onPress={() => router.push('/analysis')}
          />
        </Card>
      </View>
    </Screen>
  );
}
