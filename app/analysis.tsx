import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { es as dateFnsEs } from 'date-fns/locale';
import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { CashFlowChart, DonutChart, GroupedBarChart } from '@/components/charts';
import {
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  IconTile,
  LoadingState,
  MoneyText,
  MonthSelector,
  ScreenScaffold,
  SegmentedControl,
  Skeleton,
  StackedBar,
  Text,
} from '@/components/ui';
import { useAnalysis } from '@/features/analysis/hooks/useAnalysis';
import { useTransactionsInRange } from '@/features/transactions/hooks/useTransactions';
import type { AnalysisKind } from '@/features/analysis/utils/analysis';
import { cumulativeBalanceByDay } from '@/features/analysis/utils/cashFlow';
import { todayISO } from '@/lib/dates';
import { sliceColor, sliceTileKey } from '@/features/analysis/utils/sliceColors';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { es } from '@/i18n/es';
import { formatCompactCOP } from '@/lib/money';
import { useTheme } from '@/theme';

const OTHERS_ICON = 'ellipsis-horizontal';

function LegendItem({ color, label }: { color: string; label: string }) {
  const { spacing } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text variant="micro">{label}</Text>
    </View>
  );
}

export default function AnalysisScreen() {
  const router = useRouter();
  const { colors, spacing, mode } = useTheme();
  const { session, loading: sessionLoading } = useSession();

  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [kind, setKind] = useState<AnalysisKind>('expense');

  const { byCategory, trend, extraShare, insights, isLoading, isError, refetch } = useAnalysis(
    monthAnchor,
    kind,
  );

  const cashFlowFrom = format(startOfMonth(monthAnchor), 'yyyy-MM-dd');
  const cashFlowTo = format(endOfMonth(monthAnchor), 'yyyy-MM-dd');
  const cashFlowQuery = useTransactionsInRange(cashFlowFrom, cashFlowTo);

  const cashFlowPoints = useMemo(
    () =>
      cumulativeBalanceByDay({
        transactions: (cashFlowQuery.data ?? []).map((transaction) => ({
          type: transaction.type,
          status: transaction.status,
          amount: transaction.amount,
          occurred_on: transaction.occurred_on,
        })),
        month: monthAnchor,
        today: todayISO(),
      }),
    [cashFlowQuery.data, monthAnchor],
  );

  const selectedMonthIndex = Math.max(
    0,
    trend.findIndex((point) => point.key === format(monthAnchor, 'yyyy-MM')),
  );
  const resolvedSelectedIndex =
    selectedMonthIndex === -1 ? Math.max(0, trend.length - 1) : selectedMonthIndex;
  const selectedPoint = trend[resolvedSelectedIndex];
  const selectedMonthDate = selectedPoint ? parseISO(`${selectedPoint.key}-01`) : monthAnchor;
  const selectedBalance = (selectedPoint?.income ?? 0) - (selectedPoint?.expense ?? 0);

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const hasAnyData = trend.some((point) => point.income > 0 || point.expense > 0);
  const monthTotal = byCategory.reduce((sum, item) => sum + item.amount, 0);
  const donutSegments = byCategory.map((item) => ({
    label: item.name,
    value: item.amount,
    color: sliceColor(item, kind, mode),
  }));
  const centerLabel = kind === 'expense' ? es.analysis.expenseTab : es.analysis.incomeTab;
  const showState = isLoading || isError || !hasAnyData;

  const header = (
    <View style={{ gap: spacing.md }}>
      <IconButton
        icon="arrow-back-outline"
        onPress={() => router.back()}
        color={colors.onBrand}
        accessibilityLabel={es.common.back}
      />
      <Text variant="title" color={colors.onBrand} align="center">
        {es.analysis.title}
      </Text>
      <MonthSelector value={monthAnchor} onChange={setMonthAnchor} tone="onBlock" iconSize={20} />
      {hasAnyData && insights.length > 0 ? (
        <Text variant="caption" color={colors.onBrandMuted} align="center">
          {insights[0]}
        </Text>
      ) : null}
    </View>
  );

  return (
    <ScreenScaffold
      variant="block"
      header={header}
      contentContainerStyle={showState ? { flexGrow: 1 } : undefined}
    >
      {isLoading ? (
        <View style={{ gap: spacing.md }}>
          <Skeleton variant="card" height={40} />
          <Skeleton variant="card" height={320} />
          <Skeleton variant="card" height={260} />
          <Skeleton variant="card" height={220} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : !hasAnyData ? (
        <EmptyState
          icon="bar-chart-outline"
          illustration="chart"
          title={es.analysis.emptyTitle}
          description={es.analysis.emptyDescription}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          <SegmentedControl<AnalysisKind>
            options={[
              { label: es.analysis.expenseTab, value: 'expense' },
              { label: es.analysis.incomeTab, value: 'income' },
            ]}
            value={kind}
            onChange={setKind}
          />

          <Card style={{ gap: spacing.md }}>
            {donutSegments.length === 0 ? (
              <Text variant="caption" align="center">
                {es.analysis.noMonthData}
              </Text>
            ) : (
              <>
                <DonutChart
                  segments={donutSegments}
                  centerLabel={centerLabel}
                  centerValue={monthTotal}
                  legend={false}
                />
                <View style={{ gap: spacing.sm }}>
                  {byCategory.map((item) => (
                    <View
                      key={item.categoryId}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
                    >
                      <IconTile
                        size={32}
                        icon={item.icon ?? OTHERS_ICON}
                        tileKey={sliceTileKey(item, kind)}
                      />
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyStrong" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text variant="caption" color={colors.textSecondary}>
                          {Math.round(item.percentage)}%
                        </Text>
                      </View>
                      <MoneyText amount={item.amount} kind="neutral" size="bodyStrong" />
                    </View>
                  ))}
                </View>
              </>
            )}
          </Card>

          <Card style={{ gap: spacing.md }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text variant="subtitle">{es.analysis.cashFlowTitle ?? 'Flujo del mes'}</Text>
              <MoneyText
                amount={
                  cashFlowPoints.length > 0 ? cashFlowPoints[cashFlowPoints.length - 1].balance : 0
                }
                kind={
                  cashFlowPoints.length > 0 && cashFlowPoints[cashFlowPoints.length - 1].balance < 0
                    ? 'expense'
                    : 'income'
                }
                signed
                size="bodyStrong"
              />
            </View>
            <CashFlowChart points={cashFlowPoints} month={monthAnchor} height={140} />
          </Card>

          <Card style={{ gap: spacing.md }}>
            <Text variant="subtitle">{es.analysis.trendTitle}</Text>
            <Text variant="subtitle">
              {format(selectedMonthDate, 'MMMM yyyy', { locale: dateFnsEs })}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.lg }}>
              <Text variant="caption" color={colors.textSecondary}>
                {es.analysis.income} {formatCompactCOP(selectedPoint?.income ?? 0)}
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                {es.analysis.expense} {formatCompactCOP(selectedPoint?.expense ?? 0)}
              </Text>
              <Text variant="caption" color={selectedBalance >= 0 ? colors.income : colors.expense}>
                {es.analysis.balance ?? 'Balance'} {formatCompactCOP(selectedBalance)}
              </Text>
            </View>
            <GroupedBarChart
              groups={trend.map((point) => ({
                label: point.label,
                values: [point.income, point.expense],
              }))}
              colors={[colors.income, colors.expense]}
              seriesLabels={[es.analysis.income, es.analysis.expense]}
              selectedIndex={resolvedSelectedIndex}
              onSelectIndex={(index) => {
                const point = trend[index];
                if (point) {
                  setMonthAnchor(parseISO(`${point.key}-01`));
                }
              }}
            />
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <Text variant="subtitle">{es.analysis.extraTitle}</Text>
            <Text variant="caption">{es.analysis.extraHint}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.lg }}>
              <LegendItem color={colors.brand} label={es.analysis.base} />
              <LegendItem color={colors.extraFill} label={es.analysis.extra} />
            </View>
            {extraShare.map((point, index) => (
              <View
                key={point.key}
                accessible
                accessibilityLabel={`${point.label}: ${point.percentage}% ${es.analysis.extra}`}
                style={{ gap: spacing.xs }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="caption">{point.label}</Text>
                  <Text variant="caption">{point.percentage}%</Text>
                </View>
                <StackedBar
                  segments={[
                    { value: trend[index]?.base ?? 0, color: colors.brand },
                    { value: trend[index]?.extra ?? 0, color: colors.extraFill },
                  ]}
                />
              </View>
            ))}
          </Card>
        </View>
      )}
    </ScreenScaffold>
  );
}
