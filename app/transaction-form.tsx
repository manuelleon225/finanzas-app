import DateTimePicker from '@react-native-community/datetimepicker';
import * as Crypto from 'expo-crypto';
import { format, parseISO, subDays } from 'date-fns';
import { es as dateFnsEs } from 'date-fns/locale';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppIcon,
  BottomSheet,
  Button,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  ListRow,
  LoadingState,
  MoneyText,
  NumericKeypad,
  Screen,
  SegmentedControl,
  Skeleton,
  Text,
} from '@/components/ui';
import { applyKey } from '@/components/ui/utils/numericKeypad';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import type { Category, CategoryKind } from '@/features/categories/api/categories';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker';
import { useCategories } from '@/features/categories/hooks/useCategories';
import {
  undoCreatedTransaction,
  useCreateTransaction,
  useDeleteTransaction,
  useTransaction,
  useTransactionsInRange,
  useUpdateTransaction,
} from '@/features/transactions/hooks/useTransactions';
import { useTransactionPrefs } from '@/features/transactions/store/useTransactionPrefs';
import {
  buildTransactionCandidate,
  formFieldForIssuePath,
  type TransactionFormValues,
} from '@/features/transactions/utils/form';
import { rankCategoriesByUsage, USAGE_WINDOW_DAYS } from '@/features/transactions/utils/ranking';
import { transactionSchema, type TransactionInput } from '@/features/transactions/utils/schemas';
import { es } from '@/i18n/es';
import { todayISO } from '@/lib/dates';
import {
  error as hapticError,
  success as hapticSuccess,
  warning as hapticWarning,
} from '@/lib/haptics';
import { parseMoneyInput } from '@/lib/money';
import { useSnackbarStore } from '@/lib/snackbar';
import { useConnectivity } from '@/lib/useConnectivity';
import { tint, useTheme } from '@/theme';
import type { TablesInsert } from '@/types/database';

type GridItem = { kind: 'category'; category: Category } | { kind: 'more' };

function dateLabel(value: string, yesterdayISO: string): string {
  if (value === todayISO()) {
    return es.transactionForm.today;
  }
  if (value === yesterdayISO) {
    return es.transactionForm.yesterday;
  }
  return format(parseISO(value), 'd MMM', { locale: dateFnsEs });
}

function CategoryGrid({
  items,
  selectedId,
  onSelect,
  onMore,
}: {
  items: GridItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onMore: () => void;
}) {
  const { colors, radii, spacing } = useTheme();
  const rows: GridItem[][] = [];
  for (let index = 0; index < items.length; index += 3) {
    rows.push(items.slice(index, index + 3));
  }

  return (
    <View style={{ gap: spacing.sm }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', gap: spacing.sm }}>
          {row.map((item) => {
            if (item.kind === 'more') {
              return (
                <Pressable
                  key="more"
                  onPress={onMore}
                  accessibilityRole="button"
                  accessibilityLabel={es.transactionForm.moreCategories}
                  style={({ pressed }) => [
                    styles.tile,
                    {
                      borderRadius: radii.lg,
                      backgroundColor: pressed ? colors.surfaceHigh : colors.surfaceRaised,
                    },
                  ]}
                >
                  <View style={[styles.tileIcon, { backgroundColor: colors.surfaceHigh }]}>
                    <AppIcon name="grid-outline" size={20} color={colors.textSecondary} />
                  </View>
                  <Text variant="caption">{es.transactionForm.moreCategories}</Text>
                </Pressable>
              );
            }

            const selected = item.category.id === selectedId;
            return (
              <Pressable
                key={item.category.id}
                onPress={() => onSelect(item.category.id)}
                accessibilityRole="button"
                accessibilityLabel={item.category.name}
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.tile,
                  {
                    borderRadius: radii.lg,
                    backgroundColor: pressed ? colors.surfaceHigh : colors.surfaceRaised,
                    borderColor: selected ? colors.brand : 'transparent',
                  },
                ]}
              >
                <View
                  style={[styles.tileIcon, { backgroundColor: tint(item.category.color, 0.16) }]}
                >
                  <AppIcon name={item.category.icon} size={20} color={item.category.color} />
                </View>
                <Text variant="caption" numberOfLines={1}>
                  {item.category.name}
                </Text>
              </Pressable>
            );
          })}
          {Array.from({ length: 3 - row.length }).map((_, index) => (
            <View key={`spacer-${index}`} style={styles.tile} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function TransactionFormScreen() {
  const router = useRouter();
  const { colors, spacing, componentHeights } = useTheme();
  const insets = useSafeAreaInsets();
  const { session, loading: sessionLoading } = useSession();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = typeof id === 'string' && id.length > 0;

  const accountsQuery = useAccounts();
  const transactionQuery = useTransaction(isEditing ? id : undefined);
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const showSnackbar = useSnackbarStore((state) => state.show);
  const isOnline = useConnectivity();
  const lastAccountId = useTransactionPrefs((state) => state.lastAccountId);
  const setLastAccountId = useTransactionPrefs((state) => state.setLastAccountId);

  const [accountSheet, setAccountSheet] = useState(false);
  const [transferSheet, setTransferSheet] = useState(false);
  const [dateSheet, setDateSheet] = useState(false);
  const [categorySheet, setCategorySheet] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [shakeX] = useState(() => new Animated.Value(0));
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const {
    control,
    getValues,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    defaultValues: {
      type: 'expense',
      nature: 'base',
      amountText: '',
      accountId: '',
      transferAccountId: '',
      categoryId: '',
      occurredOn: todayISO(),
      note: '',
    },
  });

  const type = watch('type');
  const nature = watch('nature');
  const amountText = watch('amountText');
  const accountId = watch('accountId');
  const transferAccountId = watch('transferAccountId');
  const categoryId = watch('categoryId');
  const occurredOn = watch('occurredOn');
  const note = watch('note');

  const categoryKind: CategoryKind = type === 'income' ? 'income' : 'expense';
  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
  const transaction = transactionQuery.data;

  const yesterdayISO = useMemo(() => format(subDays(new Date(), 1), 'yyyy-MM-dd'), []);
  const usageFrom = useMemo(
    () => format(subDays(new Date(), USAGE_WINDOW_DAYS - 1), 'yyyy-MM-dd'),
    [],
  );

  const categoriesQuery = useCategories(categoryKind);
  const usageQuery = useTransactionsInRange(usageFrom, todayISO());

  const ranked = useMemo(
    () => rankCategoriesByUsage(usageQuery.data ?? [], categoriesQuery.data ?? [], todayISO()),
    [usageQuery.data, categoriesQuery.data],
  );

  const gridCategories = useMemo(() => {
    const top = ranked.slice(0, 5);
    const selected = ranked.find((category) => category.id === categoryId);
    if (selected && !top.some((category) => category.id === selected.id)) {
      return [...top.slice(0, 4), selected];
    }
    return top;
  }, [ranked, categoryId]);

  const gridItems: GridItem[] = useMemo(
    () => [
      ...gridCategories.map((category) => ({ kind: 'category' as const, category })),
      { kind: 'more' as const },
    ],
    [gridCategories],
  );

  useEffect(() => {
    if (isEditing || accounts.length === 0 || getValues('accountId')) {
      return;
    }
    const preferred =
      lastAccountId && accounts.some((account) => account.account_id === lastAccountId)
        ? lastAccountId
        : accounts[0].account_id;
    setValue('accountId', preferred);
  }, [accounts, isEditing, lastAccountId, setValue, getValues]);

  useEffect(() => {
    if (isEditing && transaction) {
      reset({
        type:
          transaction.type === 'income'
            ? 'income'
            : transaction.type === 'transfer'
              ? 'transfer'
              : 'expense',
        nature: transaction.nature === 'extra' ? 'extra' : 'base',
        amountText: String(transaction.amount),
        accountId: transaction.account_id,
        transferAccountId: transaction.transfer_account_id ?? '',
        categoryId: transaction.category_id ?? '',
        occurredOn: transaction.occurred_on,
        note: transaction.note ?? '',
      });
    }
  }, [isEditing, transaction, reset]);

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (accountsQuery.isLoading || (isEditing && transactionQuery.isLoading)) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (accountsQuery.isError || (isEditing && transactionQuery.isError)) {
    return (
      <Screen>
        <ErrorState onRetry={() => void accountsQuery.refetch()} />
      </Screen>
    );
  }

  if (!isEditing && accounts.length === 0) {
    return (
      <Screen>
        <EmptyState
          title={es.transactionForm.noAccountsTitle}
          description={es.transactionForm.noAccountsDescription}
          actionLabel={es.accounts.newAccount}
          onAction={() => router.push('/account-form')}
        />
      </Screen>
    );
  }

  const parsedAmount = parseMoneyInput(amountText);
  const isPending =
    createTransaction.isPending || updateTransaction.isPending || deleteTransaction.isPending;
  const transferUnavailable = type === 'transfer' && accounts.length < 2;
  const accountName = accounts.find((account) => account.account_id === accountId)?.name;
  const transferAccountName = accounts.find(
    (account) => account.account_id === transferAccountId,
  )?.name;

  function close() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function buildPayload(data: TransactionInput): TablesInsert<'transactions'> {
    if (data.type === 'transfer') {
      return {
        type: 'transfer',
        amount: data.amount,
        account_id: data.account_id,
        transfer_account_id: data.transfer_account_id,
        nature: null,
        category_id: null,
        occurred_on: data.occurred_on,
        note: data.note ?? null,
      };
    }

    return {
      type: data.type,
      nature: data.nature,
      amount: data.amount,
      account_id: data.account_id,
      category_id: data.category_id,
      transfer_account_id: null,
      occurred_on: data.occurred_on,
      note: data.note ?? null,
    };
  }

  function persist(values: TransactionFormValues, quick: boolean) {
    const parsed = transactionSchema.safeParse(buildTransactionCandidate(values));

    if (!parsed.success) {
      hapticError();
      for (const issue of parsed.error.issues) {
        const field = formFieldForIssuePath(issue.path);
        if (field) {
          setError(field, { message: issue.message });
        }
      }
      return;
    }

    const payload = isEditing
      ? buildPayload(parsed.data)
      : // id de cliente: hace idempotente la creación offline (reintentos sin duplicar).
        { ...buildPayload(parsed.data), id: Crypto.randomUUID() };

    if (isEditing) {
      if (!isOnline) {
        showSnackbar(es.connectivity.needsConnection);
        return;
      }
      updateTransaction.mutate(
        { id: id as string, input: payload },
        {
          onSuccess: () => {
            hapticSuccess();
            router.back();
          },
        },
      );
      return;
    }

    // Sin conexión: se encola y se cierra de inmediato (no espera la red).
    if (!isOnline) {
      createTransaction.mutate(payload);
      setLastAccountId(parsed.data.account_id);
      showSnackbar(es.transactionForm.savedOffline);
      close();
      return;
    }

    createTransaction.mutate(payload, {
      onSuccess: (created) => {
        setLastAccountId(parsed.data.account_id);
        // Si la pantalla ya se cerró (p. ej. la mutación se reanudó al reconectar),
        // no se navega ni se muestra el Snackbar desde un componente desmontado.
        if (!mountedRef.current) {
          return;
        }
        if (quick) {
          hapticSuccess();
          showSnackbar(es.transactionForm.saved, {
            label: es.common.undo,
            onPress: () => {
              void undoCreatedTransaction(created.id);
            },
          });
          close();
        } else {
          hapticSuccess();
          router.back();
        }
      },
    });
  }

  function handleCategoryPress(selectedCategoryId: string) {
    if (isEditing) {
      setValue('categoryId', selectedCategoryId);
      return;
    }

    if (parsedAmount <= 0) {
      hapticError();
      triggerShake();
      return;
    }

    const values = { ...getValues(), categoryId: selectedCategoryId };
    setValue('categoryId', selectedCategoryId);
    persist(values, true);
  }

  function confirmDelete() {
    if (!isOnline) {
      showSnackbar(es.connectivity.needsConnection);
      return;
    }
    Alert.alert(es.transactionForm.confirmDeleteTitle, es.transactionForm.confirmDeleteMessage, [
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.transactionForm.delete,
        style: 'destructive',
        onPress: () => {
          hapticWarning();
          deleteTransaction.mutate(id as string, { onSuccess: () => router.back() });
        },
      },
    ]);
  }

  function onDatePicked(_event: unknown, date?: Date) {
    setDatePickerOpen(false);
    if (date) {
      setValue('occurredOn', format(date, 'yyyy-MM-dd'));
    }
  }

  const amountColor = parsedAmount > 0 ? colors.textPrimary : colors.textMuted;

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.md }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Pressable onPress={close} accessibilityRole="button" hitSlop={8}>
              <Text variant="caption" color={colors.brand}>
                {es.common.cancel}
              </Text>
            </Pressable>
            <Text variant="subtitle">
              {isEditing ? es.transactionForm.editTitle : es.transactionForm.newTitle}
            </Text>
            <View style={{ width: componentHeights.iconButton }} />
          </View>

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <SegmentedControl<'income' | 'expense' | 'transfer'>
                options={[
                  { label: es.transactionForm.expense, value: 'expense' },
                  { label: es.transactionForm.income, value: 'income' },
                  { label: es.transactionForm.transfer, value: 'transfer' },
                ]}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setValue('categoryId', '');
                  setCategorySheet(false);
                }}
              />
            )}
          />

          <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
            <MoneyText
              amount={parsedAmount}
              size="displayLg"
              color={amountColor}
              style={styles.amountDisplay}
            />
          </Animated.View>
          {errors.amountText ? (
            <Text variant="caption" color={colors.danger} align="center">
              {errors.amountText.message}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.sm,
              justifyContent: 'center',
            }}
          >
            <Chip
              icon="wallet-outline"
              label={
                type === 'transfer'
                  ? (accountName ?? es.transactionForm.origin)
                  : (accountName ?? es.transactionForm.account)
              }
              onPress={() => setAccountSheet(true)}
            />
            {type === 'transfer' ? (
              <Chip
                icon="arrow-forward-outline"
                label={transferAccountName ?? es.transactionForm.destination}
                onPress={() => setTransferSheet(true)}
              />
            ) : null}
            <Chip
              icon="calendar-outline"
              label={dateLabel(occurredOn, yesterdayISO)}
              onPress={() => setDateSheet(true)}
            />
            {type !== 'transfer' ? (
              <>
                <Chip
                  label={es.transactionForm.base}
                  selected={nature === 'base'}
                  onPress={() => setValue('nature', 'base')}
                />
                <Chip
                  label={es.transactionForm.extra}
                  tone="extra"
                  selected={nature === 'extra'}
                  onPress={() => setValue('nature', 'extra')}
                />
              </>
            ) : null}
            <Chip
              icon="create-outline"
              label={es.transactionForm.note}
              onPress={() => setNoteOpen((open) => !open)}
            />
          </View>

          {errors.accountId ? (
            <Text variant="caption" color={colors.danger} align="center">
              {errors.accountId.message}
            </Text>
          ) : null}
          {errors.transferAccountId ? (
            <Text variant="caption" color={colors.danger} align="center">
              {errors.transferAccountId.message}
            </Text>
          ) : null}
          {transferUnavailable ? (
            <Text variant="caption" color={colors.danger} align="center">
              {es.transactionForm.transferNeedsTwoAccounts}
            </Text>
          ) : null}

          {type !== 'transfer' ? (
            <View style={{ gap: spacing.sm }}>
              {!isEditing ? (
                <Text variant="caption" align="center">
                  {es.transactionForm.tapCategoryToSave}
                </Text>
              ) : null}
              {categoriesQuery.isLoading ? (
                <Skeleton variant="card" height={72} />
              ) : (
                <CategoryGrid
                  items={gridItems}
                  selectedId={categoryId}
                  onSelect={handleCategoryPress}
                  onMore={() => setCategorySheet(true)}
                />
              )}
            </View>
          ) : null}
        </ScrollView>

        <View
          style={{
            gap: spacing.sm,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom,
          }}
        >
          {noteOpen ? (
            <Input
              value={note}
              onChangeText={(text) => setValue('note', text)}
              placeholder={es.transactionForm.notePlaceholder}
              autoFocus
              accessibilityLabel={es.transactionForm.note}
            />
          ) : null}

          {type === 'transfer' && !isEditing ? (
            <Button
              title={es.transactionForm.saveTransfer}
              onPress={() => persist(getValues(), false)}
              loading={isPending}
              disabled={isPending || transferUnavailable}
            />
          ) : null}

          {isEditing ? (
            <>
              <Button
                title={es.transactionForm.saveChanges}
                onPress={() => persist(getValues(), false)}
                loading={isPending}
                disabled={isPending}
              />
              <Button
                title={es.transactionForm.delete}
                variant="destructive"
                onPress={confirmDelete}
                disabled={isPending}
              />
            </>
          ) : null}

          <NumericKeypad
            onDigit={(key) => {
              clearErrors('amountText');
              setValue('amountText', applyKey(getValues('amountText'), key));
            }}
            onBackspace={() =>
              setValue('amountText', applyKey(getValues('amountText'), 'backspace'))
            }
            onClear={() => setValue('amountText', '')}
          />
        </View>
      </KeyboardAvoidingView>

      <BottomSheet visible={accountSheet} onClose={() => setAccountSheet(false)}>
        <Text variant="subtitle">
          {type === 'transfer' ? es.transactionForm.origin : es.transactionForm.account}
        </Text>
        <View style={{ gap: spacing.xs }}>
          {accounts.map((account) => (
            <ListRow
              key={account.account_id}
              icon="wallet-outline"
              iconColor={colors.brand}
              title={account.name}
              trailing={<MoneyText amount={account.balance} />}
              onPress={() => {
                setValue('accountId', account.account_id);
                clearErrors('accountId');
                setAccountSheet(false);
              }}
            />
          ))}
        </View>
      </BottomSheet>

      <BottomSheet visible={transferSheet} onClose={() => setTransferSheet(false)}>
        <Text variant="subtitle">{es.transactionForm.destination}</Text>
        <View style={{ gap: spacing.xs }}>
          {accounts.map((account) => (
            <ListRow
              key={account.account_id}
              icon="wallet-outline"
              iconColor={colors.brand}
              title={account.name}
              trailing={<MoneyText amount={account.balance} />}
              onPress={() => {
                setValue('transferAccountId', account.account_id);
                clearErrors('transferAccountId');
                setTransferSheet(false);
              }}
            />
          ))}
        </View>
      </BottomSheet>

      <BottomSheet visible={dateSheet} onClose={() => setDateSheet(false)}>
        <Text variant="subtitle">{es.transactionForm.date}</Text>
        <View style={{ gap: spacing.xs }}>
          <ListRow
            icon="today-outline"
            iconColor={colors.brand}
            title={es.transactionForm.today}
            onPress={() => {
              setValue('occurredOn', todayISO());
              setDateSheet(false);
            }}
          />
          <ListRow
            icon="calendar-outline"
            iconColor={colors.brand}
            title={es.transactionForm.yesterday}
            onPress={() => {
              setValue('occurredOn', yesterdayISO);
              setDateSheet(false);
            }}
          />
          <ListRow
            icon="calendar-outline"
            iconColor={colors.brand}
            title={es.transactionForm.chooseDate}
            onPress={() => {
              setDateSheet(false);
              setDatePickerOpen(true);
            }}
          />
        </View>
      </BottomSheet>

      <BottomSheet visible={categorySheet} onClose={() => setCategorySheet(false)}>
        <Text variant="subtitle">{es.transactionForm.category}</Text>
        <CategoryPicker
          kind={categoryKind}
          value={categoryId || null}
          onChange={(selectedCategoryId) => {
            setCategorySheet(false);
            handleCategoryPress(selectedCategoryId);
          }}
          additionIds={
            isEditing && transaction?.category_id ? [transaction.category_id] : undefined
          }
        />
      </BottomSheet>

      {datePickerOpen ? (
        <DateTimePicker
          value={parseISO(occurredOn)}
          mode="date"
          maximumDate={new Date()}
          onChange={onDatePicked}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  amountDisplay: {
    textAlign: 'center',
  },
  tile: {
    flex: 1,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
