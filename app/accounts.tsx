import { Redirect, useRouter } from 'expo-router';
import { Alert, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  IconButton,
  IconTile,
  ListRow,
  LoadingState,
  MoneyText,
  ScreenHeader,
  ScreenScaffold,
  Skeleton,
  SwipeableRow,
  SwipeableRowGroup,
  Text,
  useSwipeableRowGroup,
} from '@/components/ui';
import { resolveAccountTile } from '@/components/ui/tileHelpers';
import type { AccountWithBalance } from '@/features/accounts/api/accounts';
import { useAccounts, useArchiveAccount } from '@/features/accounts/hooks/useAccounts';
import { accountSubtitle } from '@/features/accounts/utils/accountRow';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

function AccountRow({
  account,
  onEdit,
  onArchive,
}: {
  account: AccountWithBalance;
  onEdit: (account: AccountWithBalance) => void;
  onArchive: (account: AccountWithBalance) => void;
}) {
  const group = useSwipeableRowGroup();
  const tile = resolveAccountTile({ type: account.type });

  return (
    <SwipeableRow
      onDelete={() => onArchive(account)}
      actionLabel={es.accounts.archive}
      actionIcon="archive-outline"
    >
      <ListRow
        leading={<IconTile icon={tile.icon} tileKey={tile.tileKey} size={40} />}
        title={account.name}
        subtitle={accountSubtitle({
          name: account.name,
          type: account.type,
          countsAsLiquid: account.counts_as_liquid,
        })}
        trailing={<MoneyText amount={account.balance} />}
        onPress={() => {
          group?.closeActive();
          onEdit(account);
        }}
      />
    </SwipeableRow>
  );
}

export default function AccountsScreen() {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const { data, isLoading, isError, refetch } = useAccounts();
  const archiveAccount = useArchiveAccount();

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const accounts = data ?? [];
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  function confirmArchive(account: AccountWithBalance) {
    if (accounts.length <= 1) {
      Alert.alert(es.accounts.title, es.accounts.cannotArchiveLast);
      return;
    }

    Alert.alert(es.accounts.confirmArchiveTitle, es.accounts.confirmArchiveMessage, [
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.accounts.archive,
        style: 'destructive',
        onPress: () => {
          archiveAccount.mutate(account.account_id);
        },
      },
    ]);
  }

  return (
    <ScreenScaffold
      variant="plain"
      contentContainerStyle={{ gap: spacing.md }}
      header={
        <ScreenHeader
          left={
            <IconButton
              icon="chevron-back-outline"
              onPress={() => router.back()}
              accessibilityLabel={es.common.back}
            />
          }
          title={es.accounts.title}
          actions={
            <IconButton
              icon="add-outline"
              onPress={() => router.push('/account-form')}
              accessibilityLabel={es.accounts.newAccount}
            />
          }
        />
      }
    >
      <View
        style={{
          backgroundColor: colors.brand,
          borderRadius: radii.xl,
          padding: spacing.lg,
          gap: spacing.xs,
        }}
      >
        <Text variant="caption" color={colors.onBrandMuted}>
          {es.accounts.totalBalance}
        </Text>
        <MoneyText amount={totalBalance} size="display" color={colors.onBrand} />
      </View>

      {isLoading ? (
        <View style={{ gap: spacing.md }}>
          <Skeleton variant="card" height={80} />
          <Skeleton variant="card" height={80} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          illustration="wallet"
          title={es.accounts.emptyTitle}
          description={es.accounts.emptyDescription}
          actionLabel={es.accounts.newAccount}
          onAction={() => router.push('/account-form')}
        />
      ) : (
        <SwipeableRowGroup>
          {accounts.map((account) => (
            <AccountRow
              key={account.account_id}
              account={account}
              onEdit={(target) =>
                router.push({
                  pathname: '/account-form',
                  params: { id: target.account_id },
                })
              }
              onArchive={confirmArchive}
            />
          ))}
        </SwipeableRowGroup>
      )}
    </ScreenScaffold>
  );
}
