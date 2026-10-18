import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { IconTile } from '@/components/ui/IconTile';
import { ListRow } from '@/components/ui/ListRow';
import { MoneyText } from '@/components/ui/MoneyText';
import { Text } from '@/components/ui/Text';
import { resolveCategoryTile } from '@/components/ui/tileHelpers';
import type { TransactionWithRelations } from '@/features/transactions/api/transactions';
import { es } from '@/i18n/es';
import { useTheme, type TileKey } from '@/theme';

function recentRowModel(item: TransactionWithRelations): {
  tile: { icon: string; tileKey: TileKey };
  title: string;
  subtitle?: string;
  kind: 'income' | 'expense' | 'neutral';
} {
  if (item.type === 'transfer') {
    return {
      tile: { icon: 'swap-horizontal', tileKey: 'gray' },
      title: `${item.account?.name ?? '?'} → ${item.transfer_account?.name ?? '?'}`,
      subtitle: item.note ?? undefined,
      kind: 'neutral',
    };
  }

  const tile = resolveCategoryTile({
    name: item.category?.name ?? 'Otros',
    kind: item.type === 'income' ? 'income' : 'expense',
    icon: item.category?.icon ?? 'ellipsis-horizontal',
    color: item.category?.color,
  });
  const kind = item.type === 'income' ? 'income' : 'expense';

  if (item.note) {
    return {
      tile,
      title: item.note,
      subtitle: [item.category?.name, item.account?.name].filter(Boolean).join(' · '),
      kind,
    };
  }

  return {
    tile,
    title: item.category?.name ?? '—',
    subtitle: item.account?.name ?? undefined,
    kind,
  };
}

export type RecentSectionProps = {
  items: TransactionWithRelations[];
  onPressItem: (item: TransactionWithRelations) => void;
  onViewAll: () => void;
};

export function RecentSection({ items, onPressItem, onViewAll }: RecentSectionProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="subtitle">{es.home.recent}</Text>
        <Pressable
          onPress={onViewAll}
          accessibilityRole="button"
          accessibilityLabel={es.home.viewAll}
          hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
        >
          <Text variant="caption" color={colors.brandText}>
            {es.home.viewAll} ›
          </Text>
        </Pressable>
      </View>
      {items.length === 0 ? (
        <Text variant="caption">{es.home.emptyDescription}</Text>
      ) : (
        <Card style={{ gap: spacing.xs }}>
          {items.map((item) => {
            const model = recentRowModel(item);
            return (
              <ListRow
                key={item.id}
                leading={<IconTile icon={model.tile.icon} tileKey={model.tile.tileKey} size={40} />}
                title={model.title}
                subtitle={model.subtitle}
                tag={
                  item.nature === 'extra' ? { label: es.home.extraLabel, tone: 'extra' } : undefined
                }
                trailing={<MoneyText amount={item.amount} kind={model.kind} signed />}
                onPress={() => onPressItem(item)}
              />
            );
          })}
        </Card>
      )}
    </View>
  );
}
