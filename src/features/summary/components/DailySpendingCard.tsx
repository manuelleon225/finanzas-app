import { format, parseISO } from 'date-fns';
import { es as dateFnsEs } from 'date-fns/locale';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { es } from '@/i18n/es';
import { select } from '@/lib/haptics';
import { formatCompactCOP, formatPesos } from '@/lib/money';
import { useTheme } from '@/theme';

import {
  getDailyAverage,
  getWeekdayInitial,
  type DailySpendingPoint,
} from '../utils/dailySpending';

const BAR_MAX_HEIGHT = 64;
const BAR_MIN_HEIGHT = 4;
const LABEL_RESERVE = 22;

export type DailySpendingCardProps = {
  daily: DailySpendingPoint[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export function DailySpendingCard({
  daily,
  isLoading = false,
  isError = false,
  onRetry,
}: DailySpendingCardProps) {
  const { colors, radii, spacing } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (isLoading) {
    return <Skeleton variant="card" height={168} />;
  }

  if (isError) {
    return (
      <Card>
        <ErrorState onRetry={onRetry} />
      </Card>
    );
  }

  const total = daily.reduce((sum, point) => sum + point.total, 0);
  const average = getDailyAverage(daily);
  const max = Math.max(...daily.map((point) => point.total), 0);
  const hasSpending = total > 0;
  const today = daily[daily.length - 1]?.date;

  const summaryLabel = es.home.dailySummary
    .replace('{total}', formatPesos(total))
    .replace('{promedio}', formatPesos(average));

  function barLabel(point: DailySpendingPoint): string {
    const dayName = format(parseISO(point.date), 'EEEE', { locale: dateFnsEs });
    return es.home.dailyBar.replace('{dia}', dayName).replace('{monto}', formatPesos(point.total));
  }

  function onBarPress(date: string) {
    select();
    setSelectedDate((current) => (current === date ? null : date));
  }

  return (
    <Card style={{ gap: spacing.lg }}>
      <View
        accessible
        accessibilityLabel={summaryLabel}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Text variant="subtitle">{es.home.last7Days}</Text>
        <Text variant="caption" color={colors.textSecondary}>
          {es.home.dailyAverage.replace('{amount}', formatCompactCOP(average))}
        </Text>
      </View>

      {hasSpending ? (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {daily.map((point) => {
            const barHeight = Math.max(
              BAR_MIN_HEIGHT,
              Math.round((point.total / max) * BAR_MAX_HEIGHT),
            );
            const selected = selectedDate === point.date;
            const isToday = point.date === today;

            return (
              <Pressable
                key={point.date}
                accessibilityRole="button"
                accessibilityLabel={barLabel(point)}
                onPress={() => onBarPress(point.date)}
                style={{ flex: 1, alignItems: 'center' }}
              >
                <View
                  style={{
                    width: '100%',
                    height: BAR_MAX_HEIGHT + LABEL_RESERVE,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                >
                  {selected ? (
                    <View
                      style={{
                        backgroundColor: colors.surfaceHigh,
                        borderRadius: radii.sm,
                        paddingHorizontal: spacing.xs,
                        paddingVertical: 2,
                        marginBottom: spacing.xs,
                      }}
                    >
                      <Text variant="micro" color={colors.textPrimary}>
                        {formatCompactCOP(point.total)}
                      </Text>
                    </View>
                  ) : null}
                  <View
                    style={{
                      width: '100%',
                      height: barHeight,
                      borderRadius: radii.sm,
                      backgroundColor: isToday ? colors.brand : colors.surfaceHigh,
                    }}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text variant="caption" align="center" color={colors.textSecondary}>
          {es.home.dailyEmpty}
        </Text>
      )}

      {hasSpending ? (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {daily.map((point) => (
            <Text
              key={point.date}
              variant="caption"
              align="center"
              color={colors.textMuted}
              style={{ flex: 1 }}
            >
              {getWeekdayInitial(point.date)}
            </Text>
          ))}
        </View>
      ) : null}
    </Card>
  );
}
