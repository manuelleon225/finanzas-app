import { formatCOP } from '@/lib/money';
import { fontSizes, lineHeights, useTheme } from '@/theme';

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
  displayLg: { fontSize: fontSizes.displayLg, lineHeight: lineHeights.displayLg },
  display: { fontSize: fontSizes.display, lineHeight: lineHeights.display },
  bodyStrong: { fontSize: fontSizes.bodyStrong, lineHeight: lineHeights.bodyStrong },
  caption: { fontSize: fontSizes.caption, lineHeight: lineHeights.caption },
};

export function MoneyText({
  amount,
  kind = 'neutral',
  signed = false,
  size = 'bodyStrong',
  style,
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
      style={[size !== 'bodyStrong' ? SIZE_STYLE[size] : null, style]}
      {...rest}
    >
      {formatted}
    </Text>
  );
}
