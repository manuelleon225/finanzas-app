import { View } from 'react-native';

import { IconTile } from '@/components/ui/IconTile';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { es } from '@/i18n/es';
import { tap } from '@/lib/haptics';
import { useTheme, type TileKey } from '@/theme';

export type QuickActionType = 'expense' | 'income' | 'transfer';

export type QuickActionsProps = {
  onSelect: (type: QuickActionType) => void;
};

type QuickAction = {
  type: QuickActionType;
  label: string;
  accessibilityLabel: string;
  icon: string;
  tileKey: TileKey;
};

const ACTIONS: QuickAction[] = [
  {
    type: 'expense',
    label: es.home.quickExpense,
    accessibilityLabel: es.home.quickExpenseA11y,
    icon: 'arrow-up',
    tileKey: 'coral',
  },
  {
    type: 'income',
    label: es.home.quickIncome,
    accessibilityLabel: es.home.quickIncomeA11y,
    icon: 'arrow-down',
    tileKey: 'green',
  },
  {
    type: 'transfer',
    label: es.home.quickTransfer,
    accessibilityLabel: es.home.quickTransferA11y,
    icon: 'swap-horizontal',
    tileKey: 'blue',
  },
];

export function QuickActions({ onSelect }: QuickActionsProps) {
  const { spacing } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: spacing.md }}>
      {ACTIONS.map((action) => (
        <PressableScale
          key={action.type}
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel}
          onPress={() => {
            tap();
            onSelect(action.type);
          }}
          style={{
            flex: 1,
            minHeight: 44,
            alignItems: 'center',
            gap: spacing.xs,
            paddingVertical: spacing.xs,
          }}
        >
          <IconTile icon={action.icon} tileKey={action.tileKey} size={40} />
          <Text variant="caption" align="center">
            {action.label}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
}
