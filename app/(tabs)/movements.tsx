import { addMonths, format, startOfMonth, subDays, subMonths } from 'date-fns';
import { Redirect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';

import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Fab,
  Input,
  LoadingState,
  MoneyText,
  Screen,
  Snackbar,
  Text,
} from '@/components/ui';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { CategoryIcon } from '@/features/categories/components/CategoryIcon';
import type { Category } from '@/features/categories/api/categories';
import { useCategories } from '@/features/categories/hooks/useCategories';
import type {
  Nature,
  TransactionType,
  TransactionWithRelations,
} from '@/features/transactions/api/transactions';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useTransactionsInRange,
} from '@/features/transactions/hooks/useTransactions';
import {
  calculateTotals,
  formatDayHeader,
  formatMonthLabel,
  groupTransactionsByDay,
  monthRange,
  toInsertPayload,
} from '@/features/transactions/utils/transactions';
import { es } from '@/i18n/es';
import { todayISO } from '@/lib/dates';
import { useTheme } from '@/theme';

type DaySection = {
  title: string;
  total: number;
  data: TransactionWithRelations[];
};

export default function MovementsScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();

  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionType | null>(null);
  const [natureFilter, setNatureFilter] = useState<Nature | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [deleted, setDeleted] = useState<TransactionWithRelations | null>(null);

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
    search: search.length > 0 ? search : undefined,
  });
  const rangeQuery = useTransactionsInRange(from, to);
  const accountsQuery = useAccounts();
  const categoriesQuery = useCategories();
  const deleteTransaction = useDeleteTransaction();
  const createTransaction = useCreateTransaction();

  const items = useMemo(
    () => (transactionsQuery.data?.pages ?? []).flatMap((page) => page.items),
    [transactionsQuery.data],
  );
  const summary = useMemo(() => calculateTotals(rangeQuery.data ?? []), [rangeQuery.data]);

  const today = todayISO();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const sections = useMemo<DaySection[]>(
    () =>
      groupTransactionsByDay(items).map((group) => ({
        title: formatDayHeader(group.date, today, yesterday),
        total: group.total,
        data: group.items,
      })),
    [items, today, yesterday],
  );

  const activeFilterCount = [accountId, categoryId, typeFilter, natureFilter].filter(
    Boolean,
  ).length;

  const confirmDelete = useCallback(
    (transaction: TransactionWithRelations) => {
      Alert.alert(es.transactionList.deleteTitle, es.transactionList.deleteMessage, [
        { text: es.common.cancel, style: 'cancel' },
        {
          text: es.transactionForm.delete,
          style: 'destructive',
          onPress: () => {
            deleteTransaction.mutate(transaction.id, { onSuccess: () => setDeleted(transaction) });
          },
        },
      ]);
    },
    [deleteTransaction],
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

  const summaryBalanceKind =
    summary.balance > 0 ? 'income' : summary.balance < 0 ? 'expense' : 'neutral';

  return (
    <Screen
      overlay={
        <>
          <Fab
            onPress={() => router.push('/transaction-form')}
            accessibilityLabel={es.transactionForm.add}
          />
          <Snackbar
            message={deleted ? es.transactionList.deleted : null}
            actionLabel={es.transactionList.undo}
            onAction={undoDelete}
            onDismiss={() => setDeleted(null)}
            durationMs={5000}
          />
        </>
      }
    >
      <View style={{ gap: spacing.md, marginTop: spacing.md, flex: 1 }}>
        <Card style={{ gap: spacing.md }}>
          <View style={styles.monthRow}>
            <Pressable
              onPress={() => setMonthAnchor((anchor) => subMonths(anchor, 1))}
              accessibilityRole="button"
              accessibilityLabel={es.transactionList.previousMonth}
              hitSlop={8}
            >
              <Text variant="subtitle" color={colors.primary}>
                ‹
              </Text>
            </Pressable>
            <Text variant="subtitle">{formatMonthLabel(monthAnchor)}</Text>
            <Pressable
              onPress={() => setMonthAnchor((anchor) => addMonths(anchor, 1))}
              accessibilityRole="button"
              accessibilityLabel={es.transactionList.nextMonth}
              hitSlop={8}
            >
              <Text variant="subtitle" color={colors.primary}>
                ›
              </Text>
            </Pressable>
          </View>

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

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder={es.transactionList.searchPlaceholder}
              value={searchInput}
              onChangeText={setSearchInput}
              autoCapitalize="none"
            />
          </View>
          <Pressable onPress={() => setFiltersOpen(true)} accessibilityRole="button" hitSlop={8}>
            <Text variant="caption" color={colors.primary}>
              {es.transactionList.filters}
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </Pressable>
        </View>

        {transactionsQuery.isLoading ? (
          <LoadingState />
        ) : transactionsQuery.isError ? (
          <ErrorState onRetry={() => void transactionsQuery.refetch()} />
        ) : sections.length === 0 ? (
          <EmptyState
            title={es.transactionList.emptyTitle}
            description={
              activeFilterCount > 0 || search.length > 0
                ? es.transactionList.emptyFiltered
                : es.transactionList.emptyDescription
            }
          />
        ) : (
          <SectionList
            style={{ flex: 1 }}
            sections={sections}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={transactionsQuery.isRefetching}
                onRefresh={() => void transactionsQuery.refetch()}
              />
            }
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (transactionsQuery.hasNextPage && !transactionsQuery.isFetchingNextPage) {
                void transactionsQuery.fetchNextPage();
              }
            }}
            ListFooterComponent={
              transactionsQuery.isFetchingNextPage ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
              ) : null
            }
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text variant="caption">{section.title}</Text>
                <MoneyText
                  amount={section.total}
                  kind={section.total < 0 ? 'expense' : section.total > 0 ? 'income' : 'neutral'}
                  signed
                />
              </View>
            )}
            renderItem={({ item }) => <MovementRow item={item} onLongPress={confirmDelete} />}
          />
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
    </Screen>
  );
}

const MovementRow = memo(function MovementRow({
  item,
  onLongPress,
}: {
  item: TransactionWithRelations;
  onLongPress: (transaction: TransactionWithRelations) => void;
}) {
  const { colors } = useTheme();
  const router = useRouter();

  const isExtra = item.nature === 'extra';
  const isTransfer = item.type === 'transfer';
  const categoryName = isTransfer
    ? `${item.account?.name ?? '?'} → ${item.transfer_account?.name ?? '?'}`
    : (item.category?.name ?? '—');
  const kind = item.type === 'income' ? 'income' : item.type === 'expense' ? 'expense' : 'neutral';
  const details = isTransfer
    ? (item.note ?? '')
    : [item.note, item.account?.name].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/transaction-form', params: { id: item.id } })}
      onLongPress={() => onLongPress(item)}
      accessibilityRole="button"
      style={styles.row}
    >
      <CategoryIcon
        icon={
          isTransfer
            ? 'swap-horizontal-outline'
            : (item.category?.icon ?? 'ellipsis-horizontal-outline')
        }
        color={isTransfer ? colors.textSecondary : (item.category?.color ?? colors.textSecondary)}
        size={22}
      />
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text variant="body">{categoryName}</Text>
          {isExtra ? (
            <Text variant="caption" color={colors.extra}>
              · {es.transactionList.extra}
            </Text>
          ) : null}
          {item.recurring_rule_id ? (
            <Ionicons
              name="repeat"
              size={14}
              color={colors.textSecondary}
              accessibilityLabel={es.transactionList.recurring}
            />
          ) : null}
        </View>
        {details.length > 0 ? <Text variant="caption">{details}</Text> : null}
      </View>
      <MoneyText amount={item.amount} kind={kind} signed />
    </Pressable>
  );
});

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
  const { colors, radii, spacing } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            padding: spacing.lg,
            gap: spacing.md,
          },
        ]}
      >
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
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
