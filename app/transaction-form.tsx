import { format, subDays } from 'date-fns';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import {
  Button,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  MoneyText,
  Screen,
  SegmentedControl,
  Snackbar,
  Text,
} from '@/components/ui';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransaction,
  useUpdateTransaction,
} from '@/features/transactions/hooks/useTransactions';
import { useTransactionPrefs } from '@/features/transactions/store/useTransactionPrefs';
import {
  buildTransactionCandidate,
  formFieldForIssuePath,
  type TransactionFormValues,
} from '@/features/transactions/utils/form';
import { transactionSchema } from '@/features/transactions/utils/schemas';
import { es } from '@/i18n/es';
import { todayISO } from '@/lib/dates';
import { formatCOP, parseMoneyInput } from '@/lib/money';
import { useTheme } from '@/theme';
import type { TablesInsert } from '@/types/database';

type AccountOption = { id: string; name: string };

export default function TransactionFormScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = typeof id === 'string' && id.length > 0;

  const accountsQuery = useAccounts();
  const transactionQuery = useTransaction(isEditing ? id : undefined);
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const lastAccountId = useTransactionPrefs((state) => state.lastAccountId);
  const setLastAccountId = useTransactionPrefs((state) => state.setLastAccountId);

  const [snackbar, setSnackbar] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    defaultValues: {
      type: 'expense',
      nature: 'base',
      amountText: '',
      accountId: '',
      categoryId: '',
      occurredOn: todayISO(),
      note: '',
    },
  });

  const type = watch('type');
  const amountText = watch('amountText');
  const categoryKind = type === 'income' ? 'income' : 'expense';
  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
  const transaction = transactionQuery.data;

  useEffect(() => {
    if (isEditing || accounts.length === 0 || watch('accountId')) {
      return;
    }
    const preferred =
      lastAccountId && accounts.some((account) => account.account_id === lastAccountId)
        ? lastAccountId
        : accounts[0].account_id;
    setValue('accountId', preferred);
  }, [accounts, isEditing, lastAccountId, setValue, watch]);

  useEffect(() => {
    if (isEditing && transaction) {
      reset({
        type: transaction.type === 'income' ? 'income' : 'expense',
        nature: transaction.nature === 'extra' ? 'extra' : 'base',
        amountText: String(transaction.amount),
        accountId: transaction.account_id,
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

  const accountOptions: AccountOption[] = accounts.map((account) => ({
    id: account.account_id,
    name: account.name,
  }));
  const editingAccount = transaction?.account;
  if (editingAccount && !accountOptions.some((option) => option.id === editingAccount.id)) {
    accountOptions.push({ id: editingAccount.id, name: editingAccount.name });
  }

  const isPending =
    createTransaction.isPending || updateTransaction.isPending || deleteTransaction.isPending;

  const save = (afterSave: 'close' | 'another') =>
    handleSubmit((values) => {
      const parsed = transactionSchema.safeParse(buildTransactionCandidate(values));

      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const field = formFieldForIssuePath(issue.path);
          if (field) {
            setError(field, { message: issue.message });
          }
        }
        return;
      }

      if (parsed.data.type === 'transfer') {
        return;
      }

      const payload: TablesInsert<'transactions'> = {
        type: parsed.data.type,
        nature: parsed.data.nature,
        amount: parsed.data.amount,
        account_id: parsed.data.account_id,
        category_id: parsed.data.category_id,
        transfer_account_id: null,
        occurred_on: parsed.data.occurred_on,
        note: parsed.data.note ?? null,
      };

      const onSuccess = () => {
        setLastAccountId(parsed.data.account_id);
        if (afterSave === 'another') {
          setSnackbar(es.transactionForm.saved);
          reset({ ...values, amountText: '', categoryId: '', note: '' });
        } else {
          router.back();
        }
      };

      if (isEditing) {
        updateTransaction.mutate({ id: id as string, input: payload }, { onSuccess });
      } else {
        createTransaction.mutate(payload, { onSuccess });
      }
    });

  function confirmDelete() {
    Alert.alert(es.transactionForm.confirmDeleteTitle, es.transactionForm.confirmDeleteMessage, [
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.transactionForm.delete,
        style: 'destructive',
        onPress: () => {
          deleteTransaction.mutate(id as string, { onSuccess: () => router.back() });
        },
      },
    ]);
  }

  const parsedAmount = parseMoneyInput(amountText);

  function close() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  return (
    <Screen scroll overlay={<Snackbar message={snackbar} onDismiss={() => setSnackbar(null)} />}>
      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Pressable onPress={close} accessibilityRole="button" hitSlop={8} style={styles.close}>
            <Text variant="caption" color={colors.primary}>
              {es.common.cancel}
            </Text>
          </Pressable>
          <Text variant="title">
            {isEditing ? es.transactionForm.editTitle : es.transactionForm.newTitle}
          </Text>
        </View>

        <MoneyText
          amount={parsedAmount}
          kind={type === 'income' ? 'income' : 'expense'}
          style={styles.amountDisplay}
        />

        <Controller
          name="amountText"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.xs }}>
              <TextInput
                value={field.value}
                onChangeText={(text) => field.onChange(text.replace(/[^0-9]/g, ''))}
                onBlur={field.onBlur}
                keyboardType="number-pad"
                autoFocus
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                accessibilityLabel={es.transactionForm.amount}
                style={[styles.amountInput, { color: colors.textPrimary }]}
              />
              <Text variant="caption" align="center">
                {parseMoneyInput(field.value) > 0 ? formatCOP(parseMoneyInput(field.value)) : ' '}
              </Text>
              {errors.amountText ? (
                <Text variant="caption" color={colors.danger} align="center">
                  {errors.amountText.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <SegmentedControl<'income' | 'expense'>
              options={[
                { label: es.transactionForm.expense, value: 'expense' },
                { label: es.transactionForm.income, value: 'income' },
              ]}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                setValue('categoryId', '');
              }}
            />
          )}
        />

        <Controller
          name="nature"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.xs }}>
              <SegmentedControl<'base' | 'extra'>
                options={[
                  { label: es.transactionForm.base, value: 'base' },
                  { label: es.transactionForm.extra, value: 'extra' },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
              <Text variant="caption">{es.transactionForm.natureHelp}</Text>
            </View>
          )}
        />

        <View style={{ gap: spacing.sm }}>
          <Text variant="caption">{es.transactionForm.category}</Text>
          <CategoryPicker
            kind={categoryKind}
            value={watch('categoryId') || null}
            onChange={(categoryId) => setValue('categoryId', categoryId)}
            additionIds={
              isEditing && transaction?.category_id ? [transaction.category_id] : undefined
            }
          />
          {errors.categoryId ? (
            <Text variant="caption" color={colors.danger}>
              {errors.categoryId.message}
            </Text>
          ) : null}
        </View>

        <Controller
          name="accountId"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.sm }}>
              <Text variant="caption">{es.transactionForm.account}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {accountOptions.map((option) => (
                  <Chip
                    key={option.id}
                    label={option.name}
                    selected={field.value === option.id}
                    onPress={() => field.onChange(option.id)}
                  />
                ))}
              </View>
              {errors.accountId ? (
                <Text variant="caption" color={colors.danger}>
                  {errors.accountId.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <Controller
          name="occurredOn"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.sm }}>
              <Text variant="caption">{es.transactionForm.date}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                <Chip
                  label={es.transactionForm.today}
                  selected={field.value === todayISO()}
                  onPress={() => field.onChange(todayISO())}
                />
                <Chip
                  label={es.transactionForm.yesterday}
                  selected={field.value === format(subDays(new Date(), 1), 'yyyy-MM-dd')}
                  onPress={() => field.onChange(format(subDays(new Date(), 1), 'yyyy-MM-dd'))}
                />
              </View>
              <Text variant="caption">
                {es.transactionForm.date}: {field.value}
              </Text>
            </View>
          )}
        />

        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Input
              label={es.transactionForm.note}
              placeholder={es.transactionForm.notePlaceholder}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Button
          title={es.transactionForm.save}
          onPress={() => void save('close')()}
          loading={isPending}
          disabled={isPending}
        />
        {!isEditing ? (
          <Button
            title={es.transactionForm.saveAndAdd}
            variant="secondary"
            onPress={() => void save('another')()}
            disabled={isPending}
          />
        ) : null}

        {isEditing ? (
          <Pressable onPress={confirmDelete} accessibilityRole="button" hitSlop={8}>
            <Text variant="caption" color={colors.danger} align="center">
              {es.transactionForm.delete}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: {
    alignSelf: 'flex-start',
  },
  amountDisplay: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: 'center',
  },
  amountInput: {
    fontSize: 28,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
