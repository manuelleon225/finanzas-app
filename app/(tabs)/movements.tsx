import { format, startOfMonth, subDays } from 'date-fns';
import { Redirect, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, View } from 'react-native';

import {
  AnimatedEntrance,
  AppIcon,
  BottomSheet,
  Button,
  Chip,
  ConnectivityPill,
  EmptyState,
  ErrorState,
  IconButton,
  IconTile,
  Input,
  ListRow,
  LoadingState,
  MoneyText,
  MonthSelector,
  ScreenHeader,
  ScreenScaffold,
  Skeleton,
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
import { movementRowModel } from '@/features/transactions/utils/movementRow';
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
import { formatCompactCOP } from '@/lib/money';
import { useSnackbarStore } from '@/lib/snackbar';
import { useConnectivity } from '@/lib/useConnectivity';
import { componentHeights, resolveTileKey, spacing, useTheme } from '@/theme';
import type { TablesInsert } from '@/types/database';

const ROW_HEIGHT = componentHeights.listRow;
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
  showTotal: boolean;
  data: MovementItem[];
};

function MovementRow({
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
  const model = movementRowModel(item);

  return (
    <AnimatedEntrance>
      <SwipeableRow onDelete={() => onDelete(item)}>
        <ListRow
          leading={<IconTile icon={model.tile.icon} tileKey={model.tile.tileKey} size={40} />}
          title={model.title}
          subtitle={model.subtitle}
          tag={model.isExtra ? { label: es.transactionList.extra, tone: 'extra' } : undefined}
          trailing={
            <View style={styles.trailing}>
              {model.isRecurring ? (
                <AppIcon
                  name="repeat-outline"
                  size={16}
                  color={colors.textSecondary}
                  accessibilityLabel={es.transactionList.recurring}
                />
              ) : null}
              <MoneyText amount={item.amount} kind={model.kind} signed />
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
}

const MemoMovementRow = memo(MovementRow);

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
  const isTransfer = payload.type === 'transfer';

  const title = isTransfer
    ? `${accountName ?? '?'} → ${transferAccountName ?? '?'}`
    : payload.note || category?.name || '—';
  const subtitle = isTransfer
    ? (payload.note ?? undefined)
    : [category?.name, accountName].filter(Boolean).join(' · ') || undefined;

  const kind =
    payload.type === 'income' ? 'income' : payload.type === 'expense' ? 'expense' : 'neutral';
  const tile = isTransfer
    ? { icon: 'swap-horizontal', tileKey: 'gray' as const }
    : {
        icon: category?.icon ?? 'ellipsis-horizontal',
        tileKey: resolveTileKey({
          name: category?.name ?? 'Otros',
          kind: payload.type === 'income' ? 'income' : 'expense',
          color: category?.color,
        }),
      };

  return (
    <ListRow
      leading={<IconTile icon={tile.icon} tileKey={tile.tileKey} size={40} />}
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
  const model = movementRowModel(item);
  const kind = item.type === 'income' ? 'income' : 'expense';

  return (
    <ListRow
      leading={<IconTile icon={model.tile.icon} tileKey={model.tile.tileKey} size={40} />}
      title={model.title}
      subtitle={model.subtitle}
      tag={{ label: es.transactionList.pendingTag, tone: 'pending' }}
      trailing={<MoneyText amount={item.amount} kind={kind} signed />}
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

function SummaryColumn({ label, value }: { label: string; value: string }) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <Text variant="caption" color={colors.onBrandMuted}>
        {label}
      </Text>
      <Text variant="money" color={colors.onBrand} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function MovementsScreen() {
  const { colors, radii, spacing } = useTheme();
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
        showTotal: true,
        data: dayItems,
      }),
    );

    if (pendingConfirmations.length === 0) {
      return daySections;
    }

    const confirmSection: DaySection = {
      title: es.transactionList.pendingSection,
      total: 0,
      showTotal: false,
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
      deleteTransaction.mutate(transaction.id, {
        onSuccess: () => {
          showSnackbar(es.transactionList.deleted, {
            label: es.transactionList.undo,
            onPress: () => createTransaction.mutate(toInsertPayload(transaction)),
          });
        },
      });
    },
    [createTransaction, deleteTransaction, isOnline, showSnackbar],
  );

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
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

  const balanceText =
    summary.balance > 0
      ? `+${formatCompactCOP(summary.balance)}`
      : formatCompactCOP(summary.balance);

  const header = searchOpen ? (
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
      <IconButton icon="close-outline" onPress={closeSearch} accessibilityLabel={es.common.close} />
    </View>
  ) : (
    <View style={{ gap: spacing.md }}>
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
    </View>
  );

  return (
    <ScreenScaffold variant="plain" scroll={false} header={header}>
      <View style={{ flex: 1, gap: spacing.sm }}>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.brand,
              borderRadius: radii.xl,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={[styles.summaryRow, { gap: spacing.md }]}>
            <SummaryColumn
              label={es.transactionList.income}
              value={formatCompactCOP(summary.income)}
            />
            <SummaryColumn
              label={es.transactionList.expense}
              value={formatCompactCOP(summary.expense)}
            />
            <SummaryColumn label={es.transactionList.balance} value={balanceText} />
          </View>
        </View>

        <ConnectivityPill label={pillLabel} />

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
            icon={hasActiveQuery ? 'search-outline' : 'receipt-outline'}
            illustration={hasActiveQuery ? undefined : 'list'}
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
                    { backgroundColor: colors.bg, height: HEADER_HEIGHT },
                  ]}
                >
                  <Text variant="caption">{section.title}</Text>
                  {section.showTotal ? (
                    <MoneyText
                      amount={section.total}
                      kind={
                        section.total < 0 ? 'expense' : section.total > 0 ? 'income' : 'neutral'
                      }
                      signed
                      size="caption"
                    />
                  ) : null}
                </View>
              )}
              renderItem={({ item }) => {
                if (item.kind === 'transaction') {
                  return (
                    <MemoMovementRow
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
    </ScreenScaffold>
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
      <View style={{ gap: spacing.md }}>
        <Text variant="subtitle">{es.transactionList.filters}</Text>

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

        <View style={styles.sheetFooter}>
          <Button title={es.transactionList.clear} variant="ghost" onPress={onClear} />
          <Button title={es.transactionList.apply} onPress={onClose} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCard: {
    alignSelf: 'stretch',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
    gap: spacing.sm,
  },
  sheetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
