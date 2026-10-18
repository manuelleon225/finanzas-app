import { addMonths, isBefore, parseISO, startOfMonth, subMonths } from 'date-fns';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { formatMonthLabel } from '@/features/transactions/utils/transactions';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

import { IconButton } from './IconButton';
import { Text, type TextVariant } from './Text';
import { type IconSize } from './AppIcon';

export type MonthSelectorTone = 'default' | 'onBlock';

export type MonthSelectorProps = {
  value: Date | string;
  onChange: (next: Date) => void;
  maxDate?: Date;
  labelVariant?: TextVariant;
  tone?: MonthSelectorTone;
  iconSize?: IconSize;
  style?: ViewStyle;
};

function toMonthDate(value: Date | string): Date {
  const date = value instanceof Date ? value : parseISO(value);
  return startOfMonth(date);
}

export function MonthSelector({
  value,
  onChange,
  maxDate,
  labelVariant = 'subtitle',
  tone = 'default',
  iconSize = 24,
  style,
}: MonthSelectorProps) {
  const { colors, spacing } = useTheme();
  const anchor = toMonthDate(value);
  const maxAnchor = startOfMonth(maxDate ?? new Date());
  const canGoNext = isBefore(anchor, maxAnchor);
  const color = tone === 'onBlock' ? colors.onBrand : undefined;

  return (
    <View style={[styles.row, { gap: spacing.sm }, style]}>
      <IconButton
        icon="chevron-back-outline"
        onPress={() => onChange(subMonths(anchor, 1))}
        accessibilityLabel={es.transactionList.previousMonth}
        color={color}
        iconSize={iconSize}
      />
      <Text variant={labelVariant} align="center" color={color} style={styles.label}>
        {formatMonthLabel(anchor)}
      </Text>
      <IconButton
        icon="chevron-forward-outline"
        onPress={() => onChange(addMonths(anchor, 1))}
        accessibilityLabel={es.transactionList.nextMonth}
        color={color}
        iconSize={iconSize}
        disabled={!canGoNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flex: 1,
  },
});
