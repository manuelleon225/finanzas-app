import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Switch, View } from 'react-native';

import { Button, Card, Chip, Input, LoadingState, Screen, Text } from '@/components/ui';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
} from '@/features/accounts/hooks/useAccounts';
import {
  accountSchema,
  accountTypes,
  defaultCountsAsLiquid,
  type AccountForm,
} from '@/features/accounts/utils/schemas';
import { es } from '@/i18n/es';
import { parseMoneyInput } from '@/lib/money';
import { useTheme } from '@/theme';

export default function AccountFormScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = typeof id === 'string' && id.length > 0;

  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const account = isEditing ? accounts?.find((entry) => entry.account_id === id) : undefined;
  const [liquidTouched, setLiquidTouched] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', type: 'cash', initialBalanceText: '0', countsAsLiquid: true },
  });

  useEffect(() => {
    if (isEditing && account) {
      reset({
        name: account.name,
        type: account.type,
        initialBalanceText: String(account.initial_balance),
        countsAsLiquid: account.counts_as_liquid,
      });
    }
  }, [isEditing, account, reset]);

  if (sessionLoading) {
    return <LoadingState />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (isEditing && isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  const isPending = createAccount.isPending || updateAccount.isPending;

  const onSubmit = handleSubmit((values) => {
    const payload = {
      name: values.name.trim(),
      type: values.type,
      initial_balance: parseMoneyInput(values.initialBalanceText),
      counts_as_liquid: values.countsAsLiquid,
    };

    if (isEditing) {
      updateAccount.mutate(
        { id: id as string, input: payload },
        { onSuccess: () => router.back() },
      );
    } else {
      createAccount.mutate(payload, { onSuccess: () => router.back() });
    }
  });

  return (
    <Screen scroll>
      <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
        <Text variant="title">{isEditing ? es.accounts.editAccount : es.accounts.newAccount}</Text>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              label={es.accounts.name}
              placeholder={es.accounts.namePlaceholder}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <View style={{ gap: spacing.sm }}>
              <Text variant="caption">{es.accounts.type}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {accountTypes.map((type) => (
                  <Chip
                    key={type}
                    label={es.accountTypes[type]}
                    selected={field.value === type}
                    onPress={() => {
                      field.onChange(type);
                      if (!liquidTouched) {
                        setValue('countsAsLiquid', defaultCountsAsLiquid(type));
                      }
                    }}
                  />
                ))}
              </View>
            </View>
          )}
        />

        <Controller
          name="initialBalanceText"
          control={control}
          render={({ field }) => (
            <Input
              label={es.accounts.initialBalance}
              keyboardType="number-pad"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.initialBalanceText?.message}
              helperText={es.accounts.initialBalanceHelper}
            />
          )}
        />

        <Controller
          name="countsAsLiquid"
          control={control}
          render={({ field }) => (
            <Card style={{ gap: spacing.sm }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing.md,
                }}
              >
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Text variant="body">{es.accounts.countsAsLiquid}</Text>
                  <Text variant="caption">{es.accounts.countsAsLiquidHelp}</Text>
                </View>
                <Switch
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setLiquidTouched(true);
                  }}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  accessibilityLabel={es.accounts.countsAsLiquid}
                />
              </View>
            </Card>
          )}
        />

        <Button
          title={es.accounts.saveAccount}
          onPress={() => void onSubmit()}
          loading={isPending}
          disabled={isPending}
        />
      </View>
    </Screen>
  );
}
