import { formatCOP } from '@/lib/money';
import { useTheme } from '@/theme';

import { Text, type TextProps } from './Text';

export type MoneyKind = 'income' | 'expense' | 'neutral';

export type MoneyTextProps = Omit<TextProps, 'children'> & {
  amount: number;
  kind?: MoneyKind;
  signed?: boolean;
};

export function MoneyText({ amount, kind = 'neutral', signed = false, ...rest }: MoneyTextProps) {
  const { colors } = useTheme();

  const color =
    kind === 'income' ? colors.income : kind === 'expense' ? colors.expense : colors.textPrimary;

  const sign = signed ? (kind === 'income' ? '+' : kind === 'expense' ? '-' : '') : '';
  const formatted = `${sign}${formatCOP(signed ? Math.abs(amount) : amount)}`;

  return (
    <Text variant="money" color={color} accessibilityLabel={formatted} {...rest}>
      {formatted}
    </Text>
  );
}
