import { startOfMonth } from 'date-fns';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import {
  BottomSheet,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  IconButton,
  IconTile,
  ListRow,
  LoadingState,
  MoneyText,
  MonthSelector,
  NumericKeypad,
  ProgressBar,
  ScreenHeader,
  ScreenScaffold,
  Skeleton,
  Text,
} from '@/components/ui';
import { resolveCategoryTile } from '@/components/ui/tileHelpers';
import { applyKey } from '@/components/ui/utils/numericKeypad';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import {
  useBudgetProgress,
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from '@/features/budgets/hooks/useBudgets';
import type { BudgetProgressItem } from '@/features/budgets/utils/budgetProgress';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { es } from '@/i18n/es';
import {
  error as hapticError,
  success as hapticSuccess,
  warning as hapticWarning,
} from '@/lib/haptics';
import { formatCOP, parseMoneyInput } from '@/lib/money';
import { useTheme } from '@/theme';

function BudgetRow({ item, onPress }: { item: BudgetProgressItem; onPress: () => void }) {
  const { colors, spacing } = useTheme();
  const tile = resolveCategoryTile({
    name: item.categoryName,
    kind: 'expense',
    icon: item.categoryIcon,
    color: item.categoryColor,
  });
  const remainingText =
    item.remaining >= 0
      ? es.budgets.remaining.replace('{monto}', formatCOP(item.remaining))
      : es.budgets.over.replace('{monto}', formatCOP(-item.remaining));
  const remainingColor = item.remaining >= 0 ? colors.textSecondary : colors.expense;

  return (
    <Card style={{ gap: spacing.sm }}>
      <ListRow
        leading={<IconTile icon={tile.icon} tileKey={tile.tileKey} size={40} />}
        title={item.categoryName}
        subtitle={es.budgets.spentOf
          .replace('{spent}', formatCOP(item.spent))
          .replace('{budget}', formatCOP(item.amount))}
        trailing={
          <Text variant="caption" color={remainingColor}>
            {remainingText}
          </Text>
        }
        onPress={onPress}
      />
      <ProgressBar value={item.ratio} status={item.status} />
    </Card>
  );
}

export default function BudgetsScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();

  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCategoryId, setFormCategoryId] = useState('');
  const [amountText, setAmountText] = useState('');

  const { progress, isLoading, isError, refetch } = useBudgetProgress(monthAnchor);
  const categoriesQuery = useCategories('expense');
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const mainExpense = (categoriesQuery.data ?? []).filter(
    (category) => category.parent_id === null,
  );
  const available = mainExpense.filter(
    (category) => !progress.items.some((item) => item.categoryId === category.id),
  );
  const editingItem = editingId
    ? progress.items.find((item) => item.budgetId === editingId)
    : undefined;
  const parsedAmount = parseMoneyInput(amountText);
  const isPending = createBudget.isPending || updateBudget.isPending || deleteBudget.isPending;

  function openCreate() {
    setEditingId(null);
    setFormCategoryId('');
    setAmountText('');
    setSheetOpen(true);
  }

  function openEdit(item: BudgetProgressItem) {
    setEditingId(item.budgetId);
    setFormCategoryId(item.categoryId);
    setAmountText(String(item.amount));
    setSheetOpen(true);
  }

  function save() {
    if (parsedAmount <= 0 || (!editingId && !formCategoryId)) {
      hapticError();
      return;
    }

    const onSuccess = () => {
      hapticSuccess();
      setSheetOpen(false);
    };

    if (editingId) {
      updateBudget.mutate({ id: editingId, input: { amount: parsedAmount } }, { onSuccess });
    } else {
      createBudget.mutate({ category_id: formCategoryId, amount: parsedAmount }, { onSuccess });
    }
  }

  function confirmDelete() {
    if (!editingId) {
      return;
    }

    Alert.alert(es.budgets.confirmDeleteTitle, es.budgets.confirmDeleteMessage, [
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.budgets.delete,
        style: 'destructive',
        onPress: () => {
          hapticWarning();
          deleteBudget.mutate(editingId, { onSuccess: () => setSheetOpen(false) });
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
          title={es.budgets.title}
          actions={
            <IconButton
              icon="add-outline"
              onPress={openCreate}
              accessibilityLabel={es.budgets.newBudget}
            />
          }
        />
      }
    >
      <MonthSelector value={monthAnchor} onChange={setMonthAnchor} />

      {isLoading ? (
        <View style={{ gap: spacing.md }}>
          <Skeleton variant="card" height={96} />
          <Skeleton variant="card" height={96} />
          <Skeleton variant="card" height={96} />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : progress.items.length === 0 ? (
        <EmptyState
          icon="pie-chart-outline"
          illustration="target"
          title={es.budgets.emptyTitle}
          description={es.budgets.emptyDescription}
          actionLabel={es.budgets.newBudget}
          onAction={openCreate}
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {progress.items.map((item) => (
            <BudgetRow key={item.budgetId} item={item} onPress={() => openEdit(item)} />
          ))}
        </View>
      )}

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <ScrollView
          contentContainerStyle={{ gap: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="subtitle">{editingId ? es.budgets.editBudget : es.budgets.newBudget}</Text>

          {editingId ? (
            <Text variant="body">{editingItem?.categoryName ?? '—'}</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <Text variant="caption">{es.budgets.category}</Text>
              {available.length === 0 ? (
                <Text variant="caption">{es.budgets.noCategories}</Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {available.map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      selected={formCategoryId === category.id}
                      onPress={() => setFormCategoryId(category.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          <MoneyText
            amount={parsedAmount}
            size="display"
            color={parsedAmount > 0 ? colors.textPrimary : colors.textMuted}
            style={{ textAlign: 'center' }}
          />

          <NumericKeypad
            onDigit={(key) => setAmountText((current) => applyKey(current, key))}
            onBackspace={() => setAmountText((current) => applyKey(current, 'backspace'))}
            onClear={() => setAmountText('')}
          />

          <Button
            title={es.budgets.save}
            onPress={save}
            loading={isPending}
            disabled={isPending || parsedAmount <= 0 || (!editingId && !formCategoryId)}
          />

          {editingId ? (
            <Button
              title={es.budgets.delete}
              variant="destructive"
              onPress={confirmDelete}
              disabled={isPending}
            />
          ) : null}
        </ScrollView>
      </BottomSheet>
    </ScreenScaffold>
  );
}
