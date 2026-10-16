import { startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import {
  AnimatedEntrance,
  AnimatedNumber,
  AppIcon,
  BottomSheet,
  Button,
  Card,
  ConnectivityPill,
  EmptyState,
  ErrorState,
  IconButton,
  ListRow,
  MonthSelector,
  MoneyText,
  NumericKeypad,
  ProgressBar,
  Screen,
  Skeleton,
  StackedBar,
  Tag,
  Text,
} from '@/components/ui';
import { applyKey } from '@/components/ui/utils/numericKeypad';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useProfile } from '@/features/auth/hooks/useProfile';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { usePendingTransactions } from '@/features/transactions/hooks/usePendingTransactions';
import {
  useDeleteTransaction,
  usePendingConfirmations,
  useUpdateTransaction,
} from '@/features/transactions/hooks/useTransactions';
import { confirmationUpdate } from '@/features/transactions/utils/confirm';
import {
  connectivityText,
  pendingNoticeText,
} from '@/features/transactions/utils/offlinePresentation';
import { monthRange } from '@/features/transactions/utils/transactions';
import { useAvailableToday } from '@/features/summary/hooks/useAvailableToday';
import { useMonthSummary } from '@/features/summary/hooks/useMonthSummary';
import { explainAvailable } from '@/features/summary/utils/explain';
import {
  cushionText,
  daysToPaymentText,
  extraDependencyText,
  heroAccessibilityLabel,
  heroProgress,
  heroSpentText,
  isNoMargin,
  isOverAllowance,
} from '@/features/summary/utils/home';
import type { TransactionWithRelations } from '@/features/transactions/api/transactions';
import { es } from '@/i18n/es';
import { formatCOP, parseMoneyInput } from '@/lib/money';
import { useSnackbarStore } from '@/lib/snackbar';
import { useConnectivity } from '@/lib/useConnectivity';
import { useTheme } from '@/theme';

type MonthBlockProps = {
  title: string;
  amount: number;
  kind: 'income' | 'expense';
  base: number;
  extra: number;
};

function MonthBlock({ title, amount, kind, base, extra }: MonthBlockProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="body">{title}</Text>
        <MoneyText amount={amount} kind={kind} signed={kind === 'expense'} />
      </View>
      <StackedBar
        segments={[
          { value: base, color: colors.brand, label: `${es.home.baseLabel} ${formatCOP(base)}` },
          { value: extra, color: colors.extra, label: `${es.home.extraLabel} ${formatCOP(extra)}` },
        ]}
        legend
      />
    </View>
  );
}

function RecentRow({ item, onPress }: { item: TransactionWithRelations; onPress: () => void }) {
  const { colors } = useTheme();
  const isTransfer = item.type === 'transfer';
  const isExtra = item.nature === 'extra';

  let title: string;
  let subtitle: string | undefined;

  if (isTransfer) {
    title = `${item.account?.name ?? '?'} → ${item.transfer_account?.name ?? '?'}`;
    subtitle = item.note ?? undefined;
  } else if (item.note) {
    title = item.note;
    subtitle = [item.category?.name, item.account?.name].filter(Boolean).join(' · ');
  } else {
    title = item.category?.name ?? '—';
    subtitle = item.account?.name ?? undefined;
  }

  const kind = item.type === 'income' ? 'income' : item.type === 'expense' ? 'expense' : 'neutral';

  return (
    <ListRow
      icon={
        isTransfer
          ? 'swap-horizontal-outline'
          : (item.category?.icon ?? 'ellipsis-horizontal-outline')
      }
      iconColor={isTransfer ? colors.textSecondary : (item.category?.color ?? colors.textSecondary)}
      title={title}
      subtitle={subtitle}
      tag={isExtra ? { label: es.home.extraLabel, tone: 'extra' } : undefined}
      trailing={<MoneyText amount={item.amount} kind={kind} signed />}
      onPress={onPress}
    />
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
      <Text variant="caption">{label}</Text>
      <Text variant="bodyStrong" color={colors.textPrimary}>
        {value}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const { colors, radii, spacing } = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const profile = useProfile();
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [helpOpen, setHelpOpen] = useState(false);

  const { summary, transactions, isLoading, isError, refetch } = useMonthSummary(monthAnchor);
  const availableQuery = useAvailableToday(monthAnchor);
  const accountsQuery = useAccounts();
  const isOnline = useConnectivity();
  const showSnackbar = useSnackbarStore((state) => state.show);
  const { pending } = usePendingTransactions();
  const pendingCount = pending.length;

  const { from, to } = monthRange(monthAnchor);
  const pendingConfirmationsQuery = usePendingConfirmations(from, to);
  const pendingConfirmations = pendingConfirmationsQuery.data ?? [];
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const [confirmationsOpen, setConfirmationsOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<TransactionWithRelations | null>(null);
  const [confirmAmountText, setConfirmAmountText] = useState('');

  const hero = availableQuery.result;
  const loading = isLoading || availableQuery.isLoading;
  const error = isError || availableQuery.isError;

  const displayName = profile.data ?? user?.email?.split('@')[0] ?? '';
  const accounts = accountsQuery.data ?? [];
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const lastFive = transactions.slice(0, 5);
  const firstUse = !loading && !error && transactions.length === 0;

  const noMargin = isNoMargin(hero.availableBase);
  const over = isOverAllowance(hero.spentToday, hero.allowanceToday);
  const heroColor = noMargin ? colors.expense : colors.textPrimary;
  const pillLabel = connectivityText(isOnline, pendingCount);

  function refresh() {
    void accountsQuery.refetch();
    void profile.refetch();
    refetch();
    availableQuery.refetch();
    void pendingConfirmationsQuery.refetch();
  }

  function openConfirmation(item: TransactionWithRelations) {
    setConfirmTarget(item);
    setConfirmAmountText(String(item.amount));
    setConfirmationsOpen(false);
  }

  function confirmSelected() {
    if (!confirmTarget) {
      return;
    }
    updateTransaction.mutate(
      { id: confirmTarget.id, input: confirmationUpdate(parseMoneyInput(confirmAmountText)) },
      { onSuccess: () => setConfirmTarget(null) },
    );
  }

  function discardSelected() {
    if (!confirmTarget) {
      return;
    }
    deleteTransaction.mutate(confirmTarget.id, { onSuccess: () => setConfirmTarget(null) });
  }

  return (
    <Screen scroll={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl,
        }}
        refreshControl={
          <RefreshControl refreshing={accountsQuery.isRefetching} onRefresh={refresh} />
        }
      >
        <View style={{ gap: spacing.xs }}>
          <Text variant="caption">
            {es.home.greeting}, {displayName || '…'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <MonthSelector
              value={monthAnchor}
              onChange={setMonthAnchor}
              labelVariant="title"
              style={{ flex: 1 }}
            />
            <IconButton
              icon="stats-chart-outline"
              onPress={() => router.push('/analysis')}
              accessibilityLabel={es.analysis.title}
            />
          </View>
        </View>

        <ConnectivityPill label={pillLabel} />

        {loading ? (
          <>
            <Skeleton variant="card" height={190} />
            <Skeleton variant="card" height={180} />
            <Skeleton variant="card" height={104} />
            <Skeleton variant="card" height={190} />
          </>
        ) : error ? (
          <View style={{ minHeight: 240 }}>
            <ErrorState onRetry={refresh} />
          </View>
        ) : (
          <>
            <AnimatedEntrance>
              {firstUse ? (
                <View style={{ minHeight: 240 }}>
                  <EmptyState
                    title={es.home.emptyTitle}
                    description={es.home.emptyDescription}
                    actionLabel={es.transactionForm.add}
                    onAction={() => router.push('/transaction-form')}
                  />
                </View>
              ) : (
                <Card style={{ borderRadius: radii.xl, padding: spacing.xl, gap: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Text variant="caption">{es.home.availableToday}</Text>
                    <Pressable
                      onPress={() => setHelpOpen(true)}
                      accessibilityRole="button"
                      accessibilityLabel={es.home.helpTitle}
                      hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
                    >
                      <AppIcon name="help-circle-outline" size={16} color={colors.textSecondary} />
                    </Pressable>
                  </View>

                  <AnimatedNumber
                    value={hero.remainingToday}
                    variant="display"
                    color={heroColor}
                    accessibilityLabel={heroAccessibilityLabel(
                      hero.remainingToday,
                      hero.allowanceToday,
                    )}
                  />

                  <ProgressBar
                    value={heroProgress(hero.spentToday, hero.allowanceToday)}
                    color={over ? colors.expense : colors.brand}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: spacing.md,
                    }}
                  >
                    <Text variant="caption">
                      {heroSpentText(hero.spentToday, hero.allowanceToday)}
                    </Text>
                    <Text variant="caption">
                      {daysToPaymentText(hero.daysToIncome, hero.usedFallbackHorizon)}
                    </Text>
                  </View>

                  {noMargin ? (
                    <View style={{ gap: spacing.xs }}>
                      <Text variant="bodyStrong" color={colors.expense}>
                        {es.home.noMarginTitle}
                      </Text>
                      <Text variant="caption">{es.home.noMarginHelp}</Text>
                    </View>
                  ) : null}

                  {hero.extraCushion > 0 ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Text variant="caption">{cushionText(hero.extraCushion)}</Text>
                      <Tag label={es.home.extraLabel} tone="extra" />
                    </View>
                  ) : null}

                  {hero.usedFallbackHorizon ? (
                    <Text variant="caption">{es.home.availableFallback}</Text>
                  ) : null}
                </Card>
              )}
            </AnimatedEntrance>

            {pendingCount > 0 ? (
              <Text variant="caption" color={colors.textSecondary}>
                {pendingNoticeText(pendingCount)}
              </Text>
            ) : null}

            {pendingConfirmations.length > 0 ? (
              <Pressable
                onPress={() => setConfirmationsOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={es.home.confirmationsTitle}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  backgroundColor: colors.surfaceRaised,
                  borderRadius: radii.md,
                  padding: spacing.md,
                }}
              >
                <AppIcon name="time-outline" size={20} color={colors.textSecondary} />
                <Text variant="bodyStrong" style={{ flex: 1 }}>
                  {es.home.pendingConfirmations.replace(
                    '{count}',
                    String(pendingConfirmations.length),
                  )}
                </Text>
                <AppIcon name="chevron-forward-outline" size={20} color={colors.textMuted} />
              </Pressable>
            ) : null}

            <AnimatedEntrance delayMs={40}>
              <Card style={{ gap: spacing.md }}>
                <Text variant="subtitle">{es.home.thisMonth}</Text>
                <MonthBlock
                  title={es.home.incomes}
                  amount={summary.incomeTotal}
                  kind="income"
                  base={summary.incomeBase}
                  extra={summary.incomeExtra}
                />
                <MonthBlock
                  title={es.home.expenses}
                  amount={summary.expenseTotal}
                  kind="expense"
                  base={summary.expenseBase}
                  extra={summary.expenseExtra}
                />
                <Text variant="caption">{extraDependencyText(summary.extraDependency)}</Text>
              </Card>
            </AnimatedEntrance>
          </>
        )}

        <AnimatedEntrance delayMs={80}>
          <View style={{ gap: spacing.sm }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text variant="subtitle">{es.home.accounts}</Text>
              <MoneyText amount={totalBalance} />
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
                  <Card key={account.account_id} style={{ width: 148, gap: spacing.xs }}>
                    <Text variant="caption">{account.name}</Text>
                    <MoneyText amount={account.balance} />
                  </Card>
                ))}
              </ScrollView>
            )}
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delayMs={120}>
          <View style={{ gap: spacing.sm }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text variant="subtitle">{es.home.recent}</Text>
              <Pressable
                onPress={() => router.push('/movements')}
                accessibilityRole="button"
                accessibilityLabel={es.home.viewAll}
                hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
              >
                <Text variant="caption" color={colors.brand}>
                  {es.home.viewAll} ›
                </Text>
              </Pressable>
            </View>
            {lastFive.length === 0 ? (
              <Text variant="caption">{es.home.emptyDescription}</Text>
            ) : (
              <Card style={{ gap: spacing.xs }}>
                {lastFive.map((item) => (
                  <RecentRow
                    key={item.id}
                    item={item}
                    onPress={() => {
                      if (!isOnline) {
                        showSnackbar(es.connectivity.needsConnection);
                        return;
                      }
                      router.push({ pathname: '/transaction-form', params: { id: item.id } });
                    }}
                  />
                ))}
              </Card>
            )}
          </View>
        </AnimatedEntrance>
      </ScrollView>

      <BottomSheet visible={helpOpen} onClose={() => setHelpOpen(false)}>
        <View style={{ gap: spacing.md }}>
          <Text variant="subtitle">{es.home.helpTitle}</Text>
          <Text variant="body" color={colors.textSecondary}>
            {es.home.helpBody}
          </Text>
          <View style={{ gap: spacing.xs }}>
            {explainAvailable(hero).map((line, index) => (
              <Text key={index} variant="caption">
                {line}
              </Text>
            ))}
          </View>
          <View style={{ gap: spacing.sm }}>
            <BreakdownRow label={es.home.helpLiquid} value={formatCOP(hero.liquidBalance)} />
            <BreakdownRow label={es.home.helpCommitted} value={formatCOP(hero.committed)} />
            {hero.extraCushion > 0 ? (
              <BreakdownRow label={es.home.helpCushion} value={formatCOP(hero.extraCushion)} />
            ) : null}
            <BreakdownRow label={es.home.helpDays} value={String(hero.daysToIncome)} />
          </View>
          <Button title={es.common.close} variant="secondary" onPress={() => setHelpOpen(false)} />
        </View>
      </BottomSheet>

      <BottomSheet visible={confirmationsOpen} onClose={() => setConfirmationsOpen(false)}>
        <Text variant="subtitle">{es.home.confirmationsTitle}</Text>
        <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
          {pendingConfirmations.map((item) => (
            <ListRow
              key={item.id}
              icon={item.category?.icon ?? 'time-outline'}
              iconColor={item.category?.color ?? colors.textSecondary}
              title={item.category?.name ?? '—'}
              subtitle={item.occurred_on}
              trailing={<MoneyText amount={item.amount} kind="expense" signed />}
              onPress={() => openConfirmation(item)}
            />
          ))}
        </View>
      </BottomSheet>

      <BottomSheet visible={confirmTarget !== null} onClose={() => setConfirmTarget(null)}>
        <View style={{ gap: spacing.md }}>
          <Text variant="subtitle">
            {confirmTarget?.category?.name ?? es.home.confirmationsTitle}
          </Text>
          <Text variant="caption">{confirmTarget?.occurred_on}</Text>
          <MoneyText
            amount={parseMoneyInput(confirmAmountText)}
            size="display"
            color={parseMoneyInput(confirmAmountText) > 0 ? colors.textPrimary : colors.textMuted}
            style={{ textAlign: 'center' }}
          />
          <NumericKeypad
            onDigit={(key) => setConfirmAmountText((current) => applyKey(current, key))}
            onBackspace={() => setConfirmAmountText((current) => applyKey(current, 'backspace'))}
            onClear={() => setConfirmAmountText('')}
          />
          <Button
            title={es.home.confirm}
            onPress={confirmSelected}
            loading={updateTransaction.isPending}
            disabled={updateTransaction.isPending || parseMoneyInput(confirmAmountText) <= 0}
          />
          <Button
            title={es.home.discard}
            variant="destructive"
            onPress={discardSelected}
            loading={deleteTransaction.isPending}
            disabled={deleteTransaction.isPending}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}
