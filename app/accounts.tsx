import { Redirect, useRouter } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  MoneyText,
  Screen,
  Text,
} from '@/components/ui';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import type { AccountWithBalance } from '@/features/accounts/api/accounts';
import { useAccounts, useArchiveAccount } from '@/features/accounts/hooks/useAccounts';
import { es } from '@/i18n/es';
import { useTheme } from '@/theme';

export default function AccountsScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const { data, isLoading, isError, refetch } = useAccounts();
  const archiveAccount = useArchiveAccount();

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
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
    <Screen scroll>
      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={8}>
            <Text variant="caption" color={colors.primary}>
              {es.common.back}
            </Text>
          </Pressable>
          <Text variant="title">{es.accounts.title}</Text>
        </View>

        <Card
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text variant="body">{es.accounts.totalBalance}</Text>
          <MoneyText amount={totalBalance} />
        </Card>

        <Button title={es.accounts.newAccount} onPress={() => router.push('/account-form')} />

        {accounts.length === 0 ? (
          <EmptyState
            title={es.accounts.emptyTitle}
            description={es.accounts.emptyDescription}
            actionLabel={es.accounts.newAccount}
            onAction={() => router.push('/account-form')}
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {accounts.map((account) => (
              <Card key={account.account_id} style={{ gap: spacing.sm }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: spacing.md,
                  }}
                >
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <Text variant="body">{account.name}</Text>
                    <Text variant="caption">{es.accountTypes[account.type]}</Text>
                  </View>
                  <MoneyText amount={account.balance} />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.lg }}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/account-form',
                        params: { id: account.account_id },
                      })
                    }
                    accessibilityRole="button"
                    hitSlop={8}
                  >
                    <Text variant="caption" color={colors.primary}>
                      {es.common.edit}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => confirmArchive(account)}
                    accessibilityRole="button"
                    hitSlop={8}
                  >
                    <Text variant="caption" color={colors.danger}>
                      {es.accounts.archive}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
