import { addMonths, startOfMonth, subMonths } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Card, Fab, MoneyText, Screen, Text } from '@/components/ui';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useProfile } from '@/features/auth/hooks/useProfile';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { CategoryIcon } from '@/features/categories/components/CategoryIcon';
import { useMonthSummary } from '@/features/summary/hooks/useMonthSummary';
import { formatMonthLabel } from '@/features/transactions/utils/transactions';
import { es } from '@/i18n/es';
import { formatCOP } from '@/lib/money';
import { useTheme } from '@/theme';

function SkeletonBlock({ height }: { height: number }) {
  const { colors, radii } = useTheme();
  return (
    <View
      style={{
        height,
        borderRadius: radii.md,
        backgroundColor: colors.border,
        opacity: 0.5,
      }}
    />
  );
}

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const profile = useProfile();
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const { summary, transactions, isLoading, isError, refetch } = useMonthSummary(monthAnchor);
  const accountsQuery = useAccounts();

  const displayName = profile.data ?? user?.email?.split('@')[0] ?? '';
  const totalBalance = (accountsQuery.data ?? []).reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const lastFive = transactions.slice(0, 5);

  const baseIncomePct =
    summary.incomeTotal > 0 ? (summary.incomeBase / summary.incomeTotal) * 100 : 0;
  const baseExpensePct =
    summary.expenseTotal > 0 ? (summary.expenseBase / summary.expenseTotal) * 100 : 0;

  function showAvailableHelp() {
    Alert.alert(es.home.helpTitle, es.home.helpBody);
  }

  return (
    <Screen
      scroll={false}
      overlay={
        <Fab
          onPress={() => router.push('/transaction-form')}
          accessibilityLabel={es.transactionForm.add}
        />
      }
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl,
        }}
        refreshControl={
          <RefreshControl
            refreshing={accountsQuery.isRefetching}
            onRefresh={() => {
              void accountsQuery.refetch();
              void profile.refetch();
              refetch();
            }}
          />
        }
      >
        <View style={{ gap: spacing.xs }}>
          <Text variant="title">
            {es.home.greeting}, {displayName || '…'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Pressable
              onPress={() => setMonthAnchor((anchor) => subMonths(anchor, 1))}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={es.transactionList.previousMonth}
            >
              <Text variant="subtitle" color={colors.primary}>
                ‹
              </Text>
            </Pressable>
            <Text variant="subtitle">{formatMonthLabel(monthAnchor)}</Text>
            <Pressable
              onPress={() => setMonthAnchor((anchor) => addMonths(anchor, 1))}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={es.transactionList.nextMonth}
            >
              <Text variant="subtitle" color={colors.primary}>
                ›
              </Text>
            </Pressable>
          </View>
        </View>

        {isLoading ? (
          <>
            <SkeletonBlock height={120} />
            <SkeletonBlock height={96} />
            <SkeletonBlock height={96} />
            <SkeletonBlock height={110} />
          </>
        ) : isError ? (
          <Card>
            <Text variant="body">{es.common.error}</Text>
            <Pressable onPress={refetch} style={{ marginTop: spacing.sm }}>
              <Text variant="caption" color={colors.primary}>
                {es.common.retry}
              </Text>
            </Pressable>
          </Card>
        ) : (
          <>
            <Card style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text variant="body">{es.home.availableToday}</Text>
                <Pressable
                  onPress={showAvailableHelp}
                  accessibilityRole="button"
                  accessibilityLabel={es.home.helpTitle}
                  hitSlop={8}
                >
                  <Text variant="caption" color={colors.textSecondary}>
                    ?
                  </Text>
                </Pressable>
              </View>
              <MoneyText
                amount={Math.round(summary.availableToday)}
                style={{ fontSize: 40, lineHeight: 48 }}
              />
              <Text variant="caption">
                {es.home.availableThisMonth}: {formatCOP(summary.availableMonth)}
              </Text>
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="body">{es.home.incomes}</Text>
                  <MoneyText amount={summary.incomeTotal} kind="income" />
                  <Text variant="caption">
                    {es.home.baseLabel} {formatCOP(summary.incomeBase)} · {es.home.extraLabel}{' '}
                    {formatCOP(summary.incomeExtra)}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { backgroundColor: colors.income, width: `${baseIncomePct}%` },
                    ]}
                  />
                </View>
              </View>
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="body">{es.home.expenses}</Text>
                  <MoneyText amount={summary.expenseTotal} kind="expense" signed />
                  <Text variant="caption">
                    {es.home.baseLabel} {formatCOP(summary.expenseBase)} · {es.home.extraLabel}{' '}
                    {formatCOP(summary.expenseExtra)}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { backgroundColor: colors.expense, width: `${baseExpensePct}%` },
                    ]}
                  />
                </View>
              </View>
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <Text variant="body">{es.home.extraDependency}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: colors.extra,
                      width: `${Math.min(100, summary.extraDependency)}%`,
                    },
                  ]}
                />
              </View>
              <Text variant="caption">
                {summary.extraDependency}% — {es.home.extraDependencyHint}
              </Text>
            </Card>
          </>
        )}

        <Card style={{ gap: spacing.sm }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text variant="body">{es.home.totalBalance}</Text>
            <MoneyText amount={totalBalance} />
          </View>
          <View style={{ gap: spacing.xs }}>
            {(accountsQuery.data ?? []).map((account) => (
              <View key={account.account_id} style={styles.rowBetween}>
                <Text variant="caption">{account.name}</Text>
                <MoneyText amount={account.balance} />
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Pressable
            onPress={() => router.push('/movements')}
            style={styles.rowBetween}
            accessibilityRole="button"
          >
            <Text variant="body">{es.home.recentMovements}</Text>
            <Text variant="caption" color={colors.primary}>
              {es.home.viewAll} ›
            </Text>
          </Pressable>
          <View style={{ gap: spacing.sm }}>
            {lastFive.length === 0 ? (
              <Text variant="caption">{es.home.emptyDescription}</Text>
            ) : (
              lastFive.map((item) => (
                <View key={item.id} style={styles.txRow}>
                  <CategoryIcon
                    icon={item.category?.icon ?? 'ellipsis-horizontal-outline'}
                    color={item.category?.color ?? colors.textSecondary}
                    size={18}
                  />
                  <Text variant="caption" style={{ flex: 1 }}>
                    {item.category?.name ?? '—'}
                  </Text>
                  <MoneyText
                    amount={item.amount}
                    kind={
                      item.type === 'income'
                        ? 'income'
                        : item.type === 'expense'
                          ? 'expense'
                          : 'neutral'
                    }
                  />
                </View>
              ))
            )}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  barTrack: {
    width: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
