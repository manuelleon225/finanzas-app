import { startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AppIcon,
  Button,
  Card,
  ErrorState,
  IconTile,
  ListRow,
  ProgressBar,
  ScreenHeader,
  ScreenScaffold,
  Skeleton,
  Text,
} from '@/components/ui';
import { resolveCategoryTile } from '@/components/ui/tileHelpers';
import { useAnalysis } from '@/features/analysis/hooks/useAnalysis';
import { useBudgetProgress } from '@/features/budgets/hooks/useBudgets';
import type {
  BudgetProgressItem,
  BudgetProgressTotals,
} from '@/features/budgets/utils/budgetProgress';
import {
  analysisSubtitle,
  featuredBudgets,
  recurringSubtitle,
} from '@/features/plan/utils/planText';
import { useRecurringRules } from '@/features/recurring/hooks/useRecurringRules';
import { formatMonthLabel } from '@/features/transactions/utils/transactions';
import { es } from '@/i18n/es';
import { todayISO } from '@/lib/dates';
import { formatCOP } from '@/lib/money';
import { useTheme } from '@/theme';

const HIT_SLOP = { top: 14, bottom: 14, left: 8, right: 8 };

function BudgetSummaryCard({
  monthAnchor,
  totals,
  hasBudgets,
  onCreate,
}: {
  monthAnchor: Date;
  totals: BudgetProgressTotals;
  hasBudgets: boolean;
  onCreate: () => void;
}) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.brand,
        borderRadius: radii.xl,
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <Text variant="caption" color={colors.onBrandMuted}>
        {es.plan.budgetsOf.replace('{mes}', formatMonthLabel(monthAnchor))}
      </Text>
      {hasBudgets ? (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' }}>
            <Text variant="subtitle" color={colors.onBrand}>
              {formatCOP(totals.spent)}
            </Text>
            <Text variant="subtitle" color={colors.onBrandMuted}>
              {` ${es.plan.spentDe.replace('{budget}', formatCOP(totals.budgeted))}`}
            </Text>
          </View>
          <ProgressBar value={totals.ratio} tone="onBlock" />
        </>
      ) : (
        <View style={{ gap: spacing.md }}>
          <Text variant="subtitle" color={colors.onBrand}>
            {es.budgets.planEmpty}
          </Text>
          <Button title={es.plan.createBudget} variant="onBrand" onPress={onCreate} />
        </View>
      )}
    </View>
  );
}

function BudgetMiniRow({ item }: { item: BudgetProgressItem }) {
  const { colors, spacing } = useTheme();
  const tile = resolveCategoryTile({
    name: item.categoryName,
    kind: 'expense',
    icon: item.categoryIcon,
    color: item.categoryColor,
  });
  const remainingText =
    item.remaining >= 0
      ? es.budgets.remaining.replace('{monto}', formatCOP(item.remaining))
      : es.budgets.over.replace('{monto}', formatCOP(-item.remaining));

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <IconTile icon={tile.icon} tileKey={tile.tileKey} size={32} />
        <Text variant="body" numberOfLines={1} style={{ flex: 1 }}>
          {item.categoryName}
        </Text>
        <Text variant="caption" color={item.remaining >= 0 ? colors.textSecondary : colors.expense}>
          {remainingText}
        </Text>
      </View>
      <ProgressBar value={item.ratio} status={item.status} />
    </View>
  );
}

function PlanSkeleton() {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.md }}>
      <Skeleton variant="card" tone="onBlock" height={132} />
      <Skeleton variant="card" height={188} />
    </View>
  );
}

export default function PlanScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [monthAnchor] = useState(() => startOfMonth(new Date()));

  const { progress, isLoading, isError, refetch } = useBudgetProgress(monthAnchor);
  const recurringQuery = useRecurringRules();
  const analysis = useAnalysis(monthAnchor, 'expense');

  const featured = featuredBudgets(progress.items);
  const hasBudgets = progress.items.length > 0;
  const hasMoreBudgets = progress.items.length > featured.length;

  const recurringSub = recurringSubtitle(recurringQuery.data ?? [], todayISO());
  const analysisSub = analysisSubtitle(analysis.insights);

  const chevron = <AppIcon name="chevron-forward-outline" size={20} color={colors.textMuted} />;

  return (
    <ScreenScaffold
      variant="plain"
      header={<ScreenHeader title={es.plan.title} />}
      contentContainerStyle={{ gap: spacing.md }}
    >
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <PlanSkeleton />
      ) : (
        <>
          <BudgetSummaryCard
            monthAnchor={monthAnchor}
            totals={progress.totals}
            hasBudgets={hasBudgets}
            onCreate={() => router.push('/budgets')}
          />

          {hasBudgets ? (
            <Card style={{ gap: spacing.md }}>
              {featured.map((item) => (
                <BudgetMiniRow key={item.budgetId} item={item} />
              ))}
              {hasMoreBudgets ? (
                <Pressable
                  onPress={() => router.push('/budgets')}
                  accessibilityRole="button"
                  accessibilityLabel={es.plan.viewAll}
                  hitSlop={HIT_SLOP}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Text variant="caption" color={colors.brandText}>
                    {`${es.plan.viewAll} ›`}
                  </Text>
                </Pressable>
              ) : null}
            </Card>
          ) : null}
        </>
      )}

      <Card style={{ gap: spacing.xs }}>
        <ListRow
          leading={<IconTile icon="repeat-outline" tileKey="violet" size={40} />}
          title={es.plan.recurring}
          subtitle={recurringSub}
          trailing={chevron}
          onPress={() => router.push('/recurring')}
        />
        <ListRow
          leading={<IconTile icon="stats-chart-outline" tileKey="teal" size={40} />}
          title={es.plan.analysis}
          subtitle={analysisSub}
          trailing={chevron}
          onPress={() => router.push('/analysis')}
        />
      </Card>
    </ScreenScaffold>
  );
}
