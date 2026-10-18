import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { MoneyText } from '@/components/ui/MoneyText';
import { StackedBar } from '@/components/ui/StackedBar';
import { Text } from '@/components/ui/Text';
import { es } from '@/i18n/es';
import { formatCOP } from '@/lib/money';
import { useTheme } from '@/theme';

import { extraDependencyText } from '../utils/home';
import type { MonthSummary } from '../utils/summary';

type MonthBlockProps = {
  title: string;
  amount: number;
  kind: 'income' | 'expense';
  base: number;
  extra: number;
};

function MonthBlock({ title, amount, kind, base, extra }: MonthBlockProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="body">{title}</Text>
        <MoneyText amount={amount} kind={kind} signed={kind === 'expense'} />
      </View>
      <StackedBar
        segments={[
          { value: base, color: colors.brand, label: `${es.home.baseLabel} ${formatCOP(base)}` },
          {
            value: extra,
            color: colors.extraFill,
            label: `${es.home.extraLabel} ${formatCOP(extra)}`,
          },
        ]}
        legend
      />
    </View>
  );
}

export type MonthSummaryCardProps = {
  summary: MonthSummary;
};

export function MonthSummaryCard({ summary }: MonthSummaryCardProps) {
  const { spacing } = useTheme();

  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="subtitle">{es.home.thisMonth}</Text>
      <MonthBlock
        title={es.home.incomes}
        amount={summary.incomeTotal}
        kind="income"
        base={summary.incomeBase}
        extra={summary.incomeExtra}
      />
      <MonthBlock
        title={es.home.expenses}
        amount={summary.expenseTotal}
        kind="expense"
        base={summary.expenseBase}
        extra={summary.expenseExtra}
      />
      <Text variant="caption">{extraDependencyText(summary.extraDependency)}</Text>
    </Card>
  );
}
