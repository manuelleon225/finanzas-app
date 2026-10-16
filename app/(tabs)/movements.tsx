import { format, startOfMonth, subDays } from 'date-fns';
import { Redirect, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';

import {
  AnimatedEntrance,
  AppIcon,
  BottomSheet,
  Button,
  Card,
  Chip,
  ConnectivityPill,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  ListRow,
  LoadingState,
  MoneyText,
  MonthSelector,
  Screen,
  ScreenHeader,
  Skeleton,
  Snackbar,
  SwipeableRow,
  SwipeableRowGroup,
  Text,
  useSwipeableRowGroup,
} from '@/components/ui';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import type { Category } from '@/features/categories/api/categories';
import { useCategories } from '@/features/categories/hooks/useCategories';
import type {
  Nature,
  TransactionType,
  TransactionWithRelations,
} from '@/features/transactions/api/transactions';
import {
  usePendingTransactions,
  type PendingTransaction,
} from '@/features/transactions/hooks/usePendingTransactions';
import {
  useCreateTransaction,
  useDeleteTransaction,
  usePendingConfirmations,
  useTransactions,
  useTransactionsInRange,
} from '@/features/transactions/hooks/useTransactions';
import {
  connectivityText,
  mergePendingByDay,
} from '@/features/transactions/utils/offlinePresentation';
import {
  calculateTotals,
  formatDayHeader,
  groupTransactionsByDay,
  monthRange,
  toInsertPayload,
} from '@/features/transactions/utils/transactions';
import { es } from '@/i18n/es';
import { todayISO } from '@/lib/dates';
import { useSnackbarStore } from '@/lib/snackbar';
import { useConnectivity } from '@/lib/useConnectivity';
import { useTheme } from '@/theme';
import type { TablesInsert } from '@/types/database';

const ROW_HEIGHT = 64;
const HEADER_HEIGHT = 40;
const EMPTY_TRANSACTIONS: TransactionWithRelations[] = [];

type MovementItem =
  | { kind: 'transaction'; key: string; transaction: TransactionWithRelations }
  | { kind: 'pending'; key: string; mutationId: number; payload: TablesInsert<'transactions'> }
  | { kind: 'failed'; key: string; mutationId: number; payload: TablesInsert<'transactions'> }
  | { kind: 'confirm'; key: string; transaction: TransactionWithRelations };

type DaySection = {
  title: string;
  total: number;
  data: MovementItem[];
};

const MovementRow = memo(function MovementRow({
  item,
  onEdit,
  onDelete,
}: {
  item: TransactionWithRelations;
  onEdit: (transaction: TransactionWithRelations) => void;
  onDelete: (transaction: TransactionWithRelations) => void;
}) {
  const { colors } = useTheme();
  const group = useSwipeableRowGroup();

  const isExtra = item.nature === 'extra';
  const isTransfer = item.type === 'transfer';

  const title = isTransfer
    ? `${item.account?.name ?? '?'} → ${item.transfer_account?.name ?? '?'}`
    : item.note || item.category?.name || '—';
  const subtitle = isTransfer
    ? (item.note ?? undefined)
    : item.note
      ? [item.category?.name, item.account?.name].filter(Boolean).join(' · ')
      : (item.account?.name ?? undefined);

  const kind = item.type === 'income' ? 'income' : item.type === 'expense' ? 'expense' : 'neutral';

  return (
    <AnimatedEntrance>
      <SwipeableRow onDelete={() => onDelete(item)}>
        <ListRow
          icon={
            isTransfer
              ? 'swap-horizontal-outline'
              : (item.category?.icon ?? 'ellipsis-horizontal-outline')
          }
          iconColor={
            isTransfer ? colors.textSecondary : (item.category?.color ?? colors.textSecondary)
          }
          title={title}
          subtitle={subtitle}
          tag={isExtra ? { label: es.transactionList.extra, tone: 'extra' } : undefined}
          trailing={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {item.recurring_rule_id ? (
                <AppIcon
                  name="repeat-outline"
                  size={16}
                  color={colors.textSecondary}
                  accessibilityLabel={es.transactionList.recurring}
                />
              ) : null}
              <MoneyText amount={item.amount} kind={kind} signed />
            </View>
          }
          onPress={() => {
            group?.closeActive();
            onEdit(item);
          }}
          style={{ flex: 1, height: ROW_HEIGHT }}
        />
      </SwipeableRow>
    </AnimatedEntrance>
  );
});

function OfflineRow({
  payload,
  category,
  accountName,
  transferAccountName,
  failed,
  onPress,
}: {
  payload: TablesInsert<'transactions'>;
  category?: Category;
  accountName?: string;
  transferAccountName?: string;
  failed: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const isTransfer = payload.type === 'transfer';

  const title = isTransfer
    ? `${accountName ?? '?'} → ${transferAccountName ?? '?'}`
    : payload.note || category?.name || '—';
  const subtitle = isTransfer
    ? (payload.note ?? undefined)
    : payload.note
      ? [category?.name, accountName].filter(Boolean).join(' · ')
      : accountName;

  const kind =
    payload.type === 'income' ? 'income' : payload.type === 'expense' ? 'expense' : 'neutral';

  return (
    <ListRow
      icon={
        isTransfer ? 'swap-horizontal-outline' : (category?.icon ?? 'ellipsis-horizontal-outline')
      }
      iconColor={isTransfer ? colors.textSecondary : (category?.color ?? colors.textSecondary)}
      title={title}
      subtitle={subtitle}
      tag={
        failed
          ? { label: es.connectivity.failedTag, tone: 'neutral' }
          : { label: es.connectivity.pendingTag, tone: 'pending' }
      }
      trailing={<MoneyText amount={payload.amount} kind={kind} signed />}
      onPress={onPress}
      style={{ flex: 1, height: ROW_HEIGHT }}
    />
  );
}

function PendingConfirmRow({ item }: { item: TransactionWithRelations }) {
  const { colors } = useTheme();
  const isTransfer = item.type === 'transfer';

  const title = isTransfer
    ? `${item.account?.name ?? '?'} → ${item.transfer_account?.name ?? '?'}`
    : item.note || item.category?.name || '—';
  const subtitle = isTransfer
    ? (item.note ?? undefined)
    : [item.category?.name, item.account?.name].filter(Boolean).join(' · ');

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
      tag={{ label: es.transactionList.pendingTag, tone: 'pending' }}
      trailing={
        <MoneyText
          amount={item.amount}
          kind={item.type === 'income' ? 'income' : 'expense'}
          signed
        />
      }
      style={{ flex: 1, height: ROW_HEIGHT }}
    />
  );
}

function MovementRowSkeleton() {
  const { spacing } = useTheme();

  return (
    <View style={[styles.row, { height: ROW_HEIGHT, gap: spacing.md }]}>
      <Skeleton variant="circle" width={40} height={40} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Skeleton variant="line" width="60%" />
        <Skeleton variant="line" width="40%" />
      </View>
      <Skeleton variant="line" width={64} />
    </View>
  );
}

export default function MovementsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const isOnline = useConnectivity();
  const showSnackbar = useSnackbarStore((state) => state.show);

  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionType | null>(null);
  const [natureFilter, setNatureFilter] = useState<Nature | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [deleted, setDeleted] = useState<TransactionWithRelations | null>(null);
  const [failedSheet, setFailedSheet] = useState<PendingTransaction | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { from, to } = monthRange(monthAnchor);

  const transactionsQuery = useTransactions({
    from,
    to,
    accountId: accountId ?? undefined,
    categoryId: categoryId ?? undefined,
    type: typeFilter ?? undefined,
    nature: natureFilter ?? undefined,
    status: 'posted',
    search: search.length > 0 ? search : undefined,
  });
  const rangeQuery = useTransactionsInRange(from, to);
  const pendingConfirmationsQuery = usePendingConfirmations(from, to);
  const pendingConfirmations = pendingConfirmationsQuery.data ?? EMPTY_TRANSACTIONS;
  const accountsQuery = useAccounts();
  const categoriesQuery = useCategories();
  const deleteTransaction = useDeleteTransaction();
  const createTransaction = useCreateTransaction();
  const { pending, failed, retry, discard } = usePendingTransactions();

  const items = useMemo(
    () => (transactionsQuery.data?.pages ?? []).flatMap((page) => page.items),
    [transactionsQuery.data],
  );
  const summary = useMemo(() => calculateTotals(rangeQuery.data ?? []), [rangeQuery.data]);

  const today = todayISO();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const dayGroups = useMemo(() => groupTransactionsByDay(items), [items]);
  const totalByDate = useMemo(
    () => new Map(dayGroups.map((group) => [group.date, group.total])),
    [dayGroups],
  );

  const pendingItems = useMemo<{ occurred_on: string; item: MovementItem }[]>(
    () => [
      ...pending.map((entry) => ({
        occurred_on: entry.payload.occurred_on,
        item: {
          kind: 'pending' as const,
          key: `pending-${entry.mutationId}`,
          mutationId: entry.mutationId,
          payload: entry.payload,
        },
      })),
      ...failed.map((entry) => ({
        occurred_on: entry.payload.occurred_on,
        item: {
          kind: 'failed' as const,
          key: `failed-${entry.mutationId}`,
          mutationId: entry.mutationId,
          payload: entry.payload,
        },
      })),
    ],
    [pending, failed],
  );

  const sections = useMemo<DaySection[]>(() => {
    const base: { date: string; items: MovementItem[] }[] = dayGroups.map((group) => ({
      date: group.date,
      items: group.items.map((transaction) => ({
        kind: 'transaction' as const,
        key: transaction.id,
        transaction,
      })),
    }));

    const daySections = mergePendingByDay<MovementItem>(base, pendingItems).map(
      ({ date, items: dayItems }) => ({
        title: formatDayHeader(date, today, yesterday),
        total: totalByDate.get(date) ?? 0,
        data: dayItems,
      }),
    );

    if (pendingConfirmations.length === 0) {
      return daySections;
    }

    const confirmSection: DaySection = {
      title: es.transactionList.pendingSection,
      total: 0,
      data: pendingConfirmations.map((transaction) => ({
        kind: 'confirm' as const,
        key: `confirm-${transaction.id}`,
        transaction,
      })),
    };

    return [confirmSection, ...daySections];
  }, [dayGroups, pendingItems, pendingConfirmations, totalByDate, today, yesterday]);

  const layout = useMemo(() => {
    const entries: { length: number; offset: number }[] = [];
    let offset = 0;

    for (const section of sections) {
      entries.push({ length: HEADER_HEIGHT, offset });
      offset += HEADER_HEIGHT;
      for (let index = 0; index < section.data.length; index += 1) {
        entries.push({ length: ROW_HEIGHT, offset });
        offset += ROW_HEIGHT;
      }
    }

    return entries;
  }, [sections]);

  const activeFilterCount = [accountId, categoryId, typeFilter, natureFilter].filter(
    Boolean,
  ).length;
  const hasActiveQuery = activeFilterCount > 0 || search.length > 0;
  const pillLabel = connectivityText(isOnline, pending.length);

  const openEdit = useCallback(
    (transaction: TransactionWithRelations) => {
      if (!isOnline) {
        showSnackbar(es.connectivity.needsConnection);
        return;
      }
      router.push({ pathname: '/transaction-form', params: { id: transaction.id } });
    },
    [isOnline, router, showSnackbar],
  );

  const handleDelete = useCallback(
    (transaction: TransactionWithRelations) => {
      if (!isOnline) {
        showSnackbar(es.connectivity.needsConnection);
        return;
      }
      deleteTransaction.mutate(transaction.id, { onSuccess: () => setDeleted(transaction) });
    },
    [deleteTransaction, isOnline, showSnackbar],
  );

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  function undoDelete() {
    if (!deleted) {
      return;
    }
    createTransaction.mutate(toInsertPayload(deleted), { onSuccess: () => setDeleted(null) });
  }

  function clearFilters() {
    setAccountId(null);
    setCategoryId(null);
    setTypeFilter(null);
    setNatureFilter(null);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchInput('');
  }

  const summaryBalanceKind =
    summary.balance > 0 ? 'income' : summary.balance < 0 ? 'expense' : 'neutral';

  return (
    <Screen
      overlay={
        <Snackbar
          message={deleted ? es.transactionList.deleted : null}
          actionLabel={es.transactionList.undo}
          onAction={undoDelete}
          onDismiss={() => setDeleted(null)}
          durationMs={5000}
        />
      }
    >
      <View style={{ flex: 1, gap: spacing.md, marginTop: spacing.md }}>
        {searchOpen ? (
          <View style={[styles.searchRow, { gap: spacing.sm }]}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder={es.transactionList.searchPlaceholder}
                value={searchInput}
                onChangeText={setSearchInput}
                autoFocus
                autoCapitalize="none"
                accessibilityLabel={es.transactionList.search}
              />
            </View>
            <IconButton
              icon="close-outline"
              onPress={closeSearch}
              accessibilityLabel={es.common.close}
            />
          </View>
        ) : (
          <>
            <ScreenHeader
              title={es.transactionList.title}
              actions={
                <>
                  <IconButton
                    icon="search-outline"
                    onPress={() => setSearchOpen(true)}
                    accessibilityLabel={es.transactionList.search}
                  />
                  <IconButton
                    icon="options-outline"
                    onPress={() => setFiltersOpen(true)}
                    accessibilityLabel={es.transactionList.filters}
                    badge={activeFilterCount > 0}
                  />
                </>
              }
            />
            <MonthSelector value={monthAnchor} onChange={setMonthAnchor} />
          </>
        )}

        <ConnectivityPill label={pillLabel} />

        <Card style={{ gap: spacing.sm }}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="caption">{es.transactionList.income}</Text>
              <MoneyText amount={summary.income} kind="income" />
            </View>
            <View style={styles.summaryItem}>
              <Text variant="caption">{es.transactionList.expense}</Text>
              <MoneyText amount={summary.expense} kind="expense" signed />
            </View>
            <View style={styles.summaryItem}>
              <Text variant="caption">{es.transactionList.balance}</Text>
              <MoneyText amount={summary.balance} kind={summaryBalanceKind} signed />
            </View>
          </View>
        </Card>

        {transactionsQuery.isLoading ? (
          <View style={{ gap: spacing.sm }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <MovementRowSkeleton key={index} />
            ))}
          </View>
        ) : transactionsQuery.isError ? (
          <ErrorState onRetry={() => void transactionsQuery.refetch()} />
        ) : sections.length === 0 ? (
          <EmptyState
            title={
              hasActiveQuery ? es.transactionList.emptyFiltered : es.transactionList.emptyTitle
            }
            description={hasActiveQuery ? '' : es.transactionList.emptyDescription}
            actionLabel={hasActiveQuery ? es.transactionList.clearFilters : es.transactionForm.add}
            onAction={hasActiveQuery ? clearFilters : () => router.push('/transaction-form')}
          />
        ) : (
          <SwipeableRowGroup>
            <SectionList
              style={{ flex: 1 }}
              sections={sections}
              keyExtractor={(item) => item.key}
              stickySectionHeadersEnabled
              initialNumToRender={12}
              maxToRenderPerBatch={12}
              windowSize={11}
              getItemLayout={(_data, index) => {
                const entry = layout[index] ?? { length: ROW_HEIGHT, offset: index * ROW_HEIGHT };
                return { length: entry.length, offset: entry.offset, index };
              }}
              refreshControl={
                <RefreshControl
                  refreshing={transactionsQuery.isRefetching}
                  onRefresh={() => {
                    void transactionsQuery.refetch();
                    void pendingConfirmationsQuery.refetch();
                  }}
                />
              }
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (transactionsQuery.hasNextPage && !transactionsQuery.isFetchingNextPage) {
                  void transactionsQuery.fetchNextPage();
                }
              }}
              ListFooterComponent={
                transactionsQuery.isFetchingNextPage ? (
                  <ActivityIndicator color={colors.brand} style={{ marginVertical: spacing.md }} />
                ) : null
              }
              renderSectionHeader={({ section }) => (
                <View
                  style={[
                    styles.sectionHeader,
                    { backgroundColor: colors.background, height: HEADER_HEIGHT },
                  ]}
                >
                  <Text variant="caption">{section.title}</Text>
                  <MoneyText
                    amount={section.total}
                    kind={section.total < 0 ? 'expense' : section.total > 0 ? 'income' : 'neutral'}
                    signed
                  />
                </View>
              )}
              renderItem={({ item }) => {
                if (item.kind === 'transaction') {
                  return (
                    <MovementRow
                      item={item.transaction}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  );
                }

                if (item.kind === 'confirm') {
                  return <PendingConfirmRow item={item.transaction} />;
                }

                const payload = item.payload;
                const category = categoriesQuery.data?.find(
                  (entry) => entry.id === payload.category_id,
                );
                const accountName = accountsQuery.data?.find(
                  (account) => account.account_id === payload.account_id,
                )?.name;
                const transferAccountName = payload.transfer_account_id
                  ? accountsQuery.data?.find(
                      (account) => account.account_id === payload.transfer_account_id,
                    )?.name
                  : undefined;

                return (
                  <OfflineRow
                    payload={payload}
                    category={category}
                    accountName={accountName}
                    transferAccountName={transferAccountName}
                    failed={item.kind === 'failed'}
                    onPress={
                      item.kind === 'failed'
                        ? () =>
                            setFailedSheet({
                              mutationId: item.mutationId,
                              payload,
                              failed: true,
                            })
                        : undefined
                    }
                  />
                );
              }}
            />
          </SwipeableRowGroup>
        )}
      </View>

      <FiltersSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        accounts={accountsQuery.data ?? []}
        categories={categoriesQuery.data ?? []}
        accountId={accountId}
        categoryId={categoryId}
        typeFilter={typeFilter}
        natureFilter={natureFilter}
        onAccountChange={setAccountId}
        onCategoryChange={setCategoryId}
        onTypeChange={setTypeFilter}
        onNatureChange={setNatureFilter}
        onClear={clearFilters}
      />

      <BottomSheet visible={failedSheet !== null} onClose={() => setFailedSheet(null)}>
        <View style={{ gap: spacing.md }}>
          <Text variant="subtitle">{es.connectivity.failedTitle}</Text>
          <Text variant="body" color={colors.textSecondary}>
            {es.connectivity.failedMessage}
          </Text>
          <Button
            title={es.connectivity.retry}
            onPress={() => {
              if (failedSheet) {
                retry(failedSheet.mutationId);
              }
              setFailedSheet(null);
            }}
          />
          <Button
            title={es.connectivity.discard}
            variant="destructive"
            onPress={() => {
              if (failedSheet) {
                discard(failedSheet.mutationId);
              }
              setFailedSheet(null);
            }}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}

type FiltersSheetProps = {
  visible: boolean;
  onClose: () => void;
  accounts: { account_id: string; name: string }[];
  categories: Category[];
  accountId: string | null;
  categoryId: string | null;
  typeFilter: TransactionType | null;
  natureFilter: Nature | null;
  onAccountChange: (value: string | null) => void;
  onCategoryChange: (value: string | null) => void;
  onTypeChange: (value: TransactionType | null) => void;
  onNatureChange: (value: Nature | null) => void;
  onClear: () => void;
};

function FiltersSheet({
  visible,
  onClose,
  accounts,
  categories,
  accountId,
  categoryId,
  typeFilter,
  natureFilter,
  onAccountChange,
  onCategoryChange,
  onTypeChange,
  onNatureChange,
  onClear,
}: FiltersSheetProps) {
  const { spacing } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView contentContainerStyle={{ gap: spacing.md }} showsVerticalScrollIndicator={false}>
        <Text variant="subtitle">{es.transactionList.filters}</Text>

        <View style={{ gap: spacing.xs }}>
          <Text variant="caption">{es.transactionList.filterType}</Text>
          <View style={styles.chipRow}>
            <Chip
              label={es.transactionList.all}
              selected={typeFilter === null}
              onPress={() => onTypeChange(null)}
            />
            <Chip
              label={es.transactionList.typeIncome}
              selected={typeFilter === 'income'}
              onPress={() => onTypeChange('income')}
            />
            <Chip
              label={es.transactionList.typeExpense}
              selected={typeFilter === 'expense'}
              onPress={() => onTypeChange('expense')}
            />
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="caption">{es.transactionList.filterNature}</Text>
          <View style={styles.chipRow}>
            <Chip
              label={es.transactionList.all}
              selected={natureFilter === null}
              onPress={() => onNatureChange(null)}
            />
            <Chip
              label={es.transactionForm.base}
              selected={natureFilter === 'base'}
              onPress={() => onNatureChange('base')}
            />
            <Chip
              label={es.transactionForm.extra}
              selected={natureFilter === 'extra'}
              onPress={() => onNatureChange('extra')}
            />
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="caption">{es.transactionList.filterAccount}</Text>
          <View style={styles.chipRow}>
            <Chip
              label={es.transactionList.allAccounts}
              selected={accountId === null}
              onPress={() => onAccountChange(null)}
            />
            {accounts.map((account) => (
              <Chip
                key={account.account_id}
                label={account.name}
                selected={accountId === account.account_id}
                onPress={() => onAccountChange(account.account_id)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text variant="caption">{es.transactionForm.category}</Text>
          <View style={styles.chipRow}>
            <Chip
              label={es.transactionList.allCategories}
              selected={categoryId === null}
              onPress={() => onCategoryChange(null)}
            />
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                selected={categoryId === category.id}
                onPress={() => onCategoryChange(category.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.sheetFooter}>
          <Button title={es.transactionList.clearFilters} variant="ghost" onPress={onClear} />
          <Button title={es.transactionList.apply} onPress={onClose} />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
