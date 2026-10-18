import { ScrollView, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { IconTile } from '@/components/ui/IconTile';
import { MoneyText } from '@/components/ui/MoneyText';
import { Text } from '@/components/ui/Text';
import { useAccountTile } from '@/components/ui/tileHelpers';
import type { AccountWithBalance } from '@/features/accounts/api/accounts';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

const ACCOUNT_CARD_WIDTH = 148;

function AccountCard({ account }: { account: AccountWithBalance }) {
  const { spacing } = useTheme();
  const tile = useAccountTile({ type: account.type });

  return (
    <Card style={{ width: ACCOUNT_CARD_WIDTH, gap: spacing.sm }}>
      <IconTile icon={tile.icon} tileKey={tile.tileKey} size={32} />
      <View style={{ gap: spacing.xs }}>
        <Text variant="caption" numberOfLines={1}>
          {account.name}
        </Text>
        <MoneyText amount={account.balance} />
      </View>
    </Card>
  );
}

export type AccountsSectionProps = {
  accounts: AccountWithBalance[];
  total: number;
};

export function AccountsSection({ accounts, total }: AccountsSectionProps) {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="subtitle">{es.home.accounts}</Text>
        <MoneyText amount={total} />
      </View>
      {accounts.length === 0 ? (
        <Text variant="caption">{es.home.noAccounts}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.md }}
        >
          {accounts.map((account) => (
            <AccountCard key={account.account_id} account={account} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
