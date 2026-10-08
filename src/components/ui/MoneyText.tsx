import { formatCOP } from '@/lib/money';
import { useTheme } from '@/theme';

import { Text, type TextProps } from './Text';

export type MoneyKind = 'income' | 'expense' | 'neutral';

export type MoneySize = 'displayLg' | 'display' | 'bodyStrong' | 'caption';

export type MoneyTextProps = Omit<TextProps, 'children'> & {
  amount: number;
  kind?: MoneyKind;
  signed?: boolean;
  size?: MoneySize;
};

const SIZE_STYLE: Record<MoneySize, { fontSize: number; lineHeight: number }> = {
  displayLg: { fontSize: 40, lineHeight: 48 },
  display: { fontSize: 34, lineHeight: 40 },
  bodyStrong: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 16 },
};

export function MoneyText({
  amount,
  kind = 'neutral',
  signed = false,
  size = 'bodyStrong',
  ...rest
}: MoneyTextProps) {
  const { colors } = useTheme();

  const color =
    kind === 'income' ? colors.income : kind === 'expense' ? colors.expense : colors.textPrimary;

  const sign = signed ? (kind === 'income' ? '+' : kind === 'expense' ? '-' : '') : '';
  const formatted = `${sign}${formatCOP(signed ? Math.abs(amount) : amount)}`;

  return (
    <Text
      variant="money"
      color={color}
      accessibilityLabel={formatted}
      style={[size !== 'bodyStrong' ? SIZE_STYLE[size] : null]}
      {...rest}
    >
      {formatted}
    </Text>
  );
}
