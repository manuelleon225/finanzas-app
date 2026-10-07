import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

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
  Text,
} from '@/components/ui';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import { CategoryPicker } from '@/features/categories/components/CategoryPicker';
import type { RecurringRuleWithRelations } from '@/features/recurring/api/recurring';
import {
  useCreateRecurringRule,
  useDeleteRecurringRule,
  useRecurringRules,
  useUpdateRecurringRule,
} from '@/features/recurring/hooks/useRecurringRules';
import type { Frequency } from '@/features/recurring/utils/recurrence';
import { recurringRuleSchema } from '@/features/recurring/utils/schemas';
import { es } from '@/i18n/es';
import { todayISO } from '@/lib/dates';
import { formatCOP, parseMoneyInput } from '@/lib/money';
import { useTheme } from '@/theme';
import type { TablesInsert } from '@/types/database';

type RuleFormValues = {
  type: 'income' | 'expense';
  nature: 'base' | 'extra';
  amountText: string;
  accountId: string;
  categoryId: string;
  note: string;
  frequency: Frequency;
  startDate: string;
  endDate: string | null;
};

const FREQUENCIES: Frequency[] = ['weekly', 'biweekly', 'semimonthly', 'monthly'];

export default function RecurringFormScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = typeof id === 'string' && id.length > 0;

  const accountsQuery = useAccounts();
  const rulesQuery = useRecurringRules();
  const createRule = useCreateRecurringRule();
  const updateRule = useUpdateRecurringRule();
  const deleteRule = useDeleteRecurringRule();

  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
  const rule: RecurringRuleWithRelations | undefined = isEditing
    ? rulesQuery.data?.find((entry) => entry.id === id)
    : undefined;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<RuleFormValues>({
    defaultValues: {
      type: 'expense',
      nature: 'base',
      amountText: '',
      accountId: '',
      categoryId: '',
      note: '',
      frequency: 'monthly',
      startDate: todayISO(),
      endDate: null,
    },
  });

  const type = watch('type');
  const amountText = watch('amountText');
  const categoryKind = type === 'income' ? 'income' : 'expense';

  useEffect(() => {
    if (isEditing || accounts.length === 0 || watch('accountId')) {
      return;
    }
    setValue('accountId', accounts[0].account_id);
  }, [accounts, isEditing, setValue, watch]);

  useEffect(() => {
    if (isEditing && rule) {
      reset({
        type: rule.type === 'income' ? 'income' : 'expense',
        nature: rule.nature === 'extra' ? 'extra' : 'base',
        amountText: String(rule.amount),
        accountId: rule.account_id,
        categoryId: rule.category_id,
        note: rule.note ?? '',
        frequency: rule.frequency,
        startDate: rule.start_date,
        endDate: rule.end_date,
      });
    }
  }, [isEditing, rule, reset]);

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (accountsQuery.isLoading || (isEditing && rulesQuery.isLoading)) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (accountsQuery.isError || (isEditing && rulesQuery.isError)) {
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

  const isPending = createRule.isPending || updateRule.isPending || deleteRule.isPending;

  const onSubmit = handleSubmit((values) => {
    const note = values.note.trim();
    const parsed = recurringRuleSchema.safeParse({
      type: values.type,
      nature: values.nature,
      amount: parseMoneyInput(values.amountText),
      account_id: values.accountId,
      category_id: values.categoryId,
      note: note.length > 0 ? note : undefined,
      frequency: values.frequency,
      start_date: values.startDate,
      end_date: values.endDate,
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        const field =
          key === 'amount'
            ? 'amountText'
            : key === 'account_id'
              ? 'accountId'
              : key === 'category_id'
                ? 'categoryId'
                : key === 'start_date'
                  ? 'startDate'
                  : key === 'end_date'
                    ? 'endDate'
                    : key === 'frequency'
                      ? 'frequency'
                      : key === 'note'
                        ? 'note'
                        : null;
        if (field) {
          setError(field, { message: issue.message });
        }
      }
      return;
    }

    const payload: TablesInsert<'recurring_rules'> = {
      type: parsed.data.type,
      nature: parsed.data.nature,
      amount: parsed.data.amount,
      account_id: parsed.data.account_id,
      category_id: parsed.data.category_id,
      note: parsed.data.note ?? null,
      frequency: parsed.data.frequency,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
    };

    if (isEditing) {
      updateRule.mutate({ id: id as string, input: payload }, { onSuccess: () => router.back() });
    } else {
      createRule.mutate(payload, { onSuccess: () => router.back() });
    }
  });

  function confirmDelete() {
    Alert.alert(es.recurring.confirmDeleteTitle, es.recurring.confirmDeleteMessage, [
      { text: es.common.cancel, style: 'cancel' },
      {
        text: es.recurring.delete,
        style: 'destructive',
        onPress: () => deleteRule.mutate(id as string, { onSuccess: () => router.back() }),
      },
    ]);
  }

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <Text variant="title">{isEditing ? es.recurring.editRule : es.recurring.newRule}</Text>
        <Text variant="caption">{es.recurring.generatedNote}</Text>

        <MoneyText
          amount={parseMoneyInput(amountText)}
          kind={type === 'income' ? 'income' : 'expense'}
          style={styles.amountDisplay}
        />
        <Controller
          name="amountText"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.xs }}>
              <Input
                label={es.recurring.amount}
                keyboardType="number-pad"
                value={field.value}
                onChangeText={(text) => field.onChange(text.replace(/[^0-9]/g, ''))}
                error={errors.amountText?.message}
              />
              <Text variant="caption" align="center">
                {parseMoneyInput(field.value) > 0 ? formatCOP(parseMoneyInput(field.value)) : ' '}
              </Text>
            </View>
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <SegmentedControl<'income' | 'expense'>
              options={[
                { label: es.recurring.expense, value: 'expense' },
                { label: es.recurring.income, value: 'income' },
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
            <SegmentedControl<'base' | 'extra'>
              options={[
                { label: es.recurring.base, value: 'base' },
                { label: es.recurring.extra, value: 'extra' },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <View style={{ gap: spacing.sm }}>
          <Text variant="caption">{es.recurring.category}</Text>
          <CategoryPicker
            kind={categoryKind}
            value={watch('categoryId') || null}
            onChange={(categoryId) => setValue('categoryId', categoryId)}
            additionIds={isEditing && rule?.category_id ? [rule.category_id] : undefined}
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
              <Text variant="caption">{es.recurring.account}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {accounts.map((account) => (
                  <Chip
                    key={account.account_id}
                    label={account.name}
                    selected={field.value === account.account_id}
                    onPress={() => field.onChange(account.account_id)}
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
          name="frequency"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.sm }}>
              <Text variant="caption">{es.recurring.frequency}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {FREQUENCIES.map((frequency) => (
                  <Chip
                    key={frequency}
                    label={es.recurring[frequency]}
                    selected={field.value === frequency}
                    onPress={() => field.onChange(frequency)}
                  />
                ))}
              </View>
            </View>
          )}
        />

        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.sm }}>
              <Input
                label={es.recurring.startDate}
                placeholder="AAAA-MM-DD"
                autoCapitalize="none"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.startDate?.message}
                helperText={es.recurring.dateHint}
              />
              <Chip
                label={es.transactionForm.today}
                selected={field.value === todayISO()}
                onPress={() => field.onChange(todayISO())}
              />
            </View>
          )}
        />

        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.sm }}>
              <Text variant="caption">{es.recurring.endDate}</Text>
              <Chip
                label={es.recurring.noEndDate}
                selected={field.value === null}
                onPress={() => field.onChange(null)}
              />
              {field.value !== null ? (
                <Input
                  placeholder="AAAA-MM-DD"
                  autoCapitalize="none"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.endDate?.message}
                />
              ) : null}
            </View>
          )}
        />

        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Input
              label={es.recurring.note}
              placeholder={es.recurring.notePlaceholder}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />

        <Button
          title={es.recurring.save}
          onPress={() => void onSubmit()}
          loading={isPending}
          disabled={isPending}
        />

        {isEditing ? (
          <Pressable onPress={confirmDelete} accessibilityRole="button" hitSlop={8}>
            <Text variant="caption" color={colors.danger} align="center">
              {es.recurring.delete}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountDisplay: {
    fontSize: 36,
    lineHeight: 44,
    textAlign: 'center',
  },
});
