import { startOfMonth } from 'date-fns';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { DonutChart, GroupedBarChart } from '@/components/charts';
import {
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  MonthSelector,
  ProgressBar,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Skeleton,
  Text,
} from '@/components/ui';
import { useAnalysis } from '@/features/analysis/hooks/useAnalysis';
import type { AnalysisKind } from '@/features/analysis/utils/analysis';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function AnalysisScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();

  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [kind, setKind] = useState<AnalysisKind>('expense');

  const { byCategory, trend, extraShare, insights, isLoading, isError, refetch } = useAnalysis(
    monthAnchor,
    kind,
  );

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
    color: item.color ?? colors.textMuted,
  }));
  const centerLabel = kind === 'expense' ? es.analysis.expenseTab : es.analysis.incomeTab;

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <ScreenHeader
          left={
            <IconButton
              icon="chevron-back-outline"
              onPress={() => router.back()}
              accessibilityLabel={es.common.back}
            />
          }
          title={es.analysis.title}
        />

        <MonthSelector value={monthAnchor} onChange={setMonthAnchor} />

        {isLoading ? (
          <>
            <Skeleton variant="card" height={72} />
            <Skeleton variant="card" height={300} />
            <Skeleton variant="card" height={260} />
            <Skeleton variant="card" height={200} />
          </>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : !hasAnyData ? (
          <EmptyState title={es.analysis.emptyTitle} description={es.analysis.emptyDescription} />
        ) : (
          <>
            {insights.length > 0 ? (
              <Card style={{ gap: spacing.sm }}>
                <Text variant="subtitle">{es.analysis.insightsTitle}</Text>
                {insights.map((line, index) => (
                  <Text key={index} variant="body" color={colors.textSecondary}>
                    • {line}
                  </Text>
                ))}
              </Card>
            ) : null}

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
                <DonutChart
                  segments={donutSegments}
                  centerLabel={centerLabel}
                  centerValue={monthTotal}
                />
              )}
            </Card>

            <Card style={{ gap: spacing.md }}>
              <Text variant="subtitle">{es.analysis.trendTitle}</Text>
              <GroupedBarChart
                groups={trend.map((point) => ({
                  label: point.label,
                  values: [point.income, point.expense],
                }))}
                colors={[colors.income, colors.expense]}
                seriesLabels={[es.analysis.income, es.analysis.expense]}
              />
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <Text variant="subtitle">{es.analysis.extraTitle}</Text>
              <Text variant="caption">{es.analysis.extraHint}</Text>
              {extraShare.map((point) => (
                <View key={point.key} style={{ gap: spacing.xs }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="caption">{point.label}</Text>
                    <Text variant="caption">{point.percentage}%</Text>
                  </View>
                  <ProgressBar value={point.percentage / 100} color={colors.extra} />
                </View>
              ))}
            </Card>
          </>
        )}
      </View>
    </Screen>
  );
}
