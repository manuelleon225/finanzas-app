import { startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, View } from 'react-native';

import {
  BottomSheet,
  Button,
  ConnectivityPill,
  ErrorState,
  ListRow,
  MoneyText,
  NumericKeypad,
  ScreenScaffold,
  Skeleton,
  Text,
} from '@/components/ui';
import { applyKey } from '@/components/ui/utils/numericKeypad';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useProfile } from '@/features/auth/hooks/useProfile';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { useBudgets } from '@/features/budgets/hooks/useBudgets';
import {
  AccountsSection,
  DailySpendingCard,
  HomeHero,
  MonthSummaryCard,
  OnboardingCard,
  PendingBanner,
  QuickActions,
  RecentSection,
  type QuickActionType,
} from '@/features/summary/components';
import { useAvailableToday } from '@/features/summary/hooks/useAvailableToday';
import { useDailySpending } from '@/features/summary/hooks/useDailySpending';
import { useMonthSummary } from '@/features/summary/hooks/useMonthSummary';
import { explainAvailable } from '@/features/summary/utils/explain';
import { heroProgress, isNoMargin } from '@/features/summary/utils/home';
import {
  getOnboardingSteps,
  isOnboardingDone,
  type OnboardingStepId,
} from '@/features/summary/utils/onboarding';
import type { TransactionWithRelations } from '@/features/transactions/api/transactions';
import { usePendingTransactions } from '@/features/transactions/hooks/usePendingTransactions';
import {
  useDeleteTransaction,
  usePendingConfirmations,
  useUpdateTransaction,
} from '@/features/transactions/hooks/useTransactions';
import { confirmationUpdate } from '@/features/transactions/utils/confirm';
import { connectivityText } from '@/features/transactions/utils/offlinePresentation';
import { monthRange } from '@/features/transactions/utils/transactions';
import { es } from '@/i18n/es';
import { formatCOP, parseMoneyInput } from '@/lib/money';
import { useSnackbarStore } from '@/lib/snackbar';
import { useConnectivity } from '@/lib/useConnectivity';
import { useTheme } from '@/theme';

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

function HomeSectionsSkeleton() {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.lg }}>
      <Skeleton variant="card" height={180} />
      <View style={{ gap: spacing.sm }}>
        <Skeleton variant="line" width="35%" height={16} />
        <Skeleton variant="card" height={104} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <Skeleton variant="line" width="30%" height={16} />
        <Skeleton variant="card" height={200} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const profile = useProfile();
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [helpOpen, setHelpOpen] = useState(false);

  const { summary, transactions, isLoading, isError, refetch } = useMonthSummary(monthAnchor);
  const availableQuery = useAvailableToday(monthAnchor);
  const dailySpending = useDailySpending();
  const accountsQuery = useAccounts();
  const budgetsQuery = useBudgets();
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
  const pillLabel = connectivityText(isOnline, pendingCount);

  const steps = getOnboardingSteps({
    hasIncome: transactions.some((transaction) => transaction.type === 'income'),
    hasExpense: transactions.some((transaction) => transaction.type === 'expense'),
    hasBudget: (budgetsQuery.data ?? []).length > 0,
  });
  const showOnboarding = !loading && !error && !isOnboardingDone(steps);

  function refresh() {
    void accountsQuery.refetch();
    void profile.refetch();
    refetch();
    availableQuery.refetch();
    dailySpending.refetch();
    void pendingConfirmationsQuery.refetch();
    void budgetsQuery.refetch();
  }

  function onQuickAction(type: QuickActionType) {
    router.push({ pathname: '/transaction-form', params: { type } });
  }

  function onStepPress(id: OnboardingStepId) {
    if (id === 'income') {
      router.push({ pathname: '/transaction-form', params: { type: 'income' } });
    } else if (id === 'expense') {
      router.push('/transaction-form');
    } else {
      router.push('/budgets');
    }
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

  function openRecent(item: TransactionWithRelations) {
    if (!isOnline) {
      showSnackbar(es.connectivity.needsConnection);
      return;
    }
    router.push({ pathname: '/transaction-form', params: { id: item.id } });
  }

  return (
    <ScreenScaffold
      variant="block"
      contentContainerStyle={{ gap: spacing.lg }}
      refreshControl={
        <RefreshControl refreshing={accountsQuery.isRefetching} onRefresh={refresh} />
      }
      header={
        <HomeHero
          displayName={displayName}
          monthAnchor={monthAnchor}
          onMonthChange={setMonthAnchor}
          loading={loading}
          firstUse={firstUse}
          noMargin={noMargin}
          remainingToday={hero.remainingToday}
          allowanceToday={hero.allowanceToday}
          spentToday={hero.spentToday}
          progress={heroProgress(hero.spentToday, hero.allowanceToday)}
          daysToIncome={hero.daysToIncome}
          usedFallbackHorizon={hero.usedFallbackHorizon}
          extraCushion={hero.extraCushion}
          onHelpPress={() => setHelpOpen(true)}
        />
      }
    >
      {error ? (
        <View style={{ minHeight: 240 }}>
          <ErrorState onRetry={refresh} />
        </View>
      ) : (
        <>
          <PendingBanner
            count={pendingConfirmations.length}
            onPress={() => setConfirmationsOpen(true)}
          />

          <ConnectivityPill label={pillLabel} />

          <QuickActions onSelect={onQuickAction} />

          {showOnboarding ? <OnboardingCard steps={steps} onPressStep={onStepPress} /> : null}

          {loading ? (
            <HomeSectionsSkeleton />
          ) : (
            <>
              <MonthSummaryCard summary={summary} />
              <DailySpendingCard
                daily={dailySpending.daily}
                isLoading={dailySpending.isLoading}
                isError={dailySpending.isError}
                onRetry={dailySpending.refetch}
              />
              <AccountsSection accounts={accounts} total={totalBalance} />
              <RecentSection
                items={lastFive}
                onPressItem={openRecent}
                onViewAll={() => router.push('/movements')}
              />
            </>
          )}
        </>
      )}

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
    </ScreenScaffold>
  );
}
