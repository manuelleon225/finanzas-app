import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button, Chip, Input, LoadingState, Screen, Text } from '@/components/ui';
import { useSession } from '@/features/auth/hooks/AuthProvider';
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
} from '@/features/accounts/hooks/useAccounts';
import { accountSchema, accountTypes, type AccountForm } from '@/features/accounts/utils/schemas';
import { es } from '@/i18n/es';
import { parseMoneyInput } from '@/lib/money';
import { useTheme } from '@/theme';

export default function AccountFormScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { session, loading: sessionLoading } = useSession();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = typeof id === 'string' && id.length > 0;

  const { data: accounts, isLoading } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const account = isEditing ? accounts?.find((entry) => entry.account_id === id) : undefined;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', type: 'cash', initialBalanceText: '0' },
  });

  useEffect(() => {
    if (isEditing && account) {
      reset({
        name: account.name,
        type: account.type,
        initialBalanceText: String(account.initial_balance),
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
                    onPress={() => field.onChange(type)}
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
