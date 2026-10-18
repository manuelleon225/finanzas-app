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
import { z } from 'zod';

import {
  AppIcon,
  BottomSheet,
  Button,
  Chip,
  EmptyState,
  ErrorState,
  IconTile,
  Input,
  ListRow,
  LoadingState,
  MoneyText,
  NumericKeypad,
  ScreenScaffold,
  SegmentedControl,
  Skeleton,
  Tag,
  Text,
} from '@/components/ui';
import { resolveCategoryTile } from '@/components/ui/tileHelpers';
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
import {
  getFrequentTransactions,
  suggestCategories,
  type FrequentTransaction,
  type SuggestedCategory,
} from '@/features/transactions/utils/suggestions';
import { transactionSchema, type TransactionInput } from '@/features/transactions/utils/schemas';
import { es } from '@/i18n/es';
import { todayISO } from '@/lib/dates';
import {
  error as hapticError,
  success as hapticSuccess,
  warning as hapticWarning,
} from '@/lib/haptics';
import { formatCompactCOP, formatPesos, parseMoneyInput } from '@/lib/money';
import { useSnackbarStore } from '@/lib/snackbar';
import { useConnectivity } from '@/lib/useConnectivity';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { getTileColors, useTheme, type TileKey } from '@/theme';
import type { TablesInsert } from '@/types/database';

type GridItem = { kind: 'category'; category: Category } | { kind: 'more' };

const GRID_COLUMNS = 3;
const TILE_MIN_HEIGHT = 72;
const SELECTED_BORDER_WIDTH = 1.5;
const MIN_AMOUNT_FONT_SIZE = 28;

const typeParamSchema = z.enum(['expense', 'income', 'transfer']);

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
  suggestedIds = [],
  pulse,
}: {
  items: GridItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onMore: () => void;
  suggestedIds?: string[];
  pulse?: Animated.Value;
}) {
  const { colors, radii, spacing } = useTheme();
  const rows: GridItem[][] = [];
  for (let index = 0; index < items.length; index += GRID_COLUMNS) {
    rows.push(items.slice(index, index + GRID_COLUMNS));
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
                      borderColor: 'transparent',
                    },
                  ]}
                >
                  <IconTile icon="grid" tileKey="gray" size={40} />
                  <Text variant="caption">{es.transactionForm.moreCategories}</Text>
                </Pressable>
              );
            }

            const selected = item.category.id === selectedId;
            const tile = resolveCategoryTile(item.category);
            const isSuggested = suggestedIds.includes(item.category.id);
            return (
              <Animated.View
                key={item.category.id}
                style={{
                  flex: 1,
                  transform: [{ scale: isSuggested && pulse ? pulse : 1 }],
                }}
              >
                <Pressable
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
                  <IconTile icon={tile.icon} tileKey={tile.tileKey} size={40} />
                  <Text variant="caption" numberOfLines={1}>
                    {item.category.name}
                  </Text>
                  {isSuggested ? <Tag label={es.transactionForm.suggested} tone="base" /> : null}
                </Pressable>
              </Animated.View>
            );
          })}
          {Array.from({ length: GRID_COLUMNS - row.length }).map((_, index) => (
            <View key={`spacer-${index}`} style={styles.tile} />
          ))}
        </View>
      ))}
    </View>
  );
}

function BlockLinePart({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
    >
      <Text variant="caption" color={colors.onBrandMuted}>
        {label}
      </Text>
      <AppIcon name="chevron-down-outline" size={16} color={colors.onBrandMuted} />
    </Pressable>
  );
}

export default function TransactionFormScreen() {
  const router = useRouter();
  const { colors, spacing, componentHeights, fontSizes, mode, radii } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const { id, type: typeParam } = useLocalSearchParams<{ id?: string; type?: string }>();
  const isEditing = typeof id === 'string' && id.length > 0;
  const parsedTypeParam = typeParamSchema.safeParse(typeParam);
  const initialType: 'expense' | 'income' | 'transfer' = parsedTypeParam.success
    ? parsedTypeParam.data
    : 'expense';

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
      type: initialType,
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

  const [suggestedIds, setSuggestedIds] = useState<string[]>([]);
  const [frequent, setFrequent] = useState<FrequentTransaction[]>([]);
  const reduceMotion = useReducedMotion();
  const pulse = useRef(new Animated.Value(1)).current;

  const categoryKind: CategoryKind = type === 'income' ? 'income' : 'expense';
  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
  const transaction = transactionQuery.data;

  const yesterdayISO = useMemo(() => format(subDays(new Date(), 1), 'yyyy-MM-dd'), []);

  const usageFrom = useMemo(() => format(subDays(new Date(), 179), 'yyyy-MM-dd'), []);

  const categoriesQuery = useCategories(categoryKind);
  const usageQuery = useTransactionsInRange(usageFrom, todayISO());

  const ranked = useMemo(
    () => rankCategoriesByUsage(usageQuery.data ?? [], categoriesQuery.data ?? [], todayISO()),
    [usageQuery.data, categoriesQuery.data],
  );

  useEffect(() => {
    if (isEditing) {
      return;
    }
    const history = (usageQuery.data ?? []).map((transaction) => ({
      note: transaction.note ?? null,
      categoryId: transaction.category_id ?? null,
      type: transaction.type,
      occurredOn: transaction.occurred_on,
      amount: transaction.amount,
      accountId: transaction.account_id ?? null,
    }));
    const next = getFrequentTransactions({ history, today: todayISO(), limit: 3 });
    setFrequent(next);
  }, [usageQuery.data, isEditing]);

  useEffect(() => {
    if (isEditing) {
      return;
    }
    const timer = setTimeout(() => {
      const history = (usageQuery.data ?? []).map((transaction) => ({
        note: transaction.note ?? null,
        categoryId: transaction.category_id ?? null,
        type: transaction.type,
        occurredOn: transaction.occurred_on,
        amount: transaction.amount,
        accountId: transaction.account_id ?? null,
      }));
      const suggestions = suggestCategories({
        note,
        history,
        categories: categoriesQuery.data ?? [],
        type,
        today: todayISO(),
      });
      setSuggestedIds(suggestions.map((item) => item.categoryId));
    }, 250);

    return () => clearTimeout(timer);
  }, [note, type, usageQuery.data, categoriesQuery.data, isEditing]);

  const gridCategories = useMemo(() => {
    const top = ranked.slice(0, 5);
    const selected = ranked.find((category) => category.id === categoryId);
    let base = top;
    if (selected && !top.some((category) => category.id === selected.id)) {
      base = [...top.slice(0, 4), selected];
    }

    if (suggestedIds.length === 0 || isEditing) {
      return base;
    }

    const suggestedId = suggestedIds[0];
    if (base.some((category) => category.id === suggestedId)) {
      // move suggested to first
      const rest = base.filter((category) => category.id !== suggestedId);
      const suggestedCategory =
        ranked.find((category) => category.id === suggestedId) ??
        categoriesQuery.data?.find((category) => category.id === suggestedId);
      if (!suggestedCategory) {
        return base;
      }
      return [suggestedCategory, ...rest].slice(0, 5);
    }

    // replace fifth
    const suggestedCategory =
      ranked.find((category) => category.id === suggestedId) ??
      categoriesQuery.data?.find((category) => category.id === suggestedId);
    if (!suggestedCategory) {
      return base;
    }
    return [suggestedCategory, ...base.slice(0, 4)];
  }, [ranked, categoryId, suggestedIds, isEditing, categoriesQuery.data]);

  useEffect(() => {
    if (suggestedIds.length === 0 || reduceMotion) {
      pulse.setValue(1);
      return;
    }
    pulse.setValue(1);
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.04, duration: 110, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 110, useNativeDriver: true }),
    ]).start();
  }, [suggestedIds, reduceMotion, pulse]);

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
      <ScreenScaffold variant="plain">
        <LoadingState />
      </ScreenScaffold>
    );
  }

  if (accountsQuery.isError || (isEditing && transactionQuery.isError)) {
    return (
      <ScreenScaffold variant="plain">
        <ErrorState onRetry={() => void accountsQuery.refetch()} />
      </ScreenScaffold>
    );
  }

  if (!isEditing && accounts.length === 0) {
    return (
      <ScreenScaffold variant="plain">
        <EmptyState
          icon="wallet-outline"
          title={es.transactionForm.noAccountsTitle}
          description={es.transactionForm.noAccountsDescription}
          actionLabel={es.accounts.newAccount}
          onAction={() => router.push('/account-form')}
        />
      </ScreenScaffold>
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

  const amountColor = parsedAmount > 0 ? colors.onBrand : colors.onBrandMuted;
  const lineLabel =
    type === 'transfer'
      ? `${es.transactionForm.origin} ${accountName ?? '…'} → ${transferAccountName ?? '…'}`
      : (accountName ?? es.transactionForm.account);

  return (
    <ScreenScaffold
      variant="block"
      scroll={false}
      header={
        <View style={{ gap: spacing.lg }}>
          <View
            style={{
              height: componentHeights.iconButton,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={es.common.cancel}
              hitSlop={8}
              style={styles.cancel}
            >
              <Text variant="caption" color={colors.onBrandMuted}>
                {es.common.cancel}
              </Text>
            </Pressable>
            <Text variant="bodyStrong" color={colors.onBrand}>
              {isEditing ? es.transactionForm.editTitle : es.transactionForm.newTitle}
            </Text>
          </View>

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <SegmentedControl<'income' | 'expense' | 'transfer'>
                tone="onBlock"
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
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={MIN_AMOUNT_FONT_SIZE / fontSizes.displayLg}
              style={styles.amountDisplay}
            />
          </Animated.View>
          {errors.amountText ? (
            <Text variant="caption" color={colors.onBrandMuted} align="center">
              {errors.amountText.message}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
            }}
          >
            <BlockLinePart label={lineLabel} onPress={() => setAccountSheet(true)} />
            <Text variant="caption" color={colors.onBrandMuted}>
              ·
            </Text>
            <BlockLinePart
              label={dateLabel(occurredOn, yesterdayISO)}
              onPress={() => setDateSheet(true)}
            />
          </View>
        </View>
      }
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ gap: spacing.md, paddingTop: spacing.sm }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.sm,
              justifyContent: 'center',
            }}
          >
            {type === 'transfer' ? (
              <>
                <Chip
                  label={accountName ?? es.transactionForm.origin}
                  onPress={() => setAccountSheet(true)}
                />
                <Chip
                  label={transferAccountName ?? es.transactionForm.destination}
                  onPress={() => setTransferSheet(true)}
                />
              </>
            ) : (
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
                <Chip
                  icon="create-outline"
                  label={es.transactionForm.note}
                  onPress={() => setNoteOpen((open) => !open)}
                />
              </>
            )}
          </View>

          {errors.accountId ? (
            <Text variant="caption" color={colors.expense} align="center">
              {errors.accountId.message}
            </Text>
          ) : null}
          {errors.transferAccountId ? (
            <Text variant="caption" color={colors.expense} align="center">
              {errors.transferAccountId.message}
            </Text>
          ) : null}
          {transferUnavailable ? (
            <Text variant="caption" color={colors.expense} align="center">
              {es.transactionForm.transferNeedsTwoAccounts}
            </Text>
          ) : null}

          {type !== 'transfer' ? (
            <View style={{ gap: spacing.sm }}>
              {!isEditing && amountText.trim() === '' && frequent.length > 0 ? (
                <View style={{ gap: spacing.xs }}>
                  <Text variant="caption" color={colors.textSecondary}>
                    {es.transactionForm.frequentTitle}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: spacing.sm }}
                  >
                    {frequent.map((item, index) => {
                      const category = (categoriesQuery.data ?? []).find(
                        (candidate) => candidate.id === item.categoryId,
                      );
                      const tile = category ? resolveCategoryTile(category) : null;
                      const tileColors = tile ? getTileColors(tile.tileKey, mode) : null;
                      const description =
                        item.note.trim().length > 0 ? item.note.trim() : (category?.name ?? '');
                      const label = `${description} · ${formatCompactCOP(item.amount)}`;
                      const displayLabel = label.length > 20 ? `${label.slice(0, 17)}...` : label;
                      const a11y = `Repetir ${description}, ${formatPesos(item.amount)}`;

                      function handleFrequent() {
                        const accountStillActive = accounts.some(
                          (account) => account.account_id === item.accountId,
                        );
                        const accountIdToUse =
                          accountStillActive && item.accountId
                            ? item.accountId
                            : lastAccountId &&
                                accounts.some((account) => account.account_id === lastAccountId)
                              ? lastAccountId
                              : (accounts[0]?.account_id ?? '');
                        const values: TransactionFormValues = {
                          type: item.type as 'income' | 'expense',
                          nature: 'base',
                          amountText: String(item.amount),
                          accountId: accountIdToUse,
                          transferAccountId: '',
                          categoryId: item.categoryId,
                          occurredOn: todayISO(),
                          note: item.note,
                        };
                        persist(values, true);
                      }

                      return (
                        <Pressable
                          key={`${item.categoryId}-${index}`}
                          onPress={handleFrequent}
                          accessibilityRole="button"
                          accessibilityLabel={a11y}
                          style={{
                            height: 40,
                            paddingHorizontal: 12,
                            borderRadius: radii.pill,
                            backgroundColor: colors.surfaceRaised,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          {tile ? (
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 8,
                                backgroundColor: tileColors?.bg,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <AppIcon
                                name={tile.icon}
                                size={14}
                                color={tileColors?.icon ?? colors.textSecondary}
                                filled
                              />
                            </View>
                          ) : null}
                          <Text variant="caption" numberOfLines={1}>
                            {displayLabel}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

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
                  suggestedIds={suggestedIds}
                  pulse={pulse}
                />
              )}
            </View>
          ) : null}
        </ScrollView>

        <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
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
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  cancel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  amountDisplay: {
    textAlign: 'center',
  },
  tile: {
    flex: 1,
    minHeight: TILE_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: SELECTED_BORDER_WIDTH,
    borderColor: 'transparent',
  },
});
